import vine from '@vinejs/vine'

export const profileUpdateValidator = vine.compile(
  vine.object({
    avatar: vine
      .file({
        size: '1mb',
        extnames: ['png', 'jpeg', 'jpg', 'gif'],
      })
      .optional(),
    name: vine.string().trim().minLength(2).maxLength(75).optional(),
    biography: vine.string().trim().optional(),
    location: vine.string().trim().maxLength(255).optional(),
    website: vine.string().trim().url().normalizeUrl().maxLength(255).optional(),
    company: vine.string().trim().maxLength(255).optional(),
    twitterUrl: vine
      .string()
      .trim()
      .url({ host_whitelist: ['twitter.com'] })
      .normalizeUrl()
      .maxLength(255)
      .optional(),
    githubUrl: vine
      .string()
      .trim()
      .url({ host_whitelist: ['github.com'] })
      .normalizeUrl()
      .maxLength(255)
      .optional(),
    youtubeUrl: vine
      .string()
      .trim()
      .url({ host_whitelist: ['youtube.com'] })
      .normalizeUrl()
      .maxLength(255)
      .optional(),
    facebookUrl: vine
      .string()
      .trim()
      .url({ host_whitelist: ['facebook.com'] })
      .normalizeUrl()
      .maxLength(255)
      .optional(),
    instagramUrl: vine
      .string()
      .trim()
      .url({ host_whitelist: ['instagram.com'] })
      .normalizeUrl()
      .maxLength(255)
      .optional(),
    threadsUrl: vine
      .string()
      .trim()
      .url({ host_whitelist: ['threads.net'] })
      .normalizeUrl()
      .maxLength(255)
      .optional(),
  })
)
