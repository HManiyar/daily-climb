/* =========================================================
   THE DAILY CLIMB — personal positive e-paper
   Settings and story filters live in config.js.
   All APIs below are free and need no API key.
   ========================================================= */

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

const learnLabel = t => (t === "prep" ? "Big Tech interviews" : "#" + t);

async function loadLearn(tag) {
  const grid = $("learnGrid");
  skeletons(grid);
  document.querySelectorAll("#learnChips .chip").forEach(c => c.classList.toggle("active", c.dataset.tag === tag));
  let items = (await loadFeed()).learn?.[tag] || [];
  if (!items.length) {
    // No prebuilt feed: fetch live in the browser
    items = tag === "prep"
      ? pickPrep(await settled([
          ...CONFIG.prepNewsQueries.map(q => gnews(q, 60)),
          ...CONFIG.prepMediumTags.map(medium),
          ...CONFIG.prepDevTags.map(t => dev(t, 15))
        ]))
      : (await settled([dev(tag)]))[0].filter(i => isPositive(i.title));
  }
  renderCards(grid, items, "Couldn't load articles right now — tap Refresh in a bit.");
}

async function loadRepos() {
  const grid = $("repoGrid");
  skeletons(grid, 4);
  let items = (await loadFeed()).repos || [];
  if (!items.length) items = (await settled([trendingRepos()]))[0];
  renderCards(grid, items, "GitHub is resting (rate limit). Try again in a minute.");
}

// feed.json is rebuilt every few hours by .github/workflows/pages.yml
let feedPromise;
const loadFeed = () => (feedPromise ??= fetch("feed.json", { cache: "no-store" })
  .then(r => (r.ok ? r.json() : {}))
  .catch(() => ({})));

async function loadInterviews() {
  const grid = $("interviewGrid");
  skeletons(grid);
  let items = (await loadFeed()).interviews || [];
  if (!items.length) {
    // No prebuilt feed (e.g. opened locally): fetch live in the browser
    items = pickInterviews(await settled([
      ...CONFIG.interviewNewsQueries.map(q => gnews(q, 60)),
      ...CONFIG.interviewMediumTags.map(medium),
      ...CONFIG.interviewQueries.map(q => hn(q, 3, 90)),
      ...CONFIG.interviewTags.map(t => dev(t, 15))
    ]));
  }
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
  let items = (await loadFeed()).goodNews || [];
  if (!items.length) {
    items = pickGoodNews(await settled([
      ...CONFIG.techNewsQueries.map(q => gnews(q, 7)),
      ...CONFIG.techNewsHN.map(q => hn(q, 50))
    ]));
  }
  renderCards(grid, items, "No tech good news could be loaded right now — tap Refresh in a bit.");
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

  $("learnChips").innerHTML = CONFIG.learnTags.map(t => `<button class="chip" data-tag="${esc(t)}">${esc(learnLabel(t))}</button>`).join("");
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
    feedPromise = null;
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
