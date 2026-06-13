import dotenv from 'dotenv'
dotenv.config()

export class Helpers {
  constructor() {}

  static ensureEnvVariable() {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }
    const resultTopic = process.env.RESEARCH_TOPIC
    if (!resultTopic) {
      throw new Error('RESEARCH_TOPIC is not set')
    }
    const researchUrls = process.env.RESEARCH_URLS?.split(',').map(url => url.trim())
    if (!researchUrls || researchUrls.length === 0) {
      throw new Error('RESEARCH_URL is not set')
    }
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN
    if (!telegramBotToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set')
    }
    const telegramChatId = process.env.TELEGRAM_CHAT_ID
    if (!telegramChatId) {
      throw new Error('TELEGRAM_CHAT_ID is not set')
    }

    return {
      geminiApiKey,
      resultTopic,
      researchUrls,
      telegramBotToken,
      telegramChatId,
    }
  }
}
