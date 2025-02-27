import { BarChart, Calendar, ChevronDown, Edit, FileText, Home, Inbox, LayoutDashboard, List, Map, MapPin, Package, Search, Settings, Speaker, User } from "lucide-react"
import ProductManagementPage from "./components/ProductManagementPage"
import SettingsPage from "./components/settings/SettingsPage"
import Login from "./components/Login"
import ProductEditPage from "./components/forms/EditProductPage"
import { FeatureRequestForm } from "./components/forms/FeatureRequestForm"
import DeveloperPage from "./components/DeveloperPage"
import RoadmapPage from "./components/RoadmapPage"
import FeaturesPage from "./components/FeaturesPage"
import FeatureRequestDetailPage from "./components/FeatureRequestDetailPage"
import TicketPage from "./components/TicketPage"
import MilestonePage from "./components/MilestonePage"
import ProjectsPage from "./components/project-page/ProjectsPage"
import AnalyticsPage from "./components/AnalyticsPage"
import HomePage from "./components/HomePage"

export const CREATE_NEW_PRODUCT_ROUTE = "/dashboard/new-product"


// Configuration array with fill colors and labels
export const QUARTER_CONFIG = [
    { label: "Q1", fill: "rgba(0, 128, 255, 0.1)" },
    { label: "Q2", fill: "rgba(255, 165, 0, 0.1)" },
    { label: "Q3", fill: "rgba(0, 255, 128, 0.1)" },
    { label: "Q4", fill: "rgba(128, 0, 255, 0.1)" }
  ];
  

export const navigationItems = [
    {
        title:"Home",
        url: "/",
        icon: Home,
        element: HomePage,
        access: 99, // Product team and above
        hide: true
    },
    {
        title: "Products",
        url: "/dashboard",
        description: "Browse and manage all products",
        icon: Speaker,
        element: ProductManagementPage,
        access: 99, // Product team and above
        color: "bg-blue-500",

    },
    {
        title: "Features",
        url: "/features",
        description: "View and manage feature requests",
        icon: FileText,
        element: FeaturesPage,
        access: 99, // Product team and above
        color: "bg-green-500",

    },
    {
        title: "Developers",
        url: "/developers",
        description: "Developer assignments and workload",
        icon: User,
        element: DeveloperPage,
        access: 2, // Admin, Platform, and Software Manager
        color: "bg-purple-500",
    },
    {
        title: "Ticket Browser",
        description: "Browse and manage all tickets",
        url: "/tickets",
        icon: List,
        element: TicketPage,
        access: 2, // Admin, Platform, and Software Manager
        color: "bg-orange-500",
    },
    {
        title: "Roadmap",
        url: "/roadmap",
        icon: Map,
        description: "View product development roadmap",
        element: RoadmapPage,
        access: 2, // Product team and above
        color: "bg-green-500",
    },
    {
        title: "Project Hub",
        url: "/project-hub",
        description: "Manage projects and milestones",
        icon: LayoutDashboard,
        element: ProjectsPage,
        color: "bg-indigo-500",
        access: 1, // Admin, Platform, and Software Manager
        nested: [
            {
                title: "New Ticket",
                url: "/features/new",
                description: "Create a new feature request",
                icon: Edit,
                element: FeatureRequestForm,
                access: 1, // Admin, Platform, and Software Manager
                color: "bg-teal-500",
            },
            {
                title: "Milestones",
                url: "/milestones",
                description: "Track project milestones",
                icon: MapPin,
                element: MilestonePage,
                access: 1, // Admin, Platform, and Software Manager
                color: "bg-amber-500",
            },
            {
                title:"Analytics",
                url:"/analytics",
                description: "View project and feature analytics",
                icon: BarChart,
                element: AnalyticsPage,
                access: 1, // Admin, Platform, and Software Manager
                color: "bg-cyan-500",
            }
        ],
    },
    {
        title: "Settings",
        url: "/settings",
        description: "Manage portal settings",
        icon: Settings,
        element: SettingsPage,
        access: 99, // Admin, Platform, and Software Manager
        color: "bg-gray-500",
    },
];

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
    },
    {
        title: "Feature Page",
        url: "/features/:featureId",
        // add props edit=true
        element: FeatureRequestDetailPage,
    },
    {
        title: "Edit Feature",
        url: "/features/:featureId/edit",
        element: FeatureRequestForm,
        pageProps: { editMode: true }
    }

]

export const defaultPriorities = {
    0: "At Launch",
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
}


export const getBrandName = (brand) => {
    const brandItem = defaultBrands.find((item) => item.value === brand)
    if (brandItem) {
        return brandItem.name
    } else {
        return brand
    }
}

export const defaultPlatforms = [
    "BluOS",
    'Desktop',
    "iOS",
    "Android",
]

export const defaultStatus = [
    { value: "concept", name: "Concept" },
    { value: "concept approved", name: "Concept Approved" },
    { value: "greenlight", name: "Greenlight" },
    { value: "complete", name: "Complete" },
]


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
    { label: "MP Preparation", completed: false, },
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
    { role: "admin", access: 0 },
    { role: "BluOS Platform Manager", access: 0 },
    { role: "BluOS Team", access: 1 },
    { role: "Hardware Team", access: 2 },
    { role: "Bluesound Manager", access: 3, team:"BLS" },
    { role: "Bluesound Pro Manager", access: 3, team:"BPR" },
    { role: "NAD Manager", access: 3, team:"NAD" },
    { role: "PSB Manager", access: 3, team:"PSB" }
]

export const defaultBrands = [
    { value: "BLS", name: "Bluesound" },
    { value: "BPR", name: "Bluesound Pro" },
    { value: "NAD", name: "NAD" },
    { value: "PSB", name: "PSB" },
    { value: "NAD CI", name: "NAD CI" },
]

// 0: Admin
// 1: Software Manager
// 2: Hardware Manager
// 3: Bluesound
// 4: Bluesound Pro
// 5: NAD
// 6: PSB
