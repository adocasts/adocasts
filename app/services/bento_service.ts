import env from '#start/env'
import { BentoCache, bentostore } from 'bentocache'
import { memoryDriver } from 'bentocache/drivers/memory'
import { redisDriver } from 'bentocache/drivers/redis'

const bento = new BentoCache({
  default: 'cache',
  
  ttl: '1h',

  earlyExpiration: 0.9,
  
  timeouts: { soft: '300ms' },
  
  stores: {
    cache: bentostore()
      .useL1Layer(memoryDriver({ maxSize: 10_000 }))
      .useL2Layer(redisDriver({
        connection: { 
          host: env.get('REDIS_HOST'), 
          port: env.get('REDIS_PORT') 
        }
      }))
  }
})

export default bento
