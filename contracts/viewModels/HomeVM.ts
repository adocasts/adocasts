import Post from "App/Models/Post"
import History from "App/Models/History"
import BaseVM from "./BaseVM"
import Collection from "App/Models/Collection"
import Taxonomy from "App/Models/Taxonomy"

export default class HomeVM extends BaseVM {
  protected __cacheExcludeKeys = ['postWatchlist', 'collectionProgress']

  // specific to auth user
  public postWatchlist: Post[]
  public collectionWatchlist: Collection[]
  public collectionProgress: History[]

  // base data
  public featuredLesson: Post | null
  public series: Collection[]
  public topics: Taxonomy[]
  public latestLessons: Post[]
}
