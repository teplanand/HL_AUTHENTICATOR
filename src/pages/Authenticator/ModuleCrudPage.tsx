import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridColDef, GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { useToast } from "../../../shared/hooks/useToast";
import {
  type AuthenticatorApp,
  type AuthenticatorManagedModule,
  useDeleteAuthenticatorModuleMutation,
  useGetAuthenticatorAppsListQuery,
  useGetAuthenticatorModulesByAppQuery,
  useSaveAuthenticatorModuleMutation,
} from "./api/authenticator";
import { useAuthenticatorSession } from "./useAuthenticatorSession";
import { DEVELOPED_APPS } from "../../../shared/data/developedApps";
import { moduleRoutes } from "../../../shared/sidebarNavItems";
import { getAuthenticatorRouteUiPermissions } from "./utils/authenticatorAccess";
import { buildAuthenticatorModuleCode } from "./utils/authenticatorModuleCode";
import { getAuthenticatorScopedModuleTitle } from "./utils/authenticatorModuleLabels";

const LOCAL_MODULE_STORAGE_KEY = "authenticator-managed-modules";
const LOCAL_APP_STORAGE_KEY = "authenticator-managed-apps";

type StoredApp = AuthenticatorApp & {
  createdAt?: string;
};

type StoredModule = AuthenticatorManagedModule & {
  createdAt?: string;
};

type ModuleFormState = {
  moduleId: string;
  appId: string;
  moduleTitle: string;
  moduleCode: string;
  moduleDesc: string;
};

type ApplicationFilterOption = StoredApp & {
  rowId: string;
  templateId: string;
  isSavedInDatabase: boolean;
};

type ModuleGridRow = StoredModule & {
  rowId: string;
  templateId: string;
  appTemplateId: string;
  databaseStatus: "saved" | "pending";
  databaseStatusLabel: string;
  isSavedInDatabase: boolean;
  sourceType: "static" | "database";
  routePath?: string;
};

const readLocalRecords = <T,>(storageKey: string): T[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    console.error(`Failed to parse local storage key: ${storageKey}`, error);
    window.localStorage.removeItem(storageKey);
    return [];
  }
};

const normalizeValue = (value?: string | number) => String(value ?? "").trim().toLowerCase();

const normalizeAppCode = (value?: string | number) => String(value ?? "").trim().toLowerCase();

const normalizeLooseValue = (value?: string | number) =>
  normalizeValue(value)
    .replace(/[^a-z0-9]+/g, "")
    .replace(/evidence/g, "evidance")
    .replace(/gearbox/g, "gear");

const buildTemplateId = (...values: Array<string | number | undefined>) =>
  values.map((value) => normalizeValue(value)).find(Boolean) || "";

const buildApplicationTemplateId = (app: { appCode?: string; appTitle?: string }) =>
  buildTemplateId(app.appCode, app.appTitle);

const buildAppAliases = (app: {
  appTitle?: string;
  appCode?: string;
  appDesc?: string;
  frontUrl?: string;
}) => {
  const aliases = new Set<string>();
  const values = [app.appTitle, app.appCode, app.appDesc, app.frontUrl];

  values.forEach((value) => {
    const normalized = normalizeValue(value);
    const loose = normalizeLooseValue(value);

    if (normalized) {
      aliases.add(normalized);
    }

    if (loose) {
      aliases.add(loose);
    }
  });

  return aliases;
};

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

const buildModuleAliases = (
  module: Pick<AuthenticatorManagedModule, "moduleId" | "moduleTitle" | "moduleCode" | "appId">,
  fallbackAppId?: string,
) => {
  const appScope = normalizeValue(module.appId || fallbackAppId || "global");
  const moduleId = normalizeValue(module.moduleId);
  const moduleTitle = normalizeValue(module.moduleTitle);
  const moduleCode = normalizeValue(module.moduleCode);
  const aliases = new Set<string>();

  if (moduleId) {
    aliases.add(`id::${moduleId}`);
  }

  if (moduleTitle) {
    aliases.add(`app-title::${appScope}::${moduleTitle}`);
  }

  if (moduleCode) {
    aliases.add(`app-code::${appScope}::${moduleCode}`);
  }

  return aliases;
};

