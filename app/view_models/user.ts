import User from "#models/user"
import BaseVM from "./base.js"

export class UserVM extends BaseVM {
  declare id: number
  declare name: string
  declare username: string
  declare handle: string
  declare avatar: string
  declare avatarLarge: string
  declare isEnabledProfile: boolean
  declare isEnabledMiniPlayer: boolean
  declare isEnabledAutoplayNext: boolean
  declare profile: {
    biography: string | null
    location: string | null
    company: string | null
    website: string | null
    websiteUrl: string | null
    twitterUrl: string | null
    facebookUrl: string | null
    instagramUrl: string | null
    linkedinUrl: string | null
    youtubeUrl: string | null
    threadsUrl: string | null
    githubUrl: string | null
  }

  constructor(user: User | undefined = undefined) {
    super()

    if (!user) return

    this.id = user.id
    this.name = user.profile.name || user.username
    this.username = user.username
    this.handle = user.handle
    this.avatar = user.avatar
    this.avatarLarge = user.avatarLarge
    this.isEnabledProfile = user.isEnabledProfile
    this.isEnabledMiniPlayer = user.isEnabledMiniPlayer
    this.isEnabledAutoplayNext = user.isEnabledAutoplayNext
    this.profile = {
      biography: user.profile.biography,
      location: user.profile.location,
      company: user.profile.company,
      website: user.profile.website,
      websiteUrl: user.profile.websiteUrl,
      twitterUrl: user.profile.twitterUrl,
      facebookUrl: user.profile.facebookUrl,
      instagramUrl: user.profile.instagramUrl,
      linkedinUrl: user.profile.linkedinUrl,
      youtubeUrl: user.profile.youtubeUrl,
      threadsUrl: user.profile.threadsUrl,
      githubUrl: user.profile.githubUrl,
    }
  }
}
