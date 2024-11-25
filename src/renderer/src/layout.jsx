import React from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { HashRouter as Router, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom'
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

const Layout = ({ children }) => {
  const location = useLocation()
  const currentPath = location.pathname
  return (
    <main className="w-full">
      <div className="flex items-center">
        <SidebarTrigger />
        <Breadcrumb>
          <BreadcrumbList>
            {currentPath.split('/').length > 1 &&
              currentPath.split('/').map((path, index) => (
                <BreadcrumbItem key={index}>
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
                  {index !== 0 && index < currentPath.split('/').length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </BreadcrumbItem>
              ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Routes>
        {navigationItems.map((item) => (
          <Route
            key={item.title}
            path={item.url}
            element={item.element ? <item.element /> : <h1>{item.title}</h1>}
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
                element={nestedItem.element ? <nestedItem.element /> : <h1>{nestedItem.title}</h1>}
              />
            ))
          )}

          {otherPages.map((item) => (
            <Route
              key={item.title}
              path={item.url}
              element={item.element ? <item.element /> : <h1>{item.title}</h1>}
            />
          ))}
      </Routes>
    </main>
  )
}

export default Layout
