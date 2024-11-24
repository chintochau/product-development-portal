import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { navigationItems } from "./constant";
import { TicketsProvider } from "./contexts/ticketsContext";
function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <>
      
      <TicketsProvider>
        <Router>
          <SidebarProvider>
            <AppSidebar />
            <main>
              <SidebarTrigger />
              <Routes>
                {
                  navigationItems.map((item) => (
                    <Route key={item.title} path={item.url} element={item.element ? <item.element /> : <h1>{item.title}</h1>} />
                  ))
                }
              </Routes>
            </main>
          </SidebarProvider>
        </Router>
      </TicketsProvider>

    </>
  )
}

export default App

