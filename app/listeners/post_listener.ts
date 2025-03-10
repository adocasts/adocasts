import Post from '#models/post';
import { PostShowVM } from '../view_models/post.js';

export default class PostListener {
  async onViewSync({ post, views }: { post: PostShowVM; views: number }) {
    if (post.viewCount && views <= post.viewCount) return
    await Post.query().where('id', post.id).update({ viewCount: views })
  }
}

