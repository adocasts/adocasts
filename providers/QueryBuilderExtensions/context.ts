declare module '@ioc:Adonis/Lucid/Orm' {
  import States from 'App/Enums/States'
  import Post from 'App/Models/Post'

  interface ModelQueryBuilderContract<
    Model extends LucidModel,
    Result = InstanceType<Model>
    > {
    whereTrue(columnName: string): this
    whereFalse(columnName: string): this
    wherePublic(): this
    whereState(stateId: States): this
    withWatchlist(userId: number | undefined): this
    any(primaryKey?: string): boolean
    firstOr<T = undefined>(orFunction: () => T): Promise<Result> | T
    getCount(): Promise<BigInt>
    selectIds(idColumn?: string): Promise<number>
    selectId(idColumn?: string): Promise<number>
    selectIdOrFail(idColumn?: string): Promise<number>
    selectColumn(columnName: string): Promise<string[]>
    highlight(columnName?: string, targetColumnName?: string): Promise<Result>
    highlightOrFail(columnName?: string, targetColumnName?: string): Promise<Result>
    highlightAll(columnName?: string, targetColumnName?: string): Promise<Result[]>
    makeAllSharable(columnName?: string, targetColumnName?: string): Promise<Result[]>
  }
}
