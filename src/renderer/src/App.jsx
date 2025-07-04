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
import { RoadmapProvider } from './contexts/roadmapConetxt'
import { ProjectsProvider } from './contexts/projecstContext'
import { AuthPermissionWrapper } from './contexts/permissionContext'
import { UiuxProvider } from './contexts/uiuxContext'
import { AnalyticsProvider } from './contexts/analyticsContext'

function App() {
  return (
    <>
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
                              <RoadmapProvider>
                                <AnalyticsProvider>
                                  <AppSidebar />
                                  <Layout />
                                </AnalyticsProvider>
                              </RoadmapProvider>
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
    </>
  )
}

export default App
