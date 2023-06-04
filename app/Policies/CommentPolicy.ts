import BasePolicy from 'App/Policies/BasePolicy'
import User from 'App/Models/User'
import Comment from 'App/Models/Comment'
import States from 'App/Enums/States'

export default class CommentPolicy extends BasePolicy {
	public async reply(user: User, comment: Comment) {
		if (comment.stateId === States.ARCHIVED) return false
		if (this.isAdmin(user)) return true

		return !!user
	}

	public async update(user: User, comment: Comment) {
		if (comment.stateId === States.ARCHIVED) return false
		if (this.isAdmin(user)) return true

		const isOwner = comment.userId === user.id
		return isOwner
	}

	public async delete(user: User, comment: Comment) {
		if (comment.stateId === States.ARCHIVED) return false
		if (this.isAdmin(user)) return true

		const isOwner = comment.userId === user.id
		return isOwner
	}

  public async state(user: User, comment: Comment) {
		if (this.isAdmin(user)) return true

    await comment.load('post', query => query.preload('authors'))
    return !!comment.post.authors.find(a => a.id === user.id)
  }
}
