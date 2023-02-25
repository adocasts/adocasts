import '../css/app.css'
import 'htmx.org'
import './tiptap/basic'
import './_alpine'
import './_unpoly'
import './_video'
import './_prose'

window.hideBanner = async function(target) {
  document.getElementById(target).remove()
  await axios.post('/api/session/set', { target, value: false })
}
