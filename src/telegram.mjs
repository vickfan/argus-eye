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

  async sendMessage(message) {
    const body = {
      chat_id: this.chatId,
      text: message,
      parse_mode: 'Markdown'
    }

    try {
      const response = await this.axios.post(
        '/sendMessage',
        JSON.stringify(body),
      )
      if (response.status !== 200) {
        throw new Error(`Failed to send message to Telegram: ${response.statusText}`)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  getAxios() {
    return this.axios
  }
}