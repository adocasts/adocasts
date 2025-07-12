import './unpoly'
import './alpine'

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
