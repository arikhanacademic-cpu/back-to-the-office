# Back to the Office

**How many days a week do London's biggest tech and finance employers want you at your desk?**

An interactive 3D map of London at dusk. Each employer's office glows in its policy colour, a Monday-to-Friday timelapse lights offices floor by floor as commuter trails flow in along the Tube, and every policy links to a dated source.

**[Try it →](https://arikhanacademic-cpu.github.io/back-to-the-office/)**

![Back to the Office — the City at dusk](assets/og.png)

| Colour | Category | Meaning |
|---|---|---|
| 🟦 Teal | Remote-friendly | No fixed minimum, or 0–1 days |
| 🟧 Amber | Hybrid | 2–3 days a week |
| 🟥 Red | Office-first | 4–5 days a week |
| ⬜ Grey | Not confirmed | No reputable public source for the London policy |

Data as of **15 October 2026**.

## Features

- **3D London at dusk**: the Thames, bridges, the Shard, St Paul's, the London Eye, Tower Bridge, One Canada Square and more, with bloom, fog and smooth camera moves (three.js).
- **Play the week**: a Monday-to-Friday timelapse. Offices fill floor by floor, light trails stream along the Tube into the City, Canary Wharf and King's Cross, and on Friday hybrid offices go dark while five-day offices stay lit.
- **Policy-changed ripples**: offices pulse when a company tightened its rules, with the date.
- **Explainer cards**: click any office for days required, when it changed, a paraphrased summary and the source.
- **Filters**: "Where could I work 3+ days from home?", industry and area, with live counts per colour and per area.
- **Sources panel** with methodology, plus a policy-changes ticker.
- Works on phone and desktop.

## Data and methodology

- **Sources.** Each policy comes from an official company memo, statement or careers page, or from a reputable outlet reporting the memo. The source link and its date are stored with every record in [`js/data.js`](js/data.js).
- **Not confirmed means grey.** If we found no reputable public source for the London policy, the employer is grey. We don't guess.
- **Scope.** "Company-wide" means the source describes a firm-wide policy and no London exception was reported. Where reporting covered only US staff, London is marked not confirmed.
- **Summaries are paraphrased.** There are no direct quotes.
- **Estimates are labelled.** Office locations are approximate, at building level. Building heights are stylised. The timelapse lights and Tube trails are an illustrative model based on each policy, not measured occupancy or TfL data.
- **Limits.** This edition was compiled without web search access, so only pages that could be opened directly were used. Several large employers are therefore grey. Corrections with a source are welcome: open an issue or PR.

## Sources

| Employer | Policy | Category | Changed | Source |
|---|---|---|---|---|
| Amazon | 5 days | Office-first | Announced 16 Sep 2024 · effective 2 Jan 2025 | [Amazon (official)](https://www.aboutamazon.com/news/company-news/ceo-andy-jassy-latest-update-on-amazon-return-to-office-manager-team-ratio), 16 Sept 2024 |
| Goldman Sachs | 5 days | Office-first | Five-day expectation since 2021 · enforcement renewed Aug 2023 | [Fortune / Bloomberg](https://fortune.com/2023/08/22/goldman-sachs-return-to-office-rto-five-days-weekly/), 22 Aug 2023 |
| JPMorgan Chase | 5 days | Office-first | Announced 10 Jan 2025 · phased in from Mar 2025 | [Fortune / Bloomberg](https://fortune.com/2025/01/10/jpmorgan-tells-staff-to-return-to-the-office-five-days-a-week/), 10 Jan 2025 |
| Barclays | 3 days · 4 for senior staff | Hybrid | Rolling out Oct 2026 (reported 22 Sep 2026) | [Fortune](https://fortune.com/2026/09/22/barclays-staff-demanding-more-money-return-to-office-compensation-410-weekly-cost-childcare-commuting/), 22 Sept 2026 |
| Checkout.com | 3 days (Tue–Thu) | Hybrid | Start date not stated by the company | [Checkout.com (official)](https://www.checkout.com/jobs), accessed 15 Oct 2026 |
| Citi | 3 days | Hybrid | Hybrid model kept (reported Jan 2025) | [Fortune Europe](https://fortune.com/europe/2025/01/16/citigroup-faces-1-billion-bill-london-hq-overhaul-multi-level-garden-mini-villages-staff-office/), 16 Jan 2025 |
| Deutsche Bank | 3 days · 4 for MDs | Hybrid | Memo Feb 2024 · MD rule from Jun 2024 | [Fortune / Bloomberg](https://fortune.com/europe/2024/02/16/remote-work-deutsche-banks-bans-fridays-mondays-return-to-office/), 16 Feb 2024 |
| Google | 3 days | Hybrid | 3-day model since Apr 2022 · attendance in reviews from Jun 2023 | [CNBC](https://www.cnbc.com/2023/06/08/google-to-crack-down-on-hybrid-work-asks-remote-workers-to-reconsider.html), 8 Jun 2023 |
| Lloyds Banking Group | 2 days | Hybrid | 2-day minimum since 2023 · linked to senior bonuses from Jan 2025 | [Fortune (via Yahoo Finance)](https://uk.finance.yahoo.com/news/lloyds-bank-tie-senior-bankers-120126346.html), 13 Jan 2025 |
| Meta | 3 days | Hybrid | Announced Jun 2023 · effective Sep 2023 | [The Register](https://www.theregister.com/2023/06/02/meta_return_to_office_mandate/), 2 Jun 2023 |
| Santander UK | 3 days | Hybrid | Reported 8 Sep 2024 | [City A.M.](https://www.cityam.com/santander-cracks-down-on-hybrid-working-as-return-to-office-trend-grows/), 8 Sept 2024 |
| Uber | 3 days (Tue–Thu) | Hybrid | Memo 28 Apr 2025 · effective Jun 2025 | [Fast Company](https://www.fastcompany.com/91331404/uber-staff-revolts-over-return-to-office-mandate), 9 May 2025 |
| UBS | 3 days | Hybrid | Group memo 13 Mar 2025 | [Fortune Europe](https://fortune.com/europe/2025/03/14/ubs-follows-deutsche-bank-banning-staff-from-working-remotely-friday-monday/), 14 Mar 2025 |
| Revolut | No minimum | Remote-friendly | CEO memo 19 Feb 2025 | [Fortune](https://fortune.com/2025/02/20/revolut-fintech-rto-jpmorgan-chase-goldman-sachs-wall-street-ipos-citi-bac/), 20 Feb 2025 |
| Spotify | Work from anywhere | Remote-friendly | Launched Feb 2021 · reaffirmed Oct 2024 | [Fortune (via Yahoo Finance)](https://finance.yahoo.com/news/spotify-hr-chief-says-remote-100021103.html), 8 Oct 2024 |
| Standard Chartered | No mandate — teams decide | Remote-friendly | CEO comments Jul 2025 | [Business Insider](https://www.businessinsider.com/standard-chartered-ceo-will-not-make-staff-return-to-office-2025-8), 31 Jul 2025 |
| Wise | No fixed minimum | Remote-friendly | Current official policy (undated) | [Wise (official)](https://wise.jobs/flexible-working), accessed 15 Oct 2026 |
| Apple | Not confirmed | Not confirmed | US policy set Aug 2022 | [Bloomberg](https://www.bloomberg.com/news/articles/2022-08-15/apple-sets-return-to-office-deadline-of-sept-5-after-delays), 15 Aug 2022 |
| Aviva | Not confirmed | Not confirmed | — | No reputable public source found |
| Bank of America | Not confirmed | Not confirmed | US policy since Oct 2022 | [Fortune](https://fortune.com/2024/01/25/bank-of-america-threatening-workers-return-to-office-disciplinary-action/), 25 Jan 2024 |
| BlackRock | Not confirmed | Not confirmed | — | No reputable public source found |
| Bloomberg LP | Not confirmed | Not confirmed | — | No reputable public source found |
| BT Group | Not confirmed | Not confirmed | — | No reputable public source found |
| Deliveroo | Not confirmed | Not confirmed | — | No reputable public source found |
| GoCardless | Not confirmed | Not confirmed | No company-wide minimum published | [GoCardless (official)](https://gocardless.com/about/careers/), accessed 15 Oct 2026 |
| HSBC | Not confirmed | Not confirmed | MD memo reported 29 Jul 2025 | [City A.M.](https://www.cityam.com/hsbc-ftse-100-giant-mulls-return-to-office-mandate/), 18 Jun 2025 |
| Klarna | Not confirmed | Not confirmed | — | No reputable public source found |
| Legal & General | Not confirmed | Not confirmed | — | No reputable public source found |
| LSEG | Not confirmed | Not confirmed | — | No reputable public source found |
| Microsoft | Not confirmed | Not confirmed | US rollout from Feb 2026 | [Microsoft (official)](https://blogs.microsoft.com/blog/2025/09/09/flexible-work-update/), 9 Sept 2025 |
| Monzo | Not confirmed | Not confirmed | No company-wide minimum published | [Monzo (official)](https://monzo.com/careers), accessed 15 Oct 2026 |
| Morgan Stanley | Not confirmed | Not confirmed | — | No reputable public source found |
| NatWest Group | Not confirmed | Not confirmed | Last public plan: May 2021 | [Reuters (via Investing.com)](https://uk.investing.com/news/economy/only-13-of-natwest-staff-to-return-to-office-fulltime-2384476), 31 May 2021 |
| OakNorth | Not confirmed | Not confirmed | — | No reputable public source found |
| Salesforce | Not confirmed | Not confirmed | US role-based tiers from Oct 2024 | [Entrepreneur](https://www.entrepreneur.com/business-news/salesforce-will-require-employees-in-office-5-times-per-week/477422), 22 Jul 2024 |
| Schroders | Not confirmed | Not confirmed | — | No reputable public source found |
| Starling Bank | Not confirmed | Not confirmed | No company-wide minimum published | [Starling Bank (official)](https://www.starlingbank.com/careers/), accessed 15 Oct 2026 |
| TikTok | Not confirmed | Not confirmed | — | No reputable public source found |

## Run locally

It is a static site with no build step. All dependencies (three.js r160 and the Barlow Condensed and JetBrains Mono fonts) are vendored.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

URL options: `?explore` skips the title screen, `?day=fri&hour=11` sets the clock, and `?cam=city|wharf|kx|west|overview` picks a camera.

## Deploy to GitHub Pages

1. Push this folder to a repo named `back-to-the-office`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/pages.yml`) deploys on every push to `main`.

## Rendering the promo video

`?capture&size=1080` loads a deterministic, frame-by-frame timeline (`js/video.js`).

```bash
npm i playwright
node tools/render.mjs frames 1080 30          # renders 1584 JPEG frames
python3 tools/soundtrack.py                   # synthesises the original soundtrack
ffmpeg -framerate 30 -i frames/f%05d.jpg -i soundtrack.wav -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 192k -shortest video.mp4
```

The soundtrack is generated from scratch in numpy and scipy, with no samples: 100 bpm in A minor, and the drums thin out on Friday as the hybrid offices go dark.

## Licence

Code: MIT. Policy facts belong to their cited sources. No company logos are used.

---

Built by **Ari Khan**.
