import React, { type ReactNode } from "react";
import {
  DashboardOutlined as DashboardOutlinedIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Warehouse as WarehouseIcon,
  GridView as GridViewIcon,
  ViewModule as ViewModuleIcon,
  ViewStream as ViewStreamIcon,
  Inventory as InventoryIcon,
  EventNote as EventNoteIcon,
  PostAdd as PostAddIcon,
  ShoppingCart as ShoppingCartIcon,
  FactCheck as FactCheckIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Assessment as AssessmentIcon,
  Verified as VerifiedIcon,
  MonitorHeart as MonitorHeartIcon,
  Assignment as AssignmentIcon,
  SyncAlt as SyncAltIcon,
  PersonAddAlt as PersonAddAltIcon,
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Description as DescriptionIcon,
  RuleFolder as RuleFolderIcon,
  Preview as PreviewIcon,
  Assessment as AssessmentOutlineIcon,
  History as HistoryIcon,
  SettingsSuggest as SettingsSuggestIcon,
  AccountTree as AccountTreeIcon,
  // AltRoute as AltRouteIcon,
  Hub as HubIcon,
  Notifications as NotificationsIcon,
  FolderSpecial as FolderSpecialIcon,
  ManageSearch as ManageSearchIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  WorkspacesOutlined as WorkspacesOutlinedIcon,
  ViewKanbanOutlined as ViewKanbanOutlinedIcon,
  SupportAgentOutlined as SupportAgentOutlinedIcon,
  ReceiptLongOutlined as ReceiptLongOutlinedIcon,
} from "@mui/icons-material";
import type { Navigation } from "@toolpad/core/AppProvider";

 import AdvancePaymentDashboard from "../src/pages/AdvanceVoucher/Dashboard";
import SupplierPage from "../src/pages/AdvanceVoucher/Supplier";
import POPage from "../src/pages/AdvanceVoucher/PO";
import EvidanceDashboard from "../src/pages/EvidanceCollection/Dashboard";
import EvidanceAdminDashboard from "../src/pages/EvidanceCollection/AdminDashboard";
import EvidanceUserRegistrationPage from "../src/pages/EvidanceCollection/UserRegistration";
import EvidanceCompaniesListPage from "../src/pages/EvidanceCollection/CompaniesList";
import InventoryDashboard from "../src/pages/Warehouse/Dashboard";
import WarehouselistPage from "../src/pages/Warehouse/Warehouselist";
import ZonelistPage from "../src/pages/Warehouse/Zonelist";
import RacklistPage from "../src/pages/Warehouse/Racklist";
import PalletlistPage from "../src/pages/Warehouse/Palletlist";
import ItemlistPage from "../src/pages/Warehouse/Itemlist";
import TransactionsPage from "../src/pages/Warehouse/Transactions";
import OrderTrackingDashboard from "../src/pages/OrderTracking/index";
import OrderTrackingConfiguration from "../src/pages/OrderTracking/configurationlist";
import BarcodeDashboard from "../src/pages/Barcode/Dashboard";
import { OrderComplition } from "../src/pages/Barcode/Dashboard/components/ordercomplition";
import { Reports } from "../src/pages/Barcode/Dashboard/components/reports";
import { FinalInspection } from "../src/pages/Barcode/Dashboard/components/finalinspection";
import SalesOrders from "../src/pages/Barcode/Dashboard/components/salesorders";
import GearMonitoringDashboard from "../src/pages/GearMonitoring";
import AuthenticatorPage from "../src/pages/Authenticator";
import AppCrudPage from "../src/pages/Authenticator/AppCrudPage";
import ModuleCrudPage from "../src/pages/Authenticator/ModuleCrudPage";
import PermissionCrudPage from "../src/pages/Authenticator/PermissionCrudPage";
import RolePermissionMappingPage from "../src/pages/Authenticator/RolePermissionMappingPage";
import SopsDashboardPage from "../src/pages/Sops";
import SopsRegisterPage from "../src/pages/Sops/register";
// import WorkflowConfigurationPage from "../src/pages/Sops/workflow-config";
import SopsViewerPage from "../src/pages/Sops/viewer";
import SopsReleasedPage from "../src/pages/Sops/released";
import SopsReportsPage from "../src/pages/Sops/reports";
import SopsAuditTrailPage from "../src/pages/Sops/audittrail";
import SopsCategoryPage from "../src/pages/Sops/masters";



