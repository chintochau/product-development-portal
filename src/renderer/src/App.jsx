import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { HashRouter as Router, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom'
import { navigationItems } from './constant'
import { TicketsProvider } from './contexts/ticketsContext'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import Layout from './layout'
import { ProductsProvider } from './contexts/productsContext'
import { SingleProductProvider } from './contexts/singleProductContext'
import { UserProvider } from './contexts/userContext'
import { BrowsingProvider } from './contexts/browsingContext'
import { ThemeProvider } from '../../components/theme-provider'
import { DeveloperProvider } from './contexts/developerContext'
import { RoadmapProvider } from './contexts/roadmapConetxt'

function App() {
  return (
    <>
      <Router>
        <ThemeProvider>
          <UserProvider>
            <DeveloperProvider>
              <TicketsProvider>
                <ProductsProvider>
                  <SingleProductProvider>
                    <BrowsingProvider>
                      <SidebarProvider>
                       <RoadmapProvider>
                          <AppSidebar />
                          <Layout />
                       </RoadmapProvider>
                      </SidebarProvider>
                    </BrowsingProvider>
                  </SingleProductProvider>
                </ProductsProvider>
              </TicketsProvider>
            </DeveloperProvider>
          </UserProvider>
        </ThemeProvider>
      </Router>
    </>
  )
}

export default App
