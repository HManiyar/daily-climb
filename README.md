# The Daily Climb — my positive e-paper

A personal newspaper that shows only uplifting stories: new tech to learn, how people got into the world's best tech companies, startup launches, and good news from the IT industry.

## Sections & free sources (no keys needed)
| Section | Source |
|---|---|
| Quote of the day | DummyJSON quotes (local fallback) |
| Learn | **Big Tech interviews** tab: how Google, Amazon, Microsoft, Meta… interview and how to prepare (Google News, Medium, DEV). Other tabs: DEV Community tags. Plus GitHub repos trending this week |
| How They Got In | Google News, Medium (`#faang`, `#google-interview`, `#interview-experience`), Hacker News, DEV. Only stories naming a top company (Google, Microsoft, Amazon, Meta, Apple, Nvidia, OpenAI…) |
| Startups | Hacker News (Show HN, launches) + Google News startup funding and launch news |
| Good News in Tech | Google News searches for IT hiring, expansions, investments and breakthroughs + Hacker News |
| Switch Playbook / Daily tip | Built in |

Learn, Startups, Good News in Tech and How They Got In are gathered every 2 hours by a GitHub Action (`scripts/build-feed.js`) and saved as `feed.json` next to the page, because Google News and Medium can't be read straight from a browser. If `feed.json` is missing (e.g. you open the page locally), the page tries to fetch live instead.

Stories containing negative words (layoffs, job cuts, hiring freezes, slowdowns, lawsuits…) are filtered out. Results are cached for an hour in your browser.

## Personalize
Open `config.js` and edit `CONFIG` at the top: your name, news region, the tech tags you want, interview and tech-news searches. Edit `TOP_COMPANIES` to choose which companies count. Tips and the playbook are plain arrays you can rewrite.

## Host on GitHub Pages
The paper is live at **https://hmaniyar.github.io/daily-climb/**.

Pages serves the `gh-pages` branch. The workflow in `.github/workflows/pages.yml` runs on every push to `main` and every 2 hours: it copies `main`, builds a fresh `feed.json`, and publishes both to `gh-pages`. To refresh the news right away, run the workflow from the **Actions** tab.

Note: GitHub pauses scheduled workflows in repos with no commits for 60 days. If the news stops updating, push any small change or re-enable the workflow in the Actions tab.

Tip: add it to your phone's home screen from the browser menu so it opens like an app every morning.
