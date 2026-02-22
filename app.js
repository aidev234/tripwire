const storageKey = "tripwire_custom_playbooks_v1";
const savedSearchesKey = "tripwire_saved_searches_v1";
const NEW_PLAYBOOK_ID = "__new_playbook__";

const basePlaybooks = [
  {
    id: "executive-protection",
    name: "Executive Protection",
    description: "Monitor explicit threats and hostile sentiment tied to a principal.",
    defaults: {
      unique: [],
      nonUnique: [],
      linking: [],
      issueAreas: ["explicit_threats", "explicit_threats_2", "negative_sentiment"],
    },
    custom: false,
  },
  {
    id: "negative-sentiment",
    name: "Negative Sentiment",
    description: "Track hostility and abusive sentiment around a target.",
    defaults: {
      unique: [],
      nonUnique: [],
      linking: [],
      issueAreas: ["negative_sentiment"],
    },
    custom: false,
  },
  {
    id: "location-protection",
    name: "Location Protection",
    description: "Monitor place-based threats and public safety advisories.",
    defaults: {
      unique: [],
      nonUnique: [],
      linking: [],
      issueAreas: ["location_threats", "official_advisories"],
    },
    custom: false,
  },
];

const issueLibrary = {
  physical_threat: ["threat", "harm", "target", "attack", "weapon", "shoot", "stab", "kill", "ambush", "sniper", "explosive", "detonate"],
  doxxing: ["address", "phone number", "leaked", "doxx", "exposed", "home address", "cell number", "license plate", "family details", "posted address"],
  travel_risk: ["route", "arrival time", "airport", "hotel room", "followed", "flight number", "terminal", "itinerary", "pickup point", "tailing", "convoy"],
  violence_incitement: ["take action", "bring", "riot", "burn", "storm", "show up armed", "make them pay", "hit list", "call to attack", "direct action"],
  reputation_attack: ["fraud", "scam", "corrupt", "exposed", "boycott", "cover-up", "criminal", "lawsuit", "bribery", "misconduct"],
  crowd_disruption: ["rush", "stampede", "breach", "evacuate", "panic", "gate crash", "barricade", "bottle throw", "flash mob", "overrun"],
  cyber_harassment: ["hack", "breach account", "ddos", "credential leak", "swarm report", "spam attack", "raid", "bot attack", "account takeover", "phishing"],
  stalking_surveillance: ["tracking", "follow them", "watching", "stakeout", "whereabouts", "live location", "seen at", "routine", "pattern of life", "tail them"],
  swatting: ["swat", "fake emergency", "bomb threat call", "hoax call", "call police on", "false hostage report", "prank 911", "dispatch to home"],
  impersonation_fraud: ["impersonating", "fake account", "deepfake", "forged message", "spoofed email", "posing as", "identity theft", "fraudulent request", "fake profile"],
  explicit_threats: [
    "will k*ll", "to k*ll", "will kill", "to kill", "should kill", "fucking kill", "be killed", "get killed", "will murder", "to murder",
    "should murder", "fucking murder", "be murdered", "get murdered", "will execute", "should execute", "to execute", "fucking execute",
    "be executed", "get executed", "sh00t", "should shoot", "will shoot", "to shoot", "fucking shoot", "be shot", "get shot", "should stab",
    "will stab", "to stab", "fucking stab", "be stabbed", "get stabbed", "to rape", "will rape", "should rape", "get raped", "be raped",
    "execute them", "hang them", "be hung", "should hang", "fucking head", "fucking neck", "fucking throat", "fucking skull", "be hanged",
    "be exterminated", "and kill",
  ],
  explicit_threats_2: [
    "you to death", "him to death", "her to death", "them to death", "gut you", "gut him", "gut her", "gut them", "to gut", "rag doll",
    "ragdoll", "rag dolled", "ragdolled", "behead", "beheaded", "decapitate", "decapitated", "string them up", "string him up", "string her up",
    "strung up", "curb stomp", "curb stomped", "in the head", "in the neck", "in the throat", "by the neck", "by the throat", "lynch him",
    "lynch her", "lynch them", "to lynch", "lynched", "cable ties", "cabled tied", "hogtied", "hog tied", "hog tie", "hogtie", "cable tie",
    "in the face", "be strangled", "strangle her", "strangle him", "strangle them", "will strangle", "strangle you", "punch you", "punch him",
    "punch her",
  ],
  negative_sentiment: [
    "cunt", "asshole", "bitch", "fuck", "f*ck", "shit", "bloodshed", "hate", "rage", "pissed", "angry", "fuming", "outrage", "go to hell",
    "thieves", "crooks", "motherfucker", "mother fucker", "bastard", "pedo", "evil", "corrupt", "vile", "traitor", "traitors", "treason",
    "treasonous", "snake", "maggot", "snakes", "maggots", "fucking", "fucked", "cunts", "assholes", "bitches", "witch", "witches",
  ],
  official_advisories: [
    "shelter in place", "shelterinplace", "avoid the area", "avoidthearea", "secure-in-place", "secure in place", "secureinplace",
    "stay away from the area", "been evacuated", "to evacuate", "investigating reports of", "situation is ongoing", "are investigating",
    "swat operations", "police operations", "swat situation", "active crime scene", "officers are on-scene", "officers are on-route",
    "call the police", "police on the scene", "police at the scene", "call the sheriff", "incident taking place", "incident took place",
    "emergency services on the scene", "call emergency services", "ambulance on scene", "first responder", "first responders", "cordoned off",
    "police responding", "officers responding", "law enforcement responding", "fbi responding", "mass evacuations", "evacuations ongoing",
    "evacuate the area", "advised to evacuat", "advised to evacuate",
  ],
  location_threats: [
    "call the police", "police on the scene", "police at the scene", "call the sheriff", "has a knife", "wielding a knife", "avoid the area",
    "active shooter", "explosive device", "stabbing", "gun shots", "gun fire", "shots fired", "terrorist attack", "terrorism incident",
    "incident taking place", "incident took place", "emergency services on the scene", "call emergency services", "ambulance on scene",
    "heard explosion", "saw explosion", "cordon off", "wielding a firearm", "has a firearm", "mass shooting", "mass shooter", "massshooting",
    "massshooter", "shelter in place", "shelterinplace", "avoidthearea", "terrorattack", "terroristattack", "evacuate", "evacuate the area",
    "evacuation", "ramming attack", "van attack", "truck attack", "crowd injured", "pedestrians injured", "people hit", "person hit",
    "mowed down", "mow down", "bomb threat", "evacuated", "police respond", "police responding",
  ],
};

