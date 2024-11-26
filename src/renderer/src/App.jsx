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

function App() {
  return (
    <>
      <Router>
        <TicketsProvider>
          <ProductsProvider>
            <SingleProductProvider>
              <SidebarProvider>
                <AppSidebar />
                <Layout />
              </SidebarProvider>
            </SingleProductProvider>
          </ProductsProvider>
        </TicketsProvider>
      </Router>
    </>
  )
}

export default App
