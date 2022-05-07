export default class BaseVM {
  protected __cacheExcludeKeys: string[] = []

  public __onCache() {
    return Object.keys(this)
      .filter(k => !this.__cacheExcludeKeys.includes(k))
      .reduce((vm, k) => ({ ...vm, [k]: this[k] }), {})
  }
}