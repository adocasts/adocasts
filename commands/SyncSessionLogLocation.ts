import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class SyncSessionLogLocation extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'sync:session_log_location'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest` 
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call 
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    this.logger.info('SYNC:SESSION_LOG_LOCATION > Start')

    const { default: SessionLog } = await import('App/Models/SessionLog')
    const { default: IdentityService } = await import('App/Services/IdentityService')
    let updateCount = 0

    const logs = await SessionLog.query()
      .whereNotNull('ipAddress')
      .where('city', 'IPV6_NOT_SUPPORTED')
      .orWhere('country', 'IPV6_NOT_SUPPORTED')
      .orWhere('country_code', 'IPV6_NOT_SUPPORTED')

    const promises = logs.map(async (log) => {
      try {
        const location = await IdentityService.getLocation(log.ipAddress!)
        
        log.city = location.city || null
        log.country = location.countryLong || null
        log.countryCode = location.countryShort || null

        await log.save()

        updateCount++
      } catch (error) {
        this.logger.error('SYNC:SESSION_LOG_LOCATION > Error > ' + error.message)
      }
    })

    await Promise.allSettled(promises)
    
    this.logger.info(`SYNC:SESSION_LOG_LOCATION > Updated ${updateCount} rows`)
    this.logger.info('SYNC:SESSION_LOG_LOCATION > End')
  }
}
