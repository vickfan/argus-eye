import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import moment from 'moment'

export class PerformanceLogger {
  constructor({ clientEmail, privateKey, spreadsheetId }) {
    this.auth = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    this.doc = new GoogleSpreadsheet(spreadsheetId, this.auth)
  }

  async init() {
    await this.doc.loadInfo()
    this.sheet = this.doc.sheetsByIndex[0]
  }

  format(data) {
    return {
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      source: data.source,
      url: data.url,
      status: data.status,
      posts_scrapped: data.posts_scrapped,
      execution_time: data.execution_time,
      error: data.errorMessage,
    }
  }

  async log(data) {
    const formattedData = this.format(data)
    await this.sheet.addRow(formattedData)
  }
}