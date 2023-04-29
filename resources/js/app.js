import '../css/app.css'
import htmx from 'htmx.org/dist/htmx'
import './tiptap/basic'
import './_alpine'
import './_unpoly'
import './_video'
import './_prose'

window.hideBanner = async function(target) {
  document.getElementById(target).remove()
  await axios.post('/api/session/set', { target, value: false })
}

up.on('up:fragment:inserted', function (_event, fragment) {
  htmx.process(fragment)
})

