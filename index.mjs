import { Telegram } from './src/telegram.mjs'
import { Helpers } from './src/helpers.mjs'

async function main() {
  const {
    geminiApiKey,
    resultTopic,
    researchUrls,
    telegramBotToken,
    telegramChatId,
  } = Helpers.ensureEnvVariable()

  const telegram = new Telegram({
    botToken: telegramBotToken,
    chatId: telegramChatId,
  })

  await telegram.sendMessage('Hello world!')

}

main()
