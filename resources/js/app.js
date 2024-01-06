import '../css/app.css'
import axios from 'axios'
import Cookies from 'js-cookie'
import { DateTime } from 'luxon'
import './_stars'
import './_prose'
import './_player'

Cookies.set('timezone', DateTime.now().zoneName)

window.onfocus = async function () {
  const { data: isAuthenticated } = await axios.get('/api/user/check')

  if (window.isAuthenticated && !isAuthenticated) {
    window.location = '/go/auth/reset'
  }
}

/**
 * Global shortcuts
 */
document.body.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowLeft':
      // when player is using Plyr and not hidden, allow skipping back 5sec with left arrow
      if (window.player?.isHTML5 && window.player.media.offsetParent != null) {
        const currentTime = window.player.currentTime
        const skipTo = currentTime - 5 > 0 ? currentTime - 5 : 0
        window.player.currentTime = skipTo
      }
      break
    case 'ArrowRight':
      // when player is using Plyr and not hidden, allow skipping forward 5sec with right arrow
      if (window.player?.isHTML5 && window.player.media.offsetParent != null) {
        const currentTime = window.player.currentTime
        const duration = window.player.duration
        const skipTo = currentTime + 5 < duration ? currentTime + 5 : duration
        window.player.currentTime = skipTo
      }
      break
  }
})

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
up.on(
  'up:location:changed',
  (event) => event.target?.location && storeAndClearQueryStrings(event.target.location.href)
)
