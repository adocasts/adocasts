import * as HyperDX from '@hyperdx/node-opentelemetry'
import env from './env.js'

if (env.get('HYPERDX_INTEGESTION_KEY')) {
  HyperDX.init({
    apiKey: env.get('HYPERDX_INTEGESTION_KEY'),
    service: 'adocasts-server',
  })
}
