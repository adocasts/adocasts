import BasePolicy from 'App/Policies/BasePolicy'
import User from 'App/Models/User'
import Taxonomy from 'App/Models/Taxonomy'

export default class TaxonomyPolicy extends BasePolicy {
	public async viewList() {
    return true
  }


	public async view(_: User, taxonomy: Taxonomy) {
    // TODO: apply scopes to ensure collections & posts are public
    await taxonomy.loadCount('collections')
    await taxonomy.loadCount('posts')

    return taxonomy.collections.length || taxonomy.posts.length
  }

	public async create(user: User) {
    return this.isAdmin(user)
  }

  public async update(user: User) {
    return this.isAdmin(user)
  }

  public async delete(user: User) {
    return this.isAdmin(user)
  }
}
