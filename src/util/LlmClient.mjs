import { GoogleGenAI, Type } from '@google/genai'
import { DisgestingStages } from '../constants.mjs'
import axios from 'axios'

export class LlmClient {
  constructor({
    apiKey, 
    model = 'gemini-2.5-flash',
    prompt,
    stage
  }) {
    this.ai = new GoogleGenAI({
      apiKey,
      maxRetries: 5,
      timeout: 30000,
    })
    this.apiKey = apiKey
    this.model = model
    this.prompt = prompt
    this.stage = stage
    this.axios = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Connection: 'close',
      },
    })
  }

  getSchema() {
    switch (this.stage) {
      case DisgestingStages.TRANSLATE:
        return llmSchema.translateSchema
      case DisgestingStages.CATEGORIZE:
        return llmSchema.categorizeSchema
      case DisgestingStages.AGGREGATE:
        return llmSchema.aggregateSchema
      case DisgestingStages.PUBLISH:
        return llmSchema.publishSchema
      default:
        throw new Error(`Invalid stage: ${this.stage}`)
    }
  }

  async generate(inputData, retries = 3, delay = 3000) { 
    const serializedInputData = typeof inputData === 'string' ? inputData : JSON.stringify(inputData)
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: serializedInputData,
            }
          ]
        }
      ],
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text: this.prompt,
          }
        ]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: this.getSchema(),
      }
    }

    try {
      console.log(`📡 [Axios POST] 正在呼叫 ${this.stage} ... 數據大小: ${Buffer.byteLength(serializedInputData)} bytes`);
      
      // 呼叫 Gemini REST API 頂點
      const response = await this.axios.post(
        `/models/${this.model}:generateContent?key=${this.apiKey}`,
        payload
      )

      // Axios 會自動幫你 Parse JSON，可以直接拿 data
      const result = response.data
      
      if (!result.candidates || !result.candidates[0]?.content?.parts[0]?.text) {
        throw new Error('Gemini 返回的數據結構異常')
      }

      return result.candidates[0].content.parts[0].text

    } catch (error) {
      // 🔍 抓出是不是 503 (過載) 或者是 429 (頻率限制) 或是 網絡閃斷
      const statusCode = error.response?.status
      const isTransientError = statusCode === 503 || statusCode === 429 || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT'

      if (isTransientError && retries > 0) {
        console.warn(`⏳ [Axios 警告] 遇到暫時性錯誤 (${statusCode || error.code})。將於 ${delay / 1000} 秒後自動重試... (剩餘次數: ${retries})`);
        
        // 延時等待
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // 遞迴重試 (Exponential Backoff)
        return this.generate(inputData, retries - 1, delay * 2)
      }

      // 如果是 400 語法錯誤，或者重試完都係死，直接炸出去
      console.error(`❌ [Axios 崩潰] ${this.stage} 階段徹底失敗:`, error.message)
      throw error
    }
  }

  // async generate(inputData, retries = 3, delay = 3000) {
  //   console.log(this.model)
  //   const serializedInputData = typeof inputData === 'string' ? inputData : JSON.stringify(inputData)
  //   try {
  //     const response = await this.ai.models.generateContent({
  //       model: this.model,
  //       config: {
  //         systemInstruction: this.prompt,
  //         responseMimeType: 'application/json',
  //         // responseSchema: this.getSchema(),
  //       },
  //       contents: [
  //         {
  //           role: 'user',
  //           parts: [
  //             {
  //               text: serializedInputData,
  //             },
  //           ],
  //         },
  //       ],
  //     })
  //     return response.text
  //   } catch (error) {
  //     const isSocketError =
  //       error.code === 'UND_ERR_SOCKET' ||
  //       (error.cause && error.cause.code === 'UND_ERR_SOCKET') ||
  //       (error.message && error.message.includes('fetch failed'))

  //     const is503Or429 =
  //       error.status === 503 ||
  //       error.status === 429 ||
  //       (error.message &&
  //         (error.message.includes('503') || error.message.includes('429')))

  //     if ((isSocketError || is503Or429) && retries > 0) {
  //       console.warn(
  //         `⏳ [Gemini 503/斷線震盪] Google 伺服器暫時過載。將於 ${delay / 1000} 秒後自動重試... (剩餘次數: ${retries})`,
  //       )

  //       await new Promise((resolve) => setTimeout(resolve, delay))

  //       return this.generate(inputData, retries - 1, delay * 2)
  //     }

  //     throw error
  //   }
    
  // }
}

const llmSchema = {
  translateSchema: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        title: { type: Type.STRING },
        desc: { type: Type.STRING },
      },
      required: ['id', 'title', 'desc'],
    },
  },
  categorizeSchema: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        title: { type: Type.STRING },
        desc: { type: Type.STRING },
        category: { type: Type.STRING },
      },
      required: ['id', 'title', 'desc', 'category'],
    },
  },
  aggregateSchema: {
    type: Type.OBJECT,
    properties: {
      transfers: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            related_ids: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            feeds: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, title: { type: Type.STRING }, desc: { type: Type.STRING } }, required: ['id', 'title', 'desc'] } },
          }
        },
        required: ['subject', 'related_ids', 'feeds']
      },
      world_cup_matches: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            match_name: { type: Type.STRING },
            related_ids: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER }
            },
            points: { type: Type.STRING },
            bullet_points: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['match_name', 'related_ids', 'points', 'bullet_points']
        }
      },
    },
    required: ['transfers', 'world_cup_matches'],
  },
  publishSchema: {
    type: Type.OBJECT,
    properties: {
      transfers: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            player_name: { type: Type.STRING },
            related_ids: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            clubs_involved: { type: Type.ARRAY, items: { type: Type.STRING } },
            status: { type: Type.STRING },
            headline_hk: { type: Type.STRING },
            bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['player_name', 'related_ids', 'clubs_involved', 'status', 'headline_hk', 'bullet_points']
        }
      },
      world_cup_matches: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            match_name: { type: Type.STRING },
            related_ids: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            points: { type: Type.STRING },
            bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['match_name', 'related_ids', 'points', 'bullet_points']
        }
      },
    },
    required: ['transfers', 'world_cup_matches'],
  },
}