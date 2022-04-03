declare module '@ioc:Adonis/Lucid/Orm' {
  import States from 'App/Enums/States'
  import Post from 'App/Models/Post'

  interface ModelQueryBuilderContract<
    Model extends LucidModel,
    Result = InstanceType<Model>
    > {
    wherePublic(): this
    whereState(stateId: States): this
    withWatchlist(userId: number | undefined): this
    firstOr<T = undefined>(orFunction: () => T): Promise<Result> | T
    getCount(): Promise<BigInt>
    selectIds(idColumn?: string): Promise<number>
    selectId(idColumn?: string): Promise<number>
    selectIdOrFail(idColumn?: string): Promise<number>
    highlight(columnName?: string, targetColumnName?: string): Promise<Post>
    highlightOrFail(columnName?: string, targetColumnName?: string): Promise<Post>
    highlightAll(columnName?: string, targetColumnName?: string): Promise<Post[]>
  }
}
