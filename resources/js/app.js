import axios from 'axios'
import Cookies from 'js-cookie'
import { DateTime } from 'luxon'
import '../css/app.css'
// import posthog from 'posthog-js'
import HyperDX from '@hyperdx/browser'
import './_player'
 
HyperDX.init({
  apiKey: 'ccf58ca0-80fd-415a-840e-db52e041c349',
  service: 'adocasts-client-side',
  tracePropagationTargets: [/^adocasts.com/i, /^vid.adocasts.com/i], // Set to link traces from frontend to backend requests
  consoleCapture: false, // Capture console logs (default false)
  advancedNetworkCapture: false, // Capture full HTTP request/response headers and bodies (default false)
});

Cookies.set('timezone', DateTime.now().zoneName)

const INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']

window.axios = axios
window.HyperDX = HyperDX
// window.posthog = posthog

window.onfocus = async function () {
  try {
    const { data: isAuthenticated } = await axios.get('/api/user/check')

    if (window.isAuthenticated && isAuthenticated === false) {
      window.location = '/go/auth/reset'
    }
  } catch (error) {
    window.debug('onfocus user check failed', {
      message: error.message,
      stack: error.stack,
    })
  }
}

// const posthogClientToken = document.querySelector('meta[name="posthog-client-token"]')?.content

// if (posthogClientToken) {
//   posthog.init(posthogClientToken, {
//     api_host: 'https://us.i.posthog.com',
//     person_profiles: 'identified_only',
//     capture_pageview: false,
//   })

//   posthog.capture('$pageview', {
//     path: window.location.pathname,
//   })
// }

/**
 * Global shortcuts
 */
document.body.addEventListener('keydown', (event) => {
  const isInput = INPUT_TAGS.includes(document.activeElement.tagName)
  const isEditable = document.activeElement.hasAttribute('contenteditable')

  if (isInput || isEditable || event.metaKey) return

  switch (event.key) {
    case 'ArrowLeft':
      if (window.player?.elem) {
        // bunny
        window.player.getCurrentTime((currentTime) => {
          const skipTo = currentTime - 10 > 0 ? currentTime - 10 : 0
          window.player.setCurrentTime(skipTo)
        })
      } else if (window.player?.videoTitle) {
        // youtube
        const currentTime = window.player.getCurrentTime()
        const skipTo = currentTime - 10 > 0 ? currentTime - 10 : 0
        window.player.seekTo(skipTo)
      }
      break
    case 'ArrowRight':
      if (window.player?.elem) {
        // bunny
        window.player.getCurrentTime((currentTime) => {
          window.player.getDuration((duration) => {
            const skipTo = currentTime + 10 < duration ? currentTime + 10 : duration
            window.player.setCurrentTime(skipTo)
          })
        })
      } else if (window.player?.videoTitle) {
        // youtube
        const currentTime = window.player.getCurrentTime()
        const duration = window.player.getDuration()
        const skipTo = currentTime + 10 < duration ? currentTime + 10 : duration
        window.player.seekTo(skipTo)
      }
      break
    case ' ':
      event.preventDefault()

      if (window.player?.elem) {
        // bunny
        window.player.getPaused((isPaused) => {
          isPaused ? window.player.play() : window.player.pause()
        })
      } else if (window.player?.videoTitle) {
        // youtube
        const playerState = window.player.getPlayerState()

        if (playerState === YT.PlayerState.PLAYING) {
          window.player.pauseVideo()
        } else if (playerState === YT.PlayerState.PAUSED) {
          window.player.playVideo()
        }
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
