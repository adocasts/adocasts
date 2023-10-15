import BasePolicy from 'App/Policies/BasePolicy'
import User from 'App/Models/User'
import Post from 'App/Models/Post'
import Plans from 'App/Enums/Plans'
import PaywallTypes from 'App/Enums/PaywallTypes'
import { action } from '@ioc:Adonis/Addons/Bouncer'

export default class PostPolicy extends BasePolicy {
	@action({ allowGuest: true })
	public async view(user: User, post: Post) {
		if (user && user.planId !== Plans.FREE) return true
		if (post.paywallTypeId === PaywallTypes.NONE) return true
		if (post.paywallTypeId === PaywallTypes.FULL) return false
		
		return !post.isPaywalled
	}

	@action({ allowGuest: true })
	public async viewFutureDated(user: User) {
		if (this.isAdmin(user) || this.isContributorLvl1(user) || this.isContributorLvl2(user)) return true
		return false
	}
}
