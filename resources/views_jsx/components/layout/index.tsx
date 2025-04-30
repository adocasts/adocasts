import { Vite } from '#components/utils/vite'
import vite from '@adonisjs/vite/services/main'

export default async function Layout() {
  const entrypoints = await vite.generateEntryPointsTags([
    'resources/css/app.css',
    'resources/js/app.js',
  ])

  return (
    <>
      <head>
        <meta charSet="utf-8" />
        {/* <meta name="viewport" content="width=device-width, initial-scale=1" /> */}

        <title>Adocasts</title>
        <Vite.Entrypoint assets={entrypoints} />
      </head>
      <body>
        <slot />
      </body>
    </>
  )
}
