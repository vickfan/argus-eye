import { GoogleGenAI, Type } from '@google/genai'
import { digestingPrompt } from './prompt.mjs'

export class DigestingAgent {
  constructor({ geminiApiKey, ai, model = 'gemini-2.5-flash', topic }) {
    this.ai =
      ai ??
      new GoogleGenAI({
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
      contents: text,
    })
    return aiResponse.text
  }

  // 🎯 請將你 DigestingAgent.mjs 裡面的 schema 修改為以下結構：
  get schema() {
    return {
      type: Type.OBJECT,
      properties: {
        report_date: { type: Type.STRING },
        transfers: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              // 🔒 核心錨點：讓 Gemini 告訴我們它是看哪條 feed 寫的
              related_feed_ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  "這條轉會消息源自哪一個或哪幾個 feed_id，必須從輸入數據中精確提取（例如 ['feed_0']）",
              },
              player_name: { type: Type.STRING },
              clubs_involved: { type: Type.STRING },
              status: {
                type: Type.STRING,
                enum: ['Rumor', 'Negotiation', 'Confirmed'],
                description: '轉會進度維度，每條只可選一個，必為以下固定分類之一: Rumor / Negotiation / Confirmed',
              },
              transfer_type: {
                type: Type.STRING,
                enum: ['Loan', 'Permanent'],
                description: '交易類別維度，每條只可選一個，必為以下固定分類之一: Loan / Permanent',
              },
              deals_off: {
                type: Type.BOOLEAN,
                description: '是否告吹（Deals off）。若交易已告吹或被拒，設為 true；否則 false。',
              },
              headline_hk: { type: Type.STRING },
              bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } },
              detail_content: { type: Type.ARRAY, items: { type: Type.STRING } },
              // 💡 這裡不需要叫 Gemini 回傳 source_url 欄位了，我們在外層自己接
            },
            required: [
              'related_feed_ids',
              'player_name',
              'clubs_involved',
              'status',
              'transfer_type',
              'deals_off',
              'headline_hk',
              'bullet_points',
              'detail_content',
            ],
          },
        },
      },
      required: ['report_date', 'transfers'],
    }
  }
}