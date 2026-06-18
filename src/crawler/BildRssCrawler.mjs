import { BaseCrawler } from './BaseCrawler.mjs'
import Parser from 'rss-parser'
import moment from 'moment'

const crawlRecency = 1
export class BildRssCrawler extends BaseCrawler {
  exit = false

  async crawl() {
    const parser = new Parser({
    customFields: {
      item: [
        ['media:thumbnail', 'thumbnail', { keepArray: false }]
      ]
    }
  })
    const results = []

    const feeds = await parser.parseURL(this.url)
    const now = moment()
    const crawlLimitDate = now.clone().subtract(crawlRecency, 'day')

    for (const feed of feeds.items) {
      const feedDate = moment(feed.pubDate, 'ddd, DD MMM YYYY HH:mm:ss [CEST]')

      if (feedDate.isBefore(crawlLimitDate)) {
        break
      }

      let mediaUrl = feed?.thumbnail?.$?.url || ''
      if (mediaUrl) {
        const urlObj = new URL(mediaUrl)
        urlObj.search = ''
        mediaUrl = urlObj.href
      }

      results.push({
        time: feedDate.format('YYYY-MM-DD HH:mm:ss'),
        title: feed.title,
        desc: feed.contentSnippet || feed.content || '',
        source_url: feed.link,
        media_urls: mediaUrl ? [mediaUrl] : [],
      })
    }
    
    console.log(results)
    return results
  }
}