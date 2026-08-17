export function renderTransferPage(transfers) {
  const list = Array.isArray(transfers) ? transfers : []
  const count = list.length

  const esc = (v) =>
    String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const metaDescription = `latest football transfer news — 今日共 ${count} 則轉會消息`

  const articles = list.map((t, i) => ({
    id: `item-${i}`,
    status: t.status ?? '',
    transfer_type: t.transfer_type ?? '',
    deals_off: !!t.deals_off,
    player_name: t.player_name ?? '',
    clubs_involved: t.clubs_involved ?? '',
    headline_hk: t.headline_hk ?? '',
    lead: t.lead ?? (t.bullet_points || [])[0] ?? '',
    bullet_points: t.bullet_points || [],
    source_url: t.source_url || [],
    media_urls: t.media_urls || [],
  }))

  const now = new Date()
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const edition = `${week[now.getDay()]} · ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · 轉會窗特刊`

  const dataJson = JSON.stringify(articles).replace(/</g, '\\u003c')

  const gridInitial = count === 0 ? '<p class="empty">今日無轉會消息</p>' : ''

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="renderTransferPage">
<title>今日轉會情報報 · Argus Eye</title>
<meta name="description" content="${metaDescription}">
<meta property="og:title" content="今日轉會情報報 · Argus Eye">
<meta property="og:description" content="${metaDescription}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#191510">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@700;900&display=swap" rel="stylesheet">
<style>
:root {
  --paper: #f6f1e5;
  --paper-2: #efe7d3;
  --ink: #191510;
  --ink-soft: #57503f;
  --rule: #191510;
  --rule-soft: #b6ab92;
  --accent: #9b1c1c;
  --input-bg: #fff;
  --btn-hover: #e9dfc8;
  --serif: "Noto Serif TC", "Georgia", "Times New Roman", "Songti SC", "SimSun", serif;
  --sans: "Noto Sans TC", "PingFang HK", "Microsoft JhengHei", sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --paper: #14110d;
    --paper-2: #1d1913;
    --ink: #ece5d8;
    --ink-soft: #a89d87;
    --rule: #d8cfb8;
    --rule-soft: #4a4234;
    --accent: #e2775a;
    --input-bg: #2a241b;
    --btn-hover: #3a3227;
  }
}

html[data-theme="dark"] {
  --paper: #14110d;
  --paper-2: #1d1913;
  --ink: #ece5d8;
  --ink-soft: #a89d87;
  --rule: #d8cfb8;
  --rule-soft: #4a4234;
  --accent: #e2775a;
  --input-bg: #2a241b;
  --btn-hover: #3a3227;
}

* { box-sizing: border-box }

html { background: var(--paper) }

body {
  margin: 0;
  color: var(--ink);
  font-family: var(--serif);
  line-height: 1.55;
}

a { color: inherit; text-decoration: none }

/* ---------- masthead ---------- */

.masthead {
  position: relative;
  text-align: center;
  padding: 18px 16px 10px;
  border-bottom: 3px double var(--rule);
}

.masthead .theme-btn {
  position: absolute;
  top: 14px;
  right: 14px;
}

.edition {
  margin: 0 0 6px;
  font-family: var(--sans);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
}

.paper-title {
  margin: 0;
  font-size: clamp(38px, 8vw, 64px);
  font-weight: 900;
  letter-spacing: 0.02em;
}

.tagline {
  margin: 4px 0 14px;
  font-size: 13px;
  color: var(--ink-soft);
  font-style: italic;
}

.toolbar {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin: 14px auto 8px;
  max-width: 1080px;
  padding: 0 16px;
}

#search {
  width: 100%;
  padding: 9px 14px;
  border: 1px solid var(--rule-soft);
  background: var(--input-bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 14px;
}

.theme-btn {
  display: block;
  line-height: 0;
  cursor: pointer;
}

.theme-btn input {
  display: none;
}

