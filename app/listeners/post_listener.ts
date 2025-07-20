import Post from '#models/post';

export default class PostListener {
  async onViewSync({ postId, views }: { postId: number; views: number }) {
    const post = await Post.find(postId)
    if (!post) return
    if (post.viewCount && views <= post.viewCount) return

    post.viewCount = views

    await post.save()
  }
}
