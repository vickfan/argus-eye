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

    const webCrawlingResults = await webCrawlingAgent.startCrawling()

    console.log(JSON.stringify(webCrawlingResults, null, 2))
    // const digestingAgent = new DigestingAgent({
    //   ai,
    //   topic: resultTopic,
    // })
    // message = await digestingAgent.digest(webCrawlingResults)
  } catch (error) {
    message = CustomError.createErrorTemplate(error)
  }

  try {
    await telegram.sendMessage(message, 'HTML')
  } catch (error) {
    console.error(error)
  }
}

main()
