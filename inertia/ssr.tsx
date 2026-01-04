import { ReactElement } from 'react'
import Layout from '~/layouts/default'
import { Data } from '~generated/data'
import ReactDOMServer from 'react-dom/server'
import { createInertiaApp } from '@inertiajs/react'
import { PageModule } from './types'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { client } from './client'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = import.meta.glob<PageModule>('./pages/**/*.tsx', { eager: true })
      const resolvedPage = pages[`./pages/${name}.tsx`]
      const Shell = resolvedPage.default.shell || Layout
  
      if (Shell && !resolvedPage.default.layout) {
        resolvedPage.default.layout = (page: ReactElement<Data.SharedProps>) => (
          <Shell children={page} sidebar={resolvedPage.default.sidebar} addon={resolvedPage.default.addon} />
        )
      }
      
      return resolvedPage
    },
    setup: ({ App, props }) => {
      return (
        <TuyauProvider client={client}>
          <App {...props} />
        </TuyauProvider>
      )
    },
  })
}
