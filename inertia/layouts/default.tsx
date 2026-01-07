import { Data } from '~generated/data'
import { toast, Toaster } from 'sonner'
import { ReactElement, useEffect, useState } from 'react'
import { usePage } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import {
  BookIcon,
  LibraryIcon,
  MessageCircleIcon,
  NotebookTextIcon,
  PanelLeftIcon,
} from 'lucide-react'

type LayoutProps = {
  children: ReactElement<Data.SharedProps>
  sidebar?: () => JSX.Element
  addon?: () => JSX.Element
}

export default function AuthLayout({ sidebar, addon, children }: LayoutProps) {
  const [isShowSidebar, setIsShowSidebar] = useState(true)

  useEffect(() => {
    toast.dismiss()
  }, [usePage().url])

  if (children.props.flash.error) {
    toast.error(children.props.flash.error)
  }

  return (
    <>
      <div
        className={`ado-layout after-border after:-inset-2.5 after:border-dashed ${isShowSidebar ? 'sidebar-open' : ''}`}
      >
        <div className="ado-header">
          <div className="ado-header--sidebar">
            <Button size="icon" variant="ghost" onClick={() => setIsShowSidebar((prev) => !prev)}>
              <PanelLeftIcon />
            </Button>
          </div>

          <header className="ado-header--main">
            <div className="w-full flex justify-between items-center gap-6">
              <div>
                <Link route="home">
                  <img src="/imgs/logo-black.svg" alt="Adocasts Logo" className="h-8" />
                </Link>
              </div>
              <div>
                <nav className="flex items-center gap-3">
                  {children.props.user ? (
                    <Form route="session.destroy">
                      <button type="submit"> Logout </button>
                    </Form>
                  ) : (
                    <>
                      <Button variant="ghost" render={<Link route="new_account.create" />}>
                        Sign up
                      </Button>
                      <Button render={<Link route="session.create" />}>Sign in</Button>
                    </>
                  )}
                </nav>
              </div>
            </div>
          </header>
        </div>

        <div className="ado-content">
          <div className="ado-sidebar">
            <div className="ado-sidebar--inner">
              {sidebar ? (
                sidebar()
              ) : (
                <>
                  <div className="flex flex-col gap-1.5 pb-4 mb-6 after-border-b after:border-dashed">
                    <Button variant="nav" render={<Link route="series.index" />}>
                      <LibraryIcon />
                      Series
                    </Button>
                    <Button variant="nav" render={<Link route="home" />}>
                      <BookIcon />
                      Lessons
                    </Button>
                    <Button variant="nav" render={<Link route="home" />}>
                      <NotebookTextIcon />
                      Blog
                    </Button>
                    <Button variant="nav" render={<Link route="home" />}>
                      <MessageCircleIcon />
                      Forum
                    </Button>
                  </div>

                  {addon ? (
                    addon()
                  ) : (
                    <div className="mb-8">
                      <h5 className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
                        Your activity
                      </h5>

                      <ul>
                        <li>Series progress</li>
                        <li>History</li>
                        <li>Watchlist</li>
                        <li>Bookmarks</li>
                      </ul>

                      {/* ... continue watching (show last watched, non-completed, lesson) */}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={`ado-main ${isShowSidebar ? 'after-border' : ''}`}>
            <main className="ado-main--inner">{children}</main>
          </div>
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </>
  )
}
