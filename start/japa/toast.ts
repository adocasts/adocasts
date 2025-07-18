import { ApiResponse } from '@japa/api-client'
import { PluginFn } from '@japa/runner/types'

declare module '@japa/api-client' {
  interface ApiResponse {
    assertToast(type: string, message?: string): this
  }
}

export const toastClient = () => {
  const pluginFn: PluginFn = function () {
    ApiResponse.macro('assertToast', function (this: ApiResponse, type: string, message?: string) {
      if (message !== undefined) {
        this.assert!.containsSubset(this.flashMessage('toasts'), [{ type, message }])
      } else {
        this.assert!.containsSubset(this.flashMessage('toasts'), [{ type }])
      }

      return this
    })
  }

  return pluginFn
}