const issueLabels = {
  physical_threat: "Physical Threat",
  doxxing: "Doxxing",
  travel_risk: "Travel Risk",
  violence_incitement: "Violence Incitement",
  reputation_attack: "Reputation Attack",
  crowd_disruption: "Crowd Disruption",
  cyber_harassment: "Cyber Harassment",
  stalking_surveillance: "Stalking / Surveillance",
  swatting: "Swatting",
  impersonation_fraud: "Impersonation / Fraud",
  explicit_threats: "Explicit Threats - System",
  explicit_threats_2: "Explicit Threats 2 - System",
  negative_sentiment: "Negative Sentiment - System",
  official_advisories: "Official Advisories - System",
  location_threats: "Location Threats - System",
};

const state = {
  playbookId: "",
  stage: "select_playbook",
  playbooks: [],
  unique: [],
  nonUnique: [],
  linking: [],
  customIssues: [],
  exclusions: [],
  issues: new Set(),
  logicOverrides: { final: "" },
  latestResults: [],
  latestSource: "",
  hasValidatedSearch: false,
  validatedPlanSignature: "",
};

const el = {
  playbookGrid: document.getElementById("playbook-grid"),
  playbookSelectionView: document.getElementById("playbook-selection-view"),
  playbookActiveView: document.getElementById("playbook-active-view"),
  activePlaybookCard: document.getElementById("active-playbook-card"),
  changePlaybookBtn: document.getElementById("change-playbook-btn"),
  builderFlow: document.getElementById("builder-flow"),
  targetInputsPanel: document.getElementById("target-inputs-panel"),
  issueAreaPanel: document.getElementById("issue-area-panel"),
  layer3Field: document.getElementById("layer3-field"),
  issueAreaField: document.getElementById("issue-area-field"),
  exclusionPanel: document.getElementById("exclusion-panel"),
  reviewBooleanPanel: document.getElementById("review-boolean-panel"),
  customIssueToggle: document.getElementById("custom-issue-toggle"),
  customIssueEditor: document.getElementById("custom-issue-editor"),
  showIssueKeywordsToggle: document.getElementById("show-issue-keywords-toggle"),
  issueKeywordsPreview: document.getElementById("issue-keywords-preview"),
  exclusionEditor: document.getElementById("exclusion-editor"),
  rawLogicEditor: document.getElementById("raw-logic-editor"),
  uniqueInput: document.getElementById("unique-term-input"),
  nonUniqueInput: document.getElementById("nonunique-term-input"),
  linkingInput: document.getElementById("linking-term-input"),
  customIssueInput: document.getElementById("custom-issue-input"),
  exclusionInput: document.getElementById("exclusion-term-input"),
  uniqueTags: document.getElementById("unique-tags"),
  nonUniqueTags: document.getElementById("nonunique-tags"),
  linkingTags: document.getElementById("linking-tags"),
  customIssueTags: document.getElementById("custom-issue-tags"),
  exclusionTags: document.getElementById("exclusion-tags"),
  issueGrid: document.getElementById("issue-area-grid"),
  finalLogic: document.getElementById("final-logic"),
  resetLogicBtn: document.getElementById("reset-logic-btn"),
  runSearchBtn: document.getElementById("run-search-btn"),
  searchStatus: document.getElementById("search-status"),
  feed: document.getElementById("social-feed"),
  feedSummary: document.getElementById("feed-summary"),
  feedEmptyState: document.getElementById("feed-empty-state"),
  cancelBtn: document.getElementById("cancel-btn"),
  feedColumn: document.querySelector(".feed-column"),
  saveSearchTrigger: document.getElementById("save-search-trigger"),
  saveSearchModal: document.getElementById("save-search-modal"),
  saveSearchClose: document.getElementById("save-search-close"),
  saveSearchName: document.getElementById("save-search-name"),
  streamLayoutMaster: document.getElementById("stream-layout-master"),
  streamLayoutSource: document.getElementById("stream-layout-source"),
  alertingEnabled: document.getElementById("alerting-enabled"),
  alertingConfig: document.getElementById("alerting-config"),
  alertingCadence: document.getElementById("alerting-cadence"),
  alertingThreshold: document.getElementById("alerting-threshold"),
  saveSearchConfirm: document.getElementById("save-search-confirm"),
};

