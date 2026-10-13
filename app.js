/* =========================================================
   THE DAILY CLIMB — personal positive e-paper
   Edit CONFIG to personalize. All APIs below are free,
   need no API key, and allow browser (CORS) requests.
   ========================================================= */

const CONFIG = {
  readerName: "", // e.g. "Rahul" → shows "for Rahul"
  // DEV Community tags for the "Learn" section (first one is default)
  learnTags: ["webdev", "javascript", "python", "ai", "systemdesign", "devops", "react"],
  // Region for Google News searches (en-IN = India; use en-US / US / US:en for the US)
  newsRegion: { hl: "en-IN", gl: "IN", ceid: "IN:en" },
  // Interview Stories: how people got into the world's best companies.
  // Only stories that name one of TOP_COMPANIES (below) are kept.
  interviewNewsQueries: [
    '"cracked" OR "landed" OR "bagged" job Google OR Microsoft OR Amazon OR Meta OR Apple engineer',
    '"how I got" OR "my journey" OR "interview experience" Google OR Microsoft OR Amazon OR Nvidia OR OpenAI OR Netflix'
  ],
  interviewQueries: [ // Hacker News
    "Google interview experience", "how I got into Google", "joined Microsoft",
    "Amazon offer", "Meta interview", "FAANG offer", "Big Tech job journey"
  ],
  interviewMediumTags: ["faang", "google-interview", "interview-experience"],
  interviewTags: ["faang", "interview", "career"], // DEV
  // Startup searches
  startupQueries: ["Show HN", "launch", "raised seed", "bootstrapped", "indie hacker"],
  // Good News: the positive side of the IT industry (Google News searches, last 7 days)
  techNewsQueries: [
    'tech OR IT companies hiring OR "hiring spree" OR "new jobs" software engineers',
    'tech company expands OR "new campus" OR "new office" OR "invests" India OR global',
    'AI OR semiconductor OR software breakthrough OR "record growth" OR "record revenue"'
  ],
  // Hacker News searches for upbeat industry news
  techNewsHN: ["hiring", "record revenue", "open sources", "breakthrough"],
  cacheMinutes: 60,
  daysBack: 10
};

/* Words that make a story "not positive" — those stories are hidden.
   Each entry matches at the start of a word ("layoff" also hides "layoffs"). */
const NEGATIVE = [
  "layoff", "lay off", "laid off", "fired", "firing", "job cut", "job loss", "cuts\\b", "cutting jobs",
  "slash", "downsiz", "hiring freeze", "freeze", "restructur", "retrench", "pink slip", "let go",
  "death", "died", "dies\\b", "killed", "lawsuit", "sued\\b", "scam", "fraud", "hacked", "hackers?\\b",
  "breach", "crash", "collapse", "shutdown", "shuts down", "bankrupt", "toxic", "burnout", "rejected",
  "wars?\\b", "attack", "arrest", "fail", "hate\\b", "worst", "depress", "outage", "recession",
  "slowdown", "downturn", "decline", "plunge", "slump", "tumble", "doomed", "rant\\b", "fear",
  "threat", "warn", "crisis", "bubble", "struggl", "replace", "job-killing", "jobless", "unemploy"
];
const NEGATIVE_RE = new RegExp("\\b(" + NEGATIVE.join("|") + ")", "i");
const isPositive = (t = "") => !NEGATIVE_RE.test(t);

/* Good News must also sound upbeat */
const UPBEAT_RE = /\b(hir(e|es|ed|ing)|jobs?\b|expan|opens?\b|launch|record|grow|growth|invest|breakthrough|boost|surge|rise|rising|wins?\b|award|campus|salary hike|bonus|demand|open[- ]sourc|milestone|new office|partners?hip)/i;

/* Interview Stories must name one of these companies… */
const TOP_COMPANIES = [
  "Google", "Alphabet", "DeepMind", "Microsoft", "Amazon", "AWS", "Meta", "Facebook", "Apple",
  "Netflix", "Nvidia", "OpenAI", "Anthropic", "Tesla", "Stripe", "Adobe", "Salesforce", "Uber",
  "Airbnb", "LinkedIn", "Atlassian", "Goldman Sachs", "Databricks", "Intuit", "FAANG", "MAANG", "Big Tech"
];
const COMPANY_RE = new RegExp("\\b(" + TOP_COMPANIES.join("|") + ")\\b", "i");
/* …and read like a "how I got in" story */
const STORY_RE = /\b(got|get|getting|land(ed|ing)?|crack(ed|ing)?|bag(s|ged)?|join(ed|ing)?|offers?|hired|selected|interview|journey|how i|made it|my path|road to|internship|intern\b|package|placed|preparation|prepared)/i;
const companyOf = t => {
  const m = t.match(COMPANY_RE);
  return m ? TOP_COMPANIES.find(c => c.toLowerCase() === m[1].toLowerCase()) : "";
};

