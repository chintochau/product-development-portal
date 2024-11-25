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

export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              B
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="px-2">
            {navigationItems.map((item) => (
              <SidebarMenuItem
                key={item.title}
                className={cn({ 'bg-accent rounded-xl': currentPath === item.url })}
              >
                <SidebarMenuButton asChild>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.nested && (
                  <SidebarMenuSub>
                    {item.nested.map((nestedItem) => (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
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
      <SidebarFooter />
    </Sidebar>
  )
}
