// Back to the Office — dataset
// Every policy below is taken from a source that was opened or seen during research
// on 15 Oct 2026. Anything that could not be confirmed is category "unconfirmed".
// Locations are approximate (building / postcode level).

export const AS_OF = '2026-10-15';

// cat: office = 4–5 days · hybrid = 2–3 days · remote = 0–1 / no minimum · unconfirmed
// scope: london | uk | global (company-wide policy; no London exception found in sources)
export const COMPANIES = [
  // ───────────── OFFICE-FIRST (4–5 days) ─────────────
  {
    id: 'amazon', name: 'Amazon', industry: 'Big tech', area: 'Shoreditch',
    address: '1 Principal Place, Worship Street, London EC2A 2FA', lat: 51.5218, lng: -0.0797,
    days: 5, label: '5 days', cat: 'office', scope: 'global',
    changed: 'Announced 16 Sep 2024 · effective 2 Jan 2025',
    tightened: { date: '2025-01-02', what: 'Up from 3 days to 5' },
    summary: "CEO Andy Jassy's memo replaced Amazon's three-day hybrid set-up with a five-day office expectation for corporate staff from 2 January 2025, with exceptions only for special circumstances.",
    source: { title: 'Message from CEO Andy Jassy: Strengthening our culture and teams', publisher: 'Amazon (official)', url: 'https://www.aboutamazon.com/news/company-news/ceo-andy-jassy-latest-update-on-amazon-return-to-office-manager-team-ratio', date: '2024-09-16' },
    extra: [{ title: 'Amazon orders full-time office return', publisher: 'Personnel Today', url: 'https://www.personneltoday.com/hr/amazon-orders-full-time-office-return/', date: '2024-09-17' }],
    note: 'Company-wide memo. No London-specific exception found; UK press covered the change.'
  },
  {
    id: 'jpm', name: 'JPMorgan Chase', industry: 'Banking', area: 'Canary Wharf',
    address: '25 Bank Street, Canary Wharf, London E14 5JP', lat: 51.5030, lng: -0.0210,
    days: 5, label: '5 days', cat: 'office', scope: 'global',
    changed: 'Announced 10 Jan 2025 · phased in from Mar 2025',
    tightened: { date: '2025-01-10', what: 'Hybrid ended; 5 days for all staff' },
    summary: 'JPMorgan ended its pandemic-era hybrid arrangement and told employees to work from the office five days a week, phased in from March 2025.',
    source: { title: 'JPMorgan tells staff to return to the office five days a week', publisher: 'Fortune / Bloomberg', url: 'https://fortune.com/2025/01/10/jpmorgan-tells-staff-to-return-to-the-office-five-days-a-week/', date: '2025-01-10' },
    note: 'Firm-wide memo. Sources do not single out London; no London exception reported.'
  },
  {
    id: 'goldman', name: 'Goldman Sachs', industry: 'Banking', area: 'The City',
    address: 'Plumtree Court, 25 Shoe Lane, London EC4A 4AU', lat: 51.5168, lng: -0.1064,
    days: 5, label: '5 days', cat: 'office', scope: 'global',
    changed: 'Five-day expectation since 2021 · enforcement renewed Aug 2023',
    tightened: null,
    summary: 'Goldman has expected staff in the office five days a week since 2021, and stepped up enforcement of that existing policy in 2023.',
    source: { title: 'Goldman Sachs return-to-office push (five days weekly)', publisher: 'Fortune / Bloomberg', url: 'https://fortune.com/2023/08/22/goldman-sachs-return-to-office-rto-five-days-weekly/', date: '2023-08-22' },
    note: 'Firm-wide policy; London not singled out in sources.'
  },

  // ───────────── HYBRID (2–3 days) ─────────────
  {
    id: 'barclays', name: 'Barclays', industry: 'Banking', area: 'Canary Wharf',
    address: '1 Churchill Place, Canary Wharf, London E14 5HP', lat: 51.5048, lng: -0.0145,
    days: 3, label: '3 days · 4 for senior staff', cat: 'hybrid', scope: 'uk',
    changed: 'Rolling out Oct 2026 (reported 22 Sep 2026)',
    tightened: { date: '2026-10-01', what: 'UK minimum up from 2 days to 3; senior staff 4', approx: true },
    summary: 'Barclays is raising its UK minimum from two to three office days a week, with senior staff expected in four, rolling out in October 2026. The bank says minimums vary by business area.',
    source: { title: 'Barclays staff demanding more money to return to office', publisher: 'Fortune', url: 'https://fortune.com/2026/09/22/barclays-staff-demanding-more-money-return-to-office-compensation-410-weekly-cost-childcare-commuting/', date: '2026-09-22' },
    note: 'UK-specific. Exact roll-out day in October not stated; marker uses 1 Oct 2026 as an approximation.'
  },
  {
    id: 'lloyds', name: 'Lloyds Banking Group', industry: 'Banking', area: 'The City',
    address: '25 Gresham Street, London EC2V 7HN', lat: 51.5154, lng: -0.0935,
    days: 2, label: '2 days', cat: 'hybrid', scope: 'uk',
    changed: '2-day minimum since 2023 · linked to senior bonuses from Jan 2025',
    tightened: { date: '2025-01-13', what: 'Attendance linked to senior bankers’ bonuses' },
    summary: 'Lloyds asks staff to work from the office at least two days a week. From January 2025 senior staff were told attendance would feed into their bonuses.',
    source: { title: "Lloyds Bank will tie its senior bankers' 2024 bonuses to their office attendance", publisher: 'Fortune (via Yahoo Finance)', url: 'https://uk.finance.yahoo.com/news/lloyds-bank-tie-senior-bankers-120126346.html', date: '2025-01-13' },
    extra: [{ title: 'Lloyds bankers could face bonus cut if not in office two days a week', publisher: 'The Guardian', url: 'https://www.theguardian.com/business/2025/jan/13/lloyds-bankers-could-face-bonus-cut-if-not-in-office-two-days-a-week', date: '2025-01-13' }],
    note: 'UK-specific. Sources differ on whether the 2-day rule began in April or September 2023.'
  },
  {
    id: 'santander', name: 'Santander UK', industry: 'Banking', area: "King's Cross & Euston",
    address: '2 Triton Square, Regent’s Place, London NW1 3AN', lat: 51.5254, lng: -0.1402,
    days: 3, label: '3 days', cat: 'hybrid', scope: 'uk',
    changed: 'Reported 8 Sep 2024',
    tightened: { date: '2024-09-08', what: 'Up from 2 days to 3' },
    summary: 'Santander raised its UK office requirement from two to three days a week in September 2024, affecting close to 10,000 staff.',
    source: { title: 'Santander cracks down on hybrid working as return to office trend grows', publisher: 'City A.M.', url: 'https://www.cityam.com/santander-cracks-down-on-hybrid-working-as-return-to-office-trend-grows/', date: '2024-09-08' },
    note: 'UK-specific. Effective date not stated in the source.'
  },
  {
    id: 'google', name: 'Google', industry: 'Big tech', area: "King's Cross & Euston",
    address: '6 Pancras Square, King’s Cross, London N1C 4AG', lat: 51.5337, lng: -0.1262,
    days: 3, label: '3 days', cat: 'hybrid', scope: 'global',
    changed: '3-day model since Apr 2022 · attendance in reviews from Jun 2023',
    tightened: { date: '2023-06-08', what: 'Attendance counted in performance reviews' },
    summary: 'Google expects most staff in the office at least three days a week. In 2023 it began factoring attendance into performance reviews and limited new fully remote roles.',
    source: { title: 'Google to crack down on office attendance, asks remote workers to reconsider', publisher: 'CNBC', url: 'https://www.cnbc.com/2023/06/08/google-to-crack-down-on-hybrid-work-asks-remote-workers-to-reconsider.html', date: '2023-06-08' },
    note: 'Company-wide policy. CNBC noted enforcement began in the US while local rules elsewhere were being reviewed — medium confidence for London.'
  },
  {
    id: 'meta', name: 'Meta', industry: 'Big tech', area: 'West End',
    address: '1 Rathbone Square, Fitzrovia, London W1T 1FB', lat: 51.5170, lng: -0.1349,
    days: 3, label: '3 days', cat: 'hybrid', scope: 'global',
    changed: 'Announced Jun 2023 · effective Sep 2023',
    tightened: { date: '2023-06-01', what: 'From flexible to 3 days for office-assigned staff' },
    summary: 'Meta told employees assigned to an office to come in three days a week from September 2023.',
    source: { title: 'Meta tells staff to return to office three days a week', publisher: 'The Register', url: 'https://www.theregister.com/2023/06/02/meta_return_to_office_mandate/', date: '2023-06-02' },
    note: 'Company-wide. A later five-day rule for Instagram (from Feb 2026) was reported for US staff only and is not reflected here.'
  },
  {
    id: 'uber', name: 'Uber', industry: 'Consumer tech & media', area: 'City fringe',
    address: 'Aldgate Tower, 2 Leman Street, London E1 8FA', lat: 51.5143, lng: -0.0722,
    days: 3, label: '3 days (Tue–Thu)', cat: 'hybrid', scope: 'global',
    changed: 'Memo 28 Apr 2025 · effective Jun 2025',
    tightened: { date: '2025-04-28', what: 'Up from 2 anchor days to 3' },
    summary: 'Uber raised office attendance from two anchor days to three (Tuesday to Thursday) from June 2025, and reviewed existing remote-work approvals.',
    source: { title: 'Uber staff revolts over return-to-office mandate', publisher: 'Fast Company', url: 'https://www.fastcompany.com/91331404/uber-staff-revolts-over-return-to-office-mandate', date: '2025-05-09' },
    note: 'CEO memo went company-wide; sources do not state a London exception.'
  },
  {
    id: 'citi', name: 'Citi', industry: 'Banking', area: 'Canary Wharf',
    address: 'Citigroup Centre, 25 Canada Square, London E14 5LB', lat: 51.5040, lng: -0.0178,
    days: 3, label: '3 days', cat: 'hybrid', scope: 'london',
    changed: 'Hybrid model kept (reported Jan 2025)',
    tightened: null,
    summary: 'Citi has kept a hybrid model for most staff — three office days and up to two remote — and is spending heavily on its Canary Wharf headquarters to draw people in.',
    source: { title: 'Citigroup faces £1 billion bill on London HQ overhaul to tempt staff back to the office', publisher: 'Fortune Europe', url: 'https://fortune.com/europe/2025/01/16/citigroup-faces-1-billion-bill-london-hq-overhaul-multi-level-garden-mini-villages-staff-office/', date: '2025-01-16' },
    note: 'London-focused reporting.'
  },
  {
    id: 'deutsche', name: 'Deutsche Bank', industry: 'Banking', area: 'The City',
    address: '21 Moorfields, London EC2Y 9DB', lat: 51.5183, lng: -0.0889,
    days: 3, label: '3 days · 4 for MDs', cat: 'hybrid', scope: 'global',
    changed: 'Memo Feb 2024 · MD rule from Jun 2024',
    tightened: { date: '2024-02-15', what: 'MDs to 4 days; no WFH on both Friday and Monday' },
    summary: 'Deutsche Bank asks most staff in three days a week and managing directors four, and stopped staff working from home on both a Friday and the following Monday.',
    source: { title: 'Deutsche Bank bans staff from working from home on Fridays and Mondays', publisher: 'Fortune / Bloomberg', url: 'https://fortune.com/europe/2024/02/16/remote-work-deutsche-banks-bans-fridays-mondays-return-to-office/', date: '2024-02-16' },
    note: 'Presented by the bank as a consistent, bank-wide rule; London not singled out.'
  },
  {
    id: 'ubs', name: 'UBS', industry: 'Banking', area: 'The City',
    address: '5 Broadgate, London EC2M 2QS', lat: 51.5205, lng: -0.0822,
    days: 3, label: '3 days', cat: 'hybrid', scope: 'global',
    changed: 'Group memo 13 Mar 2025',
    tightened: { date: '2025-03-13', what: 'Limits on remote working around weekends' },
    summary: 'A UBS group-wide memo set a three-day office minimum and limited remote working around weekends. It allows for country-specific rules.',
    source: { title: 'UBS follows Deutsche Bank by banning staff from working remotely on both Friday and Monday', publisher: 'Fortune Europe', url: 'https://fortune.com/europe/2025/03/14/ubs-follows-deutsche-bank-banning-staff-from-working-remotely-friday-monday/', date: '2025-03-14' },
    extra: [{ title: '[Report] UBS global home-office rules', publisher: 'finews.com', url: 'https://www.finews.com/news/english-news/66766-home-office-remote-work-ubs-global-swiss-finance-place-2', date: '2025-03-13' }],
    note: 'Group-wide memo; allows country-specific variations.'
  },
  {
    id: 'checkout', name: 'Checkout.com', industry: 'Fintech', area: 'Shoreditch',
    address: 'Wenlock Works, 1A Shepherdess Walk, London N1 7BQ', lat: 51.5300, lng: -0.0926,
    days: 3, label: '3 days (Tue–Thu)', cat: 'hybrid', scope: 'global',
    changed: 'Start date not stated by the company',
    tightened: null,
    summary: 'Checkout.com’s careers FAQ says employees work from the office three fixed days a week — Tuesday, Wednesday and Thursday.',
    source: { title: '[Official page] Checkout.com jobs FAQ', publisher: 'Checkout.com (official)', url: 'https://www.checkout.com/jobs', date: '2026-10-15', accessed: true },
    note: 'Official careers page (undated; accessed 15 Oct 2026).'
  },

  // ───────────── REMOTE-FRIENDLY (0–1 days / no minimum) ─────────────
  {
    id: 'revolut', name: 'Revolut', industry: 'Fintech', area: 'Canary Wharf',
    address: '30 South Colonnade, Canary Wharf, London E14 5HX', lat: 51.5051, lng: -0.0204,
    days: 0, label: 'No minimum', cat: 'remote', scope: 'global',
    changed: 'CEO memo 19 Feb 2025',
    tightened: null,
    summary: 'In a February 2025 memo, CEO Nik Storonsky kept Revolut’s hybrid set-up and said employees are not required to come into the office. Its careers site offers home, office or a mix.',
    source: { title: '[Report] Revolut CEO memo keeps hybrid, contrasted with Wall Street mandates', publisher: 'Fortune', url: 'https://fortune.com/2025/02/20/revolut-fintech-rto-jpmorgan-chase-goldman-sachs-wall-street-ipos-citi-bac/', date: '2025-02-20' },
    extra: [{ title: '[Official page] Working at Revolut', publisher: 'Revolut (official)', url: 'https://www.revolut.com/working-at-revolut/', date: '2026-10-15', accessed: true }],
    note: 'A June 2026 Fortune headline indicates new graduates must work from the office in their first year; details not verified, so not reflected here.'
  },
  {
    id: 'wise', name: 'Wise', industry: 'Fintech', area: 'Shoreditch',
    address: 'Worship Square, 65 Clifton Street, London EC2A 4JE', lat: 51.5226, lng: -0.0838,
    days: 0, label: 'No fixed minimum', cat: 'remote', scope: 'global',
    changed: 'Current official policy (undated)',
    tightened: null,
    summary: 'Wise sets no fixed weekly office quota. New joiners are expected in most days for their first six months, and staff can work abroad for up to 90 days a year.',
    source: { title: '[Official page] Wise — flexible working', publisher: 'Wise (official)', url: 'https://wise.jobs/flexible-working', date: '2026-10-15', accessed: true },
    note: 'Senior staff are expected in "regularly"; some US operations teams have a monthly minimum.'
  },
  {
    id: 'stanchart', name: 'Standard Chartered', industry: 'Banking', area: 'The City',
    address: '1 Basinghall Avenue, London EC2V 5DD', lat: 51.5170, lng: -0.0911,
    days: 0, label: 'No mandate — teams decide', cat: 'remote', scope: 'global',
    changed: 'CEO comments Jul 2025',
    tightened: null,
    summary: 'CEO Bill Winters said in mid-2025 that he would not impose an office mandate; teams agree their own patterns.',
    source: { title: "Standard Chartered CEO says this is the reason he won't make staff return to the office", publisher: 'Business Insider', url: 'https://www.businessinsider.com/standard-chartered-ceo-will-not-make-staff-return-to-office-2025-8', date: '2025-07-31' },
    note: 'Based on the CEO’s public comments rather than a formal written policy.'
  },
  {
    id: 'spotify', name: 'Spotify', industry: 'Consumer tech & media', area: 'Not mapped',
    address: null, lat: null, lng: null, mapped: false,
    days: 0, label: 'Work from anywhere', cat: 'remote', scope: 'global',
    changed: 'Launched Feb 2021 · reaffirmed Oct 2024',
    tightened: null,
    summary: 'Spotify’s “Work From Anywhere” scheme lets staff choose home, office or a mix. Its HR chief publicly reaffirmed it in October 2024.',
    source: { title: "Spotify HR chief says remote staff aren't 'children', reaffirms work-from-anywhere", publisher: 'Fortune (via Yahoo Finance)', url: 'https://finance.yahoo.com/news/spotify-hr-chief-says-remote-100021103.html', date: '2024-10-08' },
    note: 'London office address could not be verified, so Spotify is listed but not placed on the map.'
  },

  // ───────────── NOT CONFIRMED ─────────────
  {
    id: 'hsbc', name: 'HSBC', industry: 'Banking', area: 'Canary Wharf',
    address: '8 Canada Square, Canary Wharf, London E14 5HQ', lat: 51.5049, lng: -0.0183,
    days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'global',
    changed: 'MD memo reported 29 Jul 2025',
    tightened: { date: '2025-07-29', what: 'Managing directors: at least 4 days (reported)' },
    summary: 'HSBC weighed a three-day rule for all staff in June 2025; a later memo reportedly asked managing directors to come in at least four days a week. No all-staff rule was confirmed.',
    source: { title: 'HSBC: FTSE 100 giant mulls return-to-office mandate', publisher: 'City A.M.', url: 'https://www.cityam.com/hsbc-ftse-100-giant-mulls-return-to-office-mandate/', date: '2025-06-18' },
    extra: [{ title: 'Market Chatter: HSBC requests managing directors to return to office 4 days a week', publisher: 'MT Newswires (via Yahoo Finance)', url: 'https://finance.yahoo.com/news/market-chatter-hsbc-requests-managing-140133386.html', date: '2025-07-29' }],
    note: 'HSBC is planning to move its HQ to Panorama St Paul’s; shown at its current Canary Wharf tower.'
  },
  {
    id: 'apple', name: 'Apple', industry: 'Big tech', area: 'Battersea',
    address: 'Battersea Power Station, London SW11 8DD', lat: 51.4818, lng: -0.1447,
    days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'global',
    changed: 'US policy set Aug 2022',
    tightened: null,
    summary: 'Apple’s three-day policy (Tuesday, Thursday and a team day) was reported for US offices from September 2022. No source confirms it for London.',
    source: { title: 'Apple sets return-to-office deadline of Sept. 5 after Covid delays', publisher: 'Bloomberg', url: 'https://www.bloomberg.com/news/articles/2022-08-15/apple-sets-return-to-office-deadline-of-sept-5-after-delays', date: '2022-08-15' },
    note: 'US reporting only.'
  },
  {
    id: 'microsoft', name: 'Microsoft', industry: 'Big tech', area: 'Paddington',
    address: '2 Kingdom Street, Paddington, London W2 6BD', lat: 51.5193, lng: -0.1810,
    days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'global',
    changed: 'US rollout from Feb 2026',
    tightened: null,
    summary: 'Microsoft is phasing in three office days a week, starting in the US from February 2026. It said planning for offices outside the US would start in 2026, with no UK date given.',
    source: { title: 'Flexible work update', publisher: 'Microsoft (official)', url: 'https://blogs.microsoft.com/blog/2025/09/09/flexible-work-update/', date: '2025-09-09' },
    note: 'No UK timeline found as of the stamp date.'
  },
  {
    id: 'salesforce', name: 'Salesforce', industry: 'Big tech', area: 'The City',
    address: 'Salesforce Tower, 110 Bishopsgate, London EC2N 4AY', lat: 51.5155, lng: -0.0817,
    days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'global',
    changed: 'US role-based tiers from Oct 2024',
    tightened: null,
    summary: 'Salesforce set role-based office requirements of three to five days from October 2024, reported for US staff. No source confirms the London picture.',
    source: { title: 'Salesforce will require employees in office 5 times per week', publisher: 'Entrepreneur', url: 'https://www.entrepreneur.com/business-news/salesforce-will-require-employees-in-office-5-times-per-week/477422', date: '2024-07-22' },
    note: 'Day count varies by role; US reporting only.'
  },
  {
    id: 'bofa', name: 'Bank of America', industry: 'Banking', area: 'The City',
    address: '2 King Edward Street, London EC1A 1HQ', lat: 51.5163, lng: -0.0985,
    days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'global',
    changed: 'US policy since Oct 2022',
    tightened: null,
    summary: 'In the US, most Bank of America staff must be in three days a week and client-facing roles five. Reporting focuses on US staff; London is not confirmed.',
    source: { title: 'Bank of America threatening workers over return-to-office', publisher: 'Fortune', url: 'https://fortune.com/2024/01/25/bank-of-america-threatening-workers-return-to-office-disciplinary-action/', date: '2024-01-25' },
    note: 'US reporting only.'
  },
  {
    id: 'monzo', name: 'Monzo', industry: 'Fintech', area: 'The City',
    address: 'Broadwalk House, 5 Appold Street, London EC2A 2AG', lat: 51.5207, lng: -0.0813,
    days: null, label: 'Varies by role', cat: 'unconfirmed', scope: 'uk',
    changed: 'No company-wide minimum published',
    tightened: null,
    summary: 'Monzo publishes no single minimum. Many roles can be done remotely within the UK; sampled London job ads ask for one to two office days a week.',
    source: { title: '[Official page] Monzo careers', publisher: 'Monzo (official)', url: 'https://monzo.com/careers', date: '2026-10-15', accessed: true },
    note: 'Based on official careers page and job ads accessed 15 Oct 2026.'
  },
  {
    id: 'starling', name: 'Starling Bank', industry: 'Fintech', area: 'City fringe',
    address: 'London Fruit & Wool Exchange, 1 Duval Square, London E1 6PW', lat: 51.5188, lng: -0.0754,
    days: null, label: 'Varies by function', cat: 'unconfirmed', scope: 'uk',
    changed: 'No company-wide minimum published',
    tightened: null,
    summary: 'Starling job ads describe a hybrid approach; technology roles ask for at least one office day a week. No company-wide minimum is published.',
    source: { title: '[Official page] Starling Bank careers', publisher: 'Starling Bank (official)', url: 'https://www.starlingbank.com/careers/', date: '2026-10-15', accessed: true },
    note: 'Based on official job postings accessed 15 Oct 2026.'
  },
  {
    id: 'gocardless', name: 'GoCardless', industry: 'Fintech', area: 'City fringe',
    address: 'Sutton Yard, 65 Goswell Road, London EC1V 7EN', lat: 51.5244, lng: -0.0995,
    days: null, label: 'Team-led', cat: 'unconfirmed', scope: 'uk',
    changed: 'No company-wide minimum published',
    tightened: null,
    summary: 'GoCardless runs a team-led hybrid model, where each function sets its own attendance. No single minimum is published.',
    source: { title: '[Official page] GoCardless careers', publisher: 'GoCardless (official)', url: 'https://gocardless.com/about/careers/', date: '2026-10-15', accessed: true },
    note: 'Based on official careers page accessed 15 Oct 2026.'
  },
  {
    id: 'natwest', name: 'NatWest Group', industry: 'Banking', area: 'The City',
    address: '250 Bishopsgate, London EC2M 4AA', lat: 51.5185, lng: -0.0790,
    days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'uk',
    changed: 'Last public plan: May 2021',
    tightened: null,
    summary: 'The last public plan found dates from 2021, when NatWest said most staff would work hybrid. No current minimum was found.',
    source: { title: 'Only 13% of NatWest staff to return to office full-time', publisher: 'Reuters (via Investing.com)', url: 'https://uk.investing.com/news/economy/only-13-of-natwest-staff-to-return-to-office-fulltime-2384476', date: '2021-05-31' },
    note: 'Source is out of date; current policy not confirmed.'
  },
  { id: 'morganstanley', name: 'Morgan Stanley', industry: 'Banking', area: 'Canary Wharf', address: '20 Bank Street, Canary Wharf, London E14 4AD', lat: 51.5032, lng: -0.0228, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'global', changed: '—', tightened: null, summary: 'No reputable public source stating Morgan Stanley’s current office requirement could be found.', source: null },
  { id: 'blackrock', name: 'BlackRock', industry: 'Asset management', area: 'The City', address: '12 Throgmorton Avenue, London EC2N 2DL', lat: 51.5156, lng: -0.0868, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'global', changed: '—', tightened: null, summary: 'No accessible reputable source confirming BlackRock’s current office requirement was found.', source: null },
  { id: 'schroders', name: 'Schroders', industry: 'Asset management', area: 'The City', address: '1 London Wall Place, London EC2Y 5AU', lat: 51.5174, lng: -0.0931, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'uk', changed: '—', tightened: null, summary: 'No reputable public source confirming Schroders’ office requirement was found.', source: null },
  { id: 'lseg', name: 'LSEG', industry: 'Exchanges & data', area: 'The City', address: '10 Paternoster Square, London EC4M 7LS', lat: 51.5148, lng: -0.0994, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'global', changed: '—', tightened: null, summary: 'No reputable public source confirming London Stock Exchange Group’s office requirement was found.', source: null },
  { id: 'bloomberg', name: 'Bloomberg LP', industry: 'Exchanges & data', area: 'The City', address: '3 Queen Victoria Street, London EC4N 4TQ', lat: 51.5126, lng: -0.0907, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'global', changed: '—', tightened: null, summary: 'No reputable public source confirming Bloomberg’s London office requirement was found.', source: null },
  { id: 'aviva', name: 'Aviva', industry: 'Insurance', area: 'The City', address: '80 Fenchurch Street, London EC3M 4AE', lat: 51.5119, lng: -0.0790, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'uk', changed: '—', tightened: null, summary: 'No reputable public source confirming Aviva’s office requirement was found.', source: null },
  { id: 'lg', name: 'Legal & General', industry: 'Insurance', area: 'The City', address: 'One Coleman Street, London EC2R 5AA', lat: 51.5159, lng: -0.0905, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'uk', changed: '—', tightened: null, summary: 'No reputable public source confirming Legal & General’s office requirement was found.', source: null },
  { id: 'klarna', name: 'Klarna', industry: 'Fintech', area: 'South Bank', address: '10 York Road, London SE1 7ND', lat: 51.5025, lng: -0.1150, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'london', changed: '—', tightened: null, summary: 'No official or reputable source on Klarna’s London office requirement could be found.', source: null },
  { id: 'oaknorth', name: 'OakNorth', industry: 'Fintech', area: 'West End', address: '57 Broadwick Street, London W1F 9QS', lat: 51.5137, lng: -0.1367, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'london', changed: '—', tightened: null, summary: 'OakNorth’s careers pages do not state an office requirement, and no reputable report was found.', source: null },
  { id: 'bt', name: 'BT Group', industry: 'Consumer tech & media', area: 'City fringe', address: 'One Braham, 1 Braham Street, London E1 8EE', lat: 51.5132, lng: -0.0702, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'uk', changed: '—', tightened: null, summary: 'No reputable public source confirming BT’s office requirement could be found.', source: null },
  { id: 'deliveroo', name: 'Deliveroo', industry: 'Consumer tech & media', area: 'The City', address: 'The River Building, 1 Cousin Lane, London EC4R 3TE', lat: 51.5097, lng: -0.0927, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'london', changed: '—', tightened: null, summary: 'No reputable public source confirming Deliveroo’s office requirement could be found.', source: null },
  { id: 'tiktok', name: 'TikTok', industry: 'Consumer tech & media', area: 'City fringe', address: 'Kaleidoscope, 4 Lindsey Street, London EC1A 9HP', lat: 51.5197, lng: -0.1010, days: null, label: 'Not confirmed', cat: 'unconfirmed', scope: 'london', changed: '—', tightened: null, summary: 'No reputable public source confirming TikTok’s London office requirement could be found.', source: null },
];