const TIPS = [
  "Solve one DSA problem before breakfast. Consistency beats intensity.",
  "Ask for referrals with a 3-line message: who you are, the role link, why you fit.",
  "Write down one thing you learned today. Small notes become interview stories.",
  "Practice explaining a past project in 2 minutes: problem, your role, impact, numbers.",
  "Study one system design concept a day: caching, queues, sharding, rate limiting…",
  "Rewrite one resume bullet today with a measurable result.",
  "Mock interviews feel awkward — that's exactly why they work. Book one this week.",
  "Read the engineering blog of a company you admire. Mention it in your interview.",
  "Rejections are data, not verdicts. Note what tripped you up and drill it.",
  "Build in public: a tiny project shipped beats a big one planned.",
  "Learn the 'why' behind a pattern, not just the code. Interviewers probe the why.",
  "Spend 20 minutes on LLD: design a parking lot, an elevator or a URL shortener.",
  "Update your LinkedIn headline to the role you want, not the one you have.",
  "Your current job is practice for the next one. Take on the hardest ticket."
];

const QUOTES = [
  ["The expert in anything was once a beginner.", "Helen Hayes"],
  ["It always seems impossible until it's done.", "Nelson Mandela"],
  ["Small daily improvements are the key to staggering long-term results.", "Unknown"],
  ["Don't watch the clock; do what it does. Keep going.", "Sam Levenson"],
  ["You don't have to be great to start, but you have to start to be great.", "Zig Ziglar"]
];

const PLAYBOOK = [
  ["Pick your target list", "Choose 15–20 product companies and the exact role/level. Focus beats spraying applications."],
  ["DSA foundations (8–10 weeks)", "Arrays, strings, hashing, two pointers, trees, graphs, DP. Aim for patterns, not problem counts."],
  ["System & low-level design", "HLD for 3+ years experience: caching, DBs, queues, scaling. LLD: OOP, SOLID, design patterns."],
  ["Make your projects talk", "Rewrite resume bullets as impact: what you built, for whom, and the measurable result."],
  ["Referrals over cold applies", "Message alumni and ex-colleagues. A short, specific ask gets replies."],
  ["Mock interviews", "Do at least 5 timed mocks. Talk out loud — communication is half the score."],
  ["Behavioral stories", "Prepare 6–8 STAR stories: conflict, failure, ownership, leadership, ambiguity."],
  ["Negotiate with data", "Use levels.fyi / Glassdoor ranges. Competing offers help — always ask politely."]
];

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const stripHtml = s => String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const clip = (s, n = 140) => (s.length > n ? s.slice(0, n).trim() + "…" : s);
const ago = d => {
  const h = Math.floor((Date.now() - new Date(d)) / 36e5);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

async function cachedFetch(url) {
  const key = "dc:" + url;
  const hit = store.get(key);
  if (hit && Date.now() - hit.t < CONFIG.cacheMinutes * 6e4) return hit.d;
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  const d = await res.json();
  store.set(key, { t: Date.now(), d });
  return d;
}

const skeletons = (el, n = 6) => { el.innerHTML = Array(n).fill('<div class="skeleton"></div>').join(""); };

function renderCards(el, items, emptyMsg = "Nothing new here right now — check back soon.") {
  if (!items.length) { el.innerHTML = `<p class="empty">${emptyMsg}</p>`; return; }
  el.innerHTML = items.map(i => `
    <article class="card">
      ${i.image ? `<img src="${esc(i.image)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
      <h3><a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.title)}</a></h3>
      ${i.desc ? `<p>${esc(clip(i.desc))}</p>` : ""}
      <div class="meta">
        ${i.tag ? `<span class="tag">${esc(i.tag)}</span>` : ""}
        ${i.source ? `<span>${esc(i.source)}</span>` : ""}
        ${i.date ? `<span>${ago(i.date)}</span>` : ""}
        ${i.extra ? `<span>${esc(i.extra)}</span>` : ""}
      </div>
    </article>`).join("");
}

const dedupe = arr => {
  const seen = new Set();
  return arr.filter(i => { const k = i.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
};

/* ---------- sources ---------- */

// Hacker News via Algolia (free, no key)
async function hn(query, minPoints = 5, days = CONFIG.daysBack) {
  const since = Math.floor(Date.now() / 1000) - days * 86400;
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${since},points>${minPoints}&hitsPerPage=10`;
  const d = await cachedFetch(url);
  return d.hits.map(h => ({
    title: h.title,
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    date: h.created_at,
    source: "Hacker News",
    extra: `▲ ${h.points}`,
    score: h.points
  }));
}

