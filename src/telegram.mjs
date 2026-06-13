import axios from 'axios'

export class Telegram {
  constructor({ botToken, chatId }) {
    this.botToken = botToken
    this.chatId = chatId
    this.axios = axios.create({
      baseURL: `https://api.telegram.org/bot${this.botToken}`,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  async sendMessage(message, parseMode = 'Markdown') {
    const body = {
      chat_id: this.chatId,
      text: message.replace('_', ' '),
      parse_mode: parseMode
    }

    console.log(body)
    try {
      const response = await this.axios.post(
        '/sendMessage',
        JSON.stringify(body),
      )
      if (response.status !== 200) {
        console.log(JSON.stringify(response.data, null, 2))
        throw new Error(`Failed to send message to Telegram: ${response.statusText}`)
      }
    } catch (error) {
      console.log(error.message)
    }
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