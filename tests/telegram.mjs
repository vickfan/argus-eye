import { Telegram } from '../src/telegram.mjs'

const f = Telegram.htmlFormatter()

function formatNewsItem(name, transfer, label, detail, publishedAt) {
  return [
    `• ${f.bold(name)} ${transfer}`,
    `ℹ️ ${label}：${detail}`,
    `⏱️ ${f.italic(`發佈時間：${publishedAt}`)}`,
  ].join('\n')
}

const template = [
  `📢 ${f.bold('【24小時足壇轉會即時報】')}`,
  '📅 數據截取時間：2026-06-13',
  f.divider(),
  `🟢 ${f.bold('【官方宣佈 / HERE WE GO】')}`,
  formatNewsItem(
    '賴恩·羅拔圖 (Ryan Roberto)',
    '(費林明高 ➡️ 薩克達)',
    '詳情',
    '烏超球會薩克達已敲定以 900 萬歐元轉會費，簽下費林明高 18 歲翼鋒賴恩·羅拔圖，交易已正式落實（Deal completed）。',
    '3 小時前',
  ),
  formatNewsItem(
    '耶耶·托尼 (Yaya Touré)',
    '(自由身 ➡️ 施洛雲)',
    '詳情',
    '前曼城及巴塞隆拿傳奇中場耶耶·托尼正式展開其主教練生涯，簽約加盟斯洛伐克球會施洛雲（Slovan Bratislava）。',
    '3 小時前',
  ),
  f.divider(),
  `🟡 ${f.bold('【轉會傳聞 / 談判進展】')}`,
  formatNewsItem(
    '雲赫基 (Jan Paul van Hecke)',
    '(熱刺 / 白禮頓)',
    '進度',
    '熱刺與白禮頓中堅雲赫基的轉會談判仍在進行中。雙方在數天前已達成個人條款，目前熱刺正全力推進以求落實交易。',
    '2 小時前',
  ),
  f.divider(),
  `⚪ ${f.bold('【其他消息】')}`,
  formatNewsItem(
    '雲尼斯奧斯 (Vinicius Jr)',
    '(皇家馬德里)',
    '詳情',
    '雲尼斯奧斯公開盛讚摩洛哥已成為非洲乃至全球多國的發展典範，並祝賀他們所取得的成就，稱許其陣中擁有技術極佳的優秀球員。',
    '1 小時前',
  ),
  formatNewsItem(
    '基利安·麥巴比 (Kylian Mbappé)',
    '(皇家馬德里)',
    '詳情',
    '麥巴比盛讚法國國家隊隊友伊巴謙馬·干拿迪（Ibrahima Konaté），形容其防守極具侵略性且盯人緊密，並表示「我愛我的球隊中有像他這樣的防守球員」。',
    '2 小時前',
  ),
  formatNewsItem(
    '泰拔·高圖爾斯 (Thibaut Courtois)',
    '(皇家馬德里)',
    '詳情',
    '高圖爾斯談及個人未來時表示，在皇馬年過 30 歲後通常只能一年一簽，但他對此感到非常放鬆。他相信若能保持水準，續約並非問題。',
    '8 小時前',
  ),
].join('\n')

const singleLineTemplate = JSON.stringify(template)

console.log(singleLineTemplate)

export { template, singleLineTemplate }