const mergeModules = (modules: StoredModule[], fallbackAppId?: string) => {
  const seen = new Set<string>();

  return modules.filter((module) => {
    const aliases = Array.from(buildModuleAliases(module, fallbackAppId));

    if (aliases.some((alias) => seen.has(alias))) {
      return false;
    }

    aliases.forEach((alias) => seen.add(alias));
    return true;
  });
};

const createInitialModuleForm = (appId = ""): ModuleFormState => ({
  moduleId: "",
  appId,
  moduleTitle: "",
  moduleCode: "",
  moduleDesc: "",
});

const findMatchingSavedApp = (
  template: { appTitle?: string; appCode?: string; appDesc?: string; frontUrl?: string },
  apps: StoredApp[],
) => {
  const templateAppCode = normalizeAppCode(template.appCode);

  if (!templateAppCode) {
    return null;
  }

  return apps.find((app) => normalizeAppCode(app.appCode) === templateAppCode) || null;
};

const findRouteConfigForApp = (app: {
  appCode?: string;
  appTitle?: string;
  appDesc?: string;
  frontUrl?: string;
}) => {
  const routeCandidates = [
    normalizeValue(app.appCode),
    normalizeValue(app.appTitle),
    normalizeValue(app.frontUrl),
    normalizeLooseValue(app.appCode),
    normalizeLooseValue(app.appTitle),
    normalizeLooseValue(app.frontUrl),
  ].filter(Boolean);

  return (
    moduleRoutes.find(
      (route) => {
        const moduleValue = normalizeValue(route.module);
        const looseModuleValue = normalizeLooseValue(route.module);

        return routeCandidates.some(
          (candidate) =>
            candidate === moduleValue ||
            candidate === looseModuleValue ||
            candidate.includes(moduleValue) ||
            moduleValue.includes(candidate) ||
            candidate.includes(looseModuleValue) ||
            looseModuleValue.includes(candidate),
        );
      },
    ) ||
    null
  );
};

const buildStaticModulesForApp = (application: ApplicationFilterOption): ModuleGridRow[] => {
  const routeConfig = findRouteConfigForApp(application);

  if (!routeConfig) {
    return [];
  }

  return routeConfig.children.map<ModuleGridRow>((child) => {
    const routePath = `/${routeConfig.module}${child.path}`;
    const moduleTitle = getAuthenticatorScopedModuleTitle({
      appCode: application.appCode,
      appTitle: application.appTitle,
      frontUrl: application.frontUrl,
      moduleCode: child.moduleCode,
      moduleTitle: child.name,
      route: routePath,
    });
    const moduleCode = buildAuthenticatorModuleCode({
      appCode: application.appCode,
      appTitle: application.appTitle,
      moduleCode:
        (child.moduleCode || "")
          .trim()
          .toUpperCase() ||
        child.path
          .replace(/^\/+/, "")
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_+|_+$/g, "")
          .toUpperCase() ||
        child.name.replace(/[^a-z0-9]+/gi, "_").toUpperCase(),
      moduleTitle,
    });

    return {
      rowId: `template-${application.templateId}-${moduleCode}`,
      templateId: buildTemplateId(application.templateId, moduleCode, moduleTitle),
      appTemplateId: application.templateId,
      appId: application.appId || "",
      moduleId: "",
      moduleTitle,
      moduleCode,
      moduleDesc: `${moduleTitle} module for ${application.appTitle}.`,
      routePath,
      databaseStatus: "pending",
      databaseStatusLabel: "Not saved in table",
      isSavedInDatabase: false,
      sourceType: "static",
    };
  });
};

const findMatchingSavedModule = (
  template: ModuleGridRow,
  modules: StoredModule[],
  appId?: string,
) => {
  const normalizedCode = normalizeValue(template.moduleCode);
  const normalizedTitle = normalizeValue(template.moduleTitle);

  return (
    modules.find(
      (module) =>
        (!appId || module.appId === appId) &&
        normalizedCode &&
        normalizeValue(module.moduleCode) === normalizedCode,
    ) ||
    modules.find(
      (module) =>
        (!appId || module.appId === appId) &&
        normalizedTitle &&
        normalizeValue(module.moduleTitle) === normalizedTitle,
    ) ||
    null
  );
};

