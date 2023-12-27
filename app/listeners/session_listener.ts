import SessionLog from "#models/session_log"

export default class SessionListener {
  async onMigrated({ fromSessionId, toSessionId }: OnSessionMigrated) {
    await SessionLog.query().where('sessionId', fromSessionId).update({ sessionId: toSessionId })
  }
}

type OnSessionMigrated = {
  session: any
  fromSessionId: string
  toSessionId: string
}