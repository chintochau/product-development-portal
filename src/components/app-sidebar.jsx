import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { navigationItems } from '@/renderer/src/constant'
import { Link, useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUser } from '../renderer/src/contexts/userContext'
import { useEffect, useState } from 'react'
import { ModeToggle } from './mode-toggle'
import { WithPermission } from '../renderer/src/contexts/permissionContext'

export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname
  const { user } = useUser()
  const [version, setVersion] = useState(null)

  const getAppVersion = async () => {
    const version = await window.api.getAppVersion()
    setVersion(version)
  }

  useEffect(() => {
    getAppVersion()
  }, [])

  return (
    <WithPermission requiredAccess={99}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Avatar className="size-6">
                  <AvatarImage src="https://play-lh.googleusercontent.com/SuraPSeMbu8gmxbWqZ_W7NngmyvDgfpg4pq856Yz9StH6EccGMMVxyrqc5feFxKmLQ=w480-h960" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <span>v{version}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {navigationItems.map((item) => (
                <WithPermission requiredAccess={item.access}>
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn({
                        'bg-sidebar-accent text-sidebar-accent-foreground': currentPath === item.url
                      })}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.nested && (
                      <SidebarMenuSub>
                        {item.nested.map((nestedItem) => (
                          <SidebarMenuSubItem key={nestedItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link to={nestedItem.url}>{nestedItem.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                </WithPermission>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Link to="/login" className="flex items-center space-x-2">
                  {user && (
                    <p className="size-6 bg-primary text-background rounded-full flex items-center justify-center">
                      {user.email?.substring(0, 1).toUpperCase()}
                    </p>
                  )}
                  <span>
                    {user && user.email ? (
                      <div className="flex flex-col ">
                        <span className="text-xs text-primary">{user.name || user.email}</span>
                        <span className="text-xs text-muted-foreground text-nowrap">
                          {user.role}
                        </span>
                      </div>
                    ) : (
                      <span>Login</span>
                    )}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </WithPermission>
  )
}
