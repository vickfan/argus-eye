import { BaseCrawler } from './BaseCrawler.mjs'

// in days
const crawlRecency = 1
export class SkySportsCrawler extends BaseCrawler {

  exit = false

  async crawl() {
    const results = []
    const seenUrls = new Set()
    await this.init()

    await this.page.goto(this.url)

    await this.acceptCookies()

    while (!this.exit) {
      const { feeds, shouldExit } = await this.getFeeds()

      feeds.forEach(feed => {
        if (feed.source_url && !seenUrls.has(feed.source_url)) { 
          seenUrls.add(feed.source_url)
          results.push(feed)
        }
      })

      if (shouldExit) {
        this.exit = true
        break
      }
      await this.clickLoadMore()
    }

    await this.cleanup()
    return results
  }

  async acceptCookies() {
    try {
      console.log('⏳ 正在等待 Cookie 隱私彈窗 (iframe) 渲染...')

      // 1. 認準 Sourcepoint 的 iframe 網址通常包含 "notice" 或特定屬性
      // 這裡用 frameLocator 鎖定這個隱私彈窗的 iframe
      const privacyFrame = this.page.frameLocator(
        'iframe[title*="Privacy"], iframe[id*="sp_message_iframe"], iframe[src*="notice"]',
      )

      // 2. 在 iframe 內部，精準鎖定你貼出來的呢粒帶有 title="Accept all" 的 button
      const acceptButton = privacyFrame.locator('button[title="Accept all"]')

      // 3. 最多等 5 秒，一出現就即刻點擊
      await acceptButton.waitFor({ state: 'visible', timeout: 5000 })
      await acceptButton.click()

      console.log(
        '🍪 【Argus 突破成功】順利穿透 iframe 點擊 Accept all！解鎖網頁滾動！',
      )

      // 4. 點完等 1.5 秒，給網頁一點時間把遮罩淡出（Fade-out）並恢復 body 滾動
      await this.page.waitForTimeout(1500)
    } catch (error) {
      // 如果 5 秒內沒彈出來（例如 GitHub Actions 機房 IP 有時不會觸發隱私政策），就直接 Skip 不卡死
      console.log('ℹ️ 未能偵測到 Cookie 彈窗或已自動跳過，直接開始爬取。')
    }
  }

  async getFeeds() {
    console.log('getFeeds')
    return await this.page.evaluate((recency) => {
      const feeds = document.querySelectorAll(
        '#liveblog-posts div.ncpost-list-post',
      )

      const results = []
      let shouldExit = false

      if (!feeds) {
        return { feeds: results, shouldExit: true }
      }

      const now = new Date()
      const crawLimitDate = new Date(
        now.getTime() - recency * 24 * 60 * 60 * 1000,
      )

      for (const feed of feeds) {
        const timeEl = feed.querySelector('time')
        const datetime = timeEl ? timeEl.getAttribute('data-js-time-stamp') : null

        if (!datetime) {
          continue
        }

        if (new Date(parseInt(datetime)) < crawLimitDate) {
          shouldExit = true
          continue
        }

        const titleEl = feed.querySelector('h2.ncpost-title')
        const title = titleEl ? titleEl.innerText.replace(/\s+/g, ' ').trim() : ''
        
        const descEl = feed.querySelector('div.ncpost-content p')
        const desc = descEl ? descEl.innerText.replace(/\s+/g, ' ').trim() : ''

        const shareEl = feed.querySelector(
          'div.ncpost-share-links a.ncpost-share-link--copy',
        )
        const shareLink = shareEl ? shareEl.getAttribute('href') : ''

        const mediaUrls = []
        const imgElements = feed.querySelectorAll('img')

        imgElements.forEach((img) => {
          if (img.src) {
            mediaUrls.push(img.src)
          }
        })

        if (title) {
          results.push({
            time: datetime,
            title: title,
            desc: desc,
            source_url: shareLink,
            media_urls: mediaUrls,
          })
        }
      }
      return { feeds: results, shouldExit }
    }, crawlRecency)
  }

  async clickLoadMore() {
    console.log('clickLoadMore')
    try {
      await this.page.evaluate(() => {
        const loadMoreButton = document.querySelector(
          'button.ui-liveblog-button.ui-liveblog-button--load-more',
        )
        if (loadMoreButton) {
          loadMoreButton.click()
        }
      })
      await this.page.waitForTimeout(1000)
      return true
    } catch (error) {
      this.exit = true
      return false
    }
  }
}