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

  const cardsHtml = list
    .map((t) => {
      const playerName = esc(t.player_name)
      const clubs = esc(t.clubs_involved)
      const status = esc(t.status)
      const headline = esc(t.headline_hk)
      const searchText = esc(
        `${t.player_name || ''} ${t.clubs_involved || ''} ${t.headline_hk || ''}`,
      )
      const bullets = (t.bullet_points || [])
        .map((b) => `<li>${esc(b)}</li>`)
        .join('')
      const sources = (t.source_url || [])
        .map(
          (u, i) =>
            `<a class="source" href="${esc(u)}" target="_blank" rel="noopener noreferrer">來源 ${i + 1}</a>`,
        )
        .join(' ')
      const media = (t.media_urls || [])
        .map(
          (m) =>
            `<img class="media" src="${esc(m)}" alt="" loading="lazy" onerror="this.remove()">`,
        )
        .join('')
      const hasDetails = bullets || sources || media

      return `<article class="card" data-status="${status}" data-search="${searchText}">
  <div class="card-head">
    <div>
      <h2>${playerName}</h2>
      <p class="clubs">${clubs}</p>
    </div>
    <span class="badge">${status}</span>
  </div>
  <h3 class="headline">${headline}</h3>
  <button type="button" class="toggle">睇詳情</button>
  <div class="details" hidden>
    ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
    ${sources ? `<div class="sources">${sources}</div>` : ''}
    ${media ? `<div class="media-wrap">${media}</div>` : ''}
    ${hasDetails ? '' : '<p class="muted">暫無詳情</p>'}
  </div>
</article>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="renderTransferPage">
<title>今日轉會情報 · Argus Eye</title>
<meta name="description" content="${metaDescription}">
<meta property="og:title" content="今日轉會情報 · Argus Eye">
<meta property="og:description" content="${metaDescription}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#101014">
<style>
:root {
  --bg: #ffffff;
  --fg: #1b1b1f;
  --muted: #6b7280;
  --card-bg: #f6f6f8;
  --border: #e5e5ea;
  --accent: #1d4ed8;
  --badge-bg: #eef2ff;
  --badge-fg: #1d4ed8;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #101014;
    --fg: #eceef1;
    --muted: #9ca3af;
    --card-bg: #1b1b22;
    --border: #2c2c36;
    --accent: #7ea2ff;
    --badge-bg: #26304f;
    --badge-fg: #a5c0ff;
  }
}
* { box-sizing: border-box }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang HK", "Microsoft JhengHei", sans-serif;
  line-height: 1.6;
}
.container { max-width: 680px; margin: 0 auto; padding: 24px 16px 48px }
h1 { margin: 0 0 4px; font-size: 26px }
.sub { margin: 0 0 20px; color: var(--muted) }
.controls { position: sticky; top: 0; background: var(--bg); padding: 8px 0 12px; z-index: 10 }
#search {
  width: 100%;
  padding: 10px 14px;
  font-size: 15px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card-bg);
  color: var(--fg);
}
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px }
.filter-btn {
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--fg);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
}
.filter-btn.active { background: var(--accent); border-color: var(--accent); color: #fff }
.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 14px;
}
.card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px }
.card h2 { margin: 0; font-size: 18px }
.clubs { margin: 2px 0 0; color: var(--muted); font-size: 13px }
.badge {
  flex-shrink: 0;
  background: var(--badge-bg);
  color: var(--badge-fg);
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.headline { margin: 10px 0 12px; font-size: 15px; font-weight: 600 }
.toggle {
  border: none;
  background: none;
  color: var(--accent);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}
.details { margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border) }
.bullets { margin: 0 0 10px; padding-left: 20px }
.bullets li { margin-bottom: 4px }
.sources { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px }
.source {
  color: var(--accent);
  font-size: 13px;
  text-decoration: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px 10px;
}
.source:hover { text-decoration: underline }
.media-wrap { display: grid; gap: 10px }
.media { width: 100%; max-width: 420px; border-radius: 10px; display: block }
.muted { color: var(--muted); font-size: 13px }
.empty { color: var(--muted); text-align: center; padding: 40px 0; font-size: 15px }
[hidden] { display: none !important }
</style>
</head>
<body>
<main class="container">
  <header>
    <h1>今日轉會情報</h1>
    <p class="sub">今日共 ${count} 則轉會消息</p>
  </header>
  ${count > 0 ? `<div class="controls">
    <input id="search" type="search" placeholder="搜尋球員、球會、轉會標題…" aria-label="搜尋轉會">
    <div id="filters" class="filters"></div>
  </div>` : ''}
  <div id="cards">
    ${cardsHtml}
  </div>
  ${count === 0 ? '<p class="empty">今日無轉會消息</p>' : ''}
  <p id="noResults" hidden>無符合嘅結果</p>
</main>
<script>
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'))
  var filterBox = document.getElementById('filters')
  var searchInput = document.getElementById('search')
  var noResults = document.getElementById('noResults')
  var activeStatus = 'ALL'

  var statuses = []
  cards.forEach(function (card) {
    var s = card.getAttribute('data-status')
    if (s && statuses.indexOf(s) === -1) statuses.push(s)
  })

  function setActive(btn, status) {
    btn.classList.toggle('active', btn.getAttribute('data-status') === status)
  }

  function apply() {
    var q = searchInput.value.trim().toLowerCase()
    var visible = 0
    cards.forEach(function (card) {
      var okStatus =
        activeStatus === 'ALL' || card.getAttribute('data-status') === activeStatus
      var okSearch =
        !q ||
        (card.getAttribute('data-search') || '').toLowerCase().indexOf(q) !== -1
      var show = okStatus && okSearch
      card.hidden = !show
      if (show) visible++
    })
    if (noResults) noResults.hidden = visible > 0
  }

  var allBtn = document.createElement('button')
  allBtn.type = 'button'
  allBtn.className = 'filter-btn active'
  allBtn.setAttribute('data-status', 'ALL')
  allBtn.textContent = '全部'
  allBtn.addEventListener('click', function () {
    activeStatus = 'ALL'
    filterBox.querySelectorAll('.filter-btn').forEach(function (b) {
      setActive(b, 'ALL')
    })
    apply()
  })
  filterBox.appendChild(allBtn)

  statuses.forEach(function (status) {
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'filter-btn'
    btn.setAttribute('data-status', status)
    btn.textContent = status
    btn.addEventListener('click', function () {
      activeStatus = status
      filterBox.querySelectorAll('.filter-btn').forEach(function (b) {
        setActive(b, status)
      })
      apply()
    })
    filterBox.appendChild(btn)
  })

  searchInput.addEventListener('input', apply)

  cards.forEach(function (card) {
    var toggle = card.querySelector('.toggle')
    var details = card.querySelector('.details')
    if (!toggle || !details) return
    toggle.addEventListener('click', function () {
      var open = details.hidden
      details.hidden = !open
      toggle.textContent = open ? '收埋' : '睇詳情'
    })
  })
})()
</script>
</body>
</html>`
}
