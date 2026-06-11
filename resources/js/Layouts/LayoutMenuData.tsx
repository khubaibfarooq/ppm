import React, { useEffect, useState } from "react";

const Navdata = () => {
    //state data
    const [isDashboard, setIsDashboard] = useState<boolean>(false);
    const [isApps, setIsApps] = useState<boolean>(false);
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [isPages, setIsPages] = useState<boolean>(false);
    const [isBaseUi, setIsBaseUi] = useState<boolean>(false);
    const [isAdvanceUi, setIsAdvanceUi] = useState<boolean>(false);
    const [isForms, setIsForms] = useState<boolean>(false);
    const [isTables, setIsTables] = useState<boolean>(false);
    const [isCharts, setIsCharts] = useState<boolean>(false);
    const [isIcons, setIsIcons] = useState<boolean>(false);
    const [isMaps, setIsMaps] = useState<boolean>(false);
    const [isMultiLevel, setIsMultiLevel] = useState<boolean>(false);

    // Petroleum Station Menus
    const [isPetroStation, setIsPetroStation] = useState<boolean>(false);
    const [isPetroAccounting, setIsPetroAccounting] = useState<boolean>(false);
    const [isPetroHR, setIsPetroHR] = useState<boolean>(false);
    const [isPetroCommercial, setIsPetroCommercial] = useState<boolean>(false);
    const [isPetroReports, setIsPetroReports] = useState<boolean>(false);

    // Apps
    const [isCalendar, setCalendar] = useState<boolean>(false);
    const [isEmail, setEmail] = useState<boolean>(false);
    const [isSubEmail, setSubEmail] = useState<boolean>(false);
    const [isEcommerce, setIsEcommerce] = useState<boolean>(false);
    const [isProjects, setIsProjects] = useState<boolean>(false);
    const [isTasks, setIsTasks] = useState<boolean>(false);
    const [isCRM, setIsCRM] = useState<boolean>(false);
    const [isCrypto, setIsCrypto] = useState<boolean>(false);
    const [isInvoices, setIsInvoices] = useState<boolean>(false);
    const [isSupportTickets, setIsSupportTickets] = useState<boolean>(false);
    const [isNFTMarketplace, setIsNFTMarketplace] = useState<boolean>(false);
    const [isJobs, setIsJobs] = useState<boolean>(false);
    const [isJobList, setIsJobList] = useState<boolean>(false);
    const [isCandidateList, setIsCandidateList] = useState<boolean>(false);


    // Authentication
    const [isSignIn, setIsSignIn] = useState<boolean>(false);
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [isPasswordReset, setIsPasswordReset] = useState<boolean>(false);
    const [isPasswordCreate, setIsPasswordCreate] = useState<boolean>(false);
    const [isLockScreen, setIsLockScreen] = useState<boolean>(false);
    const [isLogout, setIsLogout] = useState<boolean>(false);
    const [isSuccessMessage, setIsSuccessMessage] = useState<boolean>(false);
    const [isVerification, setIsVerification] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);

    // Pages
    const [isProfile, setIsProfile] = useState<boolean>(false);
    const [isLanding, setIsLanding] = useState<boolean>(false);
    const [isBlog, setIsBlog] = useState<boolean>(false);

    // Charts
    const [isApex, setIsApex] = useState<boolean>(false);

    // Multi Level
    const [isLevel1, setIsLevel1] = useState<boolean>(false);
    const [isLevel2, setIsLevel2] = useState<boolean>(false);

    const [iscurrentState, setIscurrentState] = useState<any>('Dashboard');

    function updateIconSidebar(e: any) {
        if (e && e.target && e.target.getAttribute("sub-items")) {
            const ul: any = document.getElementById("two-column-menu");
            const iconItems: any = ul.querySelectorAll(".nav-icon.active");
            let activeIconItems = [...iconItems];
            activeIconItems.forEach((item) => {
                item.classList.remove("active");
                var id = item.getAttribute("sub-items");
                const getID: any = document.getElementById(id) as HTMLElement;
                if (getID)
                    getID?.parentElement.classList.remove("show");
            });
        }
    }

    useEffect(() => {
        document.body.classList.remove('twocolumn-panel');
        if (iscurrentState !== 'Dashboard') {
            setIsDashboard(false);
        }
        if (iscurrentState !== 'Apps') {
            setIsApps(false);
        }
        if (iscurrentState !== 'Auth') {
            setIsAuth(false);
        }
        if (iscurrentState !== 'Pages') {
            setIsPages(false);
        }
        if (iscurrentState !== 'BaseUi') {
            setIsBaseUi(false);
        }
        if (iscurrentState !== 'AdvanceUi') {
            setIsAdvanceUi(false);
        }
        if (iscurrentState !== 'Forms') {
            setIsForms(false);
        }
        if (iscurrentState !== 'Tables') {
            setIsTables(false);
        }
        if (iscurrentState !== 'Charts') {
            setIsCharts(false);
        }
        if (iscurrentState !== 'Icons') {
            setIsIcons(false);
        }
        if (iscurrentState !== 'Maps') {
            setIsMaps(false);
        }
        if (iscurrentState !== 'MuliLevel') {
            setIsMultiLevel(false);
        }
        if (iscurrentState !== 'Landing') {
            setIsLanding(false);
        }
        if (iscurrentState !== 'PetroStation') {
            setIsPetroStation(false);
        }
    }, [
        history,
        iscurrentState,
        isDashboard,
        isApps,
        isAuth,
        isPages,
        isBaseUi,
        isAdvanceUi,
        isForms,
        isTables,
        isCharts,
        isIcons,
        isMaps,
        isMultiLevel,
        isPetroStation
    ]);

    const menuItems: any = [
        {
            label: "Menu",
            isHeader: true,
        },
        {
            id: "petrostation",
            label: "Petroleum Management",
            icon: "bx bx-gas-pump",
            link: "/#",
            stateVariables: isPetroStation,
            click: function (e: any) {
                e.preventDefault();
                setIsPetroStation(!isPetroStation);
                setIscurrentState('PetroStation');
                updateIconSidebar(e);
            },
            subItems: [
                { id: "petro-dashboard", label: "Dashboard", link: "/dashboard", parentId: "petrostation" },
                { id: "petro-shifts", label: "Shift Operations", link: "/shift-logs", parentId: "petrostation" },
                { id: "petro-shift-templates", label: "Shift Templates", link: "/shifts", parentId: "petrostation" },
                { id: "petro-tanks", label: "Tanks Management", link: "/tanks", parentId: "petrostation" },
                { id: "petro-machines", label: "Dispensers & Nozzles", link: "/machines", parentId: "petrostation" },
                { id: "petro-products", label: "Products & Pricing", link: "/products", parentId: "petrostation" },
                {
                    id: "petro-accounting",
                    label: "Accounting",
                    link: "/#",
                    parentId: "petrostation",
                    isChildItem: true,
                    click: function (e: any) {
                        e.preventDefault();
                        setIsPetroAccounting(!isPetroAccounting);
                    },
                    stateVariables: isPetroAccounting,
                    childItems: [
                        { id: 1, label: "Chart of Accounts", link: "/accounts" },
                        { id: 2, label: "General Ledger", link: "/ledger" },
                        { id: 3, label: "Journal Vouchers", link: "/journals" },
                    ]
                },
                {
                    id: "petro-hr",
                    label: "HR & Payroll",
                    link: "/#",
                    parentId: "petrostation",
                    isChildItem: true,
                    click: function (e: any) {
                        e.preventDefault();
                        setIsPetroHR(!isPetroHR);
                    },
                    stateVariables: isPetroHR,
                    childItems: [
                        { id: 1, label: "Staff Directory", link: "/staff" },
                        { id: 2, label: "Attendance Log", link: "/attendance" },
                        { id: 3, label: "Salary Payments", link: "/salaries" },
                    ]
                },
                {
                    id: "petro-commercial",
                    label: "Commercial (AR/AP)",
                    link: "/#",
                    parentId: "petrostation",
                    isChildItem: true,
                    click: function (e: any) {
                        e.preventDefault();
                        setIsPetroCommercial(!isPetroCommercial);
                    },
                    stateVariables: isPetroCommercial,
                    childItems: [
                        { id: 1, label: "Customers (AR)", link: "/customers" },
                        { id: 2, label: "Suppliers (AP)", link: "/suppliers" },
                    ]
                },
                {
                    id: "petro-reports",
                    label: "Financial Reports",
                    link: "/#",
                    parentId: "petrostation",
                    isChildItem: true,
                    click: function (e: any) {
                        e.preventDefault();
                        setIsPetroReports(!isPetroReports);
                    },
                    stateVariables: isPetroReports,
                    childItems: [
                        { id: 1, label: "Trial Balance", link: "/reports/trial-balance" },
                        { id: 2, label: "Profit & Loss", link: "/reports/profit-loss" },
                        { id: 3, label: "Balance Sheet", link: "/reports/balance-sheet" },
                    ]
                },
            ]
        },
        // {
        //     id: "dashboard",
        //     label: "Dashboard",
        //     icon: "bx bxs-dashboard",
        //     link: "/#",
        //     stateVariables: isDashboard,
        //     click: function (e: any) {
        //         e.preventDefault();
        //         setIsDashboard(!isDashboard);
        //         setIscurrentState('Dashboard');
        //         updateIconSidebar(e);
        //     },
        //     subItems: [
        //         {
        //             id: "analytics",
        //             label: "Analytics",
        //             link: "/dashboard-analytics",
        //             parentId: "dashboard",
        //         },
        //         {
        //             id: "crm",
        //             label: "CRM",
        //             link: "/dashboard-crm",
        //             parentId: "dashboard",
        //         },
        //         {
        //             id: "ecommerce",
        //             label: "Ecommerce",
        //             link: "/dashboard",
        //             parentId: "dashboard",
        //         },
        //         {
        //             id: "crypto",
        //             label: "Crypto",
        //             link: "/dashboard-crypto",
        //             parentId: "dashboard",
        //         },
        //         {
        //             id: "projects",
        //             label: "Projects",
        //             link: "/dashboard-projects",
        //             parentId: "dashboard",
        //         },
        //         {
        //             id: "nft",
        //             label: "NFT",
        //             link: "/dashboard-nft",
        //             parentId: "dashboard",
        //         },
        //         {
        //             id: "job",
        //             label: "Job",
        //             link: "/dashboard-job",
        //             parentId: "dashboard",
        //         },
        //         {
        //             id: "blog",
        //             label: "Blog",
        //             link: "/dashboard-blog",
        //             parentId: "dashboard",
        //             badgeColor: "success",
        //             badgeName: "New",
        //         },
        //     ],
        // },
    ];
    return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;