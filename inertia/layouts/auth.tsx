import { Data } from '~generated/data'
import { toast, Toaster } from 'sonner'
import { ReactElement, useEffect, useState } from 'react'
import { usePage } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { BookIcon, LibraryIcon, MessageCircleIcon, NotebookTextIcon, PanelLeftIcon } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const [isShowSidebar, setIsShowSidebar] = useState(false)
  const sidebarShowWidth = 'w-[min(30%,200px)]'

  useEffect(() => {
    toast.dismiss()
  }, [usePage().url])

  if (children.props.flash.error) {
    toast.error(children.props.flash.error)
  }

  return (
    <>
      <div className="flex flex-col w-full h-full container mx-auto after-border after:border-dashed">
        <div className="h-18 flex items-center pr-6">
          <div className={`${isShowSidebar ? sidebarShowWidth : 'w-4'} duration-300 flex items-center px-6`}>
            <Button size="icon" variant="ghost" onClick={() => setIsShowSidebar(prev => !prev)}>
              <PanelLeftIcon />
            </Button>
          </div>

          <header className='h-18 flex-1 flex items-center px-6'>
            <div className='w-full flex justify-between items-center gap-6'>
              <div>
                <Link route="home">
                  <img src="/imgs/logo-black.svg" alt="Adocasts Logo" className="h-8" />
                </Link>
              </div>
              <div>
                <nav className='flex items-center gap-3'>
                  {children.props.user ? (
                    <Form route="session.destroy">
                      <button type="submit"> Logout </button>
                    </Form>
                  ) : (
                    <>
                      <Button variant="ghost" render={<Link route="new_account.create" />}>Sign up</Button>
                      <Button render={<Link route="session.create" />}>Sign in</Button>
                    </>
                  )}
                </nav>
              </div>
            </div>
          </header>
        </div>

        <div className={`flex flex-1 mb-6 duration-300 ${isShowSidebar ? 'mr-6' : ''}`}>
          <div className={`${isShowSidebar ? sidebarShowWidth : 'w-0'} h-full flex flex-col overflow-hidden duration-300`}>
            <div className='flex-1 overflow-y-auto p-6'>
              <div className='flex flex-col gap-1.5 pb-4 mb-6 after-border-b after:border-dashed'>
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
            </div>
          </div>

          <div className={`flex-1 h-full flex flex-col ${isShowSidebar ? 'after-border' : ''}`}>
            <main className={`flex-1 p-6 border-y overflow-auto duration-300 ${isShowSidebar ? 'border-x rounded-xl' : ''}`}>
              <div className="w-[calc(100%+3rem)] h-[calc(100%+3rem)] bg-white relative text-gray-800 -m-6">
                <div
                  className="absolute inset-0 z-0 opacity-50 pointer-events-none"
                  style={{
                    backgroundImage: `
                      repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
                      repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
                      radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.12) 2px, transparent 2px),
                      radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.12) 2px, transparent 2px)
                    `,
                    backgroundSize: '40px 40px, 40px 40px, 40px 40px, 40px 40px',
                  }}
                />
                
                <div className="p-6">
                  {children}  
                </div>
              </div>
            </main>  
          </div>
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </>
  )
}
