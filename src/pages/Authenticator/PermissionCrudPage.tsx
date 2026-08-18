import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Drawer,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useToast } from "../../../shared/hooks/useToast";
import {
  type AuthenticatorApp,
  type AuthenticatorManagedModule,
  type AuthenticatorPermission,
  type SaveAuthenticatorPermissionMatrixPayload,
  useCreateAuthenticatorModuleMutation,
  useGetAuthenticatorAppsListQuery,
  useGetAuthenticatorModulesByAppQuery,
  useGetAuthenticatorPermissionsByAppQuery,
  useSaveAuthenticatorPermissionMatrixMutation,
} from "./api/authenticator";
import { moduleRoutes } from "../../../shared/sidebarNavItems";
import { useAuthenticatorSession } from "./useAuthenticatorSession";
import {
  getAuthenticatorRouteUiPermissions,
} from "./utils/authenticatorAccess";
import { buildAuthenticatorModuleCode } from "./utils/authenticatorModuleCode";
import { getAuthenticatorScopedModuleTitle } from "./utils/authenticatorModuleLabels";
import { buildAuthenticatorDropdownApps } from "./utils/authenticatorManagedApps";

const MATRIX_ACTION_ORDER = [
  "view",
  "create",
  "update",
  "delete",
  "download",
  "approve",
  "assign",
] as const;

const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Add",
  update: "Update",
  delete: "Delete",
  download: "Download",
  approve: "Approve",
  assign: "Assign",
};

const cardSurface = {
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

const createInitialModuleForm = () => ({
  moduleTitle: "",
  moduleDesc: "",
});

const normalizeValue = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();

const normalizeLooseValue = (value?: string | number | null) =>
  normalizeValue(value)
    .replace(/[^a-z0-9]+/g, "")
    .replace(/evidence/g, "evidance")
    .replace(/gearbox/g, "gear");

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

const coerceBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (!normalizedValue) {
      return false;
    }

    if (["false", "0", "no", "n", "off", "null", "undefined"].includes(normalizedValue)) {
      return false;
    }

    if (["true", "1", "yes", "y", "on"].includes(normalizedValue)) {
      return true;
    }
  }

  return Boolean(value);
};

const getPermissionStorageKey = (module: AuthenticatorManagedModule, action: string) =>
  `${String(module.moduleId ?? module.moduleCode ?? module.moduleTitle).trim()}::${normalizeValue(action)}`;

const normalizePermissionActionKey = (action: string) => {
  const normalizedAction = normalizeValue(action);

  if (normalizedAction === "add") {
    return "create";
  }

  if (normalizedAction === "edit") {
    return "update";
  }

  return normalizedAction;
};

const inferModuleTitleFromPermission = (permission: AuthenticatorPermission) => {
  const suffixPattern = new RegExp(
    `\\s+(${Object.values(ACTION_LABELS).join("|")})$`,
    "i",
  );

  return (
    String(permission.permissionName ?? "")
      .replace(suffixPattern, "")
      .trim() ||
    String(permission.moduleCode ?? permission.moduleId ?? "Module").trim()
  );
};

type ModulePermissionRow = {
  module: AuthenticatorManagedModule;
  moduleKey: string;
  moduleLabel: string;
  permissionsByAction: Partial<Record<string, boolean>>;
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
    moduleRoutes.find((route) => {
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
    }) ?? null
  );
};

const resolveModuleRouteForApp = (
  app: AuthenticatorApp | null,
  module: AuthenticatorManagedModule,
) => {
  if (!app) {
    return "";
  }

  const routeConfig = findRouteConfigForApp(app);
  if (!routeConfig) {
    return "";
  }

  const targetChild = routeConfig.children.find((child) => {
    const childModuleCode = normalizeValue(child.moduleCode);
    const childPath = normalizeValue(child.path);
    const childName = normalizeValue(child.name);
    const moduleCode = normalizeValue(module.moduleCode);
    const moduleTitle = normalizeValue(module.moduleTitle);

    return (
      (moduleCode && childModuleCode === moduleCode) ||
      (moduleTitle && childName === moduleTitle) ||
      (moduleCode && childPath.includes(moduleCode.toLowerCase()))
    );
  });

  return targetChild ? `/${routeConfig.module}${targetChild.path}` : "";
};

