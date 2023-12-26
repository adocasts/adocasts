import 'unpoly'
import 'unpoly/unpoly.css'

// up.log.enable()
// up.network.config.autoCache = () => false
// up.fragment.config.mainTargets = ['[up-main], [up-hero], [up-list]']
up.layer.config.modal.openAnimation = 'move-from-top'
up.layer.config.modal.class = 'adocasts-modal'
up.layer.config.modal.size = 'grow'
up.layer.config.modal.onOpened = () => document.body.classList.add('overflow-hidden')
up.layer.config.modal.onDismissed = () => document.body.classList.remove('overflow-hidden')

const upPricing = document.querySelector('[up-pricing]')

up.on('up:location:changed', function(event) {
  if (!event.location) return
  if (event.location.toLowerCase().includes('/pricing')) {
    const script = document.createElement('script')
    script.src = 'https://cdn.paritydeals.com/banner.js'
    upPricing.appendChild(script)
  } else if (upPricing?.children.length) {
    Array.from(upPricing.children).map(child => child.remove())
  }
})