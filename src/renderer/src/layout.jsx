import React, { Fragment } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
  useLocation,
  Navigate
} from 'react-router-dom'
import { navigationItems, otherPages } from './constant'
import { TicketsProvider } from './contexts/ticketsContext'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import ProductDetailPage from './components/ProductDetailPage'
import { useBrowsing } from './contexts/browsingContext'
import { ScrollArea } from '../../components/ui/scroll-area'
import ProductEditPage from './components/forms/EditProductPage'
import { useUser } from './contexts/userContext'
import Login from './components/Login'
import { ModeToggle } from '../../components/mode-toggle'
import FrameWraper from './components/frameWarper'
import { WithPermission } from './contexts/permissionContext'

const Layout = ({ children }) => {
  const location = useLocation()
  const currentPath = location.pathname
  const [scrollTop, setScrollTop] = React.useState(0)
  const { user } = useUser() || {}
  if (!user) {
    return <Login />
  }
  return (
    <ScrollArea
      className="w-full h-screen relative"
      onScrollCapture={(e) => {
        setScrollTop(e.target.scrollTop)
      }}
    >
      <WithPermission requiredAccess={99} fallback={<Login />}>
          <div className="flex items-center sticky top-0 z-50 bg-background border-b">
            <div className="flex items-center">
              <SidebarTrigger />
              <Breadcrumb>
                <BreadcrumbList>
                  {currentPath.split('/').length > 1 &&
                    currentPath.split('/').map((path, index) => (
                      <Fragment key={path}>
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <Link
                              to={currentPath
                                .split('/')
                                .slice(0, index + 1)
                                .join('/')}
                            >
                              {path}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index !== 0 && index < currentPath.split('/').length - 1 && (
                          <BreadcrumbSeparator />
                        )}
                      </Fragment>
                    ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        <Routes>
          {navigationItems.map((item) => (
            <Route
              key={item.title}
              path={item.url}
              element={
                item.element ? <item.element scrollTop={scrollTop} /> : <h1>{item.title}</h1>
              }
            />
          ))}
          {/* Handle nested routes explicitly */}
          {navigationItems
            .filter((item) => item.nested) // Only process items with nested routes
            .flatMap((item) =>
              item.nested.map((nestedItem) => (
                <Route
                  key={nestedItem.title}
                  path={nestedItem.url}
                  element={
                    nestedItem.element ? <nestedItem.element /> : <h1>{nestedItem.title}</h1>
                  }
                />
              ))
            )}
          {otherPages.map((item) => (
            <Route
              key={item.title}
              path={item.url}
              element={item.element ? <item.element {...item.pageProps} /> : <h1>{item.title}</h1>}
            />
          ))}
          {/* Default redirect to /dashboard */}
          <Route path="/" />
          <Route path="/dashboard/:id" element={<ProductDetailPage editMode />} />{' '}
          <Route path="/dashboard/:id/edit" element={<ProductEditPage editMode />} />
        </Routes>
      </WithPermission >
    </ScrollArea>
  )
}

export default Layout
