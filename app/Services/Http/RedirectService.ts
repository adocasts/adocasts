import BaseHttpService from 'App/Services/Http/BaseHttpService'
import Post from 'App/Models/Post'

export default class RedirectService extends BaseHttpService {
  public checkPostTypeUrl(post: Post) {
    if (!this.ctx.request.url().toLowerCase().startsWith(post.routeUrl.toLowerCase())) {
      this.ctx.response.redirect(post.routeUrl)
      return false
    }

    return true
  }
}
