import { HttpContext } from '@adonisjs/core/http'

interface PageProps {
  page(): JSX.Element | JSX.Element[]
  state?: Record<string, unknown>
}

export default function Page(props: PageProps) {
  return {
    async fetch(ctx: HttpContext) {
      const page = props.page()

      return (
        <html context={ctx} appState={props.state}>
          {Array.isArray(page) ? <>{...page}</> : page}
        </html>
      )
    },
  }
}
