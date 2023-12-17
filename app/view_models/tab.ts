import stringHelpers from "@adonisjs/core/helpers/string"
import router from "@adonisjs/core/services/router"

export default class Tab {
  declare routeIdentifier: string

  constructor(public key: string, public name?: string | undefined, private url?: string | undefined) {
    if (!name) {
      this.name = stringHelpers.capitalCase(key)
    }
  }

  get href() {
    if (this.url) {
      return this.url
    }

    return router.makeUrl(this.routeIdentifier, { tab: this.key })
  }

  public static history(key: string, name?: string | undefined) {
    const tab = new Tab(key, name)
    tab.routeIdentifier = 'users.history'
    return tab
  }

  public static watchlist(key: string, name?: string | undefined) {
    const tab = new Tab(key, name)
    tab.routeIdentifier = 'users.watchlist'
    return tab
  }
}