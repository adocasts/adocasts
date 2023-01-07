declare module '@ioc:Adocasts/Player' {
  import Collection from "App/Models/Collection"
  import Post from "App/Models/Post"

  interface PlayerData {
    post: Post,
    series: Collection | null
  }
}