function parseTagBuffer(raw) {
  return raw
    .split(/[;,]/)
    .map((term) => term.trim().replace(/[“”]/g, "\"").replace(/[‘’]/g, "'").replace(/^"|"$/g, "").toLowerCase())
    .filter(Boolean);
}

function normalize(term) {
  return `"${term.replace(/^"|"$/g, "")}"`;
}

function toOrGroup(terms) {
  return terms.length ? `(${terms.map(normalize).join(" OR ")})` : "";
}

function composeThreatTerms() {
  return Array.from(
    new Set([
      ...Array.from(state.issues).flatMap((issue) => issueLibrary[issue] || []),
      ...state.customIssues,
    ]),
  );
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightTerms(text, terms) {
  const includeTerms = terms || [];
  const exclusionTerms = state.exclusions || [];
  const allTerms = Array.from(new Set([...includeTerms, ...exclusionTerms].map((t) => t.trim()).filter(Boolean)))
    .sort((a, b) => b.length - a.length);
  if (!allTerms.length) {
    return escapeHtml(text);
  }
  const exclusionSet = new Set(exclusionTerms.map((t) => t.toLowerCase()));
  const regex = new RegExp(`(${allTerms.map((term) => escapeRegExp(term)).join("|")})`, "gi");
  let out = "";
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    out += escapeHtml(text.slice(last, match.index));
    const matched = match[0];
    const isExclusion = exclusionSet.has(matched.toLowerCase());
    const cls = isExclusion ? "match-hit-exclusion" : "match-hit";
    out += `<mark class="${cls}"><strong>${escapeHtml(matched)}</strong></mark>`;
    last = match.index + matched.length;
    if (regex.lastIndex === match.index) {
      regex.lastIndex += 1;
    }
  }
  out += escapeHtml(text.slice(last));
  return out;
}

function deriveLayersFromInputs() {
  return {
    layer1: toOrGroup(state.unique),
    layer2: toOrGroup(state.nonUnique),
    layer3: toOrGroup(state.linking),
    layer4: toOrGroup(composeThreatTerms()),
    exclusions: toOrGroup(state.exclusions),
  };
}

function buildAutoFinal(layer1, layer2, layer3, layer4) {
  const contextualBranch = layer2 && layer3 ? `(${layer2} AND ${layer3})` : "";
  const discoveryCandidates = [layer1, contextualBranch].filter(Boolean);
  if (!discoveryCandidates.length) {
    return "";
  }
  const discoveryGate = discoveryCandidates.length === 1 ? discoveryCandidates[0] : `(${discoveryCandidates.join(" OR ")})`;
  if (!layer4) {
    // Allow target-only searches when no issue areas are selected.
    return `(${discoveryGate})`;
  }
  return `(((${discoveryGate}) AND ${layer4}))`;
}

function getLogicState() {
  const derived = deriveLayersFromInputs();
  const baseFinal = buildAutoFinal(derived.layer1, derived.layer2, derived.layer3, derived.layer4);
  const autoFinal = baseFinal && derived.exclusions ? `(${baseFinal} AND NOT ${derived.exclusions})` : baseFinal;
  const manualActive = el.reviewBooleanPanel.open || !!state.logicOverrides.final.trim();
  const final = (manualActive && state.logicOverrides.final.trim()) ? state.logicOverrides.final.trim() : autoFinal;
  return { autoFinal, final };
}

