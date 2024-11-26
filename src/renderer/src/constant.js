import { Calendar, ChevronDown, Home, Inbox, Search, Settings } from "lucide-react"
import HomePage from "./components/HomePage"
import SettingsPage from "./components/settings/SettingsPage"
import ProductEditPage from "./components/EditProductPage"
import Login from "./components/Login"

export const CREATE_NEW_PRODUCT_ROUTE = "/dashboard/new-product"

export const navigationItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
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
        element: SettingsPage
    },
]

export const otherPages = [
    {
        title: "Create New Product",
        url: CREATE_NEW_PRODUCT_ROUTE,
        icon: Inbox,
        element: ProductEditPage
    },
    {
        title: "Login",
        url: "/login",
        icon: Inbox,
        element: Login
    }
]


export const hardwareSteps = [
    { label: "Kick-Off", completed: true, timestamp: "2024-11-15", targetDate: "2024-11-20" },
    { label: "PIF Review", completed: true, timestamp: "2024-11-16", targetDate: "2024-11-21" },
    { label: "Component Sourcing", completed: true, timestamp: "2024-11-18", targetDate: "2024-12-01" },
    { label: "Prototype Development", completed: false, targetDate: "2024-12-15" },
    { label: "Prototype Testing", completed: false, targetDate: "2024-12-30" },
    { label: "Design Adjustments", completed: false },
    { label: "Pre-Production Sample", completed: false, targetDate: "2025-01-15" },
    { label: "Pre-Production Testing", completed: false },
    { label: "Mass Production Approval", completed: false },
    { label: "Mass Production", completed: false, targetDate: "2025-03-01" },
];

export const softwareSteps = [
    { label: "Kick-Off", completed: true, timestamp: "2024-11-15", targetDate: "2024-11-20" },
    { label: "PIF Review", completed: true, timestamp: "2024-11-16", targetDate: "2024-11-21" },
    { label: "Requirement Specification", completed: true, timestamp: "2024-11-18", targetDate: "2024-11-25" },
    { label: "Design", completed: false, targetDate: "2024-12-05" },
    { label: "Sign-Off", completed: false, targetDate: "2024-12-10" },
    { label: "Development", completed: false, targetDate: "2025-01-15" },
    { label: "Testing", completed: false, targetDate: "2025-01-30" },
    { label: "Integration", completed: false, targetDate: "2025-02-10" },
    { label: "Sign-Off (Post-Integration)", completed: false, targetDate: "2025-02-15" },
    { label: "Release", completed: false, milestone: "4.8.0" },
];


export const productInformation = {
    lookupId: 200124,
    brand: "BLS",
    projectName: "NODE",
    description: "iMX.8; replacement for N130, ESS DAC, THX headphone amp",
    model: "N132",
    massProduct1: "2024-07-03",
    launch: "2024-09-01",
    status: "Greenlight | Concept | Concept Approved",
    greenlightDate: "2024-07-03",
    greenlightTargetMP: "2024-07-03",
}


export const userRoles = [
    "admin",
    "productManager",
    "softwareManager",
    "hardwareManager"]
