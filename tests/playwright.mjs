import { chromium } from 'playwright'
import { ContextInjector } from '../src/contextInjector.mjs'
import dotenv from 'dotenv'
import { WebCrawlingFunction } from '../src/webCrawlingFunction.mjs'

dotenv.config()

const url = process.env.RESEARCH_URLS

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  })
  const contextInjector = new ContextInjector(context)
  const page = await context.newPage()

  await contextInjector.injectContext(url)
  await page.goto(url)

  const webCrawlingFunction = new WebCrawlingFunction(page)

  await webCrawlingFunction.getTweets()
  await webCrawlingFunction.scrollPageDown()
  await webCrawlingFunction.getTweets()
  await webCrawlingFunction.scrollPageDown()
  await webCrawlingFunction.getTweets()

  await page.close()
  await context.close()
  await browser.close()
}

// async function getTweets(page) { 
//   try {
//     const tweetsData = await page.evaluate(() => {
//       const tweetArticles = document.querySelectorAll(
//         'article[data-testid="tweet"]',
//       )

//       return Array.from(tweetArticles)
//         .map((article, index) => {
//           // 2. 深度炸彈：直接用屬性選擇器抓取帶有 datetime 嘅元素，無視 Pinned 或 Thread 的層級變形
//           const timeEl = article.querySelector('[datetime]')
//           const datetime = timeEl ? timeEl.getAttribute('datetime') : null

//           // 3. 尋找推文主體文字
//           const textEl = article.querySelector(
//             '[data-testid="tweetText"]',
//           )
//           const text = textEl
//             ? textEl.innerText.replace(/\s+/g, ' ').trim()
//             : ''

//           // 4. 順便看看這條是不是「置頂推文 (Pinned)」
//           const isPinned =
//             article.innerHTML.includes('data-testid="socialContext"') &&
//             article.innerText.includes('Pinned')

//           // 如果是一條完全沒有時間、也沒有文字的奇怪區塊（可能是空白廣告），就直接過濾掉
//           if (!text && !datetime) return null

//           return {
//             index: index + 1,
//             time: datetime || 'No time',
//             content: text || 'No content',
//             tag: isPinned ? 'pin' : 'reg',
//           }
//         })
//         .filter((item) => item !== null) // 移除空資料
//     })

//     console.log(
//       `📊 抽水完畢！成功提煉出 ${tweetsData.length} 條結構化推文情報。`,
//     )

//     // 6. 萬一 X 界面大改、連 <article> 都抓不到時的保命安全網
//     if (tweetsData.length === 0) {
//       console.warn('⚠️ 警告：精準標籤全數落空，啟用備用純文字截取...')
//       const fallbackText = await page.evaluate(
//         () => document.body.innerText,
//       )
//       return {
//         page_text:
//           '⚠️ [FALLBACK] 未能精準分塊，原始網頁純文字摘要：\n' +
//           fallbackText.substring(0, 3000),
//       }
//     }

//     console.log(JSON.stringify(tweetsData))
//     return { page_text: JSON.stringify(tweetsData)}
//   } catch (error) {
//     console.error('❌ 提取時空推文失敗:', error.message)
//     return {
//       page_text: `Error extracting tweets with timezone: ${error.message}`,
//     }
//   }
// }

// async function scrollPageDown(page) { 
//   try {
//     await page.evaluate(() => {
//       // 往下滾動一個螢幕的高度
//       window.scrollBy(0, window.innerHeight * 1.5)
//     })
//     await page.waitForTimeout(2000)

//     await page.mouse.wheel(0, 1200)
//     await page.waitForTimeout(1000)

//     return {
//       success: true,
//       message: `成功向下拉動網頁，已動態等候 ${waitTime / 1000} 秒讓新推文加載。`,
//     }
//   } catch (error) {
//     return { success: false, message: `滾動失敗: ${error.message}` }
//   }
// }

main()