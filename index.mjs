import { Telegram } from './src/telegram.mjs'
import { Helpers } from './src/helpers.mjs'
import { WebCrawlingAgent } from './src/webCrawlingAgent.mjs'
import { DigestingAgent } from './src/digestingAgent.mjs'
import { CustomError } from './src/customError.mjs'

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

  let webCrawlingAgent = null
  let message = ''
  try {
    webCrawlingAgent = new WebCrawlingAgent({
      urls: researchUrls,
      topic: resultTopic,
      geminiApiKey,
      model: 'gemini-2.5-flash',
    })
    const ai = webCrawlingAgent.getAi()

    await webCrawlingAgent.launchBrowser()
    const webCrawlingResults = await webCrawlingAgent.crawlAllUrls()
    await webCrawlingAgent.close()

    const digestingAgent = new DigestingAgent({
      ai,
      topic: resultTopic,
    })
    message = await digestingAgent.digest(webCrawlingResults)

    await telegram.sendMessage(aiResponse)
  } catch (error) {
    message = CustomError.createErrorTemplate(error)
  } finally { 
    await webCrawlingAgent.close()
  }

  try {
    await telegram.sendMessage(message, 'HTML')
  } catch (error) {
    console.error(error)
  }
}

main()
