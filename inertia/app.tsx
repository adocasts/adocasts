import './css/app.css'
import { ReactElement } from 'react'
import { client } from './client'
import Layout from '~/layouts/default'
import { Data } from '~generated/data'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { PageModule } from './types'

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
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
  setup({ el, App, props }) {
    createRoot(el).render(
      <TuyauProvider client={client}>
        <App {...props} />
      </TuyauProvider>
    )
  },
  progress: {
    color: '#4B5563',
  },
})
