import '../css/app.css'
import axios from 'axios'
import { DateTime } from 'luxon'
import './tiptap/basic'
import './_alpine'
import './_unpoly'
import './_video'
import './_prose'

window.DateTime = DateTime

window.hideBanner = async function(target) {
  document.getElementById(target).remove()
  await axios.post('/api/session/set', { target, value: false })
}

window.onfocus = async function() {
  const { data: isAuthenticated } = await axios.get('/api/user/check')

  if (window.isAuthenticated && !isAuthenticated) {
    window.location = '/go/auth/reset'
  }
}