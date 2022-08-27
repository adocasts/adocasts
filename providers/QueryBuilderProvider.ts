import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import States from 'App/Enums/States'
import HtmlParser from 'App/Services/HtmlParser'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
|   const Event = this.app.container.resolveBinding('Adonis/Core/Event')
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class QueryBuilderProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // All bindings are ready, feel free to use them
    const { ModelQueryBuilder } = this.app.container.resolveBinding('Adonis/Lucid/Database')

    ModelQueryBuilder.macro('whereTrue', function(columnName: string) {
      return this.where(columnName, true)
    })

    ModelQueryBuilder.macro('whereFalse', function(columnName: string) {
      return this.where(columnName, false)
    })

    ModelQueryBuilder.macro('wherePublic', function() {
      return this.where({ stateId: States.PUBLIC })
    })

    ModelQueryBuilder.macro('whereState', function(stateId: States) {
      return this.where({ stateId })
    })

    ModelQueryBuilder.macro('withWatchlist', function(userId: number | undefined) {
      return this.if(userId, query => query.withCount('watchlist', query => query.where({ userId })))
    })

    ModelQueryBuilder.macro('getCount', async function () {
      const result = await this.count('* as total')
      return BigInt(result[0].$extras.total)
    })

    ModelQueryBuilder.macro('firstOr', async function<T = undefined>(orFunction: () => Promise<T>) {
      const result = await this.first()

      if (!result) {
        return orFunction()
      }

      return result
    })

    // @ts-ignore
    ModelQueryBuilder.macro('selectIds', async function(idColumn: string = 'id') {
      const results = await this.select(idColumn)
      return results.map(r => r[idColumn])
    })

    ModelQueryBuilder.macro('selectId', async function(idColumn: string = 'id') {
      const result = await this.select(idColumn).first()
      return result.length && result[0][idColumn]
    })

    ModelQueryBuilder.macro('selectIdOrFail', async function(idColumn: string = 'id') {
      const result = await this.select(idColumn).firstOrFail()
      return result.length && result[0][idColumn]
    })

    ModelQueryBuilder.macro('selectColumn', async function(columnName: string) {
      const results = await this.select(columnName)
      return results.map(r => r[columnName])
    })

    ModelQueryBuilder.macro('highlight', async function(columnName: string = 'body', targetColumnName: string = columnName) {
      const result = await this.first()
      if (!result) return
      result[targetColumnName] = await HtmlParser.highlight(result[columnName])
      return result
    })

    ModelQueryBuilder.macro('highlightOrFail', async function(columnName: string = 'body', targetColumnName: string = columnName) {
      const result = await this.firstOrFail()
      result[targetColumnName] = await HtmlParser.highlight(result[columnName])
      return result
    })

    ModelQueryBuilder.macro('highlightAll', async function(columnName: string = 'body', targetColumnName: string = columnName) {
      const result = await this
      const promises = result.map(async r => {
        r[targetColumnName] = await HtmlParser.highlight(r[columnName])
        return r
      })
      return Promise.all(promises)
    })

    ModelQueryBuilder.macro('makeAllSharable', async function(columnName: string = 'body', targetColumnName: string = columnName) {
      const result = await this
      const promises = result.map(async r => {
        r[targetColumnName] = await HtmlParser.normalizeUrls(r[columnName])
        return r
      })
      return Promise.all(promises)
    })
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
