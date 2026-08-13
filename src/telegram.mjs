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

  async sendTransferReport(link) {
    await this.sendMessage(link)
  }

  async sendEmptyDayMessage() {
    await this.sendMessage('『今日無轉會消息 🤷』')
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