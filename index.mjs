import { Telegram } from './src/telegram.mjs'
import { Helpers } from './src/helpers.mjs'
import { WebCrawlingAgent } from './src/webCrawlingAgent.mjs'
import { DigestingAgent } from './src/digestingAgent.mjs'
import { CustomError } from './src/customError.mjs'
import dotenv from 'dotenv'

dotenv.config()

const NODE_ENV = process.env.NODE_ENV
const isUAT = NODE_ENV === 'UAT'
const isPROD = NODE_ENV === 'PROD'

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

    const feedMap = new Map()
    const cleanedFeeds = webCrawlingResults.map((feed, index) => {
      const feedId = `feed_${index}`

      feedMap.set(feedId, feed)

      return {
        feed_id: feedId, // 給它一個臨時 ID，方便未來比對
        time: feed.time, // 傳入你 parseInt 成功後的 timestamp
        title: feed.title, // 新聞標題
        desc: feed.desc, // 新聞內容描述
      }
    })

    if (isUAT) {
      console.log(cleanedFeeds)
    }

    if (isPROD) {
      const digestingAgent = new DigestingAgent({
        ai,
        topic: resultTopic,
        geminiApiKey,
      })
      const rawDigestingResults = await digestingAgent.digest(
        JSON.stringify(cleanedFeeds),
      )

      const digestingResults = JSON.parse(rawDigestingResults)

      const finalTransfers = digestingResults.transfers.map((transfer) => {
        const relatedFeedIds = transfer.related_feed_ids || []
        let source_urls = []
        let media_urls = []

        relatedFeedIds.forEach((feedId) => {
          const feed = feedMap.get(feedId)
          if (feed) {
            source_urls.push(feed.source_url)
            media_urls.push(...feed.media_urls)
          }
        })

        const uniqueSourceUrls = Array.from(new Set(source_urls))
        const uniqueMediaUrls = Array.from(new Set(media_urls))

        return {
          player_name: transfer.player_name,
          clubs_involved: transfer.clubs_involved,
          status: transfer.status,
          headline_hk: transfer.headline_hk,
          bullet_points: transfer.bullet_points,
          source_url: uniqueSourceUrls ?? [],
          media_urls: uniqueMediaUrls ?? [],
        }
      })

      const finalMatches = digestingResults.world_cup_matches.map((match) => {
        const relatedFeedIds = match.related_feed_ids || []
        let source_urls = []
        let media_urls = []
        relatedFeedIds.forEach((feedId) => {
          const feed = feedMap.get(feedId)
          if (feed) {
            source_urls.push(feed.source_url)
            media_urls.push(...feed.media_urls)
          }
        })

        const uniqueSourceUrls = Array.from(new Set(source_urls))
        const uniqueMediaUrls = Array.from(new Set(media_urls))

        return {
          teams_involved: match.teams_involved,
          points: match.points,
          bullet_points: match.bullet_points,
          source_urls: uniqueSourceUrls ?? [],
          media_urls: uniqueMediaUrls ?? [],
        }
      })

      await telegram.sendTransferReport(finalTransfers)
      await telegram.sendWorldCupReport(finalMatches)
    }
  } catch (error) {
    message = CustomError.createErrorTemplate(error)
    await telegram.sendMessage(message, 'HTML')
  }
}

main()
