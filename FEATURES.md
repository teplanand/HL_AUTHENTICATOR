# ELECON-UI Features Documentation

**Version:** 2.0.2  
**Last Updated:** March 26, 2026

---

## Table of Contents

1. [Core Application](#core-application)
2. [Authentication & Authorization](#authentication--authorization)
3. [Business Modules](#business-modules)
4. [UI Components & Widgets](#ui-components--widgets)
5. [Data Management & Forms](#data-management--forms)
6. [Visual & Charting Features](#visual--charting-features)
7. [User Experience Features](#user-experience-features)
8. [Technical Infrastructure](#technical-infrastructure)

---

## Core Application

### Application Portal (App Launcher)
- **Multi-Module Dashboard:** Access 6+ business applications from a unified portal
- **Module Cards:** Interactive cards for each module with notification badges
- **Quick Navigation:** One-click access to Advance Voucher, Purchase Order, Gear Monitoring, Warehouse, Barcode, and Order Tracking
- **Dynamic Permissions:** Shows only accessible modules based on user permissions
- **Favorites System:** Mark frequently used modules as favorites
- **Shopping Cart Badge:** Real-time notification indicators on each module

### Sidebar Navigation
- **Vertical/Collapsible Menu:** Configurable navigation menu layout
- **Context-Aware Navigation:** Dynamic menu based on current module
- **Responsive Sidebar:** Collapses on mobile devices
- **Deep Linking:** Direct access to any page via URL routing
- **Active State Highlighting:** Visual indication of current page

### Header Components
- **User Dropdown:** User profile, settings, logout
- **Theme Toggle:** Light/Dark mode switching
- **Notification System:** Real-time notifications dropdown
- **Logo & Branding:** Consistent branding across all pages

---

## Authentication & Authorization

### Login & Authentication
- **Email/Username Login:** Traditional login with credentials
- **OTP Verification:** Two-factor authentication via OTP
- **Password Management:**
  - Secure password reset using email verification
  - Forgot password workflow
  - Password strength validation
- **Session Management:** Automatic session timeout and refresh tokens

### Permission System
- **Role-Based Access Control (RBAC):** Granular permission management
- **Route Protection:** Protected routes requiring specific permissions
- **Permission Guard:** Component-level permission checks
- **Module-Level Access:** Control which modules users can access
- **Audit Trail:** Track user actions and access logs

---

## Business Modules

### 1. Advance Voucher Management
**Purpose:** Manage voucher issuance, tracking, and redemption

#### Dashboard
- Real-time voucher metrics and analytics
- Total vouchers issued, redeemed, pending status
- Performance charts and graphs
- Quick action buttons for common tasks
- Filter and search capabilities

#### Purchase Order (PO) Management
- Create and manage purchase orders
- Link orders to vouchers
- Track order status (pending, approved, completed)
- Supplier information and contact details
- Price management and cost tracking
- Order history and archival

#### Supplier Management
- Supplier master data
- Contact information and ratings
- Supplier performance metrics
- Communication history
- Supplier-specific pricing and terms
- Active/Inactive supplier toggling

---

### 2. Gear Monitoring System
**Purpose:** Real-time monitoring and tracking of machinery/equipment

#### Location-Based Monitoring
- Multiple location support for distributed operations
- Location hierarchy management (zones → locations → machines)
- Search and filter locations
- Location performance analytics
- Geo-based notifications

#### Machine Management
- Machine categorization and grouping
- Machine health status indicators
- Real-time data updates via custom hooks
- Machine detailed information panels
- Equipment specification tracking
- Historical data archive

#### Live Data Tracking
- Real-time sensor data updates
- Multiple data streams per machine
- Dynamic charts for asset trends
- Alert generation for anomalies
- Data export capabilities

#### Machine Details Panel
- Comprehensive equipment information
- Performance metrics and KPIs
- Maintenance history
- Tabbed interface for organized data:
  - General specifications
  - Performance data
  - Maintenance records
  - Service logs
  - Document uploads

#### Dashboard Features
- Multi-location overview
- Machine status grid
- Performance rankings
- Capacity utilization tracking
- Predictive maintenance indicators

---

### 3. Warehouse Management System
**Purpose:** Complete warehouse operations management

#### Dashboard
- Warehouse utilization overview
- Inventory levels across all locations
- Stock alerts and warnings
- Receiving/Shipping schedules
- Key performance indicators (KPIs)
- Real-time activity feed

#### Warehouse Master Data
- Multiple warehouse locations
- Warehouse capacity management
- Warehouse status and configuration
- Receiving and shipping dock assignment
- Zone and aisle management
- Edit and bulk operations

#### Pallet Management
- Pallet creation and assignment
- Pallet status tracking (in-stock, in-transit, damaged)
- Barcode label printing
- Pallet contents tracking
- Weight and dimension management
- Damage reporting and replacement

#### Rack Management
- Rack layouts and configurations
- Capacity calculations
- Storage location assignment
- Rack condition monitoring
- Maintenance scheduling
- Space optimization recommendations

#### Shelf Management
- Shelf organization within racks
- Bin assignment to shelves
- Weight distribution management
- Shelf condition status
- Utilization tracking
- Safety compliance checks

#### Section Management
- Warehouse section segmentation
- Section type categorization (cold storage, secure, hazmat, etc.)
- Access control per section
- Environmental condition monitoring
- Specialized handling requirements

#### Inventory Tracking
- Real-time inventory levels per location
- Stock movement tracking
- Barcode-based operations
- SKU management
- Lot and batch tracking
- Expiration tracking

---

### 4. Barcode Management System
**Purpose:** Streamlined barcode operations for inventory control

#### Barcode Scanning
- Real-time barcode recognition
- Support for multiple barcode formats (Code128, EAN-13, etc.)
- Mobile device compatibility
- Rapid data entry via scanning
- Automatic validation
- Error detection and correction

#### Barcode Generation
- Dynamic barcode creation for:
  - Pallets
  - Shelves
  - Inventory items
  - Orders
- Batch barcode printing
- Customizable label formats
- QR code generation
- Print directly to thermal printers

#### Barcode Tracking
- Complete barcode movement history
- Audit trail of scans and operations
- Historical data for compliance
- Export scan logs

---

### 5. Order Tracking System
**Purpose:** End-to-end order visibility and management

#### Order Dashboard
- Order status overview (all, pending, processing, shipped, delivered)
- Real-time delivery tracking
- Order metrics and KPIs
- Shipment visualization
- Performance analytics

#### Order Status Management
- Order creation and acceptance
- Fulfillment tracking
- Shipping stage monitoring
- Delivery confirmation
- Return management
- Order cancellation workflow

#### Customer Information
- Customer details integration
- Order history per customer
- Contact information
- Delivery address management
- Preferred shipping methods

#### Analytics & Reporting
- Order delivery time analysis
- Carrier performance metrics
- Geographic delivery patterns
- Seasonal order trends
- Customer satisfaction tracking

---

### 6. Evidence Collection System
**Purpose:** Document and evidence management for operations

#### Evidence Dashboard
- Evidence submission calendar
- Status overview (collected, verified, archived)
- Quick evidence search
- Priority items highlighting

#### Evidence Capture
- Photo/video uploads
- Timestamp and location tagging
- Metadata collection (who, what, when, where)
- Digital signature capture
- Notes and annotations

#### Evidence Management
- Organize by type, location, or date
- Search and filter capabilities
- Archive and retrieval
- Version control for updates
- Compliance documentation

#### PO & Supplier Linking
- Link evidence to purchase orders
- Supplier performance documentation
- Quality assurance records
- Compliance proofs

---

### 7. Master Data Management
**Purpose:** Central configuration and base data

#### Company Master
- Company information
- Branch/Location management
- Department structures
- Cost center assignment
- Financial year configuration
- Tax and compliance settings
- Logo and branding assets

#### Reference Data
- Tax codes and rates
- Unit of measurement standards
- Currency configurations
- Document templates
- System parameters
- Business rules configuration

---

## UI Components & Widgets

### Dialog & Modal Components

#### Alert Messages
- Success, warning, error, info notifications
- Toast notifications with auto-dismiss
- Custom alert styling
- Action buttons in alerts
- Icon and message customization

#### Confirmation Dialogs
- Delete confirmation
- Action confirmation
- Cancel operation dialogs
- Risk acknowledgment dialogs
- Two-step verification dialogs

#### Custom Modals
- Reusable modal framework
- Backdrop blur effect
- Customizable size and positioning
- Header, body, footer sections
- Close and save functionality

#### Signature Dialogs
- Digital signature capture
- Signature preview
- Signature validation
- Save and export options
- Signature verification

#### Signature Image Upload
- Image upload for scanned signatures
- Upload from computer or mobile
- Preview before saving
- Crop and rotate functionality
- Format conversion

---

### Form Components

#### Input Fields
- Text input with validation
- Mobile input (single-field phone)
- Email input with format validation
- Number input with formatting
- Currency input with symbol
- Date and time picker

#### Select Components
- Standard dropdown selection
- Multi-select functionality
- Search within dropdown
- Country select with flags
- Searchable options
- Custom option rendering

#### Switch/Toggle
- Boolean switch input
- Labeled toggle switches
- On/Off state indication
- Form integration
- Disabled state support

#### Rich Text Editor
- Jodit-based WYSIWYG editor
- Text formatting (bold, italic, underline)
- Lists (ordered and unordered)
- Link insertion
- Image embedding
- Code block support
- Character count tracking

#### Form Validation
- Real-time validation feedback
- Error messages per field
- Required field indicators
- Pattern matching validation
- Custom validation rules
- Formik integration
- Yup schema validation

#### Form Helpers
- Auto-save drafts
- Form state management
- Error summary
- Field dependency handling
- Conditional rendering of fields
- Multi-step form support

---

### Data Display & Tables

#### Basic Table
- Sortable columns
- Column filtering
- Pagination
- Row selection (single/multi)
- Responsive design
- Fixed headers

#### Material-UI Data Grid
- Advanced data grid with:
  - Column resizing
  - Advanced sorting (multi-column)
  - Advanced filtering
  - Column visibility toggle
  - Export to CSV
  - Column pinning
  - Row grouping
  - Aggregation functions

#### Table States
- Empty state with message
- No data found state
- Loading state with skeleton
- Error state with retry
- Pagination disabled state

#### Custom Columns
- Action buttons (edit, delete, view)
- Status badges
- Progress indicators
- Custom cell renderers
- Conditional formatting

#### Batch Operations
- Bulk select/deselect
- Batch delete with confirmation
- Bulk status update
- Batch download
- Bulk action progress tracking

---

### Button & Action Components

#### Button Variants
- Primary, secondary, success, danger, warning
- Outlined and filled styles
- Small, medium, large sizes
- Icon-only buttons
- Icon with text buttons
- Disabled state

#### Loading Button
- Shows spinner during async action
- Disabled while loading
- Text changes during loading
- Supports callbacks for completion
- Error state with retry

#### Action Buttons Group
- Assign actions (bulk assignment)
- Related action grouping
- Contextual menu
- Quick action toolbar

---

### User Profile & Settings

#### User Profile Component
- Avatar with initials
- Name and email display
- Current role/department
- Profile edit modal
- Password change dialog
- Session management

#### User Dropdown Menu
- Profile access
- Settings navigation
- Logout functionality
- Theme preferences
- Language selection

---

### Notification System

#### Toast Notifications
- Success notifications
- Error notifications with retry
- Warning alerts
- Info messages
- Auto-dismiss timing
- Custom position
- Stacking multiple notifications

#### Notification Dropdown
- Unread notification count badge
- Notification list with timestamps
- Mark as read/unread
- Clear all notifications
- Notification filtering by type
- Action buttons in notifications

---

### Utility Components

#### Loader/Skeleton
- Page-level loading indicator
- Skeleton loaders for content
- Progressive skeleton loading
- Custom loader styling
- Loading state overlay

#### Backdrop
- Modal backdrop with blur
- Click-to-close functionality
- Customizable opacity
- Multiple backdrop layers

#### Custom Styled Components
- Consistent spacing utilities
- Shadow and depth effects
- Border radius standardization
- Color theme application
- Typography scaling

#### Response Data Renderer
- Generic JSON/object display
- Collapsible nested objects
- Array item rendering
- Type-aware formatting
- Pretty print functionality

---

## Data Management & Forms

### Form Features
- **Formik Integration:** Complete form state management
- **Validation:** Real-time field validation with error messages
- **Multi-Step Forms:** Wizard-style form navigation
- **Conditional Fields:** Show/hide fields based on other values
- **Dynamic Field Arrays:** Add/remove field groups
- **Auto-Save:** Draft auto-save functionality
- **Form Reset:** Clear all fields option
- **File Upload:** Integrated file selection and upload

### Data Import/Export
- **Excel Import:** XLSX file parsing and data mapping
- **CSV Import:** Comma-separated value support
- **Excel Export:** Convert table data to Excel format
- **PDF Export:** Generate PDF reports using jsPDF
- **PDF Tables:** AutoTable plugin for formatted data tables
- **Batch Export:** Multiple records export

### Data Persistence
- **Redux State:** Global state management with Redux Toolkit
- **Local Storage:** Browser-based data caching
- **Session Storage:** Temporary data persistence
- **API Cache:** Smart caching for API responses
- **Offline Mode:** Partial offline functionality

---

## Visual & Charting Features

### Charts & Graphs

#### ApexCharts Integration
- **Chart Types:**
  - Bar charts (horizontal and vertical)
  - Line charts (multi-series)
  - Area charts
  - Pie and donut charts
  - Radial/Gauge charts
  - Column stacked charts
  - Candlestick charts

#### Chart Features
- Interactive tooltips
- Zoom and pan functionality
- Legend with toggleable series
- Real-time data updates
- Custom color schemes
- Export chart as image
- Responsive sizing

#### MUI Charts (X-Charts)
- Advanced charting capabilities
- Scatter plots
- Heat maps
- Professional styling
- Animation support

#### Map Visualization
- **Jvectormap Integration:**
  - World map visualization
  - Heat map overlay
  - Region highlighting
  - Click-to-drill functionality
  - Custom color schemes
  - Tooltip on hover

---

### Color & Theme System

#### Theme Configuration
- **Light Mode:** Professional light theme
- **Dark Mode:** Easy-on-eyes dark theme
- **Theme Switching:** On-the-fly theme change
- **Persistent Theme:** Remembers user preference
- **System Theme:** Auto-detect OS theme preference

#### Color Palette
- Primary colors with variations
- Secondary colors
- Success, warning, error, info colors
- Neutral grays
- Custom color variables
- CSS variable support

#### Typography
- Font family configuration
- Font size scaling
- Font weight variations
- Line height optimization
- Letter spacing control

---

### Layout & Design

#### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Flexbox-based layouts
- Grid-based layouts
- Responsive images
- Touch-friendly controls

#### Animations
- Page transitions
- Component animations
- Framer Motion integration
- Smooth scrolling
- Loading animations
- Hover effects
- CSS animations

#### Layout Options
- **Full Width:** Complete viewport utilization
- **Boxed Layout:** Constrained width with margins
- **Sidebar Layouts:** Side navigation variations
- **Header Variations:** Sticky, floating, or static headers
- **RTL Support:** Right-to-left language support

---

## User Experience Features

### Navigation & Routing
- **React Router Integration:** V7+ with latest features
- **Deep Linking:** Direct URL access to any page
- **Breadcrumb Navigation:** Current location display
- **Back Navigation:** useGoBack hook for smart navigation
- **Nested Routes:** Hierarchical routing structure
- **Dynamic Route Generation:** Module-based routing

### Search & Filter
- **Global Search:** Search across all modules
- **Module Search:** Search within current module
- **Debounced Search:** Optimized search with debouncing
- **Advanced Filters:** Multi-field filtering
- **Filter Presets:** Save and reuse filter combinations
- **Real-time Filtering:** Live filter updates

### Accessibility
- **Keyboard Navigation:** Full keyboard support
- **ARIA Labels:** Proper screen reader support
- **Color Contrast:** WCAG compliance
- **Focus Management:** Proper tab order
- **Alt Text:** Image descriptions

### Performance Features
- **Code Splitting:** Lazy-loaded modules
- **Component Lazy Loading:** On-demand component loading
- **Image Optimization:** Responsive image serving
- **Bundle Analysis:** Vite build optimization
- **Memoization:** React.memo and useMemo optimization
- **Debouncing:** Window-based debouncing for searches

---

## Technical Infrastructure

### Frontend Framework
- **React 19:** Latest React features
- **TypeScript:** Full type safety
- **Vite:** Fast build tool with HMR
- **SASS/SCSS:** Advanced CSS preprocessing

### State Management
- **Redux Toolkit:** Simplified Redux patterns
- **Redux Hooks:** useSelector, useDispatch
- **Local Context:** React Context API
- **Theme Context:** Global theme management
- **Sidebar Context:** Sidebar state management

### UI Libraries
- **Material-UI (MUI):** Professional component library
- **MUI Icons:** Comprehensive icon set
- **MUI Data Grid:** Advanced table component
- **MUI X-Charts:** Business charting
- **MUI X-Date-Pickers:** Date/time selection

### Styling & CSS
- **Tailwind CSS:** Utility-first CSS framework
- **SCSS/SASS:** CSS preprocessing
- **CSS Modules:** Scoped styling
- **Emotion:** CSS-in-JS support (via MUI)
- **Responsive Utilities:** Tailwind breakpoints

### Form Libraries
- **Formik:** Form state management
- **React Hook Form:** Lightweight form handling
- **Yup:** Schema validation
- **React Select:** Advanced select component
- **React Phone Input 2:** Phone number input
- **Flatpickr:** Date picker
- **MUI Date Pickers:** Material design date picking

### Data Processing
- **XLSX:** Excel file processing
- **jsPDF:** PDF document generation
- **jsPDF AutoTable:** PDF table formatting
- **date-fns:** Date manipulation and formatting
- **dayjs:** Lightweight date library
- **Moment.js:** Legacy date library support
- **JSON Viewer:** react18-json-view for data inspection

### Utilities & Helpers
- **React Toastify:** Toast notifications
- **React DnD:** Drag and drop
- **React Router:** Client-side routing
- **React Helmet:** Document head management
- **Immutability Helper:** Immutable updates
- **clsx:** Conditional className utility
- **tailwind-merge:** Tailwind class merging
- **React I18next:** Internationalization support

### Device & Environment
- **Firebase:** Backend services and authentication
- **React DOM 19:** DOM rendering
- **SVG Support:** vite-plugin-svgr for SVG components

### Build & Development
- **ESLint:** Code quality and linting
- **TypeScript Compiler:** Type checking
- **PostCSS:** CSS transformations
- **Tailwind CSS PostCSS:** Tailwind processing
- **Vite Plugins:**
  - React plugin for JSX
  - SVGR for inline SVGs

### Development Tools
- **Hot Module Replacement (HMR):** Instant code updates
- **Source Maps:** Debug-friendly transpiled code
- **Type Checking:** Pre-build TypeScript validation
- **ESLint Configuration:** Enforced code standards

---

## Custom Hooks

### Form Management Hooks
- **useForm():** Complete form handling
- **useAlert():** Alert notification management
- **useConfirmation():** Confirmation dialog control

### UI State Hooks
- **useModal():** Modal dialog management
- **useDialog():** Generic dialog control
- **useToast():** Toast notification system

### Utility Hooks
- **useDebounce():** Debounce values for performance
- **useGoBack():** Smart navigation back functionality

### Feature-Specific Hooks
- **useMachineLiveData():** Gear monitoring live data updates
- **useSidebarSubmenuScroll():** Sidebar submenu scroll handling

---

## Data Types & Models

### Available Types
- Authentication Types (User, Token, Permission)
- Campaign Types
- Common Types (Pagination, Response)
- Date Picker Types
- Permission Types
- Module-specific types (Gear Monitoring, Warehouse, etc.)

---

## API Integration

### Custom Query Setup
- **Base Query Configuration:** Centralized API settings
- **RTK Helper:** Redux Thunk Kit API integration
- **Error Handling:** Standardized error management
- **Request/Response Interceptors:** Middleware for API calls
- **Token Management:** Automatic token refresh
- **API Caching:** Smart cache invalidation

### API Services
- Mock data support for development
- RESTful API integration
- JSON request/response format
- Pagination support
- Filtering and sorting parameters

---

## Utility Functions

### Date/Time Utilities
- `FormatDate()`: Various date formatting options
- `formatDateTime()`: Combined date-time formatting
- Format validation for date inputs

### Text & Name Utilities
- `FormatName()`: Proper name formatting
- String manipulation helpers
- Case conversion functions

### Business Logic Utilities
- `amountToWords()`: Convert numbers to words
- Permission checking helpers
- Grid column configuration

---

## Project Structure

```
src/
├── pages/              # Feature modules
│   ├── AdvanceVoucher/
│   ├── GearMonitoring/
│   ├── Warehouse/
│   ├── OrderTracking/
│   ├── EvidanceCollection/
│   ├── AuthPages/
│   └── master/
├── components/         # Reusable components
├── hooks/             # Custom React hooks
├── context/           # React Context providers
├── redux/             # Redux state management
├── services/          # API and data services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── layout/            # Layout components
├── icons/             # Icon definitions
└── assets/            # Images and static files
```

---

## Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

---

## Dependencies Summary

**Key Dependencies:**
- React & React DOM (v19.0.0)
- Material-UI & Components (v7.3.6+)
- Redux & Redux Toolkit (v2.8.2+)
- React Router (v7.1.5)
- TypeScript (v5.7.2)
- Tailwind CSS (v4.0.8)
- SCSS/Sass (v1.98.0)
- Formik & Yup (Form validation)
- ApexCharts (Charting)
- Firebase (Backend services)
- XLSX (Excel processing)
- jsPDF (PDF generation)
- Date-fns & dayjs (Date handling)
- Framer Motion (Animations)
- React DnD (Drag & drop)

**Development Tools:**
- Vite (Build tool)
- ESLint (Code linting)
- PostCSS (CSS processing)

---

## Version History

- **v2.0.2** - Current release with latest features
- **v2.0.0** - Major version with new module architecture
- **v1.x** - Legacy versions

---

## Support & Documentation

For detailed documentation on specific features, refer to:
- Component documentation in component files
- Hook documentation in hooks directory
- Type definitions in types directory
- Service documentation in services directory

---

**Last Updated:** March 26, 2026  
**Maintained By:** Elecon Development Team
