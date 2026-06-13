export class CustomError extends Error {
  static createErrorTemplate(error) {
    const status = error.status
    let output
    switch (status) {
      case 429:
        output = this._format429Error(error)
        break
      default:
        output = 'Unhandled error'
    }

    return output
  }

  static _format429Error(error) {
    const message = JSON.parse(error.message)
    const detailedErrorObj = message.error
    const statusCode = detailedErrorObj.status
    const retryInfo = detailedErrorObj.details.find(detail =>
      detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
    )
    const trimmedErrorMessage = detailedErrorObj.message.split('.')[0]

    return this.template429Error(statusCode, trimmedErrorMessage, retryInfo.retryDelay)
  }

  static template429Error(status, message, retryDelay) {
    const template = `
❌ **Argus Eye 報告**: 偵察失敗或超時，未能提取情報。
error code: ${status}
error message: ${message}
retry after: ${retryDelay}
    `
    return template
  }
}