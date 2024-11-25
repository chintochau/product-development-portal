import { Calendar, ChevronDown, Home, Inbox, Search, Settings } from "lucide-react"
import HomePage from "./components/HomePage"
import SettingsPage from "./components/settings/SettingsPage"
import CreateNewProduct from "./components/CreateNewProduct"


export const navigationItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        element: HomePage,
        nested: [
            {
                title: "Create New Product",
                url: "/dashboard/new-product",
                icon: Inbox,
                element:CreateNewProduct
            }
        ]

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