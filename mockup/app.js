(function () {
  const leadBox = document.getElementById('lead')
  const grid = document.getElementById('grid')
  const filterBox = document.getElementById('filters')
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
    return articles.find((a) => a.id === id)
  }

  function searchText(a) {
    return `${a.player_name || ''} ${a.clubs_involved || ''} ${a.headline_hk || ''} ${a.status || ''} ${a.transfer_type || ''}`
  }

  function columnCount() {
    const w = grid.clientWidth
    if (w < 640) return 1
    if (w < 900) return 2
    return 3
  }

  function layout() {
    const cards = Array.from(grid.querySelectorAll('.card'))
    if (!cards.length) return
    const cw = grid.clientWidth
    const cols = columnCount()
    const colW = (cw - GAP * (cols - 1)) / cols
    const skyline = new Array(cols).fill(0)

    cards.forEach((card) => {
      const img = card.querySelector('img')
      const span = img ? (img.naturalWidth / Math.max(img.naturalHeight, 1) >= IMG_BREAKPOINT ? 2 : 1) : 1
      const cardW = span * colW + (span - 1) * GAP
      card.style.width = cardW + 'px'

      let bestCol = 0
      let bestTop = Infinity
      for (let c = 0; c <= cols - span; c++) {
        const top = Math.max(...skyline.slice(c, c + span))
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

    grid.style.height = Math.max(...skyline) + 'px'
  }

  function fitCard(card) {
    const img = card.querySelector('img')
    if (!img) return
    const reload = () => layout()
    if (img.complete && img.naturalWidth) layout()
    else img.addEventListener('load', reload)
  }

  function cardMeta(a) {
    const bits = []
    if (a.deals_off) bits.push('告吹')
    bits.push(a.clubs_involved || '')
    bits.push(a.transfer_type || '')
    return bits.filter(Boolean).join(' · ')
  }

  function cardMarkup(a) {
    const pic = a.media_urls[0]
      ? `<img src="${esc(a.media_urls[0])}" alt="" loading="lazy">`
      : ''
    return `<a class="card item" style="--fc:${colorForStatus(a.status)}" href="#${esc(a.id)}" data-id="${esc(a.id)}" data-search="${esc(searchText(a))}">
      ${pic}
      <p class="kicker">${esc(a.status)}</p>
      <h3 class="card-title">${esc(a.headline_hk)}</h3>
      <p class="lede">${esc(a.lead || '')}</p>
      <p class="card-meta">${esc(cardMeta(a))}</p>
    </a>`
  }

  function renderGrid() {
    const lead = articles[0]
    if (!lead) return

    leadBox.innerHTML = `<a class="card-lead item" style="--fc:${colorForStatus(lead.status)}" href="#${esc(lead.id)}" data-id="${esc(lead.id)}" data-search="${esc(searchText(lead))}">
      ${lead.media_urls[0] ? `<img src="${esc(lead.media_urls[0])}" alt="" loading="lazy">` : ''}
      <div class="lead-body">
        <p class="kicker">${esc(lead.status)}</p>
        <h2>${esc(lead.headline_hk)}</h2>
        <p class="lede">${esc(lead.lead || '')}</p>
      </div>
    </a>`

    grid.innerHTML = articles.slice(1).map(cardMarkup).join('')

    grid.querySelectorAll('.card').forEach(fitCard)
    layout()
  }

  function buildFilters() {
    DIM_ROWS.forEach((row) => {
      const rowEl = document.createElement('div')
      rowEl.className = 'filter-row'

      const label = document.createElement('span')
      label.className = 'filter-label'
      label.textContent = row.label
      rowEl.appendChild(label)

      const allBtn = makeBtn('全部', row.key, 'ALL')
      allBtn.classList.add('active')
      rowEl.appendChild(allBtn)

      row.options.forEach((opt) => rowEl.appendChild(makeBtn(opt, row.key, opt)))

      filterBox.appendChild(rowEl)
    })
  }

  function makeBtn(label, key, value) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'filter-btn'
    btn.dataset.dim = key
    btn.dataset.value = value
    btn.textContent = label
    if (value !== 'ALL') btn.style.setProperty('--fc', colorForStatus(value))
    btn.addEventListener('click', () => {
      filters[key] = value
      filterBox.querySelectorAll(`[data-dim="${key}"]`).forEach((b) => {
        b.classList.toggle('active', b === btn)
      })
      if (key === 'status' && value === 'ALL') searchInput.value = ''
      apply()
    })
    return btn
  }

  function query() {
    return (searchInput.value || '').trim().toLowerCase()
  }

  function anyFilterActive() {
    return filters.status !== 'ALL' || filters.type !== 'ALL' || filters.off !== 'ALL'
  }

  function matches(a) {
    const q = query()
    const okSearch = !q || searchText(a).toLowerCase().indexOf(q) !== -1
    const okStatus = filters.status === 'ALL' || a.status === filters.status
    const okType = filters.type === 'ALL' || a.transfer_type === filters.type
    const okOff = filters.off === 'ALL' || (filters.off === 'Deals off' && !!a.deals_off)
    return okSearch && okStatus && okType && okOff
  }

  function renderList() {
    const items = articles.filter(matches)
    listItems.innerHTML = items
      .map((a) => {
        const noThumb = a.media_urls[0] ? '' : ' no-thumb'
        return `<a class="list-item${noThumb}" href="#${esc(a.id)}">
          ${a.media_urls[0] ? `<img src="${esc(a.media_urls[0])}" alt="" loading="lazy">` : ''}
          <h3>${esc(a.headline_hk)}</h3>
        </a>`
      })
      .join('')
    listCount.textContent = `搜尋結果 · 共 ${items.length} 則`
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
    const host = (url.match(/^https?:\/\/([^/]+)/) || [])[1] || url
    const bare = host.replace(/^www\./, '')
    return SITE_NAMES[host] || SITE_NAMES[bare] || bare
  }

  function siteIcon(url) {
    const host = (url.match(/^https?:\/\/([^/]+)/) || [])[1] || url
    const bare = host.replace(/^www\./, '')
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(bare)}&sz=64`
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
    typePill.textContent = a.transfer_type || ''
    typePill.hidden = !a.transfer_type
    playerPill.textContent = a.player_name
    statusPill.onclick = () => filterByStatus(a.status)
    typePill.onclick = () => filterByType(a.transfer_type)
    playerPill.onclick = () => filterByPlayer(a.player_name)
    document.getElementById('a-headline').textContent = a.headline_hk
    document.getElementById('a-lead').textContent = a.lead || ''

    const [heroUrl, ...galleryUrls] = a.media_urls
    document.getElementById('a-hero').innerHTML = heroUrl
      ? `<img src="${esc(heroUrl)}" alt="" loading="eager">`
      : ''
    document.getElementById('a-gallery').innerHTML = galleryUrls.length
      ? mediaMarkup(galleryUrls)
      : ''

    document.getElementById('a-bullets').innerHTML = (a.bullet_points || [])
      .map((b) => `<li>${esc(b)}</li>`)
      .join('')

    document.getElementById('a-sources').innerHTML = (a.source_url || [])
      .map((u) => {
        const name = siteName(u)
        return `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" class="source-chip" title="${esc(name)}" aria-label="${esc(name)}">
          <img src="${esc(siteIcon(u))}" alt="" loading="lazy" onerror="this.remove()">
        </a>`
      })
      .join('')

    showView('article')
  }

  function setActiveRow(key, value) {
    filterBox.querySelectorAll(`[data-dim="${key}"]`).forEach((b) => {
      b.classList.toggle('active', b.dataset.value === value)
    })
  }

  function filterByStatus(status) {
    filters.status = status
    setActiveRow('status', status)
    searchInput.value = ''
    location.hash = 'home'
    apply()
  }

  function filterByType(type) {
    filters.type = type
    setActiveRow('type', type)
    searchInput.value = ''
    location.hash = 'home'
    apply()
  }

  function filterByPlayer(player) {
    filters.status = 'ALL'
    filters.type = 'ALL'
    filters.off = 'ALL'
    setActiveRow('status', 'ALL')
    setActiveRow('type', 'ALL')
    setActiveRow('off', 'ALL')
    searchInput.value = player
    location.hash = 'home'
    apply()
  }

  function mediaMarkup(urls) {
    return urls.map((u) => `<img src="${esc(u)}" alt="" loading="lazy">`).join('')
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

  back.addEventListener('click', () => {
    location.hash = 'home'
  })

  themeToggle.addEventListener('click', () => {
    setTheme(themeToggle.querySelector('input').checked)
  })

  searchInput.addEventListener('input', apply)
  window.addEventListener('resize', () => layout())

  window.addEventListener('hashchange', route)

  initTheme()
  renderGrid()
  buildFilters()
  apply()
  route()
})()
