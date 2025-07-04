import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { HashRouter as Router, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom'
import { TicketsProvider } from './contexts/ticketsContext'

import Layout from './layout'
import { ProductsProvider } from './contexts/productsContext'
import { SingleProductProvider } from './contexts/singleProductContext'
import { UserProvider, useUser } from './contexts/userContext'
import { BrowsingProvider } from './contexts/browsingContext'
import { ThemeProvider } from '../../components/theme-provider'
import { DeveloperProvider } from './contexts/developerContext'
// import { RoadmapProvider } from './contexts/roadmapContext' // Removed during migration
import { ProjectsProvider } from './contexts/projectsContext'
import { AuthPermissionWrapper } from './contexts/permissionContext'
import { UiuxProvider } from './contexts/uiuxContext'
import { AnalyticsProvider } from './contexts/analyticsContext'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <UserProvider>
            <AuthPermissionWrapper>
              <DeveloperProvider>
                <TicketsProvider>
                  <ProductsProvider>
                    <SingleProductProvider>
                      <BrowsingProvider>
                        <SidebarProvider>
                          <UiuxProvider>
                            <ProjectsProvider>
                              <AnalyticsProvider>
                                <AppSidebar />
                                <Layout />
                              </AnalyticsProvider>
                            </ProjectsProvider>
                          </UiuxProvider>
                        </SidebarProvider>
                      </BrowsingProvider>
                    </SingleProductProvider>
                  </ProductsProvider>
                </TicketsProvider>
              </DeveloperProvider>
            </AuthPermissionWrapper>
          </UserProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
