import axios from 'axios'

export class Telegram {
  constructor({ botToken, chatId }) {
    this.botToken = botToken
    this.chatId = chatId
    this.axios = axios.create({
      baseURL: `https://api.telegram.org/bot${this.botToken}`,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async sendMessage(message, parseMode = 'Markdown') {
    const body = {
      chat_id: this.chatId,
      text: parseMode === 'Markdown' ? message.replace(/_/g, ' ') : message,
      parse_mode: parseMode,
      disable_web_page_preview: false,
    }

    try {
      const response = await this.axios.post('/sendMessage', body)
      if (response.status !== 200) {
        throw new Error(
          `Failed to send message to Telegram: ${response.statusText}`,
        )
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  // 🎯 請將 Telegram class 裡面的 sendTransferReport 替換為此版本：
  async sendTransferReport(transfers) {
    if (!transfers || transfers.length === 0) return

    const fmt = Telegram.htmlFormatter()
    let msg = ''

    // 🧠 隱形插圖黑科技依舊保留
    if (transfers[0]?.media_urls && transfers[0].media_urls.length > 0) {
      msg += `<a href="${transfers[0].media_urls[0]}">&#8205;</a>`
    }

    msg += fmt.bold('🏆 【Argus Eye】今日轉會情報日報') + fmt.lineBreak()
    msg += fmt.divider() + fmt.lineBreak() + fmt.lineBreak()

    transfers.forEach((t) => {
      msg += `⚽ ${fmt.bold(t.player_name)}` + fmt.lineBreak()
      msg += `🔄 交易路徑: ${fmt.code(t.clubs_involved)}` + fmt.lineBreak()
      msg += `📌 當前狀態: ${fmt.bold(t.status)}` + fmt.lineBreak()
      msg += `📣 ${fmt.bold(t.headline_hk)}` + fmt.lineBreak()

      t.bullet_points.forEach((bp) => {
        msg += ` ⁃ ${bp}` + fmt.lineBreak()
      })

      // 🔗 升級：多重 Source Links 高階排版
      if (t.source_urls && t.source_urls.length > 0) {
        msg += `🔗 ${fmt.bold('消息來源：')}`
        t.source_urls.slice(0, 4).forEach((url, i) => {
          msg += ` <a href="${url}">[來源 ${i + 1}]</a>`
        })
        msg += fmt.lineBreak()
      }

      msg +=
        fmt.lineBreak() +
        `──────────────────` +
        fmt.lineBreak() +
        fmt.lineBreak()
    })

    await this.sendMessage(msg, 'HTML')
  }

  // 📝 2. 格式化並發送【世界盃賽事】Message
  async sendWorldCupReport(matches) {
    if (!matches || matches.length === 0) return

    const fmt = Telegram.htmlFormatter()
    let msg = ''

    msg += fmt.bold('🌎 【Argus Eye】2026 世界盃賽事精華') + fmt.lineBreak()
    msg += fmt.divider() + fmt.lineBreak() + fmt.lineBreak()

    matches.forEach((m) => {
      msg += `<b>⚔️ ${m.teams_involved}</b>` + fmt.lineBreak()
      msg += `🔢 最終比分: 🔴 ${fmt.bold(m.points)}` + fmt.lineBreak()
      msg += `📝 ${fmt.bold('賽事核心要點：')}` + fmt.lineBreak()

      m.bullet_points.forEach((bp) => {
        msg += ` ⁃ ${bp}` + fmt.lineBreak()
      })

      if (m.source_urls && m.source_urls.length > 0) {
        msg += `🔗 ${fmt.bold('相關精華連結：')}` + fmt.lineBreak()
        // 限制最多排 3 個來源 Link，畫面最整齊
        m.source_urls.slice(0, 3).forEach((url, i) => {
          msg += ` <a href="${url}">[來源 ${i + 1}]</a>`
        })
        msg += fmt.lineBreak()
      }
      msg += fmt.divider() + fmt.lineBreak() + fmt.lineBreak()
    })

    await this.sendMessage(msg, 'HTML')
  }

  getAxios() {
    return this.axios
  }

  static htmlFormatter() {
    return {
      bold: (text) => `<b>${text}</b>`,
      italic: (text) => `<i>${text}</i>`,
      underline: (text) => `<u>${text}</u>`,
      strikethrough: (text) => `<s>${text}</s>`,
      code: (text) => `<code>${text}</code>`,
      quote: (text) => `<blockquote>${text}</blockquote>`,
      blockCode: (text) =>
        `<pre><code class="language-json">${text}</code></pre>`,
      lineBreak: () => `\n`,
      divider: () => `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`,
    }
  }
}