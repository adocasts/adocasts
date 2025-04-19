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
