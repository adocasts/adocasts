import env from '#start/env'
import { createHmac } from 'node:crypto'
import { DateTime } from 'luxon'
import User from '#models/user'
import LessonShowDto from '#dtos/lesson_show'

export default class HlsService {
  static getSignature(user: User | undefined, post: LessonShowDto) {
    const version = 'v1'
    const userId = user?.id ?? 'NA'
    const videoId = post.videoR2Id
    const expiration = DateTime.now().plus({ hours: 48 }).toISO()
    const payload = [version, userId, videoId, expiration].join('|')
    const signature = createHmac('sha256', env.get('R2_SIGNING_KEY'))
      .update(payload)
      .setEncoding('base64')
      .digest('hex')

    return {
      signature,
      version,
      userId,
      videoId,
      expiration,
    }
  }
}
