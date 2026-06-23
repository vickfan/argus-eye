import { GoogleGenAI, Type } from '@google/genai'
import { categorizePrompt, digestingPrompt, translatePrompt } from './prompt.mjs'
import { LlmClient } from './util/LlmClient.mjs'
import { DisgestingStages } from './constants.mjs'

export class DigestingAgent {
  constructor({ geminiApiKey, model = 'gemini-2.5-flash' }) {
    this.model = model
    this.apiKey = geminiApiKey
  }

  async sleep(ms = 2500) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  validate(inputData, outputData, stageName) {
    if (!Array.isArray(outputData)) { 
      throw new Error(`output of ${stageName} is not an array`)
    }

    const inputIds = inputData.map((item) => item.id).sort()
    const outputIds = outputData.map((item) => item.id).sort()

    // if (inputIds.length !== outputIds.length) { 
    //   throw new Error(`number of items mismatch in ${stageName}`)
    // }

    const isIdMatch = inputIds.every((id, index) => id === outputIds[index])
    if (!isIdMatch) {
      throw new Error(`id mismatch in ${stageName}`)
    }

    return true
  }

  async translate(inputData) {
    const llmClient = new LlmClient({
      apiKey: this.apiKey,
      stage: DisgestingStages.TRANSLATE,
      prompt: translatePrompt
    })
    const response = await llmClient.generate(inputData)
    return response
  }

  async categorize(inputData) {
    const llmClient = new LlmClient({
      apiKey: this.apiKey,
      stage: DisgestingStages.CATEGORIZE,
      prompt: categorizePrompt
    })
    const response = await llmClient.generate(inputData)
    console.log(response)
    return JSON.parse(response).filter((item) => item.category !== 'IGNORE')
  }

  async aggregate(inputData) {
    const llmClient = new LlmClient({
      apiKey: this.apiKey,
      stage: DisgestingStages.AGGREGATE,
      prompt: aggregatePrompt
    })
    const response = await llmClient.generate(inputData)
    return response
  }

  async publish(inputData) {
    const llmClient = new LlmClient({
      apiKey: this.apiKey,
      stage: DisgestingStages.PUBLISH,
      prompt: publisherPrompt
    })
    const response = await llmClient.generate(inputData)
    return response
  }

  async digest(inputData) {
    console.log('start categorizing...')
    const categorizedData = await this.categorize(inputData)
    console.log('finished categorizing...')

    let isValid = this.validate(inputData, categorizedData, DisgestingStages.CATEGORIZE)
    if (!isValid) {
      throw new Error('categorize validation failed')
    }

    // await this.sleep()

    // console.log('start translating...')
    // const translatedData = await this.translate(categorizedData)
    // console.log('finished translating...')


    // isValid = this.validate(categorizedData, translatedData, DisgestingStages.TRANSLATE)
    // if (!isValid) {
    //   throw new Error('translate validation failed')
    // }

    // await this.sleep()
    // console.log('start aggregating...')
    // const aggregatedData = await this.aggregate(translatedData, DisgestingStages.AGGREGATE)
    // console.log('finished aggregating...')

    // await this.sleep()
    // console.log('start publishing...')
    // const publishedData = await this.publish(aggregatedData, DisgestingStages.PUBLISH)
    // console.log('finished publishing...')

    // return publishedData
  }
}