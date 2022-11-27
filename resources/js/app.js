import '../css/app.css'
// import htmx from 'htmx.org'
import 'babel-polyfill'
import Alpine from 'alpinejs'
import mask from '@alpinejs/mask'
// window.htmx = htmx

// import * as Sentry from '@sentry/browser'
// import { BrowserTracing } from '@sentry/tracing'

// axios.interceptors.response.use(function (response) {
//   // Any status code that lie within the range of 2xx cause this function to trigger
//   // Do something with response data
//   return response;
// }, function (error) {
//   // Any status codes that falls outside the range of 2xx cause this function to trigger
//   // Do something with response error
//   if (error.status === 419) {
//     console.log({ error })
//   }
//
//   return Promise.reject(error);
// });

// Sentry.init({
//   dsn: "https://eb0d646ec4de4e34867802b90b099f45@o1256915.ingest.sentry.io/6426365",
//   integrations: [new BrowserTracing()],

//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: .2,
// });

window.appWatchlist = function(route, payload, isInWatchlist) {
  return {
    payload,
    isInWatchlist,

    async toggle() {
      const { data } = await axios.post(route, this.payload)
      this.isInWatchlist = !data.wasDeleted
    }
  }
}

window.appCompleted = function(route, payload, isCompleted = false) {
  return {
    payload,
    isCompleted,

    async toggle() {
      const { data } = await axios.post(route, this.payload)
      this.isCompleted = data.progression.isCompleted
    },

    changeCompleted(event) {
      this.isCompleted = event.detail.isCompleted
    }
  }
}

window.hideBanner = async function(target) {
  document.getElementById(target).remove()
  await axios.post('/api/session/set', { target, value: false })
}

Alpine.data('modal', function () {
  return {
    closeModal(modal) {
      modal.classList.add('closing')
      modal.addEventListener('animationend', () => modal.remove(), { once: true })
    }
  }
})

Alpine.plugin(mask)
Alpine.start()
window.Alpine = Alpine

// up.on('up:fragment:inserted', function (event, fragment) {
//   up.emit('htmx:load', { detail: { elt: fragment } })
// })

// htmx.on('htmx:afterSwap', (e) => {
//   console.log({ e })
// })

// htmx.on('htmx:beforeSwap', (e) => {
//   console.log({ xhr: e.detail.xhr })
//   // const responseUrl = new URL(e.detail.xhr.responseUrl)
//   // if (e.detail.target.classList.contains('modal') && ) {
//   //   e.detail.target.dispatchEvent(new CustomEvent('close'))
//   // }
// })