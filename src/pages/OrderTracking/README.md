# Order Tracking Module

This document is a quick onboarding guide for developers working on the Order Tracking module.

## Purpose

The Order Tracking module helps users:

- View stage-wise progress of customer order lines
- Open line-item details and update selected order fields
- Update plan-vs-actual milestone dates
- View a timeline for each stage
- Manage plan configuration records by division (`EP` / `CP`)

## Entry Points

The module is mounted from the main app in two places:

- Dashboard route: `/order-tracking/dashboard`
- Plan configuration route: `/order-tracking/itemplan`
- Timeline route: `/order-tracking/timeline`

Relevant files:

- [App.tsx](../../App.tsx)
- [sidebarNavItems.tsx](../../sidebarNavItems.tsx)
- [store.ts](../../redux/store.ts)

## Folder Structure

```text
src/pages/OrderTracking/
  index.tsx                          -> Main dashboard
  configurationlist.tsx              -> Plan configuration list page
  timeline.tsx                       -> Timeline page + embedded timeline content
  README.md                          -> This file
  Dashboard/
    data.ts                          -> Mock dashboard data
    components/
      viewdetails.tsx                -> Order details modal
      AddEditPlan.tsx                -> Drawer wrapper for plan date edit
      addeditplandate.tsx            -> Plan/actual edit form
      additemplan.tsx                -> Configuration edit form

src/redux/api/ordertracking.ts       -> RTK Query API layer
```

## Screen Overview

### 1. Dashboard

File: [index.tsx](./index.tsx)

This is the primary screen for operational users.

Main responsibilities:

- Builds summary cards for stages like `Design`, `Mfg`, `Assembly`, `Testing`, `Painting`, `Dispatch`
- Shows color-coded status counts
- Renders the main `ReusableDataGrid`
- Opens:
  - `View Details` modal on `Line ID`
  - plan date drawer on actual-date columns
  - timeline modal on stage status indicators

Important internal logic in this file:

- Stage status calculation
- Color mapping for status indicators
- Final approval percentage calculation
- Summary filter interaction

### 2. Plan Configuration

File: [configurationlist.tsx](./configurationlist.tsx)

This screen is for configuration records, grouped by division.

Main responsibilities:

- Loads configuration data for `EP` and `CP`
- Displays records in `ReusableDataGrid`
- Opens the configuration edit form in a modal

### 3. Timeline

File: [timeline.tsx](./timeline.tsx)

This screen is reused in two ways:

- Full route page: `/order-tracking/timeline`
- Embedded modal content from the dashboard

Main responsibilities:

- Builds stage-specific step lists
- Calculates per-step status (`Not Started`, `In Progress`, `Completed`)
- Shows plan date, actual date, and some extra detail lines

## Components

### `viewdetails.tsx`

File: [viewdetails.tsx](./Dashboard/components/viewdetails.tsx)

Purpose:

- Fetch a single order by id
- Display order information in tabs
- Submit updates through `updateOrder`

Tabs:

- `Order Information`
- `Plan vs Actual Dates`

It also computes:

- `delivery_days_frm_po_date`
- `days_in_drawing_approval`
- `perc_time_taken_of_total_po_delivery`
- `on_time_delivery`

### `AddEditPlan.tsx`

File: [AddEditPlan.tsx](./Dashboard/components/AddEditPlan.tsx)

Purpose:

- UI wrapper around the plan-date form
- Opens as a right-side drawer
- Triggers submit using `ApiActionButton`

### `addeditplandate.tsx`

File: [addeditplandate.tsx](./Dashboard/components/addeditplandate.tsx)

Purpose:

- Accepts the clicked field from dashboard columns
- Resolves `planField` and `actualField`
- Updates plan/actual dates for a single order line

### `additemplan.tsx`

File: [additemplan.tsx](./Dashboard/components/additemplan.tsx)

Purpose:

- Loads configuration record by id
- Displays editable fields
- Saves configuration changes using RTK Query

## API Layer

File: [ordertracking.ts](../../redux/api/ordertracking.ts)

