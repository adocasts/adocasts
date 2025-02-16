import edge from 'edge.js'
import { addCollection, edgeIconify } from 'edge-iconify'
import { icons as solarIcons } from '@iconify-json/solar'

addCollection(solarIcons)

edge.use(edgeIconify)
