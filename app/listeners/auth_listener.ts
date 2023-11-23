import User from "#models/user"
import { RememberMeToken } from "@adonisjs/auth/session";

export default class AuthListener {
  onSignInSuccess(event: LoginSucceeded) {
    
  }

  onSignInFail() {}

  onSignOut() {}
}

type LoginSucceeded = {
  guardName: string; 
  user: User; 
  sessionId: string; 
  rememberMeToken?: RememberMeToken | undefined
}