.theme-btn .track {
  display: block;
  width: 54px;
  height: 26px;
  border-radius: 999px;
  background: linear-gradient(90deg, #2c3554 0 50%, #ffd27a 50% 100%);
  position: relative;
  transition: none;
}

.theme-btn .ic {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linejoin: round;
}

.theme-btn .ic-moon {
  left: 7px;
  color: #dfe6ff;
}

.theme-btn .ic-sun {
  right: 7px;
  color: #7c4a03;
}

.theme-btn .knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  transition: transform 0.18s;
}

.theme-btn .ic-knob-moon,
.theme-btn .ic-knob-sun {
  position: static;
  transform: none;
  margin: 4px;
}

.theme-btn .ic-knob-moon {
  color: #4b5c8f;
  display: block;
}

.theme-btn .ic-knob-sun {
  color: #a86a00;
  display: none;
}

.theme-btn input:checked + .track .knob {
  transform: translateX(28px);
}

.theme-btn input:checked + .track .ic-knob-moon {
  display: none;
}

.theme-btn input:checked + .track .ic-knob-sun {
  display: block;
}

.filters {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-bottom: 12px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
}

.filter-label {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--ink-soft);
  letter-spacing: 0.06em;
}

.filter-btn {
  border: 1px solid var(--fc, var(--rule-soft));
  background: color-mix(in srgb, var(--fc, var(--rule-soft)) 12%, transparent);
  color: var(--fc, var(--ink-soft));
  font-family: var(--sans);
  font-size: 12px;
  letter-spacing: 0.04em;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 999px;
  cursor: pointer;
}

.filter-btn.active {
  background: var(--fc, var(--accent));
  border-color: var(--fc, var(--accent));
  color: var(--ink-on-accent, #fff);
  font-weight: 700;
}

[hidden] { display: none !important }

/* ---------- layout ---------- */

.view { max-width: 1080px; margin: 0 auto; padding: 24px 16px 60px }

/* lead story */

.lead-story { margin-bottom: 26px }

.card-lead {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  border-top: 4px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  padding: 14px 0 18px;
  gap: 22px;
}

.card-lead img {
  width: 100%;
  height: auto;
  align-self: start;
  border: 1px solid var(--rule-soft);
}

.kicker {
  display: inline-block;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fc, var(--accent));
  border: 1px solid var(--fc, var(--accent));
  background: color-mix(in srgb, var(--fc, var(--accent)) 12%, transparent);
  padding: 2px 10px;
  border-radius: 999px;
  margin: 0 0 8px;
}

.lead-body h2 {
  margin: 0 0 10px;
  font-size: clamp(26px, 3.6vw, 40px);
  font-weight: 900;
  line-height: 1.15;
}

.card-lead:hover .lead-body h2 { text-decoration: underline }

.lede { margin: 0; color: var(--ink-soft); font-size: 15px }

/* news grid — staggered masonry */

.news-grid {
  position: relative;
  border-top: 1px solid var(--rule);
  min-height: 120px;
}

.card {
  position: absolute;
  top: 0;
  left: 0;
  padding: 16px 18px 18px;
  border-bottom: 1px solid var(--rule-soft);
}

.card:hover .card-title { text-decoration: underline }

.card-title {
  margin: 0 0 8px;
  font-size: clamp(17px, 1.8vw, 22px);
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.18;
}

.card .lede { font-size: 14px }

.card img {
  width: 100%;
  height: auto;
  border: 1px solid var(--rule-soft);
  margin-bottom: 10px;
}

.card-meta {
  margin-top: 10px;
  font-family: var(--sans);
  font-size: 12px;
  color: var(--ink-soft);
}

.rule-note {
  margin: 20px 0 0;
  text-align: center;
  font-style: italic;
  color: var(--ink-soft);
  font-size: 13px;
}

/* ---------- list view (search / filter results) ---------- */

.list-head { border-bottom: 1px solid var(--rule); padding-bottom: 8px; margin-bottom: 8px }