export const CAT = {
  remote:      { key: 'remote',      name: 'Remote-friendly', short: '0–1 days', hex: '#2de2c8' },
  hybrid:      { key: 'hybrid',      name: 'Hybrid',          short: '2–3 days', hex: '#ffae2b' },
  office:      { key: 'office',      name: 'Office-first',    short: '4–5 days', hex: '#ff3b4e' },
  unconfirmed: { key: 'unconfirmed', name: 'Not confirmed',   short: 'no public source', hex: '#7d8798' },
};

export const AREAS = [
  { name: 'Canary Wharf', lat: 51.5045, lng: -0.0195, label: true },
  { name: 'The City', lat: 51.5150, lng: -0.0900, label: true },
  { name: "King's Cross & Euston", short: "King's Cross", lat: 51.5320, lng: -0.1240, label: true },
  { name: 'Shoreditch', lat: 51.5260, lng: -0.0800, label: true },
  { name: 'City fringe', lat: 51.5160, lng: -0.0720, label: false },
  { name: 'West End', lat: 51.5145, lng: -0.1350, label: true },
  { name: 'South Bank', lat: 51.5040, lng: -0.1140, label: false },
  { name: 'Battersea', lat: 51.4818, lng: -0.1447, label: false },
  { name: 'Paddington', lat: 51.5180, lng: -0.1770, label: false },
];