import ProjectManagementInquiriesPage from "../src/pages/ProjectManagement/inquiries";
import ProjectManagementScopeDocumentsPage from "../src/pages/ProjectManagement/scope-documents";
import ProjectManagementProjectsPage from "../src/pages/ProjectManagement/projects";
import ProjectManagementBacklogsPage from "../src/pages/ProjectManagement/backlogs";
import ProjectManagementKanbanPage from "../src/pages/ProjectManagement/kanban";
import ProjectManagementSupportPage from "../src/pages/ProjectManagement/support";
import ProjectManagementInvoicesPage from "../src/pages/ProjectManagement/invoices";
// import ProjectManagementReportsPage from "../src/pages/ProjectManagement/reports";

//test

const SopsNewDashboardPage = <SopsDashboardPage />;
const SopsNewRegisterPage = <SopsRegisterPage />;
const SopsNewDetailsPage = <SopsRegisterPage />;
const SopsNewHierarchyPage = <SopsCategoryPage />;
const SopsNewVersionsPage = <SopsViewerPage />;
const SopsNewDistributionPage = <SopsViewerPage />;
const SopsNewViewerPage = <SopsViewerPage />;
const SopsNewReleasedPage = <SopsReleasedPage />;
const SopsNewAuditPage = <SopsAuditTrailPage />;
// const SopsNewConfigurationPage = <WorkflowConfigurationPage />;
const SopsNewMastersPage = <SopsCategoryPage />;
const SopsNewSecurityPage = <SopsAuditTrailPage />;
const SopsNewNotificationsPage = <SopsRegisterPage />;

export type NavItem = {
  name: string;
  icon: ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    module?: string;
    subItems?: {
      name: string;
      path: string;
      pro?: boolean;
      new?: boolean;
      module?: string;
    }[];
  }[];
  roles: string[];
  module?: string;
};

export type PageRouteConfig = {
  name: string;
  icon: ReactNode;
  path: string;
  moduleCode?: string;
  hideInNavigation?: boolean;
  roles: string[];
  element: ReactNode;
};

export type ModuleRouteConfig = {
  module: string;
  children: PageRouteConfig[];
};

const buildModuleCode = (page: Pick<PageRouteConfig, "path" | "name" | "moduleCode">) => {
  if (page.moduleCode?.trim()) {
    return page.moduleCode.trim().toUpperCase();
  }

  const normalizedPath = page.path.replace(/^\/+/, "");
  const derivedValue = normalizedPath || page.name;

  return derivedValue
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
};

const withModuleCodes = (routes: ModuleRouteConfig[]): ModuleRouteConfig[] =>
  routes.map((module) => ({
    ...module,
    children: module.children.map((page) => ({
      ...page,
      moduleCode: buildModuleCode(page),
    })),
  }));

export const isPageVisibleInNavigation = (
  page: Pick<PageRouteConfig, "hideInNavigation">,
) => !page.hideInNavigation;

