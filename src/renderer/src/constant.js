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


const sampleStepData = {
    label: "Kick-Off", completed: false, timestamp: "2024-11-15", targetDate: "2024-11-20", milestone: "1.0.0", optional: true, pif: {
        name: "sample pif",
        url: "https://gitlab.com",
        timestamp: "2024-11-15"
    },
    subSteps: [
        { label: "Kick-Off", completed: false, timestamp: "2024-11-15", targetDate: "2024-11-20" },
        { label: "Kick-Off", completed: false, timestamp: "2024-11-15", targetDate: "2024-11-20" }
    ]
}

export const defaultHardwareSteps = [
    { label: "Kick-Off", completed: false, },
    { label: "PIF Review & Approval", completed: false, },
    {
        label: "Engineering Sample", completed: false, subSteps: [
            { label: "ES Schematics + Layouts + BOMs Created, Reviewed and Issued to Factory", completed: false, },
            { label: "ES PCBs + Components Procured", completed: true, timestamp: "2024-11-15", targetDate: "2024-11-20"},
            { label: "ES Samples Built and Shipped", completed: false, },
            { label: "ES Hardware Bring-Up (Basic Firmware) Completed", completed: false, },
            { label: "ES Software Build Completed", completed: false, },
            { label: "ES Performance Testing Completed", completed: false, },
        ]
    },
    {
        label: "Engineering Sample 2", completed: false, optional: true, subSteps: [
            { label: "ES Schematics + Layouts + BOMs Created, Reviewed and Issued to Factory", completed: false, },
            { label: "ES PCBs + Components Procured", completed: false, },
            { label: "ES Samples Built and Shipped", completed: false, },
            { label: "ES Hardware Bring-Up (Basic Firmware) Completed", completed: false, },
            { label: "ES Software Build Completed", completed: false, },
            { label: "ES Performance Testing Completed", completed: false, },
        ]
    },
    {
        label: "Pre-Production", completed: false, subSteps: [
            { label: "PP Schematics + Layouts + BOMs Updated, Reviewed and Issued to Factory", completed: false },
            { label: "MP Long Leadtime Components Ordered", completed: false },
            { label: "PP PCBs + Components Procured", completed: false },
            { label: "PP Software Build Completed", completed: false },
            { label: "PP Samples Built and Shipped", completed: false },
            { label: "PP Beta Testing Completed", completed: false },
            { label: "PP Performance Testing Completed", completed: false },
            { label: "PP Certifications Completed", completed: false },
        ]
    },
    {
        label: "Mass Production", completed: false, subSteps: [
            { label: "MP Schematics + Layouts + BOMs Updated, Reviewed and Issued to Factory", completed: false },
            { label: "MP PCBs + Components Procured", completed: false },
            { label: "MP Software Build Completed", completed: false },
            { label: "MP Built and Shipped", completed: false },
        ]
    },
];

export const defaultSoftwareSteps = [
    { label: "Kick-Off", completed: false, timestamp: "2024-11-15", targetDate: "2024-11-20" },
    { label: "PIF Review & Approval", completed: false, timestamp: "2024-11-16", targetDate: "2024-11-21" },
    { label: "Requirement Specification", completed: false, timestamp: "2024-11-18", targetDate: "2024-11-25" },
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
