export const PUBLIC_PATHS : string[] = [
    '/',
    '/signin',
    '/signup',
]

export const heroHeading = "Capture Costs, Cultivate Wealth\n" +
    "Your AI Money Mentor"

export const protectedRoutes : string[] = [
    "home",
    "dashboard",
    "receipt/*",
    "settings",
    "dashboard/transactions"
]

export const sideBarLinks = [
    {
        id:"navLink1",
        position: "top",
        label: "Home",
        route: "/home",
        icon: "/icons/home.svg",
    },
    {
        id: "navLink2",
        position: "top",
        label: "Dashboard",
        route: "/dashboard",
        icon: "/icons/dashboard.svg",
    },
    {
        id: "navLink2",
        position: "top",
        label: "Upload Receipt",
        route: "/receipt/upload",
        icon: "/icons/upload.svg",
    },
    {
        id:"navLink3",
        position: "bot",
        label: "Settings",
        route: "/settings",
        icon: "/icons/settings.svg",
    },
    {
        id:"navLink4",
        position: "bot",
        label: "Sign Out",
        route: "/",
        icon: "/icons/signout.svg",
    }
];