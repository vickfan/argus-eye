import fs from 'fs'
import moment from 'moment'
import path from 'path'

class OutputChecker {
  constructor() {
    this.batchId = moment().format('YYYYMMDD')
    this.dirPath = path.join(process.cwd(), 'debug', moment().format('YYYY-MM-DD'))
  }

  checkAndSave(stepName, data, validator) {
    if (!fs.existsSync(this.dirPath)) { 
      fs.mkdirSync(this.dirPath, { recursive: true })
    }

    const filePath = path.join(this.dirPath, `${stepName}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  }
}

export const outputChecker = new OutputChecker()