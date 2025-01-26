import User from '#models/user'
import env from '#start/env'
import { PostHog } from 'posthog-node'

class PosthogService {
  #client?: PostHog

  constructor() {
    const clientToken = env.get('POSTHOG_CLIENT_TOKEN')

    if (!clientToken) return
    
    this.#client = new PostHog(clientToken, {
      host: 'https://us.i.posthog.com',
    })
  }

  get client() {
    return this.#client
  }

  async onAuthenticated(user: User) {
    await this.#client?.capture({
      distinctId: user.id.toString(),
      event: 'user_signed_up',
      properties: {
        email: user.email,
        username: user.username,
      },
    })
  }
}

const posthog = new PosthogService()
export default posthog