The module uses RTK Query through `orderTrackingApi`.

Available hooks:

- `useGetOrdersMutation`
- `useGetOrderByIdMutation`
- `useUpdateOrderMutation`
- `useGetSysConfigurationsMutation`
- `useGetSysConfigurationByIdMutation`
- `useUpdateSysConfigurationsMutation`

Endpoints used:

- `/oracle_trans/GetDataWhere`
- `/oracle_trans/GetById`
- `/oracle_trans/Update`
- `/sys_configurations/Getsys_configurationsWhere`
- `/sys_configurations/Getsys_configurationsById`
- `/sys_configurations/Updatesys_configurations`

## Data Flow

### Dashboard flow

1. `index.tsx` initializes dashboard state
2. `useGetOrdersMutation()` is called
3. Rows are transformed with derived stage statuses
4. `ReusableDataGrid` renders the rows
5. User actions open detail modal, timeline modal, or plan-date drawer

### Order detail flow

1. User clicks `Line ID`
2. `viewdetails.tsx` opens in modal
3. `useGetOrderByIdMutation()` loads fresh data
4. Form is populated
5. `useUpdateOrderMutation()` submits changes

### Configuration flow

1. `configurationlist.tsx` loads EP/CP records
2. User clicks a row
3. `additemplan.tsx` fetches full configuration by id
4. `useUpdateSysConfigurationsMutation()` saves changes

## Status and Color Logic

The dashboard and timeline depend heavily on derived status logic.

Common statuses:

- `Not Started`
- `In Progress`
- `Completed`
- `Completed On Time`
- `Completed Delayed`

These are not coming directly from the API in every case. Many of them are calculated in the UI based on:

- whether plan date exists
- whether actual date exists
- whether actual is before/after plan
- whether numeric metrics exist

If you change stage rules, start from:

- [index.tsx](./index.tsx)
- [timeline.tsx](./timeline.tsx)

## Important Current Caveats

These are important for any developer joining the module:

- The dashboard currently imports mock data from [data.ts](./Dashboard/data.ts)
- The API call exists, but dashboard rendering currently does not fully rely on live API rows
- Some business logic is duplicated across dashboard and timeline files
- The API layer contains hardcoded values like base URL and payload defaults
- Some files still use broad `Record<string, any>` or `any` types

Before making major changes, confirm whether the team wants:

- mock-first dashboard behavior
- API-first dashboard behavior
- stricter domain types
- centralized stage calculation utilities

## Where To Start For Common Tasks

### Change dashboard columns

Start in:

- [index.tsx](./index.tsx)

Look for:

- `processStageColumns`
- `planDateColumns`
- `columns`

### Change timeline steps

Start in:

- [timeline.tsx](./timeline.tsx)

Look for:

- `normalizeStageKey`
- `buildTimelineStage`

### Change order update fields

Start in:

- [viewdetails.tsx](./Dashboard/components/viewdetails.tsx)

Look for:

- `ORDER_INFORMATION_FIELDS`
- `EDITABLE_ORDER_FIELDS`
- `DATE_INPUT_FIELDS`
- submit payload inside `onSubmit`

### Change configuration edit form

Start in:

- [additemplan.tsx](./Dashboard/components/additemplan.tsx)

### Change API payloads or endpoints

Start in:

- [ordertracking.ts](../../redux/api/ordertracking.ts)

## Suggested Refactor Direction

If this module is going to grow, these are the safest next improvements:

1. Replace mock dashboard rows with live API data
2. Move stage/status/color logic into shared utility files
3. Introduce proper domain types for order-tracking rows
4. Move hardcoded API constants to configuration
5. Add module-level tests for status calculations

## Quick Summary

If you are new to this module, begin in this order:

1. Read [index.tsx](./index.tsx)
2. Read [timeline.tsx](./timeline.tsx)
3. Read [ordertracking.ts](../../redux/api/ordertracking.ts)
4. Then inspect the modal components inside `Dashboard/components`

That order gives the fastest understanding of:

- what users see
- how data is derived
- where updates are submitted
- where configuration lives


