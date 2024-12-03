import { BarChart, Calendar, ChevronDown, Edit, Home, Inbox, List, Search, Settings } from "lucide-react"
import HomePage from "./components/HomePage"
import SettingsPage from "./components/settings/SettingsPage"
import Login from "./components/Login"
import ProductEditPage from "./components/forms/EditProductPage"
import { FeatureRequestForm } from "./components/forms/FeatureRequestForm"

export const CREATE_NEW_PRODUCT_ROUTE = "/dashboard/new-product"

export const navigationItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        element: HomePage
    },
    {
        title: "Feature Requests",
        url: "/feature-requests",
        icon: Edit,
        element: FeatureRequestForm
    },
    {
        title: "Developers",
        url: "/developers",
        icon: BarChart,
    },
    {
        title: "Ticket Browser",
        url: "/tickets",
        icon: List,
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

export const defaultBrands = [
    { value: "BLS", name: "Bluesound" },
    { value: "BPR", name: "Bluesound Pro" },
    { value: "NAD", name: "NAD" },
    { value: "PSB", name: "PSB" },
    { value: "NAD CI", name: "NAD CI" },
]

export const defaultStatus = [
    { value: "concept", name: "Concept" },
    { value: "concept approved", name: "Concept Approved" },
    { value: "greenlight", name: "Greenlight" },
    { value: "complete", name: "Complete" },
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
    {
        label: "PIF Review & Approval", completed: false, pif: {
            name: null,
            url: null,
            timestamp: null,
            pifId: null,
        }
    },
    {
        label: "Engineering Sample", completed: false, subSteps: [
            { label: "ES Schematics + Layouts + BOMs Created, Reviewed and Issued to Factory", completed: false, },
            { label: "ES PCBs + Components Procured", completed: false },
            { label: "ES Samples Built and Shipped", completed: false, },
            { label: "ES Hardware Bring-Up (Basic Firmware) Completed", completed: false, },
            { label: "ES Software Build Completed", completed: false, },
            { label: "ES Performance Testing Completed", completed: false, },
        ]
    },
    {
        label: "Engineering Sample 2", completed: false, optional: false, subSteps: [
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
    { label: "Kick-Off", completed: false, },
    {
        label: "PIF Review & Approval", completed: false, pif: {
            name: "",
            url: "",
            timestamp: null,
        }
    },
    { label: "Requirement Specification", completed: false, },
    { label: "Design", completed: false, },
    { label: "Sign-Off", completed: false, },
    { label: "Development", completed: false, },
    { label: "Testing", completed: false, },
    { label: "Integration", completed: false, },
    { label: "Sign-Off (Post-Integration)", completed: false, },
    { label: "Release", completed: false, milestone: "-" },
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
