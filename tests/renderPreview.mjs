import { renderTransferPage } from '../src/pageRenderer.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const sample = [
  {
    player_name: '賴恩·羅拔圖 (Ryan Roberto)',
    clubs_involved: '費林明高 ➡️ 薩克達',
    status: 'Confirmed',
    transfer_type: 'Permanent',
    deals_off: false,
    headline_hk: '薩克達正式官宣，900 萬歐元簽下費林明高 18 歲新翼',
    bullet_points: [
      '雙方簽約至 2031 年，轉會費 900 萬歐元',
      '烏超球隊同日完成體檢，交易已正式落實',
    ],
    source_url: [
      'https://www.marca.com/futbol/internacional/2026/06/13/ryan-roberto.html',
      'https://www.skysports.com/football/news/ryan-roberto-shakhtar-deal',
    ],
    media_urls: [],
  },
  {
    player_name: '耶耶·托尼 (Yaya Touré)',
    clubs_involved: '自由身 ➡️ 施洛雲',
    status: 'Confirmed',
    transfer_type: 'Loan',
    deals_off: false,
    headline_hk: '前曼城名將耶耶·托尼正式展開教練生涯，掛帥施洛雲',
    bullet_points: [
      '簽約加盟斯洛伐克球會施洛雲 (Slovan Bratislava)',
      '首次執教即挑戰歐戰資格線',
    ],
    source_url: ['https://www.slovanbratislava.sk/news/yaya-toure-head-coach'],
    media_urls: ['https://picsum.photos/seed/yaya/640/400'],
  },
  {
    player_name: '雲尼斯奧斯 (Vinicius Jr)',
    clubs_involved: '皇家馬德里',
    status: 'Confirmed',
    transfer_type: 'Permanent',
    deals_off: false,
    headline_hk: 'Here we go！雲尼斯奧斯傾掂續約新約，五年合約等官宣',
    bullet_points: [
      '轉會窗王牌記者確認雙方已達成協議',
      '紅衫軍準備加薪一倍鎖定巴西翼鋒',
      '最快下星期簽紙',
    ],
    source_url: [
      'https://www.realmadrid.com/news/vinicius-renewal-2026',
      'https://www.marca.com/futbol/real-madrid/2026/06/13/vinicius.html',
      'https://www.skysports.com/football/news/vinicius-jr-here-we-go',
    ],
    media_urls: ['https://picsum.photos/seed/vinicius/640/400'],
  },
  {
    player_name: '雲赫基 (Jan Paul van Hecke)',
    clubs_involved: '熱刺 / 白禮頓',
    status: 'Negotiation',
    transfer_type: 'Permanent',
    deals_off: false,
    headline_hk: '熱刺斟緊白禮頓中堅雲赫基，個人條款一早傾掂',
    bullet_points: [
      '兩間球會正就轉會費展開談判',
      '白禮頓企硬要價，熱刺打算加碼成交',
    ],
    source_url: ['https://www.skysports.com/football/news/van-hecke-transfer'],
    media_urls: [],
  },
  {
    player_name: '基利安·麥巴比 (Kylian Mbappé)',
    clubs_involved: '皇家馬德里',
    status: 'Rumor',
    transfer_type: 'Permanent',
    deals_off: false,
    headline_hk: '傳聞中狀態：麥巴比被睇中撬去沙特聯賽，開天文價',
    bullet_points: [
      '沙特土豪球會願意提供天價年薪',
      '皇馬立場今季唔放人',
    ],
    source_url: ['https://www.marca.com/futbol/real-madrid/mbappe-saudi-rumor'],
    media_urls: [],
  },
  {
    player_name: '泰拔·高圖爾斯 (Thibaut Courtois)',
    clubs_involved: '皇家馬德里',
    status: 'Rumor',
    transfer_type: 'Loan',
    deals_off: true,
    headline_hk: '高圖爾斯親口講過 30 歲後一年一簽，續約傳聞滿天飛',
    bullet_points: [
      '門將話自己對續約好放鬆，相信保持狀態就冇問題',
      '傳聞中最新版本話球會想多留佢兩年',
      '外界質疑佢同雲尼斯奧斯續約成事會影響財政',
    ],
    source_url: ['https://www.skysports.com/football/news/courtois-future'],
    media_urls: ['https://picsum.photos/seed/courtois/640/400'],
  },
]

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publishDir = join(root, 'publish')
mkdirSync(publishDir, { recursive: true })

const html = renderTransferPage(sample)
const dateStr = new Date().toISOString().slice(0, 10)

writeFileSync(join(publishDir, 'latest.html'), html)
writeFileSync(join(publishDir, `${dateStr}.html`), html)

console.log(resolve(publishDir, 'latest.html'))
console.log(resolve(publishDir, `${dateStr}.html`))