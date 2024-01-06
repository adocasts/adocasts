import Post from '#models/post'

export default class PostListener {
  async onViewSync({ post, views }: { post: Post; views: number }) {
    if (post.viewCount && views <= post.viewCount) return
    await post.merge({ viewCount: views }).save()
  }
}

