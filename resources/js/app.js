import './alpine';
import './unpoly';

/**
 * Global shortcuts
 */
const INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']

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
 * @param {string} href should be fully qualified url (https://adocasts.com/some-url)
 */
function storeQueryStrings(href) {
  const url = new URL(href)
  const urlParams = new URLSearchParams(url.search)
  window.$params = Object.fromEntries(urlParams.entries())
}

// handle query strings on both initial load and when unpoly changes the location
storeQueryStrings(location.href)
up.on(
  'up:location:changed',
  (event) => event.target?.location && storeQueryStrings(event.target.location.href)
)
