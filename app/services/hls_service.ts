import env from "#start/env";
import { createHmac } from "crypto";
import { DateTime } from "luxon";
import { PostShowVM } from "../view_models/post.js";
import User from "#models/user";

export default class HlsService {
  static getSignature(user: User, post: PostShowVM) {
    const version = 'v1'
    const userId = user.id ?? 'NA'
    const videoId = post.videoR2Id
    const expiration = DateTime.now().plus({ hours: 48 }).toISO()
    const payload = [version, userId, videoId, expiration].join('|')
    const signature = createHmac('sha256', env.get('R2_SIGNING_KEY')).update(payload).setEncoding('base64').digest('hex')

    return {
      signature,
      version,
      userId,
      videoId,
      expiration
    }
  }
}