function buildBoolean() {
  return getLogicState().final;
}

function buildAutoQueryWithThreatTerms(threatTerms) {
  const derived = deriveLayersFromInputs();
  const layer4 = toOrGroup(threatTerms);
  const baseFinal = buildAutoFinal(derived.layer1, derived.layer2, derived.layer3, layer4);
  return baseFinal && derived.exclusions ? `(${baseFinal} AND NOT ${derived.exclusions})` : baseFinal;
}

function getCompiledQuery() {
  const { autoFinal, final } = getLogicState();
  const query = (final || "").trim();
  const manualActive = el.reviewBooleanPanel.open || !!state.logicOverrides.final.trim();
  return {
    query,
    autoFinal: (autoFinal || "").trim(),
    usingManual: manualActive && !!state.logicOverrides.final.trim(),
  };
}

function getSearchPlan() {
  const compiled = getCompiledQuery();
  if (!compiled.query) {
    return { queries: [], usingManual: compiled.usingManual, split: false };
  }

  if (compiled.usingManual) {
    return { queries: [compiled.query], usingManual: true, split: false };
  }

  const selectedIssues = Array.from(state.issues);
  if (selectedIssues.length <= 1) {
    return { queries: [compiled.query], usingManual: false, split: false };
  }

  const splitQueries = selectedIssues
    .map((issue) => buildAutoQueryWithThreatTerms([...(issueLibrary[issue] || []), ...state.customIssues]))
    .map((query) => (query || "").trim())
    .filter(Boolean);
  const uniqueQueries = Array.from(new Set(splitQueries));

  return {
    queries: uniqueQueries.length ? uniqueQueries : [compiled.query],
    usingManual: false,
    split: uniqueQueries.length > 1,
  };
}

function getPlanSignature(plan) {
  const safePlan = plan || getSearchPlan();
  return `${safePlan.usingManual ? "manual" : "auto"}::${safePlan.queries.join(" || ")}`;
}

function addTerm(field, term) {
  const clean = term.trim().replace(/[“”]/g, "\"").replace(/[‘’]/g, "'").replace(/^"|"$/g, "").toLowerCase();
  if (!clean) {
    return;
  }
  const key = field;
  if (!state[key].some((item) => item.toLowerCase() === clean.toLowerCase())) {
    state[key].push(clean);
  }
}

function removeTerm(field, index) {
  state[field] = state[field].filter((_, idx) => idx !== index);
}

function renderTagList(field, container) {
  container.innerHTML = state[field]
    .map((term, idx) => `<button class="term-tag" type="button" data-tag-field="${field}" data-tag-index="${idx}">"${escapeHtml(term)}" <span>x</span></button>`)
    .join("");
}

function renderTagInputs() {
  renderTagList("unique", el.uniqueTags);
  renderTagList("nonUnique", el.nonUniqueTags);
  renderTagList("linking", el.linkingTags);
  renderTagList("customIssues", el.customIssueTags);
  renderTagList("exclusions", el.exclusionTags);
  el.uniqueInput.placeholder = state.unique.length
    ? ""
    : "e.g. \"barack obama\", \"chrysler build\"";
  el.nonUniqueInput.placeholder = state.nonUnique.length
    ? ""
    : "e.g. \"johns smith\", \"chinatown\"";
  el.linkingInput.placeholder = state.linking.length
    ? ""
    : "e.g. \"imperial smith town bank\", \"new york\"";
}

function renderIssueKeywordPreview() {
  if (!el.showIssueKeywordsToggle.checked) {
    el.issueKeywordsPreview.classList.add("hidden");
    return;
  }

  const keywords = composeThreatTerms();
  if (!keywords.length) {
    el.issueKeywordsPreview.classList.remove("hidden");
    el.issueKeywordsPreview.innerHTML = '<p class="help-text">No issue keywords selected.</p>';
    return;
  }

  el.issueKeywordsPreview.classList.remove("hidden");
  el.issueKeywordsPreview.innerHTML = keywords
    .slice(0, 140)
    .map((term) => `<span class="term-tag">"${escapeHtml(term)}"</span>`)
    .join("");
}

