import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor (protected app: ApplicationContract) {}

  public register () {
    // Register your own bindings
  }

  public async boot () {
    // IoC container is ready
    const Route = this.app.container.resolveBinding('Adonis/Core/Route')
    // const HttpContext = this.app.container.resolveBinding('Adonis/Core/HttpContext')
    // const View = this.app.container.resolveBinding('Adonis/Core/View')
    const fragmentViewPath = 'components/fragments/'

    Route.BriskRoute.macro('fragment', function (path: string) {
      const fragmentPath = path.startsWith('/') ? fragmentViewPath.replace(/\/$/, '') : fragmentViewPath
      return this.render(fragmentPath + path)
    })

    // HttpContext.macro('up', function () {
    //   const mode = this.request.header('x-up-mode', 'root')
    //   return {
    //     mode,
    //     isPage: mode === 'root'
    //   }
    // })
  }

  public async ready () {
    // App is ready
  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