// DEV Community (free, no key)
async function dev(tag, count = 9) {
  const d = await cachedFetch(`https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&top=7&per_page=${count}`);
  return d.map(a => ({
    title: a.title,
    url: a.url,
    desc: a.description,
    image: a.cover_image || a.social_image,
    date: a.published_at,
    tag: "#" + tag,
    source: a.user?.name,
    extra: `♥ ${a.public_reactions_count}`,
    score: a.public_reactions_count
  }));
}

// GitHub repos created recently, sorted by stars (free, no key, 10 req/min)
async function trendingRepos() {
  const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const d = await cachedFetch(`https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=8`);
  return d.items.map(r => ({
    title: r.full_name,
    url: r.html_url,
    desc: r.description || "",
    tag: r.language || "",
    extra: `★ ${r.stargazers_count.toLocaleString()}`
  }));
}

// Positive news RSS via rss2json (free tier, no key)
async function rss(feed) {
  const d = await cachedFetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`);
  return (d.items || []).map(i => ({
    title: i.title,
    url: i.link,
    desc: stripHtml(i.description),
    image: i.thumbnail || i.enclosure?.link,
    date: i.pubDate?.replace(" ", "T") + "Z",
    source: d.feed?.title,
    author: i.author
  }));
}

// Google News search as RSS (fetched through rss2json)
async function gnews(query, days) {
  const { hl, gl, ceid } = CONFIG.newsRegion;
  const feed = `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:${days}d`)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  return (await rss(feed)).map(i => {
    // Titles look like "Headline - Publisher"
    const cut = i.title.lastIndexOf(" - ");
    return { ...i, title: cut > 0 ? i.title.slice(0, cut) : i.title, source: cut > 0 ? i.title.slice(cut + 3) : "Google News", desc: "" };
  });
}

// Medium tag feed (fetched through rss2json)
async function medium(tag) {
  return (await rss(`https://medium.com/feed/tag/${tag}`)).map(i => ({ ...i, source: `Medium · ${i.author || ""}`.replace(/ · $/, "") }));
}

// Take items from each source in turn so no single source dominates
const interleave = lists => {
  const out = [];
  for (let i = 0; lists.some(l => i < l.length); i++) lists.forEach(l => { if (i < l.length) out.push(l[i]); });
  return out;
};
const settled = async jobs => (await Promise.allSettled(jobs)).map(r => r.status === "fulfilled" ? r.value : []);

/* ---------- sections ---------- */

async function loadQuote() {
  try {
    const q = await fetch("https://dummyjson.com/quotes/random").then(r => r.json());
    $("quoteText").textContent = `“${q.quote}”`;
    $("quoteAuthor").textContent = q.author;
  } catch {
    const [t, a] = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    $("quoteText").textContent = `“${t}”`;
    $("quoteAuthor").textContent = a;
  }
}

async function loadLearn(tag) {
  const grid = $("learnGrid");
  skeletons(grid);
  document.querySelectorAll("#learnChips .chip").forEach(c => c.classList.toggle("active", c.dataset.tag === tag));
  try {
    renderCards(grid, (await dev(tag)).filter(i => isPositive(i.title)));
  } catch { grid.innerHTML = '<p class="empty">Couldn\'t reach DEV right now.</p>'; }
}

async function loadRepos() {
  const grid = $("repoGrid");
  skeletons(grid, 4);
  try { renderCards(grid, await trendingRepos()); }
  catch { grid.innerHTML = '<p class="empty">GitHub is resting (rate limit). Try again in a minute.</p>'; }
}

async function loadInterviews() {
  const grid = $("interviewGrid");
  skeletons(grid);
  const lists = await settled([
    ...CONFIG.interviewNewsQueries.map(q => gnews(q, 30)),
    ...CONFIG.interviewMediumTags.map(medium),
    ...CONFIG.interviewQueries.map(q => hn(q, 3, 90)),
    ...CONFIG.interviewTags.map(t => dev(t, 15))
  ]);
  const keep = i => isPositive(i.title) && COMPANY_RE.test(i.title + " " + (i.tag || "")) && STORY_RE.test(i.title);
  const items = dedupe(interleave(lists.map(l => l.filter(keep))))
    .slice(0, 12)
    .map(i => ({ ...i, tag: companyOf(i.title) || i.tag }));
  renderCards(grid, items, "No new stories from the top companies this week — check back tomorrow.");
  return items;
}

