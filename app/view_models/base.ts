import is from '@adonisjs/core/helpers/is'

export default class BaseVM {
  declare meta: Record<string, any>

  constructor() {}

  static consumable<T extends BaseVM>(model: new () => T, results: any[]) {
    return results.map(result => {
      if (result instanceof model) {
        return result
      }

      const instance = new model()

      instance.fill(result)

      return instance
    })
  }

  fill<T extends object>(object: T) {
    if (is.object(object)) {
      Object.keys(object).map(key => {
        const value = (object as any)[key]
        ;(this as any)[key] = value
      })
    }
  }
}
