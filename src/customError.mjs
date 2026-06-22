import { Telegram } from './telegram.mjs'

export class CustomError extends Error {
  static createErrorTemplate(error) {
    let detailedErrorObj
    try {
      detailedErrorObj = JSON.parse(error.message).error
    } catch {
      return this.template(
        error.status || 'NIL',
        error.message || String(error),
        'Non-API error',
      )
    }

    console.error(detailedErrorObj)

    let output
    switch (detailedErrorObj.code) {
      // INVALID_ARGUMENT
      case 400:
        output = this._format400Error(detailedErrorObj)
        break

      // UNAUTHENTICATED / PERMISSION_DENIED
      case 401:
      case 403:
        output = this._format401Error(detailedErrorObj)
        break

      // NOT_FOUND
      case 404:
        output = this._format404Error(detailedErrorObj)
        break
    
      // RESOURCE_EXHAUSTED
      case 429:
        output = this._format429Error(detailedErrorObj)
        break

      // INTERNAL / UNAVAILABLE
      case 500:
      case 503:
        output = this._format500Error(detailedErrorObj)
        break

      default:
        output = 'Unhandled error: ' + detailedErrorObj.message
        break
    }

    return output
  }

  static _getDetails(error) {
    return {
      statusCode: error.status,
      message: error.message.split('.')[0],
    }
  }

  static _format400Error(error) {
    const { statusCode, message } = this._getDetails(error)
    const remark = error.message.split('.')[1]

    return this.template(
      statusCode,
      message,
      remark
    )
  }

  static _format401Error(error) {
    const { statusCode, message } = this._getDetails(error)

    return this.template(
      statusCode,
      message,
      'NIL'
    )
  }

  static _format404Error(error) {
    const { statusCode, message } = this._getDetails(error)

    return this.template(
      statusCode,
      message,
      'Endpoint / model not found'
    )
  }

  static _format429Error(error) {
    const statusCode = error.status
    const retryInfo = error?.details?.find(
      (detail) =>
        detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo',
    )
    const trimmedErrorMessage = error.message.split('.')[0]

    return this.template(
      statusCode,
      trimmedErrorMessage,
      `please retry after ${retryInfo.retryDelay}`,
    )
  }

  static _format500Error(error) {
    const { statusCode, message } = this._getDetails(error)

    return this.template(
      statusCode,
      message,
      'Internal server error'
    )
  }

  static template(errorCode, message, remark) {
    return [
      Telegram.htmlFormatter().bold('❌ Argus Eye 偵察失敗報告 ❌'),
      `${Telegram.htmlFormatter().bold(`Error Code:`)} ${Telegram.htmlFormatter().code(errorCode)}`,
      Telegram.htmlFormatter().divider(),
      '',
      Telegram.htmlFormatter().bold(`Error Message:`),
      Telegram.htmlFormatter().quote(message),
      '',
      Telegram.htmlFormatter().bold(`Remark:`),
      Telegram.htmlFormatter().code(remark),
      '',
      Telegram.htmlFormatter().divider(),
    ].join('\n')
  }
}