const ModuleCrudPage = () => {
  const { showToast } = useToast();
  const { sessionReady, bootstrapping } = useAuthenticatorSession();
  const [selectedAppKey, setSelectedAppKey] = React.useState("");
  const [localModules, setLocalModules] = React.useState<StoredModule[]>(() =>
    readLocalRecords<StoredModule>(LOCAL_MODULE_STORAGE_KEY),
  );
  const [localApps] = React.useState<StoredApp[]>(() =>
    readLocalRecords<StoredApp>(LOCAL_APP_STORAGE_KEY),
  );
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [form, setForm] = React.useState<ModuleFormState>(() => createInitialModuleForm());
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

  const { data: appsResponse } = useGetAuthenticatorAppsListQuery(undefined, {
    skip: !sessionReady,
  });

  const savedApplications = React.useMemo(
    () => mergeApps([...(appsResponse?.data ?? []), ...localApps]),
    [appsResponse?.data, localApps],
  );

  const applications = React.useMemo<ApplicationFilterOption[]>(() => {
    const matchedSavedAppIds = new Set<string>();

    const mappedSavedApplications = DEVELOPED_APPS.flatMap<ApplicationFilterOption>((app) => {
      const matchedSavedApp = findMatchingSavedApp(
        {
          ...app,
          frontUrl: app.path,
        },
        savedApplications,
      );

      if (!matchedSavedApp?.appId) {
        return [];
      }

      matchedSavedAppIds.add(matchedSavedApp.appId);

      return [
        {
          ...matchedSavedApp,
          rowId: matchedSavedApp.appId,
          templateId: buildApplicationTemplateId({
            appCode: matchedSavedApp.appCode || app.appCode,
            appTitle: matchedSavedApp.appTitle || app.appTitle,
          }),
          appTitle: matchedSavedApp.appTitle || app.appTitle,
          appDesc: matchedSavedApp.appDesc || app.appDesc,
          appCode: matchedSavedApp.appCode || app.appCode,
          frontUrl: matchedSavedApp.frontUrl || app.path,
          isSavedInDatabase: true,
        },
      ];
    });

    const extraSavedApplications = savedApplications
      .filter((app) => app.appId && !matchedSavedAppIds.has(app.appId))
      .map<ApplicationFilterOption>((app) => ({
        ...app,
        rowId: app.appId,
        templateId: buildApplicationTemplateId(app),
        isSavedInDatabase: true,
      }));

    return [...mappedSavedApplications, ...extraSavedApplications].sort((first, second) =>
      (first.appTitle || "").localeCompare(second.appTitle || ""),
    );
  }, [savedApplications]);

  const selectedApplication = React.useMemo(
    () => applications.find((app) => app.templateId === selectedAppKey) ?? null,
    [applications, selectedAppKey],
  );

  React.useEffect(() => {
    if (applications.length === 0) {
      if (selectedAppKey) {
        setSelectedAppKey("");
      }
      return;
    }

    if (!applications.some((app) => app.templateId === selectedAppKey)) {
      setSelectedAppKey(applications[0].templateId);
    }
  }, [applications, selectedAppKey]);

  const selectedSavedAppId = selectedApplication?.appId || "";

  const {
    data: modulesResponse,
    isFetching: isFetchingModules,
    isLoading: isLoadingModules,
    refetch: refetchModules,
  } = useGetAuthenticatorModulesByAppQuery(selectedSavedAppId, {
    skip: !sessionReady || !selectedSavedAppId,
  });

  const [saveAuthenticatorModule, { isLoading: isSavingModule }] =
    useSaveAuthenticatorModuleMutation();
  const [deleteAuthenticatorModule, { isLoading: isDeletingModule }] =
    useDeleteAuthenticatorModuleMutation();
  const moduleRoutePermissions = React.useMemo(
    () => getAuthenticatorRouteUiPermissions("/authenticator/modules"),
    [],
  );
  const canCreateModule = moduleRoutePermissions.create;
  const canUpdateModule = moduleRoutePermissions.update;
  const canDeleteModule = moduleRoutePermissions.delete;
  const canOpenModuleDrawer = canUpdateModule || canDeleteModule || moduleRoutePermissions.view;

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_MODULE_STORAGE_KEY, JSON.stringify(localModules));
    }
  }, [localModules]);

  React.useEffect(() => {
    if (!drawerOpen || !selectedApplication) {
      return;
    }

    if (form.appId === selectedApplication.appId) {
      return;
    }

    setForm((current) => ({
      ...current,
      appId: selectedApplication.appId || "",
    }));
  }, [drawerOpen, form.appId, selectedApplication]);

  const remoteModules = React.useMemo(
    () => modulesResponse?.data ?? [],
    [modulesResponse?.data],
  );

  const savedModulesForSelectedApp = React.useMemo(
    () =>
      mergeModules(
        [
          ...remoteModules,
          ...localModules.filter(
            (module) => module.appId === selectedSavedAppId || (!selectedSavedAppId && !module.appId),
          ),
        ],
        selectedSavedAppId,
      ),
    [localModules, remoteModules, selectedSavedAppId],
  );

  const modules = React.useMemo<ModuleGridRow[]>(() => {
    if (!selectedApplication) {
      return [];
    }

    const staticModules = buildStaticModulesForApp(selectedApplication);
    const matchedTemplateIds = new Set<string>();

    const templateRows = staticModules.map<ModuleGridRow>((template) => {
      const matchedSavedModule = findMatchingSavedModule(
        template,
        savedModulesForSelectedApp,
        selectedSavedAppId,
      );

      matchedTemplateIds.add(template.templateId);

      const resolvedModuleTitle = getAuthenticatorScopedModuleTitle({
        appCode: selectedApplication.appCode,
        appTitle: selectedApplication.appTitle,
        frontUrl: selectedApplication.frontUrl,
        moduleCode: matchedSavedModule?.moduleCode || template.moduleCode,
        moduleTitle: matchedSavedModule?.moduleTitle || template.moduleTitle,
        route: template.routePath,
      });

      return {
        ...(matchedSavedModule ?? {}),
        rowId:
          String(matchedSavedModule?.moduleId ?? "").trim() || template.rowId,
        templateId: template.templateId,
        appTemplateId: selectedApplication.templateId,
        appId: matchedSavedModule?.appId || selectedSavedAppId,
        moduleId: String(matchedSavedModule?.moduleId ?? ""),
        moduleTitle: resolvedModuleTitle,
        moduleCode: matchedSavedModule?.moduleCode || template.moduleCode,
        moduleDesc:
          matchedSavedModule?.moduleDesc ||
          `${resolvedModuleTitle} module for ${selectedApplication.appTitle}.`,
        routePath: template.routePath,
        createdAt: matchedSavedModule && "createdAt" in matchedSavedModule
          ? (matchedSavedModule as StoredModule).createdAt
          : undefined,
        databaseStatus: matchedSavedModule ? "saved" : "pending",
        databaseStatusLabel: matchedSavedModule ? "Saved in table" : "Not saved in table",
        isSavedInDatabase: Boolean(matchedSavedModule?.moduleId),
        sourceType: "static",
      };
    });

    const extraDatabaseRows = savedModulesForSelectedApp
      .filter(
        (module) =>
          !templateRows.some(
            (row) =>
              normalizeValue(row.moduleCode) === normalizeValue(module.moduleCode) ||
              normalizeValue(row.moduleTitle) === normalizeValue(module.moduleTitle),
          ),
      )
      .map<ModuleGridRow>((module) => ({
        ...module,
        rowId: String(module.moduleId ?? buildTemplateId(module.appId, module.moduleCode)),
        templateId: buildTemplateId(
          selectedApplication.templateId,
          module.moduleCode,
          getAuthenticatorScopedModuleTitle({
            appCode: selectedApplication.appCode,
            appTitle: selectedApplication.appTitle,
            frontUrl: selectedApplication.frontUrl,
            moduleCode: module.moduleCode,
            moduleTitle: module.moduleTitle,
          }),
        ),
        appTemplateId: selectedApplication.templateId,
        moduleId: String(module.moduleId ?? ""),
        moduleTitle: getAuthenticatorScopedModuleTitle({
          appCode: selectedApplication.appCode,
          appTitle: selectedApplication.appTitle,
          frontUrl: selectedApplication.frontUrl,
          moduleCode: module.moduleCode,
          moduleTitle: module.moduleTitle,
        }),
        databaseStatus: "saved",
        databaseStatusLabel: "Saved in table",
        isSavedInDatabase: true,
        sourceType: "database",
      }));

    return [...templateRows, ...extraDatabaseRows].sort((first, second) =>
      (first.moduleTitle || "").localeCompare(second.moduleTitle || ""),
    );
  }, [savedModulesForSelectedApp, selectedApplication, selectedSavedAppId]);

  const selectedApplicationTitle = selectedApplication?.appTitle || "";
  const selectedApplicationCode = selectedApplication?.appCode || "";

  const openEditDrawer = React.useCallback((module: ModuleGridRow) => {
    setForm({
      moduleId: String(module.moduleId ?? ""),
      appId: module.appId || selectedSavedAppId,
      moduleTitle: module.moduleTitle || "",
      moduleCode: module.moduleCode || "",
      moduleDesc: module.moduleDesc || "",
    });
    setFormError("");
    setDrawerOpen(true);
  }, [selectedSavedAppId]);

  const openCreateDrawer = React.useCallback(() => {
    setForm(createInitialModuleForm(selectedSavedAppId));
    setFormError("");
    setDrawerOpen(true);
  }, [selectedSavedAppId]);

  const closeDrawer = React.useCallback(() => {
    setDrawerOpen(false);
    setFormError("");
  }, []);

  const handleFieldChange =
    (field: keyof ModuleFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;

      setForm((current) => ({
        ...current,
        [field]:
          field === "moduleCode"
            ? buildAuthenticatorModuleCode({
                appCode: selectedApplicationCode,
                appTitle: selectedApplicationTitle,
                moduleCode: value,
                moduleTitle: current.moduleTitle,
              })
            : value,
      }));
    };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const appId = form.appId || selectedSavedAppId;
    const moduleId = form.moduleId.trim();
    const moduleTitle = form.moduleTitle.trim();
    const moduleCode = buildAuthenticatorModuleCode({
      appCode: selectedApplicationCode,
      appTitle: selectedApplicationTitle,
      moduleCode: form.moduleCode,
      moduleTitle,
    });
    const moduleDesc = form.moduleDesc.trim();

    if (!appId) {
      setFormError("The selected application is not saved in the database yet. Please save the app first.");
      return;
    }

    if (!moduleTitle) {
      setFormError("Module title is required.");
      return;
    }

    if (!moduleCode) {
      setFormError("Module code is required.");
      return;
    }

    if (!moduleDesc) {
      setFormError("Module description is required.");
      return;
    }

    setFormError("");

    try {
      const response = await saveAuthenticatorModule({
        ...(moduleId ? { moduleId } : {}),
        appId,
        moduleTitle,
        moduleCode,
        moduleDesc,
      }).unwrap();

      const refreshedResult = await refetchModules();
      const refreshedModules = refreshedResult.data?.data ?? [];
      const matchedModule =
        refreshedModules.find((module) => String(module.moduleId ?? "") === moduleId) ||
        refreshedModules.find(
          (module) =>
            normalizeValue(module.moduleCode) === normalizeValue(moduleCode) ||
            normalizeValue(module.moduleTitle) === normalizeValue(moduleTitle),
        ) ||
        response.data ||
        null;
      const resolvedModuleId = String(matchedModule?.moduleId ?? moduleId ?? "");

      if (resolvedModuleId) {
        setLocalModules((current) =>
          mergeModules(
            [
              ...current.filter(
                (module) =>
                  !(
                    module.appId === appId &&
                    String(module.moduleId ?? "") === resolvedModuleId
                  ),
              ),
              {
                ...(matchedModule ?? {}),
                moduleId: resolvedModuleId,
                appId,
                moduleTitle,
                moduleCode,
                moduleDesc,
                createdAt: new Date().toISOString(),
              },
            ],
            appId,
          ),
        );
      }

      showToast(
        response.message ||
          (moduleId ? "Module updated successfully." : "Module created successfully."),
        "success",
      );
      closeDrawer();
    } catch (error: any) {
      const message = error?.data?.message || error?.message || "Module save failed.";
      setFormError(message);
      showToast(message, "error");
    }
  };

  const handleDelete = async () => {
    if (!form.moduleId || !form.appId) {
      return;
    }

    try {
      const response = await deleteAuthenticatorModule({
        appId: form.appId,
        moduleId: form.moduleId,
      }).unwrap();
      setLocalModules((current) =>
        current.filter(
          (module) =>
            !(module.appId === form.appId && String(module.moduleId ?? "") === form.moduleId),
        ),
      );
      await refetchModules();
      showToast(response.message || "Module deleted successfully.", "success");
      closeDrawer();
    } catch (error: any) {
      const message = error?.data?.message || error?.message || "Module delete failed.";
      setFormError(message);
      showToast(message, "error");
    }
  };

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: "moduleTitle",
        headerName: "Module Title",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "moduleCode",
        headerName: "Module Code",
        flex: 0.8,
        minWidth: 140,
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
        field: "routePath",
        headerName: "Route Path",
        flex: 1,
        minWidth: 220,
        valueGetter: (_value, row) => row.routePath || "-",
      },
      {
        field: "moduleDesc",
        headerName: "Description",
        flex: 1.4,
        minWidth: 260,
      },
    ],
    [],
  );

  const appFilterControl = (
    <TextField
      select
      label="Application"
      value={selectedAppKey}
      onChange={(event) => setSelectedAppKey(event.target.value)}
      size="small"
      sx={{ minWidth: { xs: "100%", sm: 260 } }}
      disabled={applications.length === 0}
    >
      {applications.map((app) => (
        <MenuItem key={app.rowId} value={app.templateId}>
          {app.appTitle}
        </MenuItem>
      ))}
    </TextField>
  );

  const createModuleAction = React.useMemo(
    () =>
      canCreateModule ? (
        <Button
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={openCreateDrawer}
          disabled={!selectedSavedAppId}
          sx={{ borderRadius: 999, whiteSpace: "nowrap", minWidth: "fit-content" }}
        >
          Add Module
        </Button>
      ) : null,
    [canCreateModule, openCreateDrawer, selectedSavedAppId],
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
        rows={modules}
        columns={columns}
        totalCount={modules.length}
        loading={isLoadingModules || isFetchingModules || isSavingModule || isDeletingModule}
        uniqueIdField="rowId"
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        title="Module List"
        height="calc(100vh - 120px)"
        headerControls={appFilterControl}
        searchControls={createModuleAction}
        permissions={moduleRoutePermissions}
        onRowClick={
          canOpenModuleDrawer
            ? (row) => openEditDrawer(row as ModuleGridRow)
            : undefined
        }
        noRowsMessage="No modules are available for the selected application."
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
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, pt: 10, pb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {form.moduleId ? "Update Module" : "Create Module"}
          </Typography>
          

          <Box component="form" id="module-crud-form" onSubmit={handleSave}>
            <Stack spacing={2}>
              {formError && <Alert severity="warning">{formError}</Alert>}

              <TextField
                label="Application"
                value={selectedApplicationTitle}
                InputProps={{ readOnly: true }}
                fullWidth
              />

              <TextField
                label="Module Title"
                value={form.moduleTitle}
                onChange={handleFieldChange("moduleTitle")}
                fullWidth
              />

              <TextField
                label="Module Code"
                value={form.moduleCode}
                onChange={handleFieldChange("moduleCode")}
                fullWidth
              />

              <TextField
                label="Description"
                value={form.moduleDesc}
                onChange={handleFieldChange("moduleDesc")}
                fullWidth
                multiline
                minRows={4}
              />

              {form.moduleId && canDeleteModule && (
                <Box sx={{ pt: 1 }}>
                  <Tooltip title="Delete Module">
                    <IconButton
                      color="error"
                      onClick={() => void handleDelete()}
                      disabled={isDeletingModule}
                      sx={{
                        border: "1px solid",
                        borderColor: "error.main",
                        borderRadius: 2,
                      }}
                    >
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
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
            {((form.moduleId && canUpdateModule) || (!form.moduleId && canCreateModule)) && (
              <Button
                type="submit"
                form="module-crud-form"
                variant="contained"
                disabled={isSavingModule || !selectedSavedAppId}
                sx={{ borderRadius: 999 }}
              >
                {isSavingModule
                  ? form.moduleId
                    ? "Updating..."
                    : "Creating..."
                  : form.moduleId
                    ? "Update Module"
                    : "Create Module"}
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

export default ModuleCrudPage;
