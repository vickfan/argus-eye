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
      content: text,
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
              status: { type: Type.STRING },
              headline_hk: { type: Type.STRING },
              bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } },
              // 💡 這裡不需要叫 Gemini 回傳 source_url 欄位了，我們在外層自己接
            },
            required: [
              'related_feed_ids',
              'player_name',
              'clubs_involved',
              'status',
              'headline_hk',
              'bullet_points',
            ],
          },
        },
        world_cup_matches: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              // 🔒 核心錨點：一場波通常會聚合多條 feeds 嘅 ID
              related_feed_ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  "所有與這場賽事相關的 feed_id 陣列（例如 ['feed_2', 'feed_5']）",
              },
              teams_involved: { type: Type.STRING },
              points: { type: Type.STRING },
              bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'related_feed_ids',
              'teams_involved',
              'points',
              'bullet_points',
            ],
          },
        },
      },
      required: ['report_date', 'transfers', 'world_cup_matches'],
    }
  }
}