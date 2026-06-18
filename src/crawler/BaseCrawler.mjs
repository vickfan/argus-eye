import { ContextInjector } from '../contextInjector.mjs'

export class BaseCrawler {
  constructor({
    browser,
    goal,
    url,
  }) {
    this.browser = browser
    this.goal = goal
    this.url = url
    this.contextInjector = null
    this.page = null
  }

  async init() {
    this.context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      ...ContextInjector.getContextOptions(this.url),
    })

    this.page = await this.context.newPage()
    // this.page.on('console', (msg) => {
    //   // 💡 幫瀏覽器入面傳出嚟嘅 Log 加個 [BROWSER] 標籤，方便同 Node.js 嘅 Log 區分
    //   console.log(`🌐 [BROWSER LOG]: ${msg.text()}`)
    // })
    // inject context for auth
    this.contextInjector = new ContextInjector(this.context)
    await this.contextInjector.injectContext(this.url)
  }

  async crawl() {}

  async cleanup() {
    await this.page.close()
    await this.context.close()
  }
}