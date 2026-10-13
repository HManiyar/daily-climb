# The Daily Climb — my positive e-paper

A personal newspaper that shows only uplifting stories: new tech to learn, interview experiences from people who joined product companies, startup launches, and good news from around the world.

## Sections & free APIs (no keys needed)
| Section | Source |
|---|---|
| Quote of the day | DummyJSON quotes (local fallback) |
| Learn | DEV Community API (pick a tag) + GitHub repos trending this week |
| Interview Stories | Hacker News (Algolia) + DEV `#career`, `#interview`, `#motivation` |
| Startups | Hacker News: Show HN, launches, funding |
| Good News | Positive News + Good News Network RSS via rss2json |
| Switch Playbook / Daily tip | Built in |

Stories containing negative words (layoffs, lawsuits, outages…) are filtered out. Results are cached for an hour in your browser.

## Personalize
Open `app.js` and edit `CONFIG` at the top: your name, the tech tags you want, interview search phrases, startup searches and RSS feeds. Tips and the playbook are plain arrays you can rewrite.

## Host on GitHub Pages
This repo ships a workflow (`.github/workflows/pages.yml`) that publishes the site on every push to `main`.

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions** (one-time).
2. Push to `main` (or run the workflow from the **Actions** tab).
3. Your paper is live at `https://hmaniyar.github.io/daily-climb/`.

Tip: add it to your phone's home screen from the browser menu so it opens like an app every morning.
