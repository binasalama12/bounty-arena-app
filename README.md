[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/binasalama12/bounty-arena-app/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/binasalama12/bounty-arena-app/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

# Bounty Arena

Bounty Arena is a dark, live-data frontend for discovering make.fun competitions, reviewing bounty details, viewing standings, and exploring entrant profiles. It uses the public make.fun API directly from a static browser app, with no build step or external assets.

## Run locally

Start the local server with:

```sh
node serve.ts
```

Then open <http://localhost:8080>. To build the judge dossier, run:

```sh
node main.ts
```

The dossier is written to `/output/dossier.json` by default. Set `MAKEFUN_OUTPUT_DIR` to choose another output directory.

## Routes

- `#/` — open competition board with title filtering and deadline or prize sorting.
- `#/bounty/<slug>` — competition description, rewards, fee, deadline, entry count, and requirements summary.
- `#/leaderboard` — standings for the open competition with the largest prize pot; select another competition in the picker.
- `#/profile/<handle>` — entrant bio, wallet, record, and public solutions.

Competition data is fetched live from `https://make.fun/api`. If a request fails, the app shows the API error instead of placeholder results.