export const moduleRoutes: ModuleRouteConfig[] = withModuleCodes([
  {
    module: "advance-voucher",
    children: [
      {
        name: "Dashboard",
        icon: <DashboardOutlinedIcon />,
        roles: ["admin"],
        path: "/dashboard",
        element: <AdvancePaymentDashboard type="supplier" />,
      },
      {
        name: "Supplier",
        icon: <BusinessIcon />,
        roles: ["admin"],
        path: "/supplier",
        element: <SupplierPage />,
      },
      {
        name: "PO",
        icon: <ReceiptIcon />,
        roles: ["admin"],
        path: "/po",
        element: <POPage />,
      },
    ],
  },

  {
    module: "purchase-order",
    children: [
      {
        name: "PO Dashboard",
        icon: <DashboardOutlinedIcon />,
        roles: ["admin"],
        path: "/dashboard",
        element: <AdvancePaymentDashboard type="supplier" />,
      },
      {
        name: "PO Supplier",
        icon: <BusinessIcon />,
        roles: ["admin"],
        path: "/supplier",
        element: <SupplierPage />,
      },
      {
        name: "PO PO",
        icon: <ReceiptIcon />,
        roles: ["admin"],
        path: "/po",
        element: <POPage />,
      },
    ],
  },

  {
    module: "supplier-portal",
    children: [
      {
        name: "SP Dashboard",
        icon: <DashboardOutlinedIcon />,
        roles: ["admin"],
        path: "/dashboard",
        element: <AdvancePaymentDashboard type="supplier" />,
      },
      {
        name: "sp Supplier",
        icon: <BusinessIcon />,
        roles: ["admin"],
        path: "/supplier",
        element: <SupplierPage />,
      },
      {
        name: "sp PO",
        icon: <ReceiptIcon />,
        roles: ["admin"],
        path: "/po",
        element: <POPage />,
      },
    ],
  },

  {
    module: "Warehouse",
    children: [
      {
        name: "Dashboard",
        icon: <DashboardOutlinedIcon />,
        roles: ["admin"],
        path: "/dashboard",
        element: <InventoryDashboard />,
      },
      {
        name: "Warehouse",
        icon: <WarehouseIcon />,
        roles: ["admin"],
        path: "/warehouselist",
        element: <WarehouselistPage />,
      },
      {
        name: "Zones",
        icon: <GridViewIcon />,
        roles: ["admin"],
        path: "/zonelist",
        element: <ZonelistPage />,
      },
      {
        name: "Rack",
        icon: <ViewModuleIcon />,
        roles: ["admin"],
        path: "/racklist",
        element: <RacklistPage />,
      },
      {
        name: "Pallets",
        icon: <ViewStreamIcon />,
        roles: ["admin"],
        path: "/palletlist",
        element: <PalletlistPage />,
      },
      {
        name: "Items",
        icon: <InventoryIcon />,
        roles: ["admin"],
        path: "/itemlist",
        element: <ItemlistPage />,
      },
      {
        name: "Transactions",
        icon: <SyncAltIcon />,
        roles: ["admin"],
        path: "/transactions",
        element: <TransactionsPage />,
      },
    ],
  },


  {
    module: "hr-management",
    children: [
      {
        name: "HR Dashboard",
        icon: <DashboardOutlinedIcon />,
        roles: ["admin"],
        path: "/dashboard",
        element: <AdvancePaymentDashboard type="supplier" />,
      },
      {
        name: "HR Supplier",
        icon: <BusinessIcon />,
        roles: ["admin"],
        path: "/supplier",
        element: <SupplierPage />,
      },
      {
        name: "HR PO",
        icon: <ReceiptIcon />,
        roles: ["admin"],
        path: "/po",
        element: <POPage />,
      },
    ],
  },

  {
    module: "order-tracking",
    children: [
      {
        name: "Dashboard",
        icon: <DashboardOutlinedIcon />,
        roles: ["admin"],
        path: "/dashboard",
        element: <OrderTrackingDashboard />,
      },
      {
        name: "Plan Configuration",
        icon: <EventNoteIcon />,
        roles: ["admin", "user"],
        path: "/itemplan",
        element: <OrderTrackingConfiguration />,
      },

      // {
      //   name: "Form POST",
      //   icon: <PostAddIcon />,
      //   roles: ["admin", "user"],
      //   path: "/formpost",
      //   element: <FormPostPage />,
      // },

      // {
      //   name: "Example Form",
      //   icon: <DashboardOutlinedIcon />,
      //   roles: ["admin", "user"],
      //   path: "/example",
      //   element: <MuiSampleForm />,
      // },
    ],
  },

  {
    module: "barcode",
    children: [
      {
        name: "Dashboard",
        icon: <DashboardOutlinedIcon />,
        roles: ["admin"],
        path: "/dashboard",
        element: <BarcodeDashboard />,
      },
      {
        name: "Sales Orders",
        icon: <ShoppingCartIcon />,
        roles: ["admin"],
        path: "/salesorders",
        element: <SalesOrders />,
      },
      {
        name: "Final Inspection",
        icon: <FactCheckIcon />,
        roles: ["admin"],
        path: "/finalinspection",
        element: <FinalInspection />,
      },
      {
        name: "Order Completion",
        icon: <AssignmentTurnedInIcon />,
        roles: ["admin"],
        path: "/ordercompletion",
        element: <OrderComplition />,
      },

      {
        name: "Reports",
        icon: <AssessmentIcon />,
        roles: ["admin"],
        path: "/po",
        element: <Reports />,
      },
    ],
  },

  {
    module: "evidance",
    children: [
       {
        name: "Client Dashboard",
        icon: <DashboardOutlinedIcon />,
        roles: ["admin"],
        path: "/client-dashboard",
        element: <EvidanceDashboard />,
      },
      {
        name: "Admin Dashboard",
        icon: <DashboardOutlinedIcon />,
        roles: ["admin"],
        path: "/admin-dashboard",
        element: <EvidanceAdminDashboard />,
      },
      {
        name: "User Registration",
        icon: <PersonAddAltIcon />,
        roles: ["admin"],
        path: "/user-registration",
        element: <EvidanceUserRegistrationPage />,
      },
      {
        name: "Companies List",
        icon: <BusinessIcon />,
        roles: ["admin"],
        path: "/companies",
        element: <EvidanceCompaniesListPage />,
      },
    ],
  },

  {
    module: "monitoring",
    children: [
      {
        name: "Dashboard",
        icon: <MonitorHeartIcon />,
        roles: ["admin"],
        path: "/dashboard",
        element: <GearMonitoringDashboard />,
      },
    ],
  },
  {
    module: "authenticator",
    children: [
      {
        name: "Users & Roles",
        icon: <SecurityIcon />,
        roles: ["admin"],
        path: "/dashboard",
        element: <AuthenticatorPage />,
      },
      {
        name: "Apps",
        icon: <GridViewIcon />,
        roles: ["superadmin"],
        path: "/apps",
        element: <AppCrudPage />,
      },
      {
        name: "Modules",
        icon: <ViewModuleIcon />,
        roles: ["admin"],
        path: "/modules",
        element: <ModuleCrudPage />,
      },
      {
        name: "Permission",
        icon: <VpnKeyIcon />,
        roles: ["admin"],
        path: "/permissions",
        element: <PermissionCrudPage />,
      },
      {
        name: "Role Permission Mapping",
        icon: <AdminPanelSettingsIcon />,
        roles: ["admin"],
        path: "/role-permission-mapping",
        element: <RolePermissionMappingPage />,
      },
    ],
  },
  {
    module: "sops",
    children: [
      {
        name: "Dashboard",
        icon: <DescriptionIcon />,
        roles: ["admin", "user"],
        path: "/dashboard",
        element: <SopsDashboardPage />,
      },
      {
        name: "SOP Register",
        icon: <RuleFolderIcon />,
        roles: ["admin", "user"],
        path: "/register",
        element: <SopsRegisterPage />,
      },
      {
        name: "Secure Viewer",
        icon: <PreviewIcon />,
        roles: ["admin", "user"],
        path: "/viewer",
        element: <SopsViewerPage />,
      },
      {
        name: "SOP Released",
        icon: <VerifiedIcon />,
        roles: ["admin", "user"],
        path: "/released",
        element: <SopsReleasedPage />,
      },
      // {
      //   name: "Workflow Config",
      //   icon: <AltRouteIcon />,
      //   roles: ["admin"],
      //   path: "/workflow-config",
      //   element: <WorkflowConfigurationPage />,
      // },
      {
        name: "Reports",
        icon: <AssessmentOutlineIcon />,
        roles: ["admin"],
        path: "/reports",
        element: <SopsReportsPage />,
      },
      {
        name: "Audit Trail",
        icon: <HistoryIcon />,
        roles: ["admin"],
        path: "/audit-trail",
        element: <SopsAuditTrailPage />,
      },
      {
        name: "Category",
        icon: <SettingsSuggestIcon />,
        roles: ["admin"],
        path: "/category",
        element: <SopsCategoryPage />,
      },
    ],
  },
  {
    module: "sops-new",
    children: [
      {
        name: "Dashboard",
        icon: <DescriptionIcon />,
        roles: ["admin", "user"],
        path: "/dashboard",
        element: SopsNewDashboardPage,
      },
      {
        name: "SOP Register",
        icon: <RuleFolderIcon />,
        roles: ["admin", "user"],
        path: "/register",
        element: SopsNewRegisterPage,
      },
      {
        name: "SOP Details",
        icon: <PreviewIcon />,
        roles: ["admin", "user"],
        path: "/details",
        element: SopsNewDetailsPage,
      },
      {
        name: "Hierarchy Explorer",
        icon: <AccountTreeIcon />,
        roles: ["admin", "user"],
        path: "/hierarchy",
        element: SopsNewHierarchyPage,
      },
      {
        name: "Versions",
        icon: <HistoryIcon />,
        roles: ["admin", "user"],
        path: "/versions",
        element: SopsNewVersionsPage,
      },
      {
        name: "Distribution",
        icon: <HubIcon />,
        roles: ["admin"],
        path: "/distribution",
        element: SopsNewDistributionPage,
      },
      {
        name: "Secure Viewer",
        icon: <PreviewIcon />,
        roles: ["admin", "user"],
        path: "/viewer",
        element: SopsNewViewerPage,
      },
      {
        name: "SOP Released",
        icon: <VerifiedIcon />,
        roles: ["admin", "user"],
        path: "/released",
        element: SopsNewReleasedPage,
      },
      {
        name: "Audit Trail",
        icon: <AssessmentOutlineIcon />,
        roles: ["admin"],
        path: "/audit",
        element: SopsNewAuditPage,
      },
      // {
      //   name: "Workflow Config",
      //   icon: <SettingsSuggestIcon />,
      //   roles: ["admin"],
      //   path: "/workflow-config",
      //   element: SopsNewConfigurationPage,
      // },
      {
        name: "Category",
        icon: <BusinessIcon />,
        roles: ["admin"],
        path: "/category",
        element: SopsNewMastersPage,
      },
      {
        name: "Security",
        icon: <SecurityIcon />,
        roles: ["admin"],
        path: "/security",
        element: SopsNewSecurityPage,
      },
      {
        name: "Notifications",
        icon: <NotificationsIcon />,
        roles: ["admin", "user"],
        path: "/notifications",
        element: SopsNewNotificationsPage,
      },
    ],
  },
  {
    module: "project-management",
    children: [
      {
        name: "Inquiries",
        icon: <ManageSearchIcon />,
        roles: ["admin", "user"],
        path: "/inquiries",
        element: <ProjectManagementInquiriesPage />,
      },
      {
        name: "Scope Documents",
        icon: <DescriptionOutlinedIcon />,
        hideInNavigation: true,
        roles: ["admin", "user"],
        path: "/scope-documents",
        element: <ProjectManagementScopeDocumentsPage />,
      },
      {
        name: "Projects",
        icon: <FolderSpecialIcon />,
        roles: ["admin", "user"],
        path: "/projects",
        element: <ProjectManagementProjectsPage />,
      },
      {
        name: "Backlogs",
        icon: <WorkspacesOutlinedIcon />,
        roles: ["admin", "user"],
        path: "/backlogs",
        element: <ProjectManagementBacklogsPage />,
      },
      {
        name: "Kanban Board",
        icon: <ViewKanbanOutlinedIcon />,
        roles: ["admin", "user"],
        path: "/kanban-board",
        element: <ProjectManagementKanbanPage />,
      },
      {
        name: "Support",
        icon: <SupportAgentOutlinedIcon />,
        roles: ["admin", "user"],
        path: "/support",
        element: <ProjectManagementSupportPage />,
      },
      {
        name: "Invoices",
        icon: <ReceiptLongOutlinedIcon />,
        roles: ["admin", "user"],
        path: "/invoices",
        element: <ProjectManagementInvoicesPage />,
      },
      // {
      //   name: "Reports",
      //   icon: <AssessmentOutlineIcon />,
      //   roles: ["admin", "user"],
      //   path: "/reports",
      //   element: <ProjectManagementReportsPage />,
      // },
    ],
  },

]);

export const navItems: NavItem[] = moduleRoutes.flatMap((module) =>
  module.children
    .filter(
      (page) =>
        isPageVisibleInNavigation(page) &&
        !(module.module === "barcode" && page.path === "/salesorders"),
    )
    .map((page) => ({
      name: page.name,
      icon: page.icon,
      path: `/${module.module}${page.path}`,
      roles: page.roles,
      module: module.module,
    })),
);

export const NAVIGATION: Navigation = navItems.map((item) => ({
  kind: "page" as const,
  title: item.name,
  segment: item.path?.replace("/", ""),
  icon: item.icon,
  children: item.subItems?.map((sub) => ({
    kind: "page" as const,
    title: sub.name,
    segment: sub.path.replace("/", ""),
    children: sub.subItems?.map((nested) => ({
      kind: "page" as const,
      title: nested.name,
      segment: nested.path.replace("/", ""),
    })),
  })),
}));


