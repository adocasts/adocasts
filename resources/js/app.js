import './alpine';
import './unpoly';

// set system color scheme preference
const updateColorScheme = (e) => {
  const isDark = e.matches ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.setAttribute('prefers-color-scheme', isDark ? 'dark' : 'light');
};

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

updateColorScheme(mediaQuery);

if (typeof mediaQuery.addEventListener === 'function') {
  mediaQuery.addEventListener('change', updateColorScheme);
} else {
  mediaQuery.addListener(updateColorScheme);
}

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
