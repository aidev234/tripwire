#!/usr/bin/env python3
"""Run the Tripwire UI server with backend collection endpoints."""

from __future__ import annotations

import argparse
import email.utils
import http.server
import json
import random
import socketserver
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DEFAULT_SAMPLE_QUERY = '"tim cook" AND  ( fuck OR bastard)'


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


class TwitterWebViewerCollector:
    """Collect tweets from TwitterWebViewer with retry and anti-bot workarounds."""

    api_url = "https://twitterwebviewer.com/api/search/tweets"
    html_url = "https://twitterwebviewer.com/twitter-search"
    fallback_proxy_prefix = "https://r.jina.ai/http://twitterwebviewer.com/api/search/tweets"

    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    ]

    def collect(self, query: str, limit: int = 12, cursor: str = "", query_type: str = "Latest") -> dict[str, Any]:
        normalized_query = " ".join((query or DEFAULT_SAMPLE_QUERY).split()).strip()
        if not normalized_query:
            normalized_query = DEFAULT_SAMPLE_QUERY

        attempts: list[tuple[str, str]] = [("direct_api", normalized_query)]
        if normalized_query != query:
            attempts.append(("direct_api_normalized", normalized_query))

        warmup_error = None
        for source, attempt_query in attempts:
            try:
                payload = self._fetch_api(attempt_query, cursor, query_type=query_type)
                return self._shape(payload, attempt_query, source, limit, query_type=query_type)
            except Exception as exc:  # pylint: disable=broad-except
                warmup_error = exc

        # Warm up the search page once, then retry API.
        try:
            self._warm_up(normalized_query)
            payload = self._fetch_api(normalized_query, cursor, query_type=query_type)
            return self._shape(payload, normalized_query, "warmup_then_api", limit, query_type=query_type)
        except Exception as exc:  # pylint: disable=broad-except
            warmup_error = exc

        # Fallback proxy path for anti-bot/edge failures.
        payload = self._fetch_proxy_api(normalized_query, cursor, query_type=query_type)
        result = self._shape(payload, normalized_query, "proxy_api_fallback", limit, query_type=query_type)
        if warmup_error is not None:
            result["notes"] = [f"primary_api_failed: {warmup_error}"]
        return result

    def _shape(self, payload: dict[str, Any], query: str, source: str, limit: int, query_type: str = "Latest") -> dict[str, Any]:
        data = payload.get("data") or {}
        tweets = data.get("tweets") or []
        rows: list[dict[str, Any]] = []
        for tweet in tweets[: max(1, limit)]:
            author = tweet.get("author") or {}
            username = str(author.get("username") or "").strip()
            handle = f"@{username}" if username and not username.startswith("@") else (username or "@unknown")
            tweet_id = str(tweet.get("id") or "").strip()
            created_at = str(tweet.get("createdAt") or "").strip()
            rows.append(
                {
                    "id": tweet_id,
                    "platform": "X",
                    "handle": handle,
                    "author": str(author.get("displayName") or handle),
                    "body": str(tweet.get("content") or "").strip(),
                    "ts": self._to_relative_time(created_at),
                    "createdAt": created_at,
                    "url": f"https://x.com/{username}/status/{tweet_id}" if username and tweet_id else "",
                    "stats": tweet.get("stats") or {},
                }
            )

        return {
            "query": data.get("query") or query,
            "queryType": data.get("queryType") or query_type,
            "posts": rows,
            "hasMore": bool(data.get("hasNextPage")),
            "nextCursor": data.get("nextCursor") or "",
            "source": source,
            "cached": bool(payload.get("cached")),
        }

    def _fetch_api(self, query: str, cursor: str = "", query_type: str = "Latest") -> dict[str, Any]:
        params = {"q": query, "queryType": query_type}
        if cursor:
            params["cursor"] = cursor
        url = f"{self.api_url}?{urllib.parse.urlencode(params)}"
        payload = self._request_json(url, referer=self.html_url)
        if not payload.get("success"):
            raise ValueError(payload.get("error") or "search API returned unsuccessful response")
        return payload

    def _fetch_proxy_api(self, query: str, cursor: str = "", query_type: str = "Latest") -> dict[str, Any]:
        params = {"q": query, "queryType": query_type}
        if cursor:
            params["cursor"] = cursor
        url = f"{self.fallback_proxy_prefix}?{urllib.parse.urlencode(params)}"
        raw = self._request_text(url, referer=self.html_url)
        start = raw.find("{")
        end = raw.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("proxy response did not contain JSON")
        payload = json.loads(raw[start : end + 1])
        if not payload.get("success"):
            raise ValueError(payload.get("error") or "proxy API returned unsuccessful response")
        return payload

    def _warm_up(self, query: str) -> None:
        params = urllib.parse.urlencode({"q": query, "type": "tweets"})
        self._request_text(f"{self.html_url}?{params}")

    def _request_json(self, url: str, referer: str = "") -> dict[str, Any]:
        raw = self._request_text(url, referer=referer)
        return json.loads(raw)

    def _request_text(self, url: str, referer: str = "", retries: int = 4) -> str:
        for attempt in range(retries):
            req = urllib.request.Request(
                url,
                headers=self._headers(referer),
                method="GET",
            )
            try:
                with urllib.request.urlopen(req, timeout=25) as response:
                    return response.read().decode("utf-8", errors="replace")
            except urllib.error.HTTPError as exc:
                if exc.code not in (403, 429, 500, 502, 503, 504) or attempt >= retries - 1:
                    raise
            except (urllib.error.URLError, TimeoutError):
                if attempt >= retries - 1:
                    raise
            self._backoff_sleep(attempt)
        raise RuntimeError("unexpected retry loop exit")

    def _headers(self, referer: str = "") -> dict[str, str]:
        headers = {
            "User-Agent": random.choice(self.user_agents),
            "Accept": "application/json,text/plain,text/html,*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "DNT": "1",
            "Connection": "keep-alive",
        }
        if referer:
            headers["Referer"] = referer
        return headers

    def _backoff_sleep(self, attempt: int) -> None:
        delay = min(5.0, (0.5 * (2**attempt)) + random.uniform(0.05, 0.35))
        time.sleep(delay)

    def _to_relative_time(self, raw: str) -> str:
        if not raw:
            return ""
        try:
            parsed = email.utils.parsedate_to_datetime(raw)
            now = datetime.now(timezone.utc)
            seconds = max(0, int((now - parsed.astimezone(timezone.utc)).total_seconds()))
            if seconds < 60:
                return f"{seconds}s"
            if seconds < 3600:
                return f"{seconds // 60}m"
            if seconds < 86400:
                return f"{seconds // 3600}h"
            return f"{seconds // 86400}d"
        except Exception:  # pylint: disable=broad-except
            return raw


