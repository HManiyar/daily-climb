/* Builds feed.json for the Good News and How They Got In sections.
   Runs in GitHub Actions (see .github/workflows/pages.yml), where feeds
   can be fetched directly without browser CORS limits.
   Usage: node scripts/build-feed.js [output path] */

const fs = require("fs");
const { CONFIG, pickGoodNews, pickInterviews, pickPrep, pickStartups, isPositive } = require("../config.js");

const UA = { "User-Agent": "Mozilla/5.0 (compatible; DailyClimbBot/1.0)" };

const decode = s => String(s ?? "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
  .replace(/&amp;/g, "&");
const stripHtml = s => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]).trim() : "";
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Retries when a source says "too many requests" (DEV does this under load)
async function getText(url, tries = 4) {
  for (let i = 1; ; i++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok) return res.text();
    if (res.status !== 429 || i >= tries) throw new Error(`${res.status} ${url}`);
    await sleep(2000 * i);
  }
}

async function rss(url) {
  const xml = await getText(url);
  return (xml.match(/<item>[\s\S]*?<\/item>/g) || []).map(item => {
    const html = tag(item, "content:encoded") || tag(item, "description");
    return {
      title: stripHtml(tag(item, "title")),
      url: tag(item, "link"),
      desc: stripHtml(html).slice(0, 300),
      image: (html.match(/<img[^>]+src="([^"]+)"/) || [])[1] || "",
      date: new Date(tag(item, "pubDate") || Date.now()).toISOString(),
      source: tag(item, "source") || tag(item, "dc:creator")
    };
  });
}

async function gnews(query, days) {
  const { hl, gl, ceid } = CONFIG.newsRegion;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:${days}d`)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  return (await rss(url)).map(i => {
    // Titles look like "Headline - Publisher"
    const cut = i.title.lastIndexOf(" - ");
    return {
      ...i,
      title: cut > 0 ? i.title.slice(0, cut) : i.title,
      source: i.source || (cut > 0 ? i.title.slice(cut + 3) : "Google News"),
      desc: "", image: ""
    };
  });
}

async function medium(tagName) {
  return (await rss(`https://medium.com/feed/tag/${tagName}`))
    .map(i => ({ ...i, source: i.source ? `Medium · ${i.source}` : "Medium" }));
}

async function hn(query, minPoints, days) {
  const since = Math.floor(Date.now() / 1000) - days * 86400;
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${since},points>${minPoints}&hitsPerPage=15`;
  const d = JSON.parse(await getText(url));
  return d.hits.map(h => ({
    title: h.title,
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    date: h.created_at,
    source: "Hacker News",
    extra: `▲ ${h.points}`,
    score: h.points
  }));
}

async function dev(tagName, count, topDays = 30) {
  const d = JSON.parse(await getText(`https://dev.to/api/articles?tag=${encodeURIComponent(tagName)}&top=${topDays}&per_page=${count}`));
  return d.map(a => ({
    title: a.title,
    url: a.url,
    desc: a.description,
    image: a.cover_image || a.social_image,
    date: a.published_at,
    tag: "#" + tagName,
    source: a.user?.name,
    extra: `♥ ${a.public_reactions_count}`
  }));
}

// GitHub repos created this week, sorted by stars
async function trendingRepos() {
  const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const d = JSON.parse(await getText(`https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=8`));
  return d.items.map(r => ({
    title: r.full_name,
    url: r.html_url,
    desc: r.description || "",
    tag: r.language || "",
    extra: `★ ${r.stargazers_count.toLocaleString()}`
  }));
}

// Run each source, log how it went, and never let one failure stop the rest
async function gather(label, jobs) {
  const results = await Promise.allSettled(jobs.map(([, run]) => run()));
  return results.map((r, i) => {
    const name = jobs[i][0];
    if (r.status === "fulfilled") { console.log(`  ${label} · ${name}: ${r.value.length}`); return r.value; }
    console.log(`  ${label} · ${name}: FAILED ${r.reason.message}`);
    return [];
  });
}

(async () => {
  const goodLists = await gather("good news", [
    ...CONFIG.techNewsQueries.map(q => [`google news "${q.slice(0, 40)}…"`, () => gnews(q, 7)]),
    ...CONFIG.techNewsHN.map(q => [`hn "${q}"`, () => hn(q, 50, CONFIG.daysBack)])
  ]);
  const interviewLists = await gather("interviews", [
    ...CONFIG.interviewNewsQueries.map(q => [`google news "${q.slice(0, 40)}…"`, () => gnews(q, 60)]),
    ...CONFIG.interviewMediumTags.map(t => [`medium #${t}`, () => medium(t)]),
    ...CONFIG.interviewQueries.map(q => [`hn "${q}"`, () => hn(q, 3, 90)]),
    ...CONFIG.interviewTags.map(t => [`dev #${t}`, () => dev(t, 30)])
  ]);

  const prepLists = await gather("big tech interviews", [
    ...CONFIG.prepNewsQueries.map(q => [`google news "${q.slice(0, 40)}…"`, () => gnews(q, 60)]),
    ...CONFIG.prepMediumTags.map(t => [`medium #${t}`, () => medium(t)]),
    ...CONFIG.prepDevTags.map(t => [`dev #${t}`, () => dev(t, 30)])
  ]);
  // Stories already in How They Got In are left out of the interviews tab
  const interviews = pickInterviews(interviewLists, 15);
  const shown = new Set(interviews.map(i => i.url));
  const learn = { prep: pickPrep(prepLists.map(l => l.filter(i => !shown.has(i.url))), 15) };
  const tagLists = await gather("learn", CONFIG.learnTags.filter(t => t !== "prep").map(t => [`dev #${t}`, () => dev(t, 12, 7)]));
  CONFIG.learnTags.filter(t => t !== "prep").forEach((t, i) => { learn[t] = tagLists[i].filter(a => isPositive(a.title)).slice(0, 9); });
  const startupHN = await gather("startups", CONFIG.startupQueries.map(q => [`hn "${q}"`, () => hn(q, 20, CONFIG.daysBack)]));
  const startupNews = await gather("startups", CONFIG.startupNewsQueries.map(q => [`google news "${q.slice(0, 40)}…"`, () => gnews(q, 7)]));
  const [repos] = await gather("learn", [["github trending repos", trendingRepos]]);

  const feed = {
    updated: new Date().toISOString(),
    goodNews: pickGoodNews(goodLists, 15),
    interviews,
    startups: pickStartups(startupHN, startupNews, 12),
    learn,
    repos
  };
  console.log(`kept ${feed.goodNews.length} good news, ${feed.interviews.length} interview stories, ${learn.prep.length} big tech interview guides, ${repos.length} repos`);
  feed.goodNews.forEach(i => console.log("  + " + i.title));
  feed.interviews.forEach(i => console.log("  * " + i.title));
  learn.prep.forEach(i => console.log("  # " + i.title));
  feed.startups.forEach(i => console.log("  ^ " + i.title));

  fs.writeFileSync(process.argv[2] || "feed.json", JSON.stringify(feed, null, 1));
})();
