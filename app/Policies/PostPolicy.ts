import BasePolicy from 'App/Policies/BasePolicy'
import User from 'App/Models/User'
import Post from 'App/Models/Post'

export default class PostPolicy extends BasePolicy {
	public async before(user: User) {
		if (this.isAdmin(user)) {
			return true
		}
	}

	public async view(user: User, post: Post) {
    const isOwner = await this.isOwner(user, post)
    return isOwner || post.isViewable
	}

	public async store(user: User) {
    return this.isAdmin(user)
	}

	public async update(user: User, post: Post) {
    return this.isOwner(user, post)
	}

	public async destroy(user: User, post: Post) {
    return this.isOwner(user, post)
	}

  private async isOwner(user: User, post: Post) {
    const author = await post.related('authors').query().where('users.id', user.id).first()
    return !!author
  }
}
