export default class BaseService {
  public static invalid<T>(message: string, data: T | undefined = undefined) {
    return this.handler(false, message, data)
  }

  public static valid<T>(message: string, data: T | undefined = undefined) {
    return this.handler(true, message, data)
  }

  public static handler<T>(success: boolean, message: string, data: T) {
    return {
      success,
      flashStatus: success ? 'success' : 'error',
      message,
      data
    }
  }
}