# The Daily Climb — my positive e-paper

A personal newspaper that shows only uplifting stories: new tech to learn, how people got into the world's best tech companies, startup launches, and good news from the IT industry.

## Sections & free APIs (no keys needed)
| Section | Source |
|---|---|
| Quote of the day | DummyJSON quotes (local fallback) |
| Learn | DEV Community API (pick a tag) + GitHub repos trending this week |
| How They Got In | Google News, Medium (`#faang`, `#google-interview`, `#interview-experience`), Hacker News, DEV. Only stories naming a top company (Google, Microsoft, Amazon, Meta, Apple, Nvidia, OpenAI…) |
| Startups | Hacker News: Show HN, launches, funding |
| Good News in Tech | Google News searches for IT hiring, expansions, investments and breakthroughs + Hacker News |
| Switch Playbook / Daily tip | Built in |

Stories containing negative words (layoffs, job cuts, hiring freezes, slowdowns, lawsuits…) are filtered out. Results are cached for an hour in your browser.

## Personalize
Open `app.js` and edit `CONFIG` at the top: your name, news region, the tech tags you want, interview and tech-news searches. Edit `TOP_COMPANIES` to choose which companies count. Tips and the playbook are plain arrays you can rewrite.

## Host on GitHub Pages
The paper is live at **https://hmaniyar.github.io/daily-climb/**.

Pages serves the `gh-pages` branch. The workflow in `.github/workflows/pages.yml` copies `main` into `gh-pages` on every push, so just push to `main` to update the site.

Tip: add it to your phone's home screen from the browser menu so it opens like an app every morning.
