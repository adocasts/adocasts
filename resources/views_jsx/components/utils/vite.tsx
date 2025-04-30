import vite from '@adonisjs/vite/services/main'
import { AdonisViteElement } from '@adonisjs/vite/types'

function Image(props: { src: string; alt?: string; class?: string }) {
  const url = vite.assetPath(props.src)
  return <img src={url} alt={props.alt} class={props.class} />
}

function Entrypoint(props: { assets: AdonisViteElement[] }) {
  const elements = props.assets.map((asset) => {
    if (asset.tag === 'script') {
      return <script {...asset.attributes}></script>
    }

    return <link {...asset.attributes} />
  })

  return <>{...elements}</>
}

export const Vite = {
  Entrypoint,
  Image,
}
