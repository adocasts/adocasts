import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class StarterSeedSeeder extends BaseSeeder {
  public async run() {
    // ROLES
    await Role.createMany([
      {
        id: 1,
        name: 'User',
        description: 'Authenticated User'
      },
      {
        id: 2,
        name: 'Admin',
        description: 'Super User'
      }
    ])
  }
}