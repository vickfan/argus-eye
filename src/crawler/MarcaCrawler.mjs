import { BaseCrawler } from './BaseCrawler.mjs'

const crawlRecency = 1
export class MarcaCrawler extends BaseCrawler { 

  exit = false

  async accpetCookies() { 
    try {
      const acceptButton = this.page.locator('button[action-name="agreeAll"]')
      await acceptButton.waitFor({ state: 'visible', timeout: 5000 })
      await acceptButton.click()

      await this.page.waitForTimeout(1500)
    } catch (error) {

    }
  }

  async crawl() {
    const results = []
    const seenUrls = new Set()
    await this.init()
    await this.page.goto(this.url)
    await this.accpetCookies()

    const { feeds, shouldExit } = await this.getFeeds()

    feeds.forEach((feed) => {
      if (feed.source_url && !seenUrls.has(feed.source_url)) {
        seenUrls.add(feed.source_url)
        results.push(feed)
      }
    })

    await this.cleanup()
    return results
  }

  async getFeeds() {
    return await this.page.evaluate((recency) => {
      let count = 0
      const maxCount = 3
      const feeds = document.querySelectorAll('article.ue-c-cover-content')

      const results = []
      let shouldExit = false
      
      if (!feeds) {
        return { feeds: results, shouldExit: true }
      }

      const now = new Date()
      const crawLimitDate = new Date(
        now.getTime() - recency * 24 * 60 * 60 * 1000
      )

      for (const feed of feeds) {
        if (count >= maxCount) {
          shouldExit = true
          break
        }

        const linkEl = feed.querySelector('a.ue-c-cover-content__link')
        const link = linkEl ? linkEl.getAttribute('href') : ''
        if (!link) {
          return { feeds: results, shouldExit: true }
        }

        const { pathname } = new URL(link)
        let dateArr = []
        const paths = pathname.split('/')
        for (const path of paths) {
          if (Number.isInteger(Number(path)) && path !== '') { 
            dateArr.push(path)
            if (dateArr.length >= 3) { 
              break
            }
          }
        }
        const postDate = new Date(`${dateArr.join('-')}`)
        if (postDate < crawLimitDate) {
          count++
          continue
        }

        const titleEl = feed.querySelector('h2.ue-c-cover-content__headline')
        const title = titleEl ? titleEl.innerText.replace(/\s+/g, ' ').trim() : ''

        const mediaUrls = []
        const imgElements = feed.querySelectorAll(
          'img.ue-c-cover-content__image',
        )
        imgElements.forEach(img => {
          if (img.src) {
            mediaUrls.push(img.src)
          }
        })

        if (title) {
          results.push({
            time: postDate,
            title: title,
            desc: null,
            source_url: link,
            media_urls: mediaUrls,
          })
        }
      }

      return { feeds: results, shouldExit }
    }, crawlRecency)
  }

  async cleanup() {
    await this.page.close()
    await this.context.close()
  }
}