import '../css/app.css'
import axios from 'axios'
import { DateTime } from 'luxon'
import Cookies from 'js-cookie'
import './tiptap/basic'
import './_alpine'
import './_unpoly'
import './_video'
import './_prose'

Cookies.set('timezone', DateTime.now().zoneName)

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

/**
 * grabs query string off location href and adds object representation on window.$params
 * then clears the query string from the url to prevent future side-effects
 * @param {string} href should be fully qualified url (https://adocasts.com/some-url)
 */
function storeAndClearQueryStrings(href) {
  const url = new URL(href)
  const urlParams = new URLSearchParams(url.search)
  window.$params = Object.fromEntries(urlParams.entries())
  if (url.search) {
    urlParams.delete('autoplay')
    url.search = urlParams.toString()
    window.history.replaceState({}, document.title, url.toString())
  }
}

// handle query strings on both initial load and when unpoly changes the location
storeAndClearQueryStrings(location.href)
up.on('up:location:changed', (event) => storeAndClearQueryStrings(event.target.location.href))