.list-count { margin: 0; color: var(--ink-soft); font-family: var(--sans); font-size: 13px }

.list { border-top: 1px solid var(--rule) }

.list-item {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--rule-soft);
}

.list-item.no-thumb { grid-template-columns: 1fr }

.list-item img {
  width: 90px;
  height: 60px;
  object-fit: cover;
  border: 1px solid var(--rule-soft);
}

.list-item h3 {
  margin: 0;
  width: 100%;
  min-width: 0;
  font-size: 16px;
  line-height: 1.3;
  font-weight: 700;
}

.list-item:hover h3 { text-decoration: underline }

.empty { color: var(--ink-soft); text-align: center; padding: 40px 0; font-size: 15px }

/* ---------- article view ---------- */

#article { max-width: 932px }

.back {
  display: inline-block;
  margin-bottom: 20px;
  font-family: var(--sans);
  font-size: 14px;
  color: var(--accent);
}

.pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px }

.pills .kicker { cursor: pointer }

.pills .kicker:hover { filter: brightness(0.85) }

.kicker.accent {
  color: var(--accent);
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.story {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 32px;
  align-items: start;
  max-width: 900px;
}

.story-side {
  position: sticky;
  top: 24px;
  border-left: 1px solid var(--rule-soft);
  padding-left: 18px;
}

.story-headline {
  margin: 6px 0 12px;
  font-size: clamp(26px, 4vw, 40px);
  line-height: 1.15;
}

.story-lede { font-size: 17px; color: var(--ink-soft) }

.story-hero { margin: 14px 0 12px }

.story-hero img {
  width: 100%;
  height: auto;
  border: 1px solid var(--rule-soft);
}

.story-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 18px 0;
}

.story-gallery img {
  width: 100%;
  height: auto;
  border: 1px solid var(--rule-soft);
}

.story h3 {
  font-family: var(--sans);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 4px;
  margin: 24px 0 10px;
}

.bullets { margin: 0 0 0 18px; padding: 0 }

.bullets li { margin-bottom: 6px }

.sources { display: flex; flex-wrap: wrap; gap: 8px }

.source-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--rule-soft);
  border-radius: 999px;
  background: var(--input-bg);
  padding: 8px;
}

.source-chip img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.source-chip:hover {
  border-color: var(--ink);
  box-shadow: 0 0 0 1px var(--ink);
}

/* ---------- responsive ---------- */

@media (max-width: 760px) {
  .card-lead { grid-template-columns: 1fr }

  .story { grid-template-columns: 1fr }

  .story-side {
    position: static;
    border-left: none;
    border-top: 1px solid var(--rule-soft);
    padding-left: 0;
    padding-top: 12px;
  }
}
</style>
</head>
<body>

