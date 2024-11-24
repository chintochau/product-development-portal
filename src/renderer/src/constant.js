import { Calendar, ChevronDown, Home, Inbox, Search, Settings } from "lucide-react"
import HomePage from "./components/HomePage"
import SettingsPage from "./components/settings/SettingsPage"


export const navigationItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: Home,
        element: HomePage

    },
    {
        title: "Inbox",
        url: "/inbox",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "/search",
        icon: Search,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        element:SettingsPage
    },
]