async function loadStartups() {
  const grid = $("startupGrid");
  skeletons(grid);
  const results = (await Promise.allSettled(CONFIG.startupQueries.map(q => hn(q, 20))))
    .flatMap(r => r.status === "fulfilled" ? r.value : []);
  const items = dedupe(results.filter(i => isPositive(i.title))).sort((a, b) => b.score - a.score).slice(0, 12);
  renderCards(grid, items);
  return items;
}

async function loadGoodNews() {
  const grid = $("goodGrid");
  skeletons(grid);
  const lists = await settled([
    ...CONFIG.techNewsQueries.map(q => gnews(q, 7)),
    ...CONFIG.techNewsHN.map(q => hn(q, 50))
  ]);
  const keep = i => isPositive(i.title + " " + (i.desc || "")) && UPBEAT_RE.test(i.title);
  const items = dedupe(interleave(lists.map(l => l.filter(keep)
    .sort((a, b) => new Date(b.date) - new Date(a.date))))).slice(0, 12);
  renderCards(grid, items, "Tech good news is loading slowly — check back soon.");
}

function renderLead(items) {
  const lead = items[0];
  const el = $("leadStory");
  if (!lead) { el.innerHTML = '<span class="kicker">Lead Story</span><h2>Your story is being written today. Go build something.</h2>'; return; }
  el.innerHTML = `
    <span class="kicker">Lead Story · ${esc(lead.source || "")}</span>
    <h2><a href="${esc(lead.url)}" target="_blank" rel="noopener">${esc(lead.title)}</a></h2>
    ${lead.desc ? `<p>${esc(clip(lead.desc, 220))}</p>` : ""}
    <p class="meta" style="font-family:var(--sans);font-size:12px;color:var(--muted)">${lead.date ? ago(lead.date) : ""} ${lead.extra ? "· " + esc(lead.extra) : ""}</p>`;
}

function setupStatic() {
  const now = new Date();
  $("today").textContent = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hr = now.getHours();
  $("edition").textContent = hr < 12 ? "Morning Edition" : hr < 17 ? "Afternoon Edition" : "Evening Edition";
  if (CONFIG.readerName) $("readerName").textContent = `for ${CONFIG.readerName}`;

  const dayIndex = Math.floor(now / 864e5);
  $("dailyTip").textContent = TIPS[dayIndex % TIPS.length];

  // reading streak
  const today = now.toDateString();
  const s = store.get("dc:streak") || { last: null, count: 0 };
  if (s.last !== today) {
    const yesterday = new Date(now - 864e5).toDateString();
    s.count = s.last === yesterday ? s.count + 1 : 1;
    s.last = today;
    store.set("dc:streak", s);
  }
  $("streakCount").textContent = s.count;

  $("playbook").innerHTML = PLAYBOOK.map(([h, p]) => `<li><h4>${esc(h)}</h4><p>${esc(p)}</p></li>`).join("");

  $("learnChips").innerHTML = CONFIG.learnTags.map(t => `<button class="chip" data-tag="${esc(t)}">#${esc(t)}</button>`).join("");
  $("learnChips").addEventListener("click", e => { if (e.target.dataset.tag) { store.set("dc:tag", e.target.dataset.tag); loadLearn(e.target.dataset.tag); } });

  // theme
  const saved = store.get("dc:theme");
  if (saved) document.documentElement.dataset.theme = saved;
  $("themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store.set("dc:theme", next);
  });

  $("refreshBtn").addEventListener("click", () => {
    try { Object.keys(localStorage).filter(k => k.startsWith("dc:http")).forEach(k => localStorage.removeItem(k)); } catch {}
    loadAll();
  });
}

async function loadAll() {
  loadQuote();
  loadLearn(store.get("dc:tag") || CONFIG.learnTags[0]);
  loadRepos();
  loadGoodNews();
  const [interviews, startups] = await Promise.all([loadInterviews(), loadStartups()]);
  renderLead([...interviews, ...startups].sort((a, b) => (b.score || 0) - (a.score || 0)));
}

setupStatic();
loadAll();