function updateProgressiveFlow() {
  const hasContextualStart = state.nonUnique.length > 0;
  const hasQuery = !!getCompiledQuery().query;
  const exclusionActive = el.exclusionPanel.open || state.exclusions.length > 0;
  const manualActive = el.reviewBooleanPanel.open || !!state.logicOverrides.final.trim();

  el.layer3Field.classList.toggle("hidden", !hasContextualStart);
  el.customIssueEditor.classList.toggle("hidden", !el.customIssueToggle.checked);
  el.exclusionEditor.classList.toggle("hidden", !exclusionActive);
  el.rawLogicEditor.classList.toggle("hidden", !manualActive);
  el.runSearchBtn.disabled = !hasQuery;

  renderIssueKeywordPreview();
}

function commitTagInput(field, input) {
  const terms = parseTagBuffer(input.value);
  if (!terms.length) {
    return;
  }
  const nonUniqueWasEmpty = field === "nonUnique" && state.nonUnique.length === 0;
  terms.forEach((term) => addTerm(field, term));
  input.value = "";
  recompute();
  if (nonUniqueWasEmpty && state.nonUnique.length > 0 && state.linking.length === 0) {
    window.setTimeout(() => {
      el.linkingInput.focus();
    }, 0);
  }
}

function setInputIfUnfocused(input, value) {
  if (!input || document.activeElement === input) {
    return;
  }
  if (input.value !== value) {
    input.value = value;
  }
}

function renderLogicEditor() {
  const { autoFinal } = getLogicState();
  setInputIfUnfocused(el.finalLogic, state.logicOverrides.final || autoFinal);
}