const buildPermissionAccessPayload = ({
  app,
  moduleRows,
  draftSelection,
}: {
  app: AuthenticatorApp;
  moduleRows: ModulePermissionRow[];
  draftSelection: Record<string, boolean>;
}): SaveAuthenticatorPermissionMatrixPayload => ({
  appId: app.appId,
  appTitle: app.appTitle || app.appId,
  modules: moduleRows.map((row) => ({
    permissionId: "",
    moduleId: String(row.module.moduleId ?? "").trim(),
    moduleCode: String(row.module.moduleCode ?? "").trim() || undefined,
    moduleTitle: getAuthenticatorScopedModuleTitle({
      appCode: app.appCode,
      appTitle: app.appTitle,
      frontUrl: app.frontUrl,
      moduleCode: row.module.moduleCode,
      moduleTitle: row.module.moduleTitle ?? row.module.moduleCode ?? "Module",
      route: resolveModuleRouteForApp(app, row.module),
    }),
    route: resolveModuleRouteForApp(app, row.module),
    permissions: Object.fromEntries(
      MATRIX_ACTION_ORDER.map((action) => [
        normalizePermissionActionKey(action),
        Boolean(draftSelection[getPermissionStorageKey(row.module, action)]),
      ]),
    ),
  })),
});

const buildRemotePermissionLookup = (permissions: AuthenticatorPermission[]) => {
  const lookup = new Map<string, Record<string, boolean>>();

  permissions.forEach((permission) => {
    const aliases = [
      `id:${normalizeValue(permission.moduleId)}`,
      `code:${normalizeValue(permission.moduleCode)}`,
      `title:${normalizeValue(permission.moduleTitle)}`,
      `title:${normalizeValue(inferModuleTitleFromPermission(permission))}`,
    ].filter((alias) => !alias.endsWith(":"));

    if (aliases.length === 0) {
      return;
    }

    const actionKey = normalizePermissionActionKey(permission.action);

    aliases.forEach((alias) => {
      const current = lookup.get(alias) ?? {};
      current[actionKey] = coerceBoolean(permission.isActive);
      lookup.set(alias, current);
    });
  });

  return lookup;
};

