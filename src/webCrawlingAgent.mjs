import { chromium } from 'playwright'
import { GoogleGenAI, Type } from '@google/genai'
import { webCrawlingPrompt } from './prompt.mjs'

export class WebCrawlingAgent { 
  constructor({
    urls,
    topic,
    geminiApiKey,
    model = 'gemini-2.5-flash',
  }) {
    this.urls = urls
    this.topic = topic
    this.ai = new GoogleGenAI({
      apiKey: geminiApiKey,
    })
    this.model = model

    this.functions = {
      getCurrentPageText: async () => {
        const rawText = await this.page.evaluate(() => document.body.innerText)
        const cleanedText = rawText.replace(/\s+/g, ' ').substring(0, 12000)

        const interactiveElements = await this.page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('a, button'))
          return elements.map(element => {
            const text = (element.innerText || element.textContent || '').trim().substring(0, 30)
            let selector = element.tagName.toLowerCase()
            if (element.id) {
              selector += `#${element.id}`
            } else if (element.className) {
              selector += `.${element.className.trim().split(/\s+/)[0]}`
            }

            if (text.toLowerCase() === 'more') {
              selector = 'a.morelink'
            }

            return { text, selector}
          }).filter(item => {
            return item.text.length > 1 && item.selector.length > 1
          }).slice(0, 40)
        })

        return {
          page_text: cleanedText,
          available_clickable_selectors: interactiveElements,
        }
      },
      clickButton: async ({ selector }) => {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 })

          await this.page.$eval(selector, (element) => element.scrollIntoView())
          await this.page.click(selector)

          await this.page.waitForLoadState('domcontentloaded')
          await this.page.waitForTimeout(1000)

          return { success: true, message: `成功點擊 ${selector}` }
        } catch (error) {
          return { success: false, message: `點擊失敗: ${error.message}` }
        }
      },
    }
    this.tools = [
      {
        functionDeclarations: [
          {
            name: 'getCurrentPageText',
            description:
              '獲取當前網頁的所有純文字內容，以及當前頁面所有可點擊元素的 CSS Selector 清單。',
            parameters: { type: Type.OBJECT, properties: {} },
          },
          {
            name: 'clickButton',
            description:
              '根據 getCurrentPageText 提供 的 available_clickable_selectors 清單，傳入選定的 CSS Selector 進行點擊跳轉。',
            parameters: {
              type: Type.OBJECT,
              properties: {
                selector: {
                  type: Type.STRING,
                  description: '目標元素的 CSS Selector，必須精確。',
                },
              },
              required: ['selector'],
            },
          },
        ],
      },
    ]
  }

  async launchBrowser() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    this.context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    })
    this.page = await this.context.newPage()
  }

  async crawlAllUrls() { 
    const promises = this.urls.map(url => this._crawl(url))
    const results = await Promise.all(promises)
    return results
  }

  async _crawl(url) {
    await this.page.goto(url)

    const chat = this.ai.chats.create({
      model: this.model,
      config: {
        systemInstruction: webCrawlingPrompt,
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
      const response = await chat.sendMessage({ message })
      
      if (response.functionCalls && response.functionCalls.length > 0) { 
        const functionCall = response.functionCalls[0]
        const { name, args } = functionCall

        if (this.functions[name]) {
          const result = await this.functions[name](args)
          message = [{ functionResponse: { name, response: result } }]
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

  close() {
    this.page.close()
    this.context.close()
    this.browser.close()
  }

  getAi() {
    return this.ai
  }


}