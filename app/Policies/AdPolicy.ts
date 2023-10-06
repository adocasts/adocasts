import BasePolicy from 'App/Policies/BasePolicy'
import User from 'App/Models/User'

export default class CommentPolicy extends BasePolicy {
  public async view(user: User) {
    return user.isFreeTier
  }
}