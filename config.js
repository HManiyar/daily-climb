/* =========================================================
   THE DAILY CLIMB — settings and story filters
   Edit CONFIG to personalize. This file is used by the page
   (config.js) and by the news builder (scripts/build-feed.js).
   ========================================================= */

const CONFIG = {
  readerName: "", // e.g. "Rahul" → shows "for Rahul"
  // Tabs in the "Learn" section (first one is default). "prep" is the
  // Big Tech interviews track; the rest are DEV Community tags.
  learnTags: ["prep", "systemdesign", "webdev", "javascript", "python", "ai", "devops", "react"],
  // Big Tech interviews: how interviews work at top companies and how to prepare.
  // Only articles that name one of TOP_COMPANIES are kept.
  prepNewsQueries: [
    '"interview process" OR "interview rounds" OR "interview questions" Google OR Amazon OR Microsoft OR Meta OR Apple engineer',
    '"how to prepare" OR "how to crack" coding OR "system design" interview Google OR Amazon OR Microsoft OR Meta'
  ],
  prepMediumTags: ["faang", "google-interview", "interview-experience", "system-design-interview", "coding-interview"],
  prepDevTags: ["interview", "faang", "systemdesign", "leetcode", "career"],
  // Region for Google News searches (en-IN = India; use en-US / US / US:en for the US)
  newsRegion: { hl: "en-IN", gl: "IN", ceid: "IN:en" },
  // Interview Stories: how people got into the world's best companies.
  // Only stories that name one of TOP_COMPANIES (below) are kept.
  interviewNewsQueries: [
    'techie "lands" OR "bags" OR "cracked" job Google OR Microsoft OR Amazon OR Meta OR Apple',
    '"how I got" OR "how I cracked" OR "how I landed" Google OR Microsoft OR Amazon OR Meta OR Nvidia',
    '"my journey" OR "interview experience" OR "offer letter" Google OR Microsoft OR Amazon OR Netflix OR OpenAI'
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
  "threat", "warn", "crisis", "bubble", "struggl", "replace", "job-killing", "jobless", "unemploy",
  "worr", "controvers", "suppress", "shocking", "exposes", "cheap labou?r", "archiv", "backlash", "probe\\b"
];
const NEGATIVE_RE = new RegExp("\\b(" + NEGATIVE.join("|") + ")", "i");
const isPositive = (t = "") => !NEGATIVE_RE.test(t);

/* Good News must be about tech… */
const TECH_RE = /\b(tech|IT\b|software|AI\b|A\.I\.|engineer|developer|coding|cloud|chip|semiconductor|startup|SaaS|data cent|digital|cyber|quantum|open[- ]sourc|robot|GCC|Infosys|TCS|Wipro|HCL|Google|Microsoft|Amazon|AWS|Meta|Apple|Nvidia|OpenAI|Anthropic|Intel|IBM|Oracle|Salesforce|Adobe)/i;
/* …and sound upbeat */
const UPBEAT_RE = /\b(hir(e|es|ed|ing)|jobs?\b|expan|opens?\b|launch|record|grow|growth|invest|breakthrough|boost|surge|rise|rising|wins?\b|award|campus|salary hike|bonus|demand|open[- ]sourc|milestone|new office|partners?hip)/i;

/* Interview Stories must name one of these companies… */
const TOP_COMPANIES = [
  "Google", "Alphabet", "DeepMind", "Microsoft", "Amazon", "AWS", "Meta", "Facebook", "Apple",
  "Netflix", "Nvidia", "OpenAI", "Anthropic", "Tesla", "Stripe", "Adobe", "Salesforce", "Uber",
  "Airbnb", "LinkedIn", "Atlassian", "Goldman Sachs", "Databricks", "Intuit", "FAANG", "MAANG", "Big Tech"
];
const COMPANY_RE = new RegExp("\\b(" + TOP_COMPANIES.join("|") + ")\\b", "i");
/* …and read like a "how I got in" story, not interview questions or company news */
const STORY_RE = /\b(lands?|landed|landing|crack(s|ed)?|bag(s|ged)?|join(s|ed)|got (an? )?(offer|job|in|into|hired|selected)|getting (in|into|hired)|offer letter|hired|selected|interview experience|my journey|journey (to|from|of)|how (i|she|he|they) (got|landed|cracked|made|prepared)|i got|made it|road to|path to|from .{2,40} to (google|microsoft|amazon|meta|apple|netflix|nvidia|openai)|story of)\b/i;
/* Big Tech interviews: articles that teach how a top company interviews */
const PREP_RE = /\b(interview (process|questions?|prep|preparation|guide|rounds?|loop|experience|tips|problem|pattern)|how to (prepare|crack|pass|ace|clear)|prepar(e|ing|ation)|system design|coding (interview|round)|leetcode|DSA|behaviou?ral|leadership principles|LLD|HLD|low[- ]level design|high[- ]level design|mock interview|onsite|phone screen|OA\b|online assessment|questions? (asked|i was asked)|roadmap|study plan|cheat ?sheet)/i;
const NOT_CAREER_RE = /\b(actor|actress|film|movie|TV|series|season|stock|shares|drugs?)\b/i;
const companyOf = t => {
  const m = t.match(COMPANY_RE);
  return m ? TOP_COMPANIES.find(c => c.toLowerCase() === m[1].toLowerCase()) : "";
};

/* ---------- picking stories (shared by the page and the builder) ---------- */
// Drops repeats, including the same story reworded by another outlet
const words = t => new Set(t.toLowerCase().match(/[a-z0-9]{4,}/g) || []);
const dedupe = arr => {
  const kept = [];
  return arr.filter(i => {
    const w = words(i.title);
    const dup = kept.some(k => {
      let same = 0;
      w.forEach(x => { if (k.has(x)) same++; });
      return same / Math.max(1, Math.min(w.size, k.size)) >= 0.6;
    });
    if (!dup) kept.push(w);
    return !dup;
  });
};

// Take items from each source in turn so no single source dominates
const interleave = lists => {
  const out = [];
  for (let i = 0; lists.some(l => i < l.length); i++) lists.forEach(l => { if (i < l.length) out.push(l[i]); });
  return out;
};

const byNewest = (a, b) => new Date(b.date) - new Date(a.date);

function pickGoodNews(lists, max = 12) {
  const keep = i => isPositive(i.title + " " + (i.desc || "")) && UPBEAT_RE.test(i.title) &&
    !i.title.trim().endsWith("?") && (i.source === "Hacker News" || TECH_RE.test(i.title));
  return dedupe(interleave(lists.map(l => l.filter(keep).sort(byNewest)))).slice(0, max);
}

function pickInterviews(lists, max = 12) {
  const keep = i => isPositive(i.title) && COMPANY_RE.test(i.title + " " + (i.tag || "")) &&
    STORY_RE.test(i.title) && !NOT_CAREER_RE.test(i.title);
  return dedupe(interleave(lists.map(l => l.filter(keep))))
    .slice(0, max)
    .map(i => ({ ...i, tag: companyOf(i.title) || i.tag }));
}

function pickPrep(lists, max = 12) {
  const keep = i => isPositive(i.title) && COMPANY_RE.test(i.title) && PREP_RE.test(i.title) && !NOT_CAREER_RE.test(i.title);
  return dedupe(interleave(lists.map(l => l.filter(keep))))
    .slice(0, max)
    .map(i => ({ ...i, tag: companyOf(i.title) || i.tag }));
}

if (typeof module !== "undefined") {
  module.exports = { CONFIG, pickGoodNews, pickInterviews, pickPrep, isPositive };
}
