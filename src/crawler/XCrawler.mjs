import { BaseCrawler } from './baseCrawler.mjs'

// in days
const crawlRecency = 1
export class XCrawler extends BaseCrawler {

  exit = false

  async crawl() {
    const results = []
    await this.init()

    await this.page.goto(this.url)

    while (!this.exit) {
      const { tweets, shouldExit } = await this.getTweets()
      results.push(...tweets)
      if (shouldExit) {
        this.exit = true
        break
      }
      await this.scrollPageDown()
    }

    await this.cleanup()
    return results
  }

  async getTweets() {
    return await this.page.evaluate((recency) => {
      const tweetArticles = document.querySelectorAll(
        'article[data-testid="tweet"]',
      )
      const now = new Date()
      const crawLimitDate = new Date(
        now.getTime() - recency * 24 * 60 * 60 * 1000,
      )

      const results = []
      let shouldExit = false

      for (const article of tweetArticles) {
        const timeEl = article.querySelector('[datetime]')
        const datetime = timeEl ? timeEl.getAttribute('datetime') : null
        const isPinned =
          article.innerHTML.includes('data-testid="socialContext"') &&
          article.innerText.includes('Pinned')

        if (!datetime) {
          continue
        }

        if (new Date(datetime) < crawLimitDate && !isPinned) {
          shouldExit = true
          break
        }

        const textEl = article.querySelector('[data-testid="tweetText"]')
        const text = textEl ? textEl.innerText.replace(/\s+/g, ' ').trim() : ''

        let tweetLink = ''
        if (timeEl) {
          const aTag = timeEl.closest('a')
          if (aTag) {
            const relativePath = aTag.getAttribute('href') // 例如 "/FabrizioRomano/status/180154321"
            if (relativePath) {
              tweetLink = `https://x.com${relativePath}`
            }
          }
        }

        const mediaUrls = []
        const imgElements = article.querySelectorAll(
          '[data-testid="tweetPhoto"] img',
        )
        imgElements.forEach((img) => {
          if (img.src) {
            mediaUrls.push(img.src)
          }
        })

        if (text || mediaUrls.length > 0) {
          results.push({
            time: datetime,
            content: text,
            tag: isPinned ? 'pin' : 'reg',
            tweet_url: tweetLink || window.location.href, // 🔴 塞入剛剛撈到嘅 Tweet Link
            media_urls: mediaUrls, // 🔴 塞入撈到嘅圖片 Array
          })
        }
      }

      return { tweets: results, shouldExit }
    }, crawlRecency)
  }

  async scrollPageDown() {
    try {
      await this.page.evaluate(() => {

        window.scrollBy(0, window.innerHeight * 1.5)
      })
      await this.page.waitForTimeout(2000)

      await this.page.mouse.wheel(0, 1200)
      await this.page.waitForTimeout(1000)

      return true
    } catch (error) {
      this.exit = true
      return false
    }
  }
}