import React from "react";
import {
  Alert,
  alpha,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { GridColDef, GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { useToast } from "../../../shared/hooks/useToast";
import {
  type AuthenticatorApp,
  useCreateAuthenticatorAppMutation,
  useDeleteAuthenticatorAppMutation,
  useGetAuthenticatorAppsListQuery,
  useGetAuthenticatorOrganizationsQuery,
} from "./api/authenticator";
import { useAuthenticatorSession } from "./useAuthenticatorSession";
import { DEVELOPED_APPS } from "../../../shared/data/developedApps";
import { getAuthenticatorRouteUiPermissions } from "./utils/authenticatorAccess";

const LOCAL_APP_STORAGE_KEY = "authenticator-managed-apps";

type StoredApp = AuthenticatorApp & {
  createdAt?: string;
};

type AppFormState = {
  appId: string;
  appTitle: string;
  appDesc: string;
  appCode: string;
  hrmsId: string;
  frontUrl: string;
  backendUrl: string;
  orgIds: string[];
  isPublic: boolean;
};

type AppGridRow = StoredApp & {
  rowId: string;
  templateId: string;
  databaseStatus: "saved" | "pending";
  databaseStatusLabel: string;
  isSavedInDatabase: boolean;
  sourceType: "static" | "database";
};

const readLocalApps = (): StoredApp[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(LOCAL_APP_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as StoredApp[]) : [];
  } catch (error) {
    console.error("Failed to parse app storage", error);
    window.localStorage.removeItem(LOCAL_APP_STORAGE_KEY);
    return [];
  }
};

const normalizeAppCode = (value?: string) => String(value ?? "").trim().toLowerCase();

const buildManagedAppCode = (appTitle?: string) =>
  String(appTitle ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const mergeApps = (apps: StoredApp[]) => {
  const seen = new Set<string>();

  return apps.filter((app) => {
    const identityKey = normalizeAppCode(app.appCode) || app.appId;

    if (!identityKey || seen.has(identityKey)) {
      return false;
    }

    seen.add(identityKey);
    return true;
  });
};

const createInitialAppForm = (): AppFormState => ({
  appId: "",
  appTitle: "",
  appDesc: "",
  appCode: "",
  hrmsId: "",
  frontUrl: "",
  backendUrl: "",
  orgIds: [],
  isPublic: false,
});

const normalizeOrgIds = (value?: string[] | string) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildTemplateId = (appCode?: string, appTitle?: string) =>
  normalizeAppCode(appCode) || String(appTitle ?? "").trim().toLowerCase();

const buildAppId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `app-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const findMatchingSavedApp = (template: { appTitle?: string; appCode?: string }, apps: StoredApp[]) => {
  const templateAppCode = normalizeAppCode(template.appCode);

  if (!templateAppCode) {
    return null;
  }

  return apps.find((app) => normalizeAppCode(app.appCode) === templateAppCode) || null;
};

const AppCrudPage = () => {
  const { showToast } = useToast();
  const { sessionReady, bootstrapping } = useAuthenticatorSession();
  const [localApps, setLocalApps] = React.useState<StoredApp[]>(() => readLocalApps());
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [form, setForm] = React.useState<AppFormState>(createInitialAppForm);
  const [formError, setFormError] = React.useState("");
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  const {
    data: appsResponse,
    isFetching: isFetchingApplications,
    isLoading: isLoadingApplications,
    refetch: refetchApps,
  } = useGetAuthenticatorAppsListQuery(undefined, {
    skip: !sessionReady,
  });
  const { data: organizationsResponse, isFetching: isFetchingOrganizations } =
    useGetAuthenticatorOrganizationsQuery(undefined, {
      skip: !sessionReady,
    });
  const [createAuthenticatorApp, { isLoading: isSavingApp }] =
    useCreateAuthenticatorAppMutation();
  const [deleteAuthenticatorApp, { isLoading: isDeletingApp }] =
    useDeleteAuthenticatorAppMutation();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_APP_STORAGE_KEY, JSON.stringify(localApps));
    }
  }, [localApps]);

  const organizations = React.useMemo(
    () => organizationsResponse?.data ?? [],
    [organizationsResponse?.data],
  );
  const loadingOrganizations = isFetchingOrganizations;
  const appRoutePermissions = React.useMemo(
    () => getAuthenticatorRouteUiPermissions("/authenticator/apps"),
    [],
  );
  const canCreateApp = appRoutePermissions.create;
  const canUpdateApp = appRoutePermissions.update;
  const canOpenAppDrawer =
    appRoutePermissions.view || appRoutePermissions.update || appRoutePermissions.delete;

  const savedApplications = React.useMemo(
    () => mergeApps([...(appsResponse?.data ?? []), ...localApps]),
    [appsResponse?.data, localApps],
  );

  const applications = React.useMemo<AppGridRow[]>(() => {
    const matchedTemplateIds = new Set<string>();

    const templateRows = DEVELOPED_APPS.map<AppGridRow>((app) => {
      const matchedSavedApp = findMatchingSavedApp(app, savedApplications);
      const templateId = buildTemplateId(app.appCode, app.appTitle);

      matchedTemplateIds.add(templateId);

      return {
        ...(matchedSavedApp ?? {}),
        rowId: matchedSavedApp?.appId || `template-${templateId}`,
        templateId,
        appId: matchedSavedApp?.appId ?? "",
        appTitle: matchedSavedApp?.appTitle || app.appTitle,
        appDesc: matchedSavedApp?.appDesc || app.appDesc,
        appCode: matchedSavedApp?.appCode || app.appCode,
        hrmsId: matchedSavedApp?.hrmsId || "",
        frontUrl: matchedSavedApp?.frontUrl || app.path || "",
        backendUrl: matchedSavedApp?.backendUrl || "",
        orgIds:
          matchedSavedApp?.orgIds ??
          (matchedSavedApp as AuthenticatorApp & { orgId?: string })?.orgId,
        isPublic: matchedSavedApp?.isPublic ?? false,
        createdAt: matchedSavedApp?.createdAt,
        databaseStatus: matchedSavedApp ? "saved" : "pending",
        databaseStatusLabel: matchedSavedApp ? "Saved in table" : "Not saved in table",
        isSavedInDatabase: Boolean(matchedSavedApp?.appId),
        sourceType: "static",
      };
    });

    const extraDatabaseRows = savedApplications
      .filter((app) => {
        const appCode = normalizeAppCode(app.appCode);

        return (
          !appCode ||
          !DEVELOPED_APPS.some((template) => normalizeAppCode(template.appCode) === appCode)
        );
      })
      .map<AppGridRow>((app) => ({
        ...app,
        rowId: app.appId || `database-${buildTemplateId(app.appCode, app.appTitle)}`,
        templateId: buildTemplateId(app.appCode, app.appTitle),
        databaseStatus: "saved",
        databaseStatusLabel: "Saved in table",
        isSavedInDatabase: true,
        sourceType: "database",
      }));

    return [...templateRows, ...extraDatabaseRows].sort((first, second) =>
      (first.appTitle || "").localeCompare(second.appTitle || ""),
    );
  }, [savedApplications]);

  const gridRows = React.useMemo(
    () =>
      applications.map((app) => ({
        ...app,
        organizationNames: normalizeOrgIds(
          app.orgIds ?? (app as AuthenticatorApp & { orgId?: string })?.orgId,
        )
          .map(
            (orgId) =>
              organizations.find((organization) => organization.orgId === orgId)?.orgTitle || orgId,
          )
          .join(", "),
      })),
    [applications, organizations],
  );

  const openEditDrawer = React.useCallback((app: AppGridRow) => {
    setForm({
      appId: app.appId || "",
      appTitle: app.appTitle || "",
      appDesc: app.appDesc || "",
      appCode: app.appCode || "",
      hrmsId: app.hrmsId || "",
      frontUrl: app.frontUrl || "",
      backendUrl: app.backendUrl || "",
      orgIds: normalizeOrgIds(app.orgIds ?? (app as AuthenticatorApp & { orgId?: string })?.orgId),
      isPublic: Boolean(app.isPublic),
    });
    setFormError("");
    setDrawerOpen(true);
  }, []);

  const openCreateDrawer = React.useCallback(() => {
    setForm(createInitialAppForm());
    setFormError("");
    setDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setDrawerOpen(false);
    setFormError("");
  }, []);

  const handleFieldChange =
    (field: keyof AppFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;

      setForm((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const handleTogglePublic = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({
      ...current,
      isPublic: event.target.checked,
    }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const editingAppId = form.appId.trim();
    const isUpdateMode = Boolean(editingAppId);
    const resolvedAppId = editingAppId || buildAppId();
    const appTitle = form.appTitle.trim();
    const appDesc = form.appDesc.trim();
    const appCode = form.appCode.trim() || buildManagedAppCode(form.appTitle);
    const hrmsId = form.hrmsId.trim();
    const frontUrl = form.frontUrl.trim();
    const backendUrl = form.backendUrl.trim();

    if (!appTitle) {
      setFormError("App title is required.");
      return;
    }

    if (!appDesc) {
      setFormError("App description is required.");
      return;
    }

    if (!appCode) {
      setFormError("App code is required.");
      return;
    }

    if (form.orgIds.length === 0) {
      setFormError("At least one organization is required.");
      return;
    }

    setFormError("");

    try {
      const response = await createAuthenticatorApp({
        appId: resolvedAppId,
        appTitle,
        appDesc,
        appCode,
        hrmsId,
        frontUrl,
        backendUrl,
        orgIds: form.orgIds,
        isPublic: form.isPublic,
      }).unwrap();

      const refreshedResult = await refetchApps();
      const refreshedApps = refreshedResult.data?.data ?? [];
      const responseApp = response?.data ?? null;
      const matchedApp =
        refreshedApps.find((app) => editingAppId && app.appId === editingAppId) ||
        refreshedApps.find(
          (app) =>
            normalizeAppCode(app.appCode) === normalizeAppCode(appCode),
        ) ||
        responseApp;

      const savedAppId = matchedApp?.appId || resolvedAppId;

      if (savedAppId) {
        setLocalApps((current) =>
          mergeApps([
            ...current.filter((app) => app.appId !== editingAppId && app.appId !== savedAppId),
            {
              ...(matchedApp ?? {}),
              appId: savedAppId,
              appTitle,
              appDesc,
              appCode,
              hrmsId,
              frontUrl,
              backendUrl,
              orgIds: [...form.orgIds],
              isPublic: form.isPublic,
              createdAt: new Date().toISOString(),
            },
          ]),
        );
      }

      showToast(
        response.message ||
          (isUpdateMode ? "Application updated successfully." : "Application created successfully."),
        "success",
      );
      closeDrawer();
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        `Application ${isUpdateMode ? "update" : "create"} failed.`;
      setFormError(message);
      showToast(message, "error");
    }
  };

  const handleDelete = async () => {
    if (!form.appId) {
      return;
    }

    try {
      const response = await deleteAuthenticatorApp({ appId: form.appId }).unwrap();
      setLocalApps((current) => current.filter((app) => app.appId !== form.appId));
      await refetchApps();
      showToast(response.message || "Application deleted successfully.", "success");
      closeDrawer();
    } catch (error: any) {
      const message = error?.data?.message || error?.message || "Application delete failed.";
      setFormError(message);
      showToast(message, "error");
    }
  };

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: "appTitle",
        headerName: "App Title",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "appCode",
        headerName: "App Code",
        flex: 0.7,
        minWidth: 130,
        valueGetter: (_value, row) => row.appCode || "-",
      },
      {
        field: "hrmsId",
        headerName: "HRMS ID",
        flex: 0.8,
        minWidth: 140,
        valueGetter: (_value, row) => row.hrmsId || "-",
      },
      {
        field: "databaseStatusLabel",
        headerName: "DB Status",
        flex: 0.8,
        minWidth: 170,
        renderCell: (params) => (
          <Chip
            label={params.row.databaseStatusLabel}
            size="small"
            color={params.row.isSavedInDatabase ? "success" : "warning"}
            variant={params.row.isSavedInDatabase ? "filled" : "outlined"}
          />
        ),
      },
      {
        field: "organizationNames",
        headerName: "Organizations",
        flex: 1.2,
        minWidth: 220,
        valueGetter: (_value, row) => row.organizationNames || "-",
      },
      {
        field: "isPublic",
        headerName: "Public",
        flex: 0.6,
        minWidth: 100,
        renderCell: (params) => (
          <Chip
            label={params.value ? "Yes" : "No"}
            size="small"
            color={params.value ? "success" : "default"}
            variant="outlined"
          />
        ),
      },
      {
        field: "appDesc",
        headerName: "Description",
        flex: 1.4,
        minWidth: 260,
      },
    ],
    [],
  );

  const createAppAction = React.useMemo(
    () =>
      canCreateApp ? (
        <Button
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={openCreateDrawer}
          sx={{ borderRadius: 999, whiteSpace: "nowrap", minWidth: "fit-content" }}
        >
          Add App
        </Button>
      ) : null,
    [canCreateApp, openCreateDrawer],
  );

  if (bootstrapping) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Initializing authenticator session...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <ReusableDataGrid
        rows={gridRows}
        columns={columns}
        totalCount={gridRows.length}
        loading={
          isLoadingApplications ||
          isFetchingApplications ||
          isFetchingOrganizations ||
          isSavingApp ||
          isDeletingApp
        }
        uniqueIdField="rowId"
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        title="Application List"
        height="calc(100vh - 120px)"
        permissions={appRoutePermissions}
        searchControls={createAppAction}
        onRowClick={
          canOpenAppDrawer
            ? (row) => openEditDrawer(row as AppGridRow)
            : undefined
        }
        noRowsMessage="No applications available."
      />

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: { xs: 360, sm: 430 },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, pt: 8, pb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {form.appId ? "Update App" : "Create App"}
          </Typography>
 

          <Box component="form" id="app-crud-form" onSubmit={handleSave}>
            <Stack spacing={2}>
              {formError && <Alert severity="warning">{formError}</Alert>}

              <TextField
                label="App Title"
                value={form.appTitle}
                onChange={handleFieldChange("appTitle")}
                fullWidth
              />

              <TextField
                label="Description"
                value={form.appDesc}
                onChange={handleFieldChange("appDesc")}
                fullWidth
              />

              <TextField
                label="HRMS ID"
                value={form.hrmsId}
                onChange={handleFieldChange("hrmsId")}
                fullWidth
              />

              <TextField
                label="Front URL"
                value={form.frontUrl}
                onChange={handleFieldChange("frontUrl")}
                fullWidth
                placeholder="https://frontend.example.com"
              />

              <TextField
                label="Backend URL"
                value={form.backendUrl}
                onChange={handleFieldChange("backendUrl")}
                fullWidth
                placeholder="https://api.example.com"
              />

              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  Organizations
                </Typography>
                <Box
                  sx={{
                    minHeight: 180,
                    maxHeight: 240,
                    overflowY: "auto",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha("#F8FAFC", 0.65),
                    px: 1,
                    py: 0.75,
                  }}
                >
                  {organizations.length > 0 ? (
                    <Stack spacing={0.25}>
                      {organizations.map((organization) => {
                        const checked = form.orgIds.includes(organization.orgId);

                        return (
                          <FormControlLabel
                            key={organization.orgId}
                            control={
                              <Checkbox
                                checked={checked}
                                onChange={(event) =>
                                  setForm((current) => ({
                                    ...current,
                                    orgIds: event.target.checked
                                      ? [...current.orgIds, organization.orgId]
                                      : current.orgIds.filter(
                                          (orgId) => orgId !== organization.orgId,
                                        ),
                                  }))
                                }
                              />
                            }
                            label={organization.orgTitle}
                            sx={{
                              mx: 0,
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 1.5,
                              alignItems: "center",
                              "& .MuiFormControlLabel-label": {
                                display: "flex",
                                alignItems: "center",
                                minHeight: 24,
                              },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box sx={{ p: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {loadingOrganizations
                          ? "Organizations loading..."
                          : "No organizations found."}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <FormControlLabel
                control={<Switch checked={form.isPublic} onChange={handleTogglePublic} />}
                label="Public application for all Elecon companies users"
              />
            </Stack>
          </Box>
        </Box>

        <Divider />
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            bgcolor: "background.paper",
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1.2}>
            {((form.appId && canUpdateApp) || (!form.appId && canCreateApp)) && (
              <Button
                type="submit"
                form="app-crud-form"
                variant="contained"
                disabled={isSavingApp}
                sx={{ borderRadius: 999 }}
              >
                {isSavingApp
                  ? form.appId
                    ? "Updating..."
                    : "Creating..."
                  : form.appId
                    ? "Update App"
                    : "Create App"}
              </Button>
            )}
            <Button variant="outlined" onClick={closeDrawer} sx={{ borderRadius: 999 }}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};

export default AppCrudPage;
