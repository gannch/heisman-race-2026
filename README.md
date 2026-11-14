# Heisman Race 2026

A one-page dashboard tracking the top 2026 Heisman Trophy candidates:

- **Overall odds of winning:** the average implied chance across FanDuel, Kalshi, Polymarket and the average sportsbook line, plus how the odds have moved this season
- **Leaders by best odds:** every source's price side by side
- **Leaders by fan votes:** the official Heisman Hopefuls Fan Vote, with a writers' weekly poll for comparison
- **Buzz on X:** the most-engaged Heisman posts from teams, media and reporters, summarized in a line each
- **Overall season stats:** passing, rushing and receiving totals, plus yards and touchdowns per game

It's a static site: plain HTML, one small script, and [d3](https://d3js.org) from a CDN. No build step.

## View it locally

The page loads its data with `fetch`, so open it through a local web server rather than double-clicking the file:

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Update the numbers

All figures come from the JSON files in [`data/`](data/):

| File | What it holds |
|---|---|
| `odds.json` | FanDuel and average sportsbook American odds, Kalshi and Polymarket win % |
| `odds_history.json` | Implied win chance by date, one row per player per day |
| `stats.json` | Season totals and team records |
| `fan_vote.json` | Official fan vote: latest top 3 (`board: "latest"`) and the weekly top 10 (`board: "week10"`) |
| `poll.json` | Writers' weekly poll top 5 |
| `x_posts.json` | Popular posts on X with engagement counts and a one-line summary |

These files are refreshed automatically: odds, stats and the writers' poll each morning, and X posts and the fan vote every three hours. Each refresh is a commit to this repo. You can also edit a file by hand; the page shows the new numbers on the next load. The consensus odds, completion %, total touchdowns and yards per game are worked out in the page from these files.

## Sources

Odds from FanDuel (via TSN), Kalshi (via Covers), Polymarket (via On3) and SportsBettingDime's sportsbook average. Stats from ESPN game logs, Sports-Reference and game reports. Fan vote from the Heisman Trust's posts on X. Writers' poll from Last Word on Sports.

## Credits

- Photos are original images generated with Figma AI for this page. They show no real players, team logos or numbers.
- Fonts: [Lexend Deca](https://fonts.google.com/specimen/Lexend+Deca) and [Unbounded](https://fonts.google.com/specimen/Unbounded), both under the SIL Open Font License.
- Independent fan project, not affiliated with the Heisman Trophy Trust.