const PermissionCrudPage = () => {
  const { showToast } = useToast();
  const { sessionReady, bootstrapping, autoLoginError } = useAuthenticatorSession();
  const [selectedAppId, setSelectedAppId] = React.useState("");
  const [moduleDrawerOpen, setModuleDrawerOpen] = React.useState(false);
  const [moduleForm, setModuleForm] = React.useState(createInitialModuleForm);
  const [moduleFormError, setModuleFormError] = React.useState("");
  const [draftSelection, setDraftSelection] = React.useState<Record<string, boolean>>({});

  const { data: appsResponse, isFetching: isFetchingApplications } =
    useGetAuthenticatorAppsListQuery(undefined, {
      skip: !sessionReady,
    });
  const {
    data: modulesResponse,
    isFetching: isFetchingModules,
    isLoading: isLoadingModules,
    refetch: refetchModules,
  } = useGetAuthenticatorModulesByAppQuery(selectedAppId, {
    skip: !sessionReady || !selectedAppId,
    refetchOnMountOrArgChange: true,
  });
  const {
    data: permissionsResponse,
    isFetching: isFetchingPermissions,
    isLoading: isLoadingPermissions,
    refetch: refetchPermissions,
  } = useGetAuthenticatorPermissionsByAppQuery(selectedAppId, {
    skip: !sessionReady || !selectedAppId,
    refetchOnMountOrArgChange: true,
  });
  const [createAuthenticatorModule, { isLoading: isCreatingModule }] =
    useCreateAuthenticatorModuleMutation();
  const [saveAuthenticatorPermissionMatrix, { isLoading: isSavingDraft }] =
    useSaveAuthenticatorPermissionMatrixMutation();
  const permissionRoutePermissions = React.useMemo(
    () => getAuthenticatorRouteUiPermissions("/authenticator/permissions"),
    [],
  );
  const moduleRoutePermissions = React.useMemo(
    () => getAuthenticatorRouteUiPermissions("/authenticator/modules"),
    [],
  );
  const canEditPermissionMatrix =
    permissionRoutePermissions.create || permissionRoutePermissions.update;
  const canCreateModule = moduleRoutePermissions.create;

  const applications = React.useMemo(
    () => buildAuthenticatorDropdownApps(appsResponse?.data ?? []),
    [appsResponse?.data],
  );

  React.useEffect(() => {
    if (applications.length === 0) {
      if (selectedAppId) {
        setSelectedAppId("");
      }
      return;
    }

    if (!applications.some((app) => app.appId === selectedAppId)) {
      setSelectedAppId(applications[0].appId);
    }
  }, [applications, selectedAppId]);

  const handleAppChange = React.useCallback((nextAppId: string) => {
    setDraftSelection({});
    setSelectedAppId(nextAppId);
  }, []);

  const selectedApp = React.useMemo(
    () => applications.find((app) => app.appId === selectedAppId) ?? null,
    [applications, selectedAppId],
  );
  const remotePermissionModuleLookup = React.useMemo(
    () => buildRemotePermissionLookup(permissionsResponse?.data ?? []),
    [permissionsResponse?.data],
  );
  const modules = React.useMemo(
    () =>
      (modulesResponse?.data ?? []).filter((module) => {
        const moduleId = String(module.moduleId ?? "").trim();
        return Boolean(moduleId);
      }),
    [modulesResponse?.data],
  );

  const moduleRows = React.useMemo<ModulePermissionRow[]>(
    () =>
      modules
        .map((module) => {
          const moduleId = String(module.moduleId ?? "").trim();
          const moduleCode = String(module.moduleCode ?? "").trim();
          const resolvedModuleTitle = getAuthenticatorScopedModuleTitle({
            appCode: selectedApp?.appCode,
            appTitle: selectedApp?.appTitle,
            frontUrl: selectedApp?.frontUrl,
            moduleCode,
            moduleTitle: module.moduleTitle ?? module.moduleCode ?? "Module",
            route: resolveModuleRouteForApp(selectedApp, module),
          });
          const storedPermissions =
            (moduleId && remotePermissionModuleLookup.get(`id:${normalizeValue(moduleId)}`)) ||
            (moduleCode && remotePermissionModuleLookup.get(`code:${normalizeValue(moduleCode)}`)) ||
            remotePermissionModuleLookup.get(
              `title:${normalizeValue(module.moduleTitle ?? module.moduleCode ?? "")}`,
            ) ||
            {};
          const permissionsByAction = Object.fromEntries(
            MATRIX_ACTION_ORDER.map((action) => [
              action,
              Boolean(storedPermissions[normalizePermissionActionKey(action)]),
            ]),
          ) as Partial<Record<string, boolean>>;

          return {
            module: {
              ...module,
              moduleTitle: resolvedModuleTitle,
            },
            moduleKey: moduleId || moduleCode || module.moduleTitle || "module",
            moduleLabel: resolvedModuleTitle,
            permissionsByAction,
          };
        })
        .sort((first, second) => first.moduleLabel.localeCompare(second.moduleLabel)),
    [modules, remotePermissionModuleLookup, selectedApp],
  );

  const originalSelection = React.useMemo(
    () =>
      moduleRows.reduce<Record<string, boolean>>((acc, row) => {
        MATRIX_ACTION_ORDER.forEach((action) => {
          acc[getPermissionStorageKey(row.module, action)] = Boolean(row.permissionsByAction[action]);
        });
        return acc;
      }, {}),
    [moduleRows],
  );

  React.useEffect(() => {
    setDraftSelection(originalSelection);
  }, [originalSelection]);

  const getDraftValue = React.useCallback(
    (row: ModulePermissionRow, action: string) =>
      Boolean(draftSelection[getPermissionStorageKey(row.module, action)]),
    [draftSelection],
  );

  const dirtyCount = React.useMemo(
    () =>
      Object.keys(originalSelection).filter(
        (key) => Boolean(draftSelection[key]) !== Boolean(originalSelection[key]),
      ).length,
    [draftSelection, originalSelection],
  );
  const hasUnsavedChanges = dirtyCount > 0;

  const allMatrixChecked =
    moduleRows.length > 0 &&
    moduleRows.every((row) =>
      MATRIX_ACTION_ORDER.every((action) => getDraftValue(row, action)),
    );
  const someMatrixChecked =
    moduleRows.some((row) =>
      MATRIX_ACTION_ORDER.some((action) => getDraftValue(row, action)),
    ) && !allMatrixChecked;

  const getColumnState = React.useCallback(
    (action: string) => {
      const checked =
        moduleRows.length > 0 &&
        moduleRows.every((row) => getDraftValue(row, action));
      const indeterminate = moduleRows.some((row) => getDraftValue(row, action)) && !checked;

      return { checked, indeterminate };
    },
    [getDraftValue, moduleRows],
  );

  const getModuleState = React.useCallback((row: ModulePermissionRow) => {
    const checked = MATRIX_ACTION_ORDER.every((action) => getDraftValue(row, action));
    const indeterminate =
      MATRIX_ACTION_ORDER.some((action) => getDraftValue(row, action)) && !checked;

    return { checked, indeterminate };
  }, [getDraftValue]);

  const handleCellToggle = React.useCallback((row: ModulePermissionRow, action: string) => {
    const key = getPermissionStorageKey(row.module, action);
    setDraftSelection((current) => ({
      ...current,
      [key]: !Boolean(current[key]),
    }));
  }, []);

  const handleModuleToggle = React.useCallback((row: ModulePermissionRow, checked: boolean) => {
    setDraftSelection((current) => {
      const next = { ...current };
      MATRIX_ACTION_ORDER.forEach((action) => {
        next[getPermissionStorageKey(row.module, action)] = checked;
      });
      return next;
    });
  }, []);

  const handleActionColumnToggle = React.useCallback(
    (action: string, checked: boolean) => {
      setDraftSelection((current) => {
        const next = { ...current };
        moduleRows.forEach((row) => {
          next[getPermissionStorageKey(row.module, action)] = checked;
        });
        return next;
      });
    },
    [moduleRows],
  );

  const handleAllToggle = React.useCallback(
    (checked: boolean) => {
      setDraftSelection((current) => {
        const next = { ...current };
        moduleRows.forEach((row) => {
          MATRIX_ACTION_ORDER.forEach((action) => {
            next[getPermissionStorageKey(row.module, action)] = checked;
          });
        });
        return next;
      });
    },
    [moduleRows],
  );

  const handleSaveMatrix = React.useCallback(async () => {
    if (!selectedAppId || !selectedApp) {
      return;
    }

    const permissionAccessPayload = buildPermissionAccessPayload({
      app: selectedApp,
      moduleRows,
      draftSelection,
    });

    try {
      const response = await saveAuthenticatorPermissionMatrix(permissionAccessPayload).unwrap();
      await refetchPermissions();
      showToast(
        response?.message ||
          `${selectedApp.appTitle || "Selected application"} permissions were saved successfully.`,
        "success",
      );
    } catch (error: any) {
      showToast(
        error?.data?.message || error?.message || "There was a problem saving permissions.",
        "error",
      );
    }
  }, [
    draftSelection,
    moduleRows,
    refetchPermissions,
    saveAuthenticatorPermissionMatrix,
    selectedApp,
    selectedAppId,
    showToast,
  ]);

  const closeModuleDrawer = React.useCallback(() => {
    setModuleDrawerOpen(false);
    setModuleForm(createInitialModuleForm());
    setModuleFormError("");
  }, []);

  const handleCreateModule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAppId) {
      setModuleFormError("Please select an application first.");
      return;
    }

    if (!moduleForm.moduleTitle.trim()) {
      setModuleFormError("Module title is required.");
      return;
    }

    if (!moduleForm.moduleDesc.trim()) {
      setModuleFormError("Module description is required.");
      return;
    }

    const moduleCode = buildAuthenticatorModuleCode({
      appCode: selectedApp?.appCode,
      appTitle: selectedApp?.appTitle,
      moduleTitle: moduleForm.moduleTitle,
    });
    if (!moduleCode) {
      setModuleFormError("A valid module code could not be generated.");
      return;
    }

    setModuleFormError("");

    try {
      const response = await createAuthenticatorModule({
        appId: selectedAppId,
        moduleTitle: moduleForm.moduleTitle.trim(),
        moduleCode,
        moduleDesc: moduleForm.moduleDesc.trim(),
      }).unwrap();

      await refetchModules();
      showToast(response?.message || "Module created successfully.", "success");
      closeModuleDrawer();
    } catch (error: any) {
      setModuleFormError(
        error?.data?.message || error?.message || "Module create API failed.",
      );
    }
  };

  if (bootstrapping) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Initializing authenticator session...
        </Typography>
      </Box>
    );
  }

  if (autoLoginError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{autoLoginError}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Card sx={cardSurface}>
        <CardContent sx={{ display: "grid", gap: 2 }}>
          <Stack
            direction={{ xs: "column", xl: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", xl: "center" }}
          >
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Permission Master
              </Typography>
              
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", md: "center" }}
              flexWrap="wrap"
              useFlexGap
              sx={{ width: { xs: "100%", xl: "auto" } }}
            >
              <TextField
                select
                size="small"
                label="Application"
                value={selectedAppId}
                onChange={(event) => handleAppChange(event.target.value)}
                disabled={applications.length === 0}
                sx={{ minWidth: { xs: "100%", sm: 260 } }}
              >
                {applications.map((app) => (
                  <MenuItem key={app.appId} value={app.appId}>
                    {app.appTitle}
                  </MenuItem>
                ))}
              </TextField>
              {canEditPermissionMatrix && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => void handleSaveMatrix()}
                  disabled={!hasUnsavedChanges || isSavingDraft}
                  sx={{ borderRadius: 999, minWidth: { xs: "100%", md: 120 } }}
                >
                  {isSavingDraft ? "Saving..." : "Save"}
                </Button>
              )}
            </Stack>
          </Stack>

          {!canEditPermissionMatrix && (
            <Alert severity="info">
              This page is currently read-only. Save/update permission access is not available.
            </Alert>
          )}

          {(isFetchingApplications ||
            isFetchingModules ||
            isLoadingModules ||
            isFetchingPermissions ||
            isLoadingPermissions) && <LinearProgress />}

         
 

          <TableContainer
            sx={{
             
              maxHeight: "calc(100vh - 120px)",
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 220, fontWeight: 800 }}>Module</TableCell>
                  <TableCell align="center" sx={{ minWidth: 70, fontWeight: 800 }}>
                    <Stack alignItems="center" spacing={0.5}>
                      <Typography variant="caption" fontWeight={800}>
                        All
                      </Typography>
                      <Checkbox
                        size="small"
                        checked={allMatrixChecked}
                        indeterminate={someMatrixChecked}
                        disabled={
                          moduleRows.length === 0 || isSavingDraft || !canEditPermissionMatrix
                        }
                        onChange={(_event, checked) => handleAllToggle(checked)}
                      />
                    </Stack>
                  </TableCell>
                  {MATRIX_ACTION_ORDER.map((action) => {
                    const columnState = getColumnState(action);

                    return (
                      <TableCell key={action} align="center" sx={{ minWidth: 88, fontWeight: 800 }}>
                        <Stack alignItems="center" spacing={0.5}>
                          <Typography variant="caption" fontWeight={800}>
                            {ACTION_LABELS[action] || capitalize(action)}
                          </Typography>
                          <Checkbox
                            size="small"
                            checked={columnState.checked}
                            indeterminate={columnState.indeterminate}
                            disabled={
                              moduleRows.length === 0 ||
                              isSavingDraft ||
                              !canEditPermissionMatrix
                            }
                            onChange={(_event, checked) => handleActionColumnToggle(action, checked)}
                          />
                        </Stack>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {moduleRows.length > 0 ? (
                  moduleRows.map((row) => {
                    const moduleState = getModuleState(row);

                    return (
                      <TableRow key={row.moduleKey} hover>
                        <TableCell>
                          <Stack >
                            <Typography fontWeight={700}>{row.moduleLabel}</Typography>
                        
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            size="small"
                            checked={moduleState.checked}
                            indeterminate={moduleState.indeterminate}
                            disabled={isSavingDraft || !canEditPermissionMatrix}
                            onChange={(_event, checked) => handleModuleToggle(row, checked)}
                          />
                        </TableCell>
                        {MATRIX_ACTION_ORDER.map((action) => {
                          return (
                            <TableCell key={action} align="center">
                              <Checkbox
                                size="small"
                                checked={getDraftValue(row, action)}
                                disabled={isSavingDraft || !canEditPermissionMatrix}
                                onChange={() => handleCellToggle(row, action)}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={MATRIX_ACTION_ORDER.length + 2}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <Typography fontWeight={700}>No modules available</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        No modules are available for this application, so the matrix is empty.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={moduleDrawerOpen}
        onClose={closeModuleDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420, lg: 480 },
            maxWidth: "100%",
          },
        }}
      >
        <Box sx={{ p: 3, mt: 6 }}>
          <Box component="form" onSubmit={handleCreateModule}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Add Module
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                  Once the module is created, its row will appear in this matrix immediately.
                </Typography>
              </Box>

              <TextField
                label="Selected Application"
                value={selectedApp?.appTitle || ""}
                InputProps={{ readOnly: true }}
                fullWidth
              />

              <TextField
                label="Module Title"
                value={moduleForm.moduleTitle}
                onChange={(event) =>
                  setModuleForm((current) => ({
                    ...current,
                    moduleTitle: event.target.value,
                  }))
                }
                fullWidth
              />

              <TextField
                label="Module Description"
                value={moduleForm.moduleDesc}
                onChange={(event) =>
                  setModuleForm((current) => ({
                    ...current,
                    moduleDesc: event.target.value,
                  }))
                }
                fullWidth
                multiline
                minRows={4}
              />

              {moduleFormError && <Alert severity="warning">{moduleFormError}</Alert>}

              <Stack direction="row" spacing={1}>
                {canCreateModule && (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isCreatingModule || !selectedAppId || !sessionReady}
                    sx={{ borderRadius: 999 }}
                  >
                    {isCreatingModule ? "Creating..." : "Create Module"}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={closeModuleDrawer}
                  sx={{ borderRadius: 999 }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default PermissionCrudPage;
