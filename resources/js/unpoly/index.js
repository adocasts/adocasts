import 'unpoly'
import 'unpoly/unpoly.css'

window.up = up

up.log.enable()
up.network.config.autoCache = () => false

// link configuration
up.link.config.followSelectors.push('a[href]')

// form configuration
up.form.config.submitSelectors.push(['form'])

// modal configuration
up.layer.config.modal.openAnimation = 'move-from-top'
up.layer.config.modal.class = 'adocasts-modal'
up.layer.config.modal.size = 'grow'
up.layer.config.modal.onOpened = () => document.body.classList.add('overflow-hidden')
up.layer.config.modal.onDismissed = () => document.body.classList.remove('overflow-hidden')

up.on('up:fragment:loaded', function (event) {
  const target = event.renderOptions.target

  // custom match to update any matching target with fragment
  if (target?.includes(':any') && event.response.text) {
    event.preventDefault()
    event.target.querySelectorAll(target).forEach((element) => {
      up.render({ target: element, fragment: event.response.text })
    })
  }

  if (event?.response?.url?.includes('hash=')) {
    const url = new URL(location.origin + event.response.url)
    const hash = url.searchParams.get('hash')

    url.searchParams.delete('hash')
    url.hash = `#${hash}`

    event.response.url = url.toString()
  }
})

const header = document.querySelector('header')

up.on('up:location:changed', function () {
  const detail = {
    location: up.history.location
  }

  header.dispatchEvent(new CustomEvent('location', { detail }))
})

up.on('up:request:loaded', function (event) {
  // sync body styles on every request
  if (event.response.text.includes('<body')) {
    const doc = new DOMParser().parseFromString(event.response.text, 'text/html')
    document.body.style = doc.body.style.cssText
  }
})
