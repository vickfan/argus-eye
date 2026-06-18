import { chromium } from 'playwright'
import { GoogleGenAI, Type } from '@google/genai'
import { webCrawlingPrompt, webCrawlingPromptForX } from './prompt.mjs'
import { Helpers } from './helpers.mjs'
import { ContextInjector } from './contextInjector.mjs'
import { XCrawler } from './crawler/XCrawler.mjs'
import { SkySportsCrawler } from './crawler/SkySportsCrawler.mjs'
import { MarcaCrawler } from './crawler/MarcaCrawler.mjs'
import { BildRssCrawler } from './crawler/BildRssCrawler.mjs'
import { MarcaRssCrawler } from './crawler/MarcaRssCrawler.mjs'
import dotenv from 'dotenv'
dotenv.config()
const NODE_ENV = process.env.NODE_ENV
const isPROD = NODE_ENV === 'PROD'
export class WebCrawlingAgent { 
  constructor({
    urls,
    topic,
    geminiApiKey,
    model = 'gemini-3-flash-preview',
  }) {
    this.urls = urls
    this.topic = topic
    this.ai = new GoogleGenAI({
      apiKey: geminiApiKey,
    })
    this.model = model
  }

  async startCrawling() {
    let masterPayload = []
    this.browser = await chromium.launch({
      headless: isPROD,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    await Promise.all(this.urls.map(async url => {
      if (!url) {
        return
      }

      const type = this.getType(url)
      let crawler = null
      switch (type) {
        case 'x':
          crawler = new XCrawler({
            browser: this.browser,
            goal: this.topic,
            url,
          })
          break

        case 'skysports':
          crawler = new SkySportsCrawler({
            browser: this.browser,
            goal: this.topic,
            url,
          })
          break

        case 'marca':
          crawler = new MarcaCrawler({
            browser: this.browser,
            goal: this.topic,
            url,
          })
          break

        case 'marcaRss':
          crawler = new MarcaRssCrawler({
            browser: this.browser,
            goal: this.topic,
            url,
          })
          break

        case 'bildRss':
          crawler = new BildRssCrawler({
            browser: this.browser,
            goal: this.topic,
            url,
          })
          break

        default:
          throw new Error(`unsupported url type: ${type}`)
      }

      if (crawler) {
        const data = await crawler.crawl()
        masterPayload = masterPayload.concat(data)
      }
    }))

    this.close()
    return masterPayload
  }

  getType(url) {
    if (url.includes('x.com')) { 
      return 'x'
    }
    if (url.includes('skysports.com')) {
      return 'skysports'
    }
    if (url.includes('marca.com/rss')) {
      return 'marcaRss'
    }
    if (url.includes('marca.com')) {
      return 'marca'
    }
    if (url.includes('sportbild.bild.de/feed')) {
      return 'bildRss'
    }
    return 'ai'
  }

  async launchBrowser() {
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }

  async crawlAllUrls() { 
    const promises = this.urls.map(url => this._crawl(url))
    const results = await Promise.all(promises)
    return results
  }

  async _crawl(url) {
    await this.contextInjector.injectContext(url)
    await this.page.goto(url)
    let prompt = webCrawlingPrompt
    if (ContextInjector.isX(url)) {
      prompt = webCrawlingPromptForX
    }

    const chat = this.ai.chats.create({
      model: this.model,
      config: {
        systemInstruction: prompt,
        tools: this.tools
      }
    })
    
    let message = `我的目標是：${this.topic}\n請開始你的偵察。`
    let keepGoing = true
    let maxLoop = 6
    let currentLoop = 0
    let aiFinalAnswer = ''

    while (keepGoing && currentLoop < maxLoop) { 
      currentLoop++
      console.log(`AI thinking... (${currentLoop}/${maxLoop})`)
      await Helpers.sleep(7000)
      console.log('message')
      console.log(message)
      const response = await chat.sendMessage({ message })
      
      if (response.functionCalls && response.functionCalls.length > 0) { 
        const functionCall = response.functionCalls[0]
        const { name, args } = functionCall
        console.log(`calling function ${name}`)

        if (this.functions[name]) {
          const result = (await this.functions[name](args)) || {
            status: 'success',
            message: 'Action completed but returned no data.',
          }
          message = {
            functionResponses: [
              {
                name,
                response: result,
              }
            ]
          }
          await Helpers.sleep(4000)
        } else {
          keepGoing = false
        }
      } else {
        aiFinalAnswer = response.text
        keepGoing = false
      }
    }

    let payload = `❌ **Argus Eye 報告**: 偵察失敗或超時，未能提取情報。`
    if (aiFinalAnswer) {
      payload = `👁️ **Argus Eye 偵察回報**\n\n${aiFinalAnswer}`
    }

    console.log('✨ 任務完成。')
    return payload
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  getAi() {
    return this.ai
  }
}