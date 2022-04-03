import * as AWS from 'aws-sdk';
import Env from '@ioc:Adonis/Core/Env'

const storageConfig = {
  disk: new AWS.S3({
    apiVersion: '2006-03-01',
    credentials: {
      accessKeyId: Env.get('DO_SPACES_KEY'),
      secretAccessKey: Env.get('DO_SPACES_SECRET')
    },
    endpoint: new AWS.Endpoint(Env.get('DO_SPACES_ENDPOINT')),
    region: Env.get('DO_SPACES_REGION')
  })
}

export default storageConfig