class TripwireHandler(http.server.SimpleHTTPRequestHandler):
    collector = TwitterWebViewerCollector()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802 (framework method name)
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/twitter-search":
            self._handle_twitter_search(parsed)
            return
        super().do_GET()

    def _handle_twitter_search(self, parsed: urllib.parse.ParseResult) -> None:
        params = urllib.parse.parse_qs(parsed.query)
        query = (params.get("q") or [DEFAULT_SAMPLE_QUERY])[0]
        cursor = (params.get("cursor") or [""])[0]
        query_type = (params.get("queryType") or ["Latest"])[0] or "Latest"
        try:
            limit = int((params.get("limit") or ["12"])[0])
        except ValueError:
            limit = 12
        limit = max(1, min(limit, 30))

        try:
            payload = self.collector.collect(query=query, limit=limit, cursor=cursor, query_type=query_type)
            self._write_json(200, {"success": True, **payload})
        except Exception as exc:  # pylint: disable=broad-except
            self._write_json(
                502,
                {
                    "success": False,
                    "error": "Collection failed",
                    "detail": str(exc),
                    "query": query,
                },
            )

    def _write_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run Tripwire frontend locally")
    parser.add_argument("--host", default="127.0.0.1", help="Host interface (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8000, help="Port (default: 8000)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = Path(__file__).resolve().parent

    handler = lambda *a, **k: TripwireHandler(*a, directory=str(root), **k)

    with ReusableTCPServer((args.host, args.port), handler) as httpd:
        url = f"http://{args.host}:{args.port}/index.html"
        print(f"Tripwire UI serving from {root}")
        print(f"Open: {url}")
        print("API: /api/twitter-search?q=<query>")
        print("Press Ctrl+C to stop")
        webbrowser.open(url, new=2)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")


if __name__ == "__main__":
    main()
