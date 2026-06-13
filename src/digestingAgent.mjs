import { GoogleGenAI, Type } from '@google/genai'
import { digestingPrompt } from './prompt.mjs'

export class DigestingAgent {
  constructor({
    geminiApiKey,
    ai,
    model = 'gemini-2.5-flash',
    topic
  }) {
    this.ai = ai ?? new GoogleGenAI({
      apiKey: geminiApiKey,
    })
    this.model = model
    this.prompt = digestingPrompt
    this.topic = topic
  }

  async digest(text) {
    const aiResponse = await this.ai.models.generateContent({
      model: this.model,
      config: {
        systemInstruction: this.prompt,
        responseMimeType: 'application/json',
        responseSchema: this.schema,
      },
      content: `【用戶監控目標】: ${this.topic}\n\n【Crawler 帶回來的網頁原始文字】:\n${text}`,
    })
    return aiResponse.text
  }

  get schema() {
    return {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description:
            "必須為 'SUCCESS' 或 'FAILED'。如果找到符合用戶目標的資料填 SUCCESS，找不到或資料不足填 FAILED。",
        },
        reason: {
          type: Type.STRING,
          description:
            "成功或失敗的原因摘要（例如：'成功在第二頁找到3條超過100分的文章' 或 '網頁文字中未見任何超過100分的數據'）。",
        },
        extracted_data: {
          type: Type.ARRAY,
          description:
            '提取出來符合用戶監控目標的情報列表。如果 status 為 FAILED，此陣列留空 []。',
          items: {
            type: Type.OBJECT,
            properties: {
              rank: {
                type: Type.STRING,
                description: "資訊在網頁上的排名或順序編號（例如 '31'）",
              },
              title: {
                type: Type.STRING,
                description: '情報的核心標題或專案名稱',
              },
              link: {
                type: Type.STRING,
                description:
                  '相關的網址連結（必須從原始文字中精確提取，不可自行發明）',
              },
              score: {
                type: Type.INTEGER,
                description: '指標分數、熱度、價格或點數（純數字，例如 150）',
              },
              additional_info: {
                type: Type.STRING,
                description:
                  '任何額外的有用備註（如發布時間、作者等），如無可填空字串',
              },
            },
            required: ['rank', 'title', 'link', 'score'],
          },
        },
      },
      required: ['status', 'reason', 'extracted_data'],
    }
  }
}