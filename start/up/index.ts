import { HttpContext } from "@adonisjs/core/http"
import Up from "./up.js"

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    up: Up
  }
}

HttpContext.getter('up', function (this: HttpContext) {
  return new Up(this)
}, true)