function bodyHasAny(text, terms) {
  if (!terms.length) {
    return false;
  }
  const lower = (text || "").toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function rawQueryMatches(text, query) {
  const notZone = [...query.matchAll(/NOT\s*\(([^)]*)\)/gi)].map((m) => m[1]).join(" ");
  const blockedTerms = [...notZone.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (bodyHasAny(text, blockedTerms)) {
    return false;
  }
  const positiveZone = query.replace(/NOT\s*\(([^)]*)\)/gi, " ");
  const positiveTerms = [...positiveZone.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (!positiveTerms.length) {
    return true;
  }
  return bodyHasAny(text, positiveTerms);
}

function structuredMatches(text) {
  const hasL1 = bodyHasAny(text, state.unique);
  const hasL2 = bodyHasAny(text, state.nonUnique);
  const hasL3 = bodyHasAny(text, state.linking);
  const hasL4 = bodyHasAny(text, composeThreatTerms());
  const excluded = bodyHasAny(text, state.exclusions);
  return (hasL1 || (hasL2 && hasL3)) && hasL4 && !excluded;
}

function matchesCurrentQuery(text) {
  const query = buildBoolean().trim();
  if (!query) {
    return false;
  }
  if ((el.reviewBooleanPanel.open || !!state.logicOverrides.final.trim()) && state.logicOverrides.final.trim()) {
    return rawQueryMatches(text, query);
  }
  return structuredMatches(text);
}

function renderFeed(posts = [], source = "") {
  if (!posts.length) {
    el.feedSummary.textContent = "";
    el.feed.innerHTML = "";
    el.feedSummary.classList.add("hidden");
    el.feed.classList.add("hidden");
    el.feedEmptyState.classList.remove("hidden");
    return;
  }

  el.feedSummary.classList.remove("hidden");
  el.feed.classList.remove("hidden");
  el.feedEmptyState.classList.add("hidden");

  const highlightPool = [...state.unique, ...state.nonUnique, ...state.linking, ...composeThreatTerms(), ...state.exclusions];
  const sourceTag = source ? ` via ${escapeHtml(source)}` : "";
  el.feedSummary.textContent = `${posts.length} raw posts collected${sourceTag}`;
  el.feed.innerHTML = posts
    .map((post) => {
      const active = matchesCurrentQuery(post.body || "");
      const url = post.url ? `<a href="${escapeHtml(post.url)}" target="_blank" rel="noopener noreferrer">open</a>` : "";
      return `
        <article class="post-card ${active ? "" : "muted"}">
          <div class="post-meta">
            <span>${escapeHtml(post.platform || "X")}</span>
            <span>${escapeHtml(post.handle || "@unknown")}</span>
            <span>${escapeHtml(post.ts || "")}</span>
            <span>${active ? "captured" : "outside current query"}</span>
            <span>${url}</span>
          </div>
          <p class="post-body">${highlightTerms(post.body || "", highlightPool)}</p>
        </article>
      `;
    })
    .join("");
}

function getPlaybookById(playbookId) {
  if (playbookId === NEW_PLAYBOOK_ID) {
    return {
      id: NEW_PLAYBOOK_ID,
      name: "New Playbook",
      description: "Blank workspace for manually building a new playbook.",
      defaults: { unique: [], nonUnique: [], linking: [], customIssues: [], issueAreas: [] },
      custom: false,
    };
  }
  return state.playbooks.find((item) => item.id === playbookId);
}

function getDefaultSaveSearchTitle() {
  const playbook = getPlaybookById(state.playbookId);
  const playbookName = (playbook && playbook.name) || "Playbook";
  const firstUnique = state.unique[0] || "Search";
  return `${playbookName} - ${firstUnique}`.toUpperCase();
}

function updateSaveSearchVisibility() {
  const currentSignature = getPlanSignature(getSearchPlan());
  const isCurrentConfigValidated = state.hasValidatedSearch && state.validatedPlanSignature === currentSignature;
  const visible = state.stage === "build" && isCurrentConfigValidated;
  el.saveSearchTrigger.classList.toggle("hidden", !visible);
}

function openSaveSearchModal() {
  if (!state.hasValidatedSearch) {
    return;
  }
  el.saveSearchName.value = getDefaultSaveSearchTitle();
  el.streamLayoutMaster.checked = true;
  el.streamLayoutSource.checked = false;
  el.alertingEnabled.checked = false;
  el.alertingCadence.value = "instant";
  el.alertingThreshold.value = "1";
  el.alertingConfig.classList.add("hidden");
  el.saveSearchModal.classList.remove("hidden");
  el.saveSearchName.focus();
  el.saveSearchName.select();
}

function closeSaveSearchModal() {
  el.saveSearchModal.classList.add("hidden");
}

function loadSavedSearches() {
  try {
    const raw = window.localStorage.getItem(savedSearchesKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function persistSavedSearch(payload) {
  const existing = loadSavedSearches();
  existing.unshift(payload);
  window.localStorage.setItem(savedSearchesKey, JSON.stringify(existing.slice(0, 150)));
}

function saveCurrentSearchConfig() {
  const title = el.saveSearchName.value.trim();
  if (!title) {
    el.saveSearchName.focus();
    return;
  }

  const playbook = getPlaybookById(state.playbookId);
  const plan = getSearchPlan();
  const compiled = getCompiledQuery();
  const payload = {
    id: `saved-${Date.now()}`,
    title,
    playbookId: state.playbookId,
    playbookName: (playbook && playbook.name) || "Unknown",
    queryMode: compiled.usingManual ? "manual" : "auto",
    layout: el.streamLayoutSource.checked ? "per_source" : "master",
    alerting: {
      enabled: el.alertingEnabled.checked,
      cadence: el.alertingEnabled.checked ? el.alertingCadence.value : null,
      threshold: el.alertingEnabled.checked ? Number(el.alertingThreshold.value || "1") : null,
    },
    queryPlan: [...plan.queries],
    mergedQueryCount: plan.queries.length,
    createdAt: new Date().toISOString(),
  };

  persistSavedSearch(payload);
  closeSaveSearchModal();
  el.searchStatus.textContent = `Saved search "${title}" with ${payload.mergedQueryCount} query stream${payload.mergedQueryCount === 1 ? "" : "s"}.`;
}

function applyPlaybook(playbookId) {
  const playbook = getPlaybookById(playbookId);
  if (!playbook) {
    return;
  }

  state.stage = "build";
  state.playbookId = playbook.id;
  state.unique = [];
  state.nonUnique = [];
  state.linking = [];
  state.customIssues = [...(playbook.defaults.customIssues || [])];
  state.exclusions = [];
  state.issues = new Set(playbook.defaults.issueAreas || []);
  state.logicOverrides = { final: "" };
  state.latestResults = [];
  state.latestSource = "";
  state.hasValidatedSearch = false;
  state.validatedPlanSignature = "";

  el.uniqueInput.value = "";
  el.nonUniqueInput.value = "";
  el.linkingInput.value = "";
  el.customIssueInput.value = "";
  el.exclusionInput.value = "";
  el.customIssueToggle.checked = state.customIssues.length > 0;
  el.showIssueKeywordsToggle.checked = false;

  renderIssueAreaSelection();
  renderPlaybookButtons();
  renderFeed();
  recompute();
}

function loadCustomPlaybooks() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.id && item.name && item.defaults) : [];
  } catch (error) {
    return [];
  }
}

function initializePlaybooks() {
  state.playbooks = [...basePlaybooks, ...loadCustomPlaybooks()];
}

function renderPlaybookButtons() {
  const newPlaybookCard = `
      <button class="playbook-btn ${state.playbookId === NEW_PLAYBOOK_ID ? "active" : ""}" data-playbook-id="${NEW_PLAYBOOK_ID}" type="button">
        <span class="playbook-name">New Playbook</span>
        <span class="playbook-desc">Start from empty keywords and empty issue set.</span>
      </button>
    `;
  const cards = state.playbooks
    .map(
      (playbook) => `
      <button class="playbook-btn ${playbook.id === state.playbookId ? "active" : ""} ${playbook.custom ? "custom" : ""}" data-playbook-id="${playbook.id}" type="button">
        <span class="playbook-name">${playbook.name}</span>
        <span class="playbook-desc">${playbook.description}</span>
      </button>
    `,
    )
    .join("");
  el.playbookGrid.innerHTML = `${newPlaybookCard}${cards}`;
}

function renderIssueAreaSelection() {
  el.issueGrid.innerHTML = Object.keys(issueLibrary)
    .map((issueKey) => {
      const selected = state.issues.has(issueKey);
      return `
        <button class="issue-chip ${selected ? "selected" : ""}" data-issue="${issueKey}" type="button" aria-pressed="${selected ? "true" : "false"}">
          ${issueLabels[issueKey]}
        </button>
      `;
    })
    .join("");
}

function renderPlaybookFlow() {
  const playbook = getPlaybookById(state.playbookId);
  const buildMode = state.stage === "build" && !!playbook;

  el.playbookSelectionView.classList.toggle("hidden", buildMode);
  el.playbookActiveView.classList.toggle("hidden", !buildMode);
  el.builderFlow.classList.toggle("hidden", !buildMode);
  el.feedColumn.classList.toggle("hidden", !buildMode);
  updateSaveSearchVisibility();

  if (!buildMode) {
    el.activePlaybookCard.innerHTML = "";
    return;
  }

  el.activePlaybookCard.innerHTML = `
    <div class="playbook-name">${escapeHtml(playbook.name)}</div>
    <div class="playbook-desc">${escapeHtml(playbook.description)}</div>
  `;
}

function clearStateForCancel() {
  state.stage = "select_playbook";
  state.playbookId = "";
  state.unique = [];
  state.nonUnique = [];
  state.linking = [];
  state.customIssues = [];
  state.exclusions = [];
  state.issues = new Set();
  state.logicOverrides = { final: "" };
  state.latestResults = [];
  state.latestSource = "";
  state.hasValidatedSearch = false;
  state.validatedPlanSignature = "";

  el.uniqueInput.value = "";
  el.nonUniqueInput.value = "";
  el.linkingInput.value = "";
  el.customIssueInput.value = "";
  el.exclusionInput.value = "";
  el.customIssueToggle.checked = false;
  el.showIssueKeywordsToggle.checked = false;

  renderIssueAreaSelection();
  renderPlaybookButtons();
  renderFeed();
  recompute();
}

function recompute() {
  const compiled = getCompiledQuery();
  const query = compiled.query;
  renderPlaybookFlow();
  renderIssueAreaSelection();
  renderTagInputs();
  updateProgressiveFlow();
  renderLogicEditor();

  if (state.latestResults.length) {
    renderFeed(state.latestResults, state.latestSource);
  }
  updateSaveSearchVisibility();

  if (!query.trim()) {
    el.searchStatus.textContent = "Query incomplete. Add keyterms to continue.";
  } else if (!state.latestResults.length) {
    el.searchStatus.textContent = compiled.usingManual
      ? "Manual boolean active. Run search to collect raw data."
      : "Auto boolean compiled from inputs. Run search to collect raw data.";
  }
}

async function runSearch() {
  const plan = getSearchPlan();
  if (!plan.queries.length) {
    el.searchStatus.textContent = "Query is empty. Add keyterm tags first.";
    return;
  }

  el.runSearchBtn.disabled = true;
  el.searchStatus.textContent = plan.split
    ? `Collecting and merging ${plan.queries.length} split queries...`
    : "Collecting raw Twitter data...";

  try {
    const settled = await Promise.allSettled(
      plan.queries.map(async (query) => {
        const endpoint = `/api/twitter-search?q=${encodeURIComponent(query)}&limit=12&queryType=Latest`;
        const response = await fetch(endpoint, { method: "GET" });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.detail || payload.error || "Collection failed");
        }
        return payload;
      }),
    );

    const successes = settled.filter((item) => item.status === "fulfilled").map((item) => item.value);
    if (!successes.length) {
      const firstError = settled.find((item) => item.status === "rejected");
      const reason = firstError && firstError.status === "rejected" ? firstError.reason : new Error("Collection failed");
      throw reason;
    }

    const mergedPosts = [];
    const seen = new Set();
    for (const payload of successes) {
      const posts = Array.isArray(payload.posts) ? payload.posts : [];
      for (const post of posts) {
        const key = post.id || post.url || `${post.handle || ""}|${post.body || ""}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        mergedPosts.push(post);
      }
    }

    state.latestResults = mergedPosts;
    state.latestSource = plan.split
      ? `merged ${successes.length}/${plan.queries.length} queries`
      : (successes[0].source || "collector");
    // Only expose "Save Search" after at least one result is returned.
    state.hasValidatedSearch = mergedPosts.length > 0;
    state.validatedPlanSignature = state.hasValidatedSearch ? getPlanSignature(plan) : "";
    renderFeed(state.latestResults, state.latestSource);
    el.searchStatus.textContent = mergedPosts.length
      ? `Collected ${mergedPosts.length} post(s) using ${plan.usingManual ? "manual" : "auto"} boolean${plan.split ? " (split/merged)" : ""}.`
      : "No posts returned for current query.";
    updateSaveSearchVisibility();
  } catch (error) {
    state.hasValidatedSearch = false;
    state.validatedPlanSignature = "";
    updateSaveSearchVisibility();
    renderFeed();
    el.searchStatus.textContent = `Search failed: ${error.message}`;
  } finally {
    updateProgressiveFlow();
  }
}

function bindTagInput(field, input) {
  const shell = input.closest(".tag-input-shell");
  if (shell) {
    shell.addEventListener("click", () => {
      input.focus();
    });
  }

  input.addEventListener("keydown", (event) => {
    if (event.isComposing) {
      return;
    }
    if (!["Enter", ",", ";"].includes(event.key) && event.keyCode !== 13) {
      return;
    }
    event.preventDefault();
    commitTagInput(field, input);
  });

  input.addEventListener("blur", () => {
    commitTagInput(field, input);
  });
}

function bindEvents() {
  el.playbookGrid.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-playbook-id]");
    if (!btn) {
      return;
    }
    applyPlaybook(btn.dataset.playbookId);
  });

  el.issueGrid.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-issue]");
    if (!chip) {
      return;
    }
    const issue = chip.dataset.issue;
    if (state.issues.has(issue)) {
      state.issues.delete(issue);
    } else {
      state.issues.add(issue);
    }
    recompute();
  });

  bindTagInput("unique", el.uniqueInput);
  bindTagInput("nonUnique", el.nonUniqueInput);
  bindTagInput("linking", el.linkingInput);
  bindTagInput("customIssues", el.customIssueInput);
  bindTagInput("exclusions", el.exclusionInput);

  [el.uniqueTags, el.nonUniqueTags, el.linkingTags, el.customIssueTags, el.exclusionTags].forEach((container) => {
    container.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-tag-field]");
      if (!chip) {
        return;
      }
      removeTerm(chip.dataset.tagField, Number(chip.dataset.tagIndex));
      recompute();
    });
  });

  el.customIssueToggle.addEventListener("change", () => {
    if (!el.customIssueToggle.checked) {
      state.customIssues = [];
      el.customIssueInput.value = "";
    }
    recompute();
  });

  el.exclusionPanel.addEventListener("toggle", () => {
    if (!el.exclusionPanel.open && el.exclusionInput) {
      el.exclusionInput.blur();
    }
    recompute();
  });

  el.reviewBooleanPanel.addEventListener("toggle", () => {
    recompute();
  });

  el.showIssueKeywordsToggle.addEventListener("change", () => {
    recompute();
  });

  el.finalLogic.addEventListener("input", () => {
    state.logicOverrides.final = el.finalLogic.value;
    recompute();
  });

  el.resetLogicBtn.addEventListener("click", () => {
    state.logicOverrides = { final: "" };
    recompute();
  });

  el.runSearchBtn.addEventListener("click", () => {
    runSearch();
  });

  el.saveSearchTrigger.addEventListener("click", () => {
    openSaveSearchModal();
  });

  el.saveSearchClose.addEventListener("click", () => {
    closeSaveSearchModal();
  });

  el.saveSearchConfirm.addEventListener("click", () => {
    saveCurrentSearchConfig();
  });

  el.alertingEnabled.addEventListener("change", () => {
    el.alertingConfig.classList.toggle("hidden", !el.alertingEnabled.checked);
  });

  el.saveSearchModal.addEventListener("click", (event) => {
    if (event.target === el.saveSearchModal) {
      closeSaveSearchModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el.saveSearchModal.classList.contains("hidden")) {
      closeSaveSearchModal();
    }
  });

  el.cancelBtn.addEventListener("click", () => {
    closeSaveSearchModal();
    clearStateForCancel();
  });

  el.changePlaybookBtn.addEventListener("click", () => {
    state.stage = "select_playbook";
    recompute();
  });
}

function init() {
  initializePlaybooks();
  renderPlaybookButtons();
  renderIssueAreaSelection();
  bindEvents();
  closeSaveSearchModal();
  renderFeed();
  recompute();
}

init();
