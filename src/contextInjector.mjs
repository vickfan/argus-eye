export class ContextInjector {
  constructor(context) {
    this.context = context
  }

  async injectContext(url) {
    const cookies = []
    if (ContextInjector.isX(url)) {
      cookies.push(this.getXCookies())
    }

    await this.context.addCookies(cookies)
  }

  static isX(url) {
    return url.includes('x.com')
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