<header class="masthead">
  <label class="theme-btn" id="themeToggle" title="切換深色模式">
    <input type="checkbox" aria-label="切換深色模式">
    <span class="track">
      <svg class="ic ic-moon" viewBox="0 0 12 12" aria-hidden="true"><path d="M6.5 1a5 5 0 1 0 4.5 5A4 4 0 0 1 6.5 1Z"/></svg>
      <svg class="ic ic-sun" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="2.4"/><g stroke-linecap="round"><g><line x1="6" y1="0.6" x2="6" y2="2.6"/><line x1="6" y1="9.4" x2="6" y2="11.4"/><line x1="0.6" y1="6" x2="2.6" y2="6"/><line x1="9.4" y1="6" x2="11.4" y2="6"/></g><g transform="rotate(45 6 6)"><line x1="6" y1="0.6" x2="6" y2="2.6"/><line x1="6" y1="9.4" x2="6" y2="11.4"/><line x1="0.6" y1="6" x2="2.6" y2="6"/><line x1="9.4" y1="6" x2="11.4" y2="6"/></g></g></svg>
      <span class="knob">
        <svg class="ic ic-knob-moon" viewBox="0 0 12 12" aria-hidden="true"><path d="M6.5 1a5 5 0 1 0 4.5 5A4 4 0 0 1 6.5 1Z"/></svg>
        <svg class="ic ic-knob-sun" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="2.4"/><g stroke-linecap="round"><g><line x1="6" y1="0.6" x2="6" y2="2.6"/><line x1="6" y1="9.4" x2="6" y2="11.4"/><line x1="0.6" y1="6" x2="2.6" y2="6"/><line x1="9.4" y1="6" x2="11.4" y2="6"/></g><g transform="rotate(45 6 6)"><line x1="6" y1="0.6" x2="6" y2="2.6"/><line x1="6" y1="9.4" x2="6" y2="11.4"/><line x1="0.6" y1="6" x2="2.6" y2="6"/><line x1="9.4" y1="6" x2="11.4" y2="6"/></g></g></svg>
      </span>
    </span>
  </label>
  <p class="edition">${edition}</p>
  <h1 class="paper-title">轉會情報報</h1>
  <p class="tagline">每日追蹤各大班霸動向 · 官宣 / 傳聞 / 斟介 一目了然</p>
  <div class="toolbar">
    <input id="search" type="search" placeholder="搜尋球員、球會、標題…" aria-label="搜尋轉會">
  </div>
  <div id="filters" class="filters"></div>
</header>

<main id="home" class="view">
  <section class="lead-story" id="lead" aria-label="頭條"></section>

  <div class="news-grid" id="grid">${gridInitial}</div>
</main>

<section id="list" class="view" hidden>
  <div class="list-head">
    <p class="list-count" id="listCount"></p>
  </div>
  <div id="listItems" class="list"></div>
  <p id="listEmpty" class="empty" hidden>無符合嘅結果</p>
</section>

<section id="article" class="view" hidden>
  <a href="#home" class="back" id="back">← 返回報攤</a>
  <article class="story">
    <div class="story-main">
      <div class="pills">
        <span class="kicker" id="a-status"></span>
        <span class="kicker" id="a-type" hidden></span>
        <span class="kicker accent" id="a-player"></span>
      </div>
      <h2 class="story-headline" id="a-headline"></h2>
      <div class="story-hero" id="a-hero"></div>
      <p class="story-lede" id="a-lead"></p>
      <div class="story-gallery" id="a-gallery"></div>
    </div>
    <aside class="story-side">
      <h3>消息重點</h3>
      <ul class="bullets" id="a-bullets"></ul>
      <h3>相關來源</h3>
      <div class="sources" id="a-sources"></div>
    </aside>
  </article>
</section>

<script>
const articles = ${dataJson}
;(function () {
  const leadBox = document.getElementById('lead')
  const grid = document.getElementById('grid')
  const filterBox = document.getElementById('filters')
  const rowBox = filterBox
  const searchInput = document.getElementById('search')
  const home = document.getElementById('home')
  const listView = document.getElementById('list')
  const listItems = document.getElementById('listItems')
  const listCount = document.getElementById('listCount')
  const listEmpty = document.getElementById('listEmpty')
  const articleView = document.getElementById('article')
  const back = document.getElementById('back')
  const themeToggle = document.getElementById('themeToggle')

  const GAP = 20
  const IMG_BREAKPOINT = 1.4

  const filters = { status: 'ALL', type: 'ALL', off: 'ALL' }

  const DIM_ROWS = [
    { key: 'status', label: '進度', options: ['Rumor', 'Negotiation', 'Confirmed'] },
    { key: 'type', label: '類別', options: ['Loan', 'Permanent'] },
    { key: 'off', label: '狀態', options: ['Deals off'] },
  ]

  const palette = [
    '#b58900',
    '#268bd2',
    '#d33682',
    '#2aa198',
    '#cb4b16',
    '#dc322f',
    '#6c71c4',
    '#859900',
  ]
  let paletteIdx = 0
  const statusColor = {}

  function colorForStatus(status) {
    if (!statusColor[status]) {
      statusColor[status] = palette[paletteIdx++ % palette.length]
    }
    return statusColor[status]
  }

  function esc(v) {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function byId(id) {
    return articles.find(function (a) { return a.id === id })
  }

  function searchText(a) {
    return (a.player_name || '') + ' ' + (a.clubs_involved || '') + ' ' + (a.headline_hk || '') + ' ' + (a.status || '') + ' ' + (a.transfer_type || '')
  }

  function columnCount() {
    const w = grid.clientWidth
    if (w < 640) return 1
    if (w < 900) return 2
    return 3
  }

  function layout() {
    const cards = Array.prototype.slice.call(grid.querySelectorAll('.card'))
    if (!cards.length) return
    const cw = grid.clientWidth
    const cols = columnCount()
    const colW = (cw - GAP * (cols - 1)) / cols
    const skyline = new Array(cols).fill(0)

    cards.forEach(function (card) {
      const img = card.querySelector('img')
      const span = Math.min(img ? (img.naturalWidth / Math.max(img.naturalHeight, 1) >= IMG_BREAKPOINT ? 2 : 1) : 1, cols)
      const cardW = span * colW + (span - 1) * GAP
      card.style.width = cardW + 'px'

      let bestCol = 0
      let bestTop = Infinity
      for (let c = 0; c <= cols - span; c++) {
        const top = Math.max.apply(Math, skyline.slice(c, c + span))
        if (top < bestTop) {
          bestTop = top
          bestCol = c
        }
      }
      card.style.left = bestCol * (colW + GAP) + 'px'
      card.style.top = bestTop + 'px'

      const h = card.offsetHeight
      for (let c = bestCol; c < bestCol + span; c++) skyline[c] = bestTop + h
    })

    grid.style.height = Math.max.apply(Math, skyline) + 'px'
  }

  function fitCard(card) {
    const img = card.querySelector('img')
    if (!img) return
    const reload = function () { return layout() }
    if (img.complete && img.naturalWidth) layout()
    else img.addEventListener('load', reload)
  }

  function markupOpen(a) {
    return '<a class="card item" style="--fc:' + colorForStatus(a.status) + '" href="#' + esc(a.id) + '" data-id="' + esc(a.id) + '" data-status="' + esc(a.status) + '" data-search="' + esc(searchText(a)) + '">'
  }
  function markupClose() {
    return '</a>'
  }
  function picMarkup(url) {
    return '<img src="' + esc(url) + '" alt="" loading="lazy">'
  }

  function cardMeta(a) {
    const bits = []
    if (a.deals_off) bits.push('告吹')
    bits.push(a.clubs_involved || '')
    bits.push(a.transfer_type || '')
    return bits.filter(Boolean).join(' · ')
  }

  function cardMarkup(a) {
    const pic = a.media_urls[0] ? picMarkup(a.media_urls[0]) : ''
    return (
      markupOpen(a) +
      pic +
      '<p class="kicker">' + esc(a.status) + '</p>' +
      '<h3 class="card-title">' + esc(a.headline_hk) + '</h3>' +
      '<p class="lede">' + esc(a.lead || '') + '</p>' +
      '<p class="card-meta">' + esc(cardMeta(a)) + '</p>' +
      markupClose()
    )
  }

  function renderGrid() {
    const lead = articles[0]
    if (!lead) return

    leadBox.innerHTML =
      '<a class="card-lead item" style="--fc:' + colorForStatus(lead.status) + '" href="#' + esc(lead.id) + '" data-id="' + esc(lead.id) + '" data-status="' + esc(lead.status) + '" data-search="' + esc(searchText(lead)) + '">' +
      (lead.media_urls[0] ? picMarkup(lead.media_urls[0]) : '') +
      '<div class="lead-body">' +
        '<p class="kicker">' + esc(lead.status) + '</p>' +
        '<h2>' + esc(lead.headline_hk) + '</h2>' +
        '<p class="lede">' + esc(lead.lead || '') + '</p>' +
      '</div>' +
      '</a>'

    const rest = articles.slice(1)
    grid.innerHTML = rest.map(cardMarkup).join('')

    grid.querySelectorAll('.card').forEach(fitCard)
    layout()
  }

  function buildFilters() {
    DIM_ROWS.forEach(function (row) {
      const label = document.createElement('span')
      label.className = 'filter-label'
      label.textContent = row.label
      rowBox.appendChild(label)
      rowBox.appendChild(createRow(row))
    })
  }

  function createRow(row) {
    const box = document.createElement('span')
    box.className = 'filter-row'
    box.dataset.dim = row.key

    const allBtn = makeBtn('全部', 'ALL')
    allBtn.classList.add('active')
    allBtn.style.setProperty('--fc', 'var(--ink-soft)')
    box.appendChild(allBtn)

    row.options.forEach(function (opt) {
      const btn = makeBtn(opt, opt)
      btn.style.setProperty('--fc', colorForStatus(opt))
      box.appendChild(btn)
    })
    return box
  }

  function makeBtn(labelText, value) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'filter-btn'
    btn.textContent = labelText
    btn.dataset.id = value
    btn.addEventListener('click', function () {
      setActiveRow(rowFor(btn), value)
      if (value === 'ALL') searchInput.value = ''
      apply()
    })
    return btn
  }

  function rowFor(btn) {
    return btn.closest('.filter-row')
  }

  function setActiveRow(row, value) {
    const key = row.dataset.dim
    filters[key] = value
    row.querySelectorAll('.filter-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.id === value)
    })
  }

  function anyFilterActive() {
    return filters.status !== 'ALL' || filters.type !== 'ALL' || filters.off !== 'ALL'
  }

  function query() {
    return (searchInput.value || '').trim().toLowerCase()
  }

  function matches(a) {
    const q = query()
    const okStatus = filters.status === 'ALL' || a.status === filters.status
    const okType = filters.type === 'ALL' || a.transfer_type === filters.type
    const okOff =
      filters.off === 'ALL' || (filters.off === 'Deals off' ? !!a.deals_off : !a.deals_off)
    const okSearch = !q || searchText(a).toLowerCase().indexOf(q) !== -1
    return okStatus && okType && okOff && okSearch
  }

  function renderList() {
    const items = articles.filter(matches)
    listItems.innerHTML = items
      .map(function (a) {
        const noThumb = a.media_urls[0] ? '' : ' no-thumb'
        return (
          '<a class="list-item' + noThumb + '" href="#' + esc(a.id) + '">' +
          (a.media_urls[0] ? picMarkup(a.media_urls[0]) : '') +
          '<h3>' + esc(a.headline_hk) + '</h3>' +
          '</a>'
        )
      })
      .join('')
    listCount.textContent = '搜尋結果 · 共 ' + items.length + ' 則'
    listEmpty.hidden = items.length > 0
  }

  function showView(name) {
    home.hidden = name !== 'home'
    listView.hidden = name !== 'list'
    articleView.hidden = name !== 'article'
  }

  function apply() {
    if (anyFilterActive() || query()) {
      renderList()
      showView('list')
    } else {
      showView('home')
    }
  }

  const SITE_NAMES = {
    'x.com': 'X/傳媒帳號',
    'www.skysports.com': 'Sky Sports',
    'www.marca.com': '馬卡報 Marca',
    'sportbild.bild.de': '圖片報 Bild',
  }

  function siteName(url) {
    const host = (url.match(/^https?\\:\\/\\/([^/]+)/) || [])[1] || url
    const bare = host.replace(/^www\\./, '')
    return SITE_NAMES[host] || SITE_NAMES[bare] || bare
  }

  function siteIcon(url) {
    const host = (url.match(/^https?\\:\\/\\/([^/]+)/) || [])[1] || url
    const bare = host.replace(/^www\\./, '')
    return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(bare) + '&sz=64'
  }

  function renderArticle(id) {
    const a = byId(id)
    if (!a) return apply()

    const story = document.querySelector('.story')
    story.style.setProperty('--fc', colorForStatus(a.status))
    const statusPill = document.getElementById('a-status')
    const typePill = document.getElementById('a-type')
    const playerPill = document.getElementById('a-player')
    statusPill.textContent = a.status
    if (a.transfer_type) {
      typePill.textContent = a.transfer_type
      typePill.hidden = false
    } else {
      typePill.hidden = true
    }
    playerPill.textContent = a.player_name
    statusPill.onclick = function () { return filterByStatus(a.status) }
    typePill.onclick = function () { return filterByType(a.transfer_type) }
    playerPill.onclick = function () { return filterByPlayer(a.player_name) }
    document.getElementById('a-headline').textContent = a.headline_hk
    document.getElementById('a-lead').textContent = a.lead || ''

    const heroUrl = a.media_urls[0] || ''
    const galleryUrls = a.media_urls.slice(1)
    document.getElementById('a-hero').innerHTML = heroUrl
      ? '<img src="' + esc(heroUrl) + '" alt="" loading="eager">'
      : ''
    document.getElementById('a-gallery').innerHTML = galleryUrls.length
      ? mediaMarkup(galleryUrls)
      : ''

    document.getElementById('a-bullets').innerHTML = (a.bullet_points || [])
      .map(function (b) { return '<li>' + esc(b) + '</li>' })
      .join('')

    document.getElementById('a-sources').innerHTML = (a.source_url || [])
      .map(function (u) {
        const name = siteName(u)
        return '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer" class="source-chip" title="' + esc(name) + '" aria-label="' + esc(name) + '">' +
          '<img src="' + esc(siteIcon(u)) + '" alt="" loading="lazy" onerror="this.remove()">' +
          '</a>'
      })
      .join('')

    showView('article')
  }

  function filterByStatus(status) {
    const row = rowBox.querySelector('[data-dim="status"]')
    setActiveRow(row, status)
    searchInput.value = ''
    location.hash = 'home'
    apply()
  }

  function filterByType(type) {
    const row = rowBox.querySelector('[data-dim="type"]')
    setActiveRow(row, type)
    searchInput.value = ''
    location.hash = 'home'
    apply()
  }

  function filterByPlayer(player) {
    filters.status = 'ALL'
    filters.type = 'ALL'
    filters.off = 'ALL'
    setActiveRow(rowBox.querySelector('[data-dim="status"]'), 'ALL')
    setActiveRow(rowBox.querySelector('[data-dim="type"]'), 'ALL')
    setActiveRow(rowBox.querySelector('[data-dim="off"]'), 'ALL')
    searchInput.value = player
    location.hash = 'home'
    apply()
  }

  function mediaMarkup(urls) {
    return urls.map(function (u) { return '<img src="' + esc(u) + '" alt="" loading="lazy">' }).join('')
  }

  function route() {
    const id = location.hash.replace(/^#/, '')
    if (id && id !== 'home') renderArticle(id)
    else apply()
  }

  function initTheme() {
    const saved = localStorage.getItem('argus-theme')
    const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(dark)
  }

  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    themeToggle.querySelector('input').checked = dark
    localStorage.setItem('argus-theme', dark ? 'dark' : 'light')
  }

  back.addEventListener('click', function () {
    location.hash = 'home'
  })

  themeToggle.addEventListener('click', function () {
    setTheme(themeToggle.querySelector('input').checked)
  })

  searchInput.addEventListener('input', apply)
  window.addEventListener('resize', function () { return layout() })

  window.addEventListener('hashchange', route)

  initTheme()
  renderGrid()
  buildFilters()
  apply()
  route()
})()
</script>
</body>
</html>`
}