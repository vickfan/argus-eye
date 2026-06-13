import { Telegram } from './src/telegram.mjs'
import { Helpers } from './src/helpers.mjs'
import { WebCrawlingAgent } from './src/webCrawlingAgent.mjs'
import { DigestingAgent } from './src/digestingAgent.mjs'

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

  const webCrawlingAgent = new WebCrawlingAgent({
    urls: researchUrls,
    topic: resultTopic,
    geminiApiKey,
    model: 'gemini-2.5-flash',
  })
  const ai = webCrawlingAgent.getAi()

  await webCrawlingAgent.launchBrowser()
  const webCrawlingResults = await webCrawlingAgent.crawlAllUrls()
  webCrawlingAgent.close()

  const digestingAgent = new DigestingAgent({
    ai,
    topic: resultTopic,
  })
  const aiResponse = await digestingAgent.digest(webCrawlingResults)

  await telegram.sendMessage(aiResponse)
  return
}

main()
