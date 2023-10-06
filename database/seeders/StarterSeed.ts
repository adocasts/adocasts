import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Roles from 'App/Enums/Roles'
import Role from 'App/Models/Role'

export default class StarterSeedSeeder extends BaseSeeder {
  public async run() {
    // ROLES
    await Role.createMany([
      {
        id: Roles.USER,
        name: 'User',
        description: 'Authenticated User'
      },
      {
        id: Roles.ADMIN,
        name: 'Admin',
        description: 'Super User'
      },
      {
        id: Roles.CONTRIBUTOR_LVL_1,
        name: 'Contributor LVL 1',
        description: 'Can contribute content'
      },
      {
        id: Roles.CONTRIBUTOR_LVL_2,
        name: 'Contributor LVL 2',
        description: 'Can contribute content, series, and taxonomies'
      }
    ])
  }
}