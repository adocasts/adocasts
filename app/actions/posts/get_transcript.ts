import BaseAction from '#actions/base_action'
import LessonShowDto from '#dtos/lesson_show'
import CaptionService from '#services/caption_service'
import logger from '#services/logger_service'
import cache from '@adonisjs/cache/services/main'
import axios from 'axios'

export default class GetTranscript extends BaseAction {
  async handle(post: LessonShowDto) {
    if (!post.transcriptUrl) return ''

    return cache.getOrSet({
      key: `TRANSCRIPT:${post.id}`,
      ttl: '7 days',
      factory: async () => this.#get(post),
    })
  }

  async #get(post: LessonShowDto) {
    try {
      const { data: caption } = await axios.get(post.transcriptUrl!, {
        headers: { Referer: `https://adocasts.com` },
      })

      return CaptionService.parseAsParagraphs(caption)
    } catch (error) {
      await logger.warn(`GetTranscript failed: ${post.id}, ${post.transcriptUrl}`, error.message)
      return ''
    }
  }
}
