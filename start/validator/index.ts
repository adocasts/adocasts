import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import './_enum.js'

vine.messagesProvider = new SimpleMessagesProvider({
  'username.confirmed': 'The username provided does not match your username',
})
