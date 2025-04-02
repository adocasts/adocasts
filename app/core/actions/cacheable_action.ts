import is from '@adonisjs/core/helpers/is'
import BaseAction from './base_action.js'

type ActionConstructor<CO, DO> = new (...args: any[]) => CacheableAction<CO, DO>

type Options<CacheOptions, DbOptions> =
  | ['cache', CacheOptions?]
  | ['db', DbOptions?]
  | [CacheOptions?]
  | []

export default abstract class CacheableAction<
  CacheOptions = undefined,
  DbOptions = undefined,
> extends BaseAction<Options<CacheOptions, DbOptions>> {
  abstract fromCache(options?: CacheOptions): unknown
  abstract fromDb(options?: DbOptions): unknown

  // overload signatures
  static override run<T extends ActionConstructor<any, any>>(
    this: T
  ): ReturnType<InstanceType<T>['fromCache']>
  static override run<T extends ActionConstructor<any, any>, CacheOptions>(
    this: T,
    options: CacheOptions
  ): ReturnType<InstanceType<T>['fromCache']>
  static override run<T extends ActionConstructor<any, any>, CacheOptions>(
    this: T,
    type: 'cache',
    options?: CacheOptions
  ): ReturnType<InstanceType<T>['fromCache']>
  static override run<T extends ActionConstructor<any, any>, DbOptions>(
    this: T,
    type: 'db',
    options?: DbOptions
  ): ReturnType<InstanceType<T>['fromDb']>

  // implementation
  static override run<CacheOptions, DbOptions>(
    this: ActionConstructor<CacheOptions, DbOptions>,
    typeOrOptions?: 'cache' | 'db' | CacheOptions,
    options?: CacheOptions | DbOptions
  ): unknown {
    const action = new this()

    if (typeOrOptions === 'db') {
      return action.handle('db', options as DbOptions)
    } else if (typeOrOptions === 'cache') {
      return action.handle('cache', options as CacheOptions)
    } else if (arguments.length === 1 && is.object(typeOrOptions)) {
      return action.handle(typeOrOptions as CacheOptions)
    } else {
      return action.handle()
    }
  }

  // overload signatures
  handle(): ReturnType<this['fromCache']>
  handle(options: CacheOptions): ReturnType<this['fromCache']>
  handle(type: 'cache', options?: CacheOptions): ReturnType<this['fromCache']>
  handle(type: 'db', options?: DbOptions): ReturnType<this['fromDb']>

  // implementation
  handle(
    typeOrOptions?: 'cache' | 'db' | CacheOptions,
    options?: CacheOptions | DbOptions
  ): ReturnType<this['fromCache']> | ReturnType<this['fromDb']> {
    if (typeOrOptions === 'db') {
      return this.fromDb(options as DbOptions) as ReturnType<this['fromDb']>
    }

    if (typeOrOptions === 'cache') {
      return this.fromCache(options as CacheOptions) as ReturnType<this['fromCache']>
    }

    if (arguments.length === 1 && is.object(typeOrOptions)) {
      return this.fromCache(typeOrOptions as CacheOptions) as ReturnType<this['fromCache']>
    }

    return this.fromCache() as ReturnType<this['fromCache']>
  }
}
