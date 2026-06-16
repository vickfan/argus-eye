export class ContextInjector {
  constructor(context) {
    this.context = context
  }

  static getContextOptions(url) {
    if (ContextInjector.isRequireStealth(url)) {
      return {
        locale: 'zh-HK',
        geolocation: { longitude: 114.1694, latitude: 22.3193 },
        permissions: ['geolocation'],
      }
    }

    return {}
  }

  async injectContext(url) {
    const cookies = []

    if (ContextInjector.isX(url)) {
      cookies.push(this.getXCookies())
    }

    if (cookies.length > 0) {
      await this.context.addCookies(cookies)
    }
  }

  static isX(url) {
    return url.includes('x.com')
  }

  static isRequireStealth(url) {
    return url.includes('egazette.gld.gov.hk')
  }

  getXCookies() {
    return {
      name: 'auth_token',
      value: process.env.X_AUTH_TOKEN,
      domain: '.x.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    }
  }
}