// import SessionLog from "#models/session_log"

export default class SessionListener {
  async onMigrated(_event: OnSessionMigrated) {
    // await SessionLog.query().where('token', fromSessionId).update({ token: toSessionId })
  }
}

type OnSessionMigrated = {
  session: any
  fromSessionId: string
  toSessionId: string
}
