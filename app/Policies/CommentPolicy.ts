import BasePolicy from 'App/Policies/BasePolicy'
import User from 'App/Models/User'
import Comment from 'App/Models/Comment'

export default class CommentPolicy extends BasePolicy {
	public async before(user: User) {
		if (this.isAdmin(user)) {
			return true
		}
	}

	public async reply(user: User) {
		return !!user
	}

	public async update(user: User, comment: Comment, identity: string) {
		const isOwner = comment.userId === user.id
		const isIdentityOwner = identity === comment.identity && !comment.userId
		return isOwner || isIdentityOwner
	}

	public async delete(user: User, comment: Comment, identity: string) {
		const isOwner = comment.userId === user.id
		const isIdentityOwner = identity === comment.identity && !comment.userId
		return isOwner || isIdentityOwner
	}

  public async state(user: User, comment: Comment) {
    await comment.load('post', query => query.preload('authors'))
    return !!comment.post.authors.find(a => a.id === user.id)
  }
}
