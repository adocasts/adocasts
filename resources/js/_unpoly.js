import 'unpoly'
import 'unpoly/unpoly.css'

// up.log.enable()

up.fragment.config.mainTargets.push('[up-hero]', '[up-list]')
up.layer.config.modal.openAnimation = 'move-from-top'
up.layer.config.modal.class = 'adocasts-modal'
up.layer.config.modal.size = 'grow'
up.layer.config.modal.onOpened = () => document.body.classList.add('overflow-hidden')
up.layer.config.modal.onDismissed = () => document.body.classList.remove('overflow-hidden')