// Simplified Thames centreline (lng, lat), west → east
export const THAMES = [
  [-0.2050, 51.4790], [-0.1880, 51.4775], [-0.1720, 51.4815], [-0.1600, 51.4850], [-0.1450, 51.4845],
  [-0.1330, 51.4860], [-0.1260, 51.4895], [-0.1222, 51.4950], [-0.1218, 51.5005], [-0.1210, 51.5055],
  [-0.1160, 51.5090], [-0.1060, 51.5097], [-0.0985, 51.5094], [-0.0900, 51.5085], [-0.0820, 51.5072],
  [-0.0754, 51.5056], [-0.0660, 51.5040], [-0.0560, 51.5045], [-0.0470, 51.5072], [-0.0370, 51.5080],
  [-0.0300, 51.5058], [-0.0285, 51.4990], [-0.0262, 51.4925], [-0.0170, 51.4875], [-0.0060, 51.4860],
  [ 0.0020, 51.4895], [ 0.0055, 51.4960], [ 0.0058, 51.5025], [ 0.0040, 51.5075], [ 0.0150, 51.5080],
  [ 0.0300, 51.5030], [ 0.0480, 51.5000],
];

// Commuter routes (outer station → hub). Coordinates of real stations, simplified paths.
const S = {
  bakerSt: [-0.1571, 51.5226], bondSt: [-0.1490, 51.5142], greenPark: [-0.1428, 51.5067], westminster: [-0.1250, 51.5010],
  waterloo: [-0.1132, 51.5031], southwark: [-0.1048, 51.5039], londonBridge: [-0.0864, 51.5052], bermondsey: [-0.0638, 51.4979],
  canadaWater: [-0.0497, 51.4982], canaryWharf: [-0.0195, 51.5035], northGreenwich: [0.0045, 51.5005],
  paddington: [-0.1755, 51.5154], tcr: [-0.1304, 51.5165], farringdon: [-0.1053, 51.5203], liverpoolSt: [-0.0823, 51.5178],
  whitechapel: [-0.0597, 51.5195], cwElizabeth: [-0.0209, 51.5058], customHouse: [0.0264, 51.5095],
  euston: [-0.1337, 51.5282], kingsCross: [-0.1238, 51.5308], angel: [-0.1058, 51.5322], oldSt: [-0.0876, 51.5263],
  moorgate: [-0.0886, 51.5186], bank: [-0.0886, 51.5133], borough: [-0.0937, 51.5011], elephant: [-0.0995, 51.4943],
  victoria: [-0.1439, 51.4965], oxfordCircus: [-0.1415, 51.5152], warrenSt: [-0.1384, 51.5247], highbury: [-0.1032, 51.5463],
  nottingHill: [-0.1966, 51.5094], holborn: [-0.1200, 51.5174], chanceryLane: [-0.1111, 51.5185], stPauls: [-0.0976, 51.5146],
  bethnalGreen: [-0.0553, 51.5270], mileEnd: [-0.0333, 51.5249], shadwell: [-0.0570, 51.5117], limehouse: [-0.0397, 51.5124],
  westferry: [-0.0267, 51.5097], wiq: [-0.0203, 51.5070], euSq: [-0.1357, 51.5258], barbican: [-0.0979, 51.5204],
  stratford: [-0.0035, 51.5416], caledonianRd: [-0.1185, 51.5481], hoxton: [-0.0755, 51.5315],
};
export const ROUTES = [
  { line: 'Jubilee', color: '#a0a5a9', pts: [S.bakerSt, S.bondSt, S.greenPark, S.westminster, S.waterloo, S.southwark, S.londonBridge, S.bermondsey, S.canadaWater, S.canaryWharf] },
  { line: 'Jubilee', color: '#a0a5a9', pts: [[0.0050, 51.5420], S.northGreenwich, S.canaryWharf] },
  { line: 'Elizabeth', color: '#9364cc', pts: [[-0.2300, 51.5150], S.paddington, S.bondSt, S.tcr, S.farringdon, S.liverpoolSt] },
  { line: 'Elizabeth', color: '#9364cc', pts: [S.customHouse, S.cwElizabeth] },
  { line: 'Elizabeth', color: '#9364cc', pts: [[-0.0300, 51.5250], S.whitechapel, S.cwElizabeth] },
  { line: 'Elizabeth', color: '#9364cc', pts: [S.stratford, S.whitechapel, S.liverpoolSt] },
  { line: 'Northern', color: '#d0d0d0', pts: [[-0.1050, 51.4750], S.elephant, S.borough, S.londonBridge, S.bank] },
  { line: 'Northern', color: '#d0d0d0', pts: [[-0.1400, 51.5480], S.euston, S.kingsCross, S.angel, S.oldSt, S.moorgate, S.bank] },
  { line: 'Victoria', color: '#00a0e2', pts: [[-0.1350, 51.4750], S.victoria, S.greenPark, S.oxfordCircus, S.warrenSt, S.euston, S.kingsCross] },
  { line: 'Victoria', color: '#00a0e2', pts: [S.highbury, S.kingsCross] },
  { line: 'Piccadilly', color: '#1c3f94', pts: [S.caledonianRd, S.kingsCross] },
  { line: 'Central', color: '#e32017', pts: [S.nottingHill, S.bondSt, S.oxfordCircus, S.tcr, S.holborn, S.chanceryLane, S.stPauls, S.bank] },
  { line: 'Central', color: '#e32017', pts: [S.mileEnd, S.bethnalGreen, S.liverpoolSt, S.bank] },
  { line: 'DLR', color: '#00afad', pts: [S.bank, S.shadwell, S.limehouse, S.westferry, S.wiq, S.canaryWharf] },
  { line: 'Metropolitan', color: '#9b0056', pts: [S.paddington, S.bakerSt, S.euSq, S.kingsCross, S.farringdon, S.barbican, S.moorgate, S.liverpoolSt] },
  { line: 'Overground', color: '#ee7c0e', pts: [[-0.0760, 51.5480], S.hoxton, [-0.0770, 51.5235], S.liverpoolSt] },
];

export const LANDMARKS = [
  { name: 'The Shard', type: 'shard', lat: 51.5045, lng: -0.0865 },
  { name: '30 St Mary Axe', type: 'gherkin', lat: 51.5145, lng: -0.0803 },
  { name: "St Paul's", type: 'dome', lat: 51.5138, lng: -0.0984 },
  { name: 'London Eye', type: 'eye', lat: 51.5033, lng: -0.1196 },
  { name: 'Elizabeth Tower', type: 'clock', lat: 51.5007, lng: -0.1246 },
  { name: 'Tower Bridge', type: 'bridge', lat: 51.5055, lng: -0.0754 },
  { name: 'One Canada Square', type: 'ocs', lat: 51.5049, lng: -0.0195 },
  { name: 'BT Tower', type: 'bttower', lat: 51.5215, lng: -0.1389 },
  { name: '20 Fenchurch St', type: 'walkie', lat: 51.5113, lng: -0.0835 },
  { name: 'Battersea Power Station', type: 'battersea', lat: 51.4818, lng: -0.1447 },
];
