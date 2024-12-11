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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              B<span>v{version}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="px-2">
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={cn({ 'bg-accent rounded-xl': currentPath === item.url })}
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.nested && (
                  <SidebarMenuSub>
                    {item.nested.map((nestedItem) => (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to={nestedItem.url}>{nestedItem.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Link to="/login" className="flex items-center space-x-2">
                <Avatar className="size-6">
                  <AvatarImage src="https://play-lh.googleusercontent.com/SuraPSeMbu8gmxbWqZ_W7NngmyvDgfpg4pq856Yz9StH6EccGMMVxyrqc5feFxKmLQ=w480-h960" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <span>
                  {user && user.username ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-primary">{user.username}</span>
                      <span className="text-xs">{user.role}</span>
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
  )
}
