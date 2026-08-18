import React from "react";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  LinearProgress,
  List,
  ListItemButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import PersonRemoveRoundedIcon from "@mui/icons-material/PersonRemoveRounded";
import dayjs from "dayjs";
import { useToast } from "../../../shared/hooks/useToast";
import {
  type AuthenticatorApp,
  type AuthenticatorDivision,
  type AuthenticatorOrganization,
  type AuthenticatorRole,
  type AuthenticatorUser,
  useAddAuthenticatorUsersToAppMutation,
  useAssignAuthenticatorUserRoleMutation,
  useCreateAuthenticatorUserMutation,
  useGetAuthenticatorAppsListQuery,
  useGetAuthenticatorDivisionsQuery,
  useGetAuthenticatorOrganizationsQuery,
  useGetAuthenticatorRolesByAppQuery,
  useGetAuthenticatorUsersByAppQuery,
  useGetAuthenticatorUsersQuery,
  useRemoveAuthenticatorUserRoleMutation,
  useRemoveAuthenticatorUsersFromAppMutation,
} from "./api/authenticator";
import { useAuthenticatorSession } from "./useAuthenticatorSession";
import { getAuthenticatorRouteUiPermissions } from "./utils/authenticatorAccess";
import { buildAuthenticatorDropdownApps } from "./utils/authenticatorManagedApps";

const cardSurface = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: alpha("#D7E1EC", 0.95),
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
  bgcolor: "#FFFFFF",
};

const normalizeValue = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();

const formatAssignmentDateTimeValue = () =>
  `${dayjs().add(1, "year").hour(18).minute(0).second(0).format("YYYY-MM-DD HH:mm:ss.SSS")}000`;

const formatRemovalDateTimeValue = () => `${dayjs().format("YYYY-MM-DD HH:mm:ss.SSS")}000`;

const getUserRoleTitles = (user: AuthenticatorUser) => {
  if (Array.isArray(user.roleData) && user.roleData.length > 0) {
    return user.roleData
      .map((role) => String(role.roleTitle ?? "").trim())
      .filter(Boolean);
  }

  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles.map((role) => String(role ?? "").trim()).filter(Boolean);
  }

  return [];
};

const mergeUsersWithAppRoles = (
  divisionUsers: AuthenticatorUser[],
  appUsers: AuthenticatorUser[],
): AuthenticatorUser[] => {
  if (appUsers.length === 0) {
    return divisionUsers;
  }

  const appUsersById = new Map(
    appUsers.map((user) => [String(user.userId ?? "").trim(), user] satisfies [string, AuthenticatorUser]),
  );

  return divisionUsers.map((user) => {
    const appUser = appUsersById.get(String(user.userId ?? "").trim());

    if (!appUser) {
      return {
        ...user,
        roleData: [],
        roles: [],
      };
    }

    return {
      ...user,
      roleData: Array.isArray(appUser.roleData) ? appUser.roleData : user.roleData,
      roles: Array.isArray(appUser.roles) ? appUser.roles : user.roles,
    };
  });
};

const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Box
    sx={{
      borderRadius: 3,
      border: "1px dashed",
      borderColor: "divider",
      p: 3,
      textAlign: "center",
      bgcolor: alpha("#F8FAFC", 0.72),
    }}
  >
    <Typography fontWeight={800}>{title}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
      {subtitle}
    </Typography>
  </Box>
);

type UserCreateFormState = {
  name: string;
  username: string;
  password: string;
  hrmsId: string;
  orgId: string;
  divId: string;
};

const createInitialUserForm = ({
  orgId = "",
  divId = "",
}: {
  orgId?: string;
  divId?: string;
} = {}): UserCreateFormState => ({
  name: "",
  username: "",
  password: "",
  hrmsId: "",
  orgId,
  divId,
});

const ManagementWorkspace = () => {
  const { showToast } = useToast();
  const { sessionReady, bootstrapping, autoLoginError } = useAuthenticatorSession();

  const [selectedListAppId, setSelectedListAppId] = React.useState("");
  const [selectedAssignAppId, setSelectedAssignAppId] = React.useState("");
  const [selectedRoleId, setSelectedRoleId] = React.useState("");
  const [selectedOrgId, setSelectedOrgId] = React.useState("");
  const [selectedDivisionId, setSelectedDivisionId] = React.useState("");
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
  const [userSearch, setUserSearch] = React.useState("");
  const [removeConfirmOpen, setRemoveConfirmOpen] = React.useState(false);
  const [removeRoleConfirmOpen, setRemoveRoleConfirmOpen] = React.useState(false);
  const [userDrawerOpen, setUserDrawerOpen] = React.useState(false);
  const [userForm, setUserForm] = React.useState<UserCreateFormState>(createInitialUserForm);
  const [userFormError, setUserFormError] = React.useState("");

  const { data: appsResponse, isLoading: isAppsLoading, isFetching: isAppsFetching } =
    useGetAuthenticatorAppsListQuery(undefined, {
      skip: !sessionReady,
    });
  const { data: organizationsResponse, isLoading: isOrganizationsLoading, isFetching: isOrganizationsFetching } =
    useGetAuthenticatorOrganizationsQuery(undefined, {
      skip: !sessionReady,
    });
  const { currentData: rolesResponse, isLoading: isRolesLoading, isFetching: isRolesFetching } =
    useGetAuthenticatorRolesByAppQuery(selectedAssignAppId, {
      skip: !sessionReady || !selectedAssignAppId,
    });
  const { currentData: divisionsResponse, isLoading: isDivisionsLoading, isFetching: isDivisionsFetching } =
    useGetAuthenticatorDivisionsQuery(selectedOrgId, {
      skip: !sessionReady || !selectedOrgId,
    });
  const {
    currentData: divisionUsersResponse,
    isLoading: isDivisionUsersLoading,
    isFetching: isDivisionUsersFetching,
  } = useGetAuthenticatorUsersQuery(
    {
      orgId: selectedOrgId,
      divId: selectedDivisionId,
    },
    {
      skip: !sessionReady || !selectedOrgId || !selectedDivisionId,
    },
  );
  const {
    currentData: appUsersResponse,
    isLoading: isAppUsersLoading,
    isFetching: isAppUsersFetching,
  } = useGetAuthenticatorUsersByAppQuery(selectedListAppId, {
    skip: !sessionReady || !selectedListAppId,
  });

  const [addAuthenticatorUsersToApp, { isLoading: isAddingUsersToApp }] =
    useAddAuthenticatorUsersToAppMutation();
  const [assignAuthenticatorUserRole, { isLoading: isAssigningUserRole }] =
    useAssignAuthenticatorUserRoleMutation();
  const [removeAuthenticatorUserRole, { isLoading: isRemovingUserRole }] =
    useRemoveAuthenticatorUserRoleMutation();
  const [removeAuthenticatorUsersFromApp, { isLoading: isRemovingUsersFromApp }] =
    useRemoveAuthenticatorUsersFromAppMutation();
  const [createAuthenticatorUser, { isLoading: isCreatingUser }] =
    useCreateAuthenticatorUserMutation();

  const dashboardRoutePermissions = React.useMemo(
    () => getAuthenticatorRouteUiPermissions("/authenticator/dashboard"),
    [],
  );
  const canAssignDashboardAccess =
    dashboardRoutePermissions.assign || dashboardRoutePermissions.update;

  const applications = React.useMemo(
    () => buildAuthenticatorDropdownApps(appsResponse?.data ?? []),
    [appsResponse?.data],
  );
  const organizations = React.useMemo<AuthenticatorOrganization[]>(
    () => organizationsResponse?.data ?? [],
    [organizationsResponse?.data],
  );
  const roles = React.useMemo(
    () => [...(rolesResponse?.data ?? [])].sort((a, b) => a.roleName.localeCompare(b.roleName)),
    [rolesResponse?.data],
  );
  const divisions = React.useMemo(
    () => divisionsResponse?.data ?? [],
    [divisionsResponse?.data],
  );
  const users = React.useMemo<AuthenticatorUser[]>(
    () =>
      mergeUsersWithAppRoles(
        divisionUsersResponse?.data ?? [],
        selectedListAppId ? appUsersResponse?.data ?? [] : [],
      ),
    [appUsersResponse?.data, divisionUsersResponse?.data, selectedListAppId],
  );

  React.useEffect(() => {
    if (!applications.length) {
      if (selectedListAppId) {
        setSelectedListAppId("");
      }
      return;
    }

    if (!applications.some((app) => app.appId === selectedListAppId)) {
      setSelectedListAppId("");
    }
  }, [applications, selectedListAppId]);

  React.useEffect(() => {
    if (!applications.length) {
      if (selectedAssignAppId) {
        setSelectedAssignAppId("");
      }
      return;
    }

    if (!applications.some((app) => app.appId === selectedAssignAppId)) {
      setSelectedAssignAppId("");
    }
  }, [applications, selectedAssignAppId]);

  React.useEffect(() => {
    if (!roles.length) {
      setSelectedRoleId("");
      return;
    }

    if (!roles.some((role) => String(role.roleId) === selectedRoleId)) {
      setSelectedRoleId(String(roles[0].roleId));
    }
  }, [roles, selectedRoleId]);

  React.useEffect(() => {
    if (!organizations.length) {
      setSelectedOrgId("");
      return;
    }

    if (!organizations.some((organization) => organization.orgId === selectedOrgId)) {
      setSelectedOrgId(organizations[0].orgId);
    }
  }, [organizations, selectedOrgId]);

  React.useEffect(() => {
    if (!selectedOrgId || !divisions.length) {
      setSelectedDivisionId("");
      return;
    }

    if (!divisions.some((division) => division.divId === selectedDivisionId)) {
      setSelectedDivisionId(divisions[0].divId);
    }
  }, [divisions, selectedDivisionId, selectedOrgId]);

  React.useEffect(() => {
    const availableUserIds = new Set(users.map((user) => user.userId));
    setSelectedUserIds((current) => current.filter((userId) => availableUserIds.has(userId)));
  }, [users]);

  const selectedAssignApp = React.useMemo(
    () => applications.find((app) => app.appId === selectedAssignAppId) ?? null,
    [applications, selectedAssignAppId],
  );
  const selectedListApp = React.useMemo(
    () => applications.find((app) => app.appId === selectedListAppId) ?? null,
    [applications, selectedListAppId],
  );
  const selectedRole = React.useMemo(
    () => roles.find((role) => String(role.roleId) === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );
  const selectedOrganization = React.useMemo<AuthenticatorOrganization | null>(
    () => organizations.find((organization) => organization.orgId === selectedOrgId) ?? null,
    [organizations, selectedOrgId],
  );
  const selectedDivision = React.useMemo<AuthenticatorDivision | null>(
    () => divisions.find((division) => division.divId === selectedDivisionId) ?? null,
    [divisions, selectedDivisionId],
  );

  const filteredUsers = React.useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.hrmsId, user.userId, getUserRoleTitles(user).join(", ")]
        .some((value) => String(value ?? "").toLowerCase().includes(query)),
    );
  }, [userSearch, users]);

  const selectedUsers = React.useMemo(
    () => users.filter((user) => selectedUserIds.includes(user.userId)),
    [selectedUserIds, users],
  );

  const allVisibleUsersSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((user) => selectedUserIds.includes(user.userId));

  const loadingUsers =
    isDivisionUsersLoading ||
    isDivisionUsersFetching ||
    (Boolean(selectedListAppId) && (isAppUsersLoading || isAppUsersFetching));
  const loadingApps = isAppsLoading || isAppsFetching;
  const loadingRoles = isRolesLoading || isRolesFetching;
  const loadingOrganizations = isOrganizationsLoading || isOrganizationsFetching;
  const loadingDivisions = isDivisionsLoading || isDivisionsFetching;
  const assigningAccess = isAddingUsersToApp || isAssigningUserRole;
  const removingAccess = isRemovingUsersFromApp || isRemovingUserRole;
  const canRemoveSelectedUsers =
    canAssignDashboardAccess && Boolean(selectedListAppId) && selectedUsers.length > 0;
  const canRemoveSelectedRole =
    canAssignDashboardAccess &&
    Boolean(selectedAssignAppId) &&
    Boolean(selectedRoleId) &&
    selectedUsers.length > 0;
  const canCreateUser = dashboardRoutePermissions.create;

  const handleListAppChange = React.useCallback((appId: string) => {
    setSelectedListAppId(appId);
    setSelectedUserIds([]);
  }, []);

  const handleAssignAppChange = React.useCallback((appId: string) => {
    setSelectedAssignAppId(appId);
    setSelectedRoleId("");
  }, []);

  const handleOrgChange = React.useCallback((orgId: string) => {
    setSelectedOrgId(orgId);
    setSelectedDivisionId("");
    setSelectedUserIds([]);
  }, []);

  const handleDivisionChange = React.useCallback((divisionId: string) => {
    setSelectedDivisionId(divisionId);
    setSelectedUserIds([]);
  }, []);

  const openUserDrawer = React.useCallback(() => {
    if (!selectedOrgId || !selectedDivisionId) {
      showToast("Please select organization and division first.", "warning");
      return;
    }

    setUserForm(
      createInitialUserForm({
        orgId: selectedOrgId,
        divId: selectedDivisionId,
      }),
    );
    setUserFormError("");
    setUserDrawerOpen(true);
  }, [selectedDivisionId, selectedOrgId, showToast]);

  const closeUserDrawer = React.useCallback(() => {
    if (isCreatingUser) {
      return;
    }

    setUserDrawerOpen(false);
    setUserFormError("");
  }, [isCreatingUser]);

  const handleUserFieldChange =
    (field: keyof Pick<UserCreateFormState, "name" | "username" | "password" | "hrmsId">) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;

      setUserForm((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const toggleUser = React.useCallback((userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((currentUserId) => currentUserId !== userId)
        : [...current, userId],
    );
  }, []);

  const toggleAllVisibleUsers = React.useCallback(() => {
    const visibleUserIds = filteredUsers.map((user) => user.userId);

    setSelectedUserIds((current) => {
      const currentSet = new Set(current);
      const everyVisibleSelected = visibleUserIds.every((userId) => currentSet.has(userId));

      if (everyVisibleSelected) {
        return current.filter((userId) => !visibleUserIds.includes(userId));
      }

      return Array.from(new Set([...current, ...visibleUserIds]));
    });
  }, [filteredUsers]);

  const handleAssignRole = async () => {
    if (!selectedAssignAppId || !selectedAssignApp) {
      showToast("Please select an application.", "warning");
      return;
    }

    if (!selectedRoleId || !selectedRole) {
      showToast("Please select a role.", "warning");
      return;
    }

    if (selectedUsers.length === 0) {
      showToast("Please select at least one user.", "warning");
      return;
    }

    const endDate = formatAssignmentDateTimeValue();

    try {
      await addAuthenticatorUsersToApp({
        appId: selectedAssignAppId,
        users: selectedUsers.map((user) => user.userId),
        roleId: selectedRoleId,
        endDate,
      }).unwrap();

      await Promise.all(
        selectedUsers.map((user) =>
          assignAuthenticatorUserRole({
            appId: selectedAssignAppId,
            userId: user.userId,
            roleId: selectedRoleId,
            endDate,
          }).unwrap(),
        ),
      );

      showToast(
        `${selectedUsers.length} users were assigned to ${selectedAssignApp.appTitle} with the ${selectedRole.roleName} role.`,
        "success",
      );
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "There was a problem assigning user access.";
      showToast(message, "error");
    }
  };

  const handleOpenRemoveConfirm = React.useCallback(() => {
    if (!selectedListAppId || !selectedListApp) {
      showToast("Please select an application from Users List first.", "warning");
      return;
    }

    if (selectedUsers.length === 0) {
      showToast("Please select at least one user to remove.", "warning");
      return;
    }

    setRemoveConfirmOpen(true);
  }, [selectedListApp, selectedListAppId, selectedUsers.length, showToast]);

  const handleCloseRemoveConfirm = React.useCallback(() => {
    if (removingAccess) {
      return;
    }

    setRemoveConfirmOpen(false);
  }, [removingAccess]);

  const handleOpenRemoveRoleConfirm = React.useCallback(() => {
    if (!selectedAssignAppId || !selectedAssignApp) {
      showToast("Please select an application in Assign Access first.", "warning");
      return;
    }

    if (!selectedRoleId || !selectedRole) {
      showToast("Please select a role to remove.", "warning");
      return;
    }

    if (selectedUsers.length === 0) {
      showToast("Please select at least one user.", "warning");
      return;
    }

    setRemoveRoleConfirmOpen(true);
  }, [
    selectedAssignApp,
    selectedAssignAppId,
    selectedRole,
    selectedRoleId,
    selectedUsers.length,
    showToast,
  ]);

  const handleCloseRemoveRoleConfirm = React.useCallback(() => {
    if (removingAccess) {
      return;
    }

    setRemoveRoleConfirmOpen(false);
  }, [removingAccess]);

  const handleRemoveUsersFromApp = async () => {
    if (!selectedListAppId || !selectedListApp) {
      showToast("Please select an application from Users List first.", "warning");
      return;
    }

    if (selectedUsers.length === 0) {
      showToast("Please select at least one user to remove.", "warning");
      return;
    }

    try {
      await removeAuthenticatorUsersFromApp({
        appId: selectedListAppId,
        users: selectedUsers.map((user) => user.userId),
        endDate: formatRemovalDateTimeValue(),
      }).unwrap();

      const roleRemovalRequests = selectedUsers.flatMap((user) =>
        (user.roleData ?? [])
          .filter((role) => String(role.roleId ?? "").trim())
          .map((role) =>
            removeAuthenticatorUserRole({
              removeUserId: user.userId,
              appId: selectedListAppId,
              removeRoleId: role.roleId,
            }).unwrap(),
          ),
      );

      if (roleRemovalRequests.length > 0) {
        await Promise.all(roleRemovalRequests);
      }

      setRemoveConfirmOpen(false);
      setSelectedUserIds([]);
      showToast(
        `${selectedUsers.length} users were removed from ${selectedListApp.appTitle} and their assigned roles were cleared.`,
        "success",
      );
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "There was a problem removing users from the application.";
      showToast(message, "error");
    }
  };

  const handleRemoveRoleFromUsers = async () => {
    if (!selectedAssignAppId || !selectedAssignApp) {
      showToast("Please select an application in Assign Access first.", "warning");
      return;
    }

    if (!selectedRoleId || !selectedRole) {
      showToast("Please select a role to remove.", "warning");
      return;
    }

    if (selectedUsers.length === 0) {
      showToast("Please select at least one user.", "warning");
      return;
    }

    try {
      await Promise.all(
        selectedUsers.map((user) =>
          removeAuthenticatorUserRole({
            removeUserId: user.userId,
            appId: selectedAssignAppId,
            removeRoleId: selectedRoleId,
          }).unwrap(),
        ),
      );

      setRemoveRoleConfirmOpen(false);
      setSelectedUserIds([]);
      showToast(
        `${selectedRole.roleName} role was removed from ${selectedUsers.length} user${selectedUsers.length === 1 ? "" : "s"} in ${selectedAssignApp.appTitle}.`,
        "success",
      );
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "There was a problem removing the selected role from users.";
      showToast(message, "error");
    }
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = userForm.name.trim();
    const username = userForm.username.trim();
    const password = userForm.password;
    const hrmsId = userForm.hrmsId.trim();
    const orgId = userForm.orgId || selectedOrgId;
    const divId = userForm.divId || selectedDivisionId;

    if (!orgId || !divId) {
      setUserFormError("Organization and division are required.");
      return;
    }

    if (!name) {
      setUserFormError("User name is required.");
      return;
    }

    if (!username) {
      setUserFormError("Username is required.");
      return;
    }

    if (!password.trim()) {
      setUserFormError("Password is required.");
      return;
    }

    setUserFormError("");

    try {
      const response = await createAuthenticatorUser({
        name,
        username,
        password,
        divId,
        orgId,
        hrmsId,
      }).unwrap();

      showToast(response.message || "User created successfully.", "success");
      setUserDrawerOpen(false);
      setUserForm(createInitialUserForm({ orgId, divId }));
      setUserFormError("");
    } catch (error: any) {
      const message = error?.data?.message || error?.message || "User create failed.";
      setUserFormError(message);
      showToast(message, "error");
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
      {!canAssignDashboardAccess && (
        <Alert severity="info">
          This Users & Roles page is currently read-only. User-role assignment is not available.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 2.5fr) minmax(320px, 1fr)",
          },
          gap:1,
          alignItems: "start",
        }}
      >
        <Card sx={{ ...cardSurface, minHeight: 560 }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                px: 2.5,
                py: 2.5,
                borderBottom: "1px solid",
                borderColor: alpha("#D7E1EC", 0.9),
                background: "linear-gradient(180deg, rgba(248,250,252,0.9) 0%, rgba(255,255,255,1) 100%)",
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={1.5}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      Users List
                    </Typography>
                   
                  </Box>
                   
                </Stack>
                <Box 
                >
                  <Stack
                    direction={{ xs: "column", lg: "row" }}
                    spacing={1.5}
                    useFlexGap
                    flexWrap="wrap"
                    alignItems={{ xs: "stretch", lg: "center" }}
                  >
                    <TextField
                      select
                      size="small"
                      label="Organization"
                      value={selectedOrgId}
                      onChange={(event) => handleOrgChange(event.target.value)}
                      disabled={loadingOrganizations || organizations.length === 0}
                      sx={{ minWidth: { xs: "100%", sm: 220 } }}
                    >
                      {organizations.map((organization) => (
                        <MenuItem key={organization.orgId} value={organization.orgId}>
                          {organization.orgTitle}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      size="small"
                      label="Division"
                      value={selectedDivisionId}
                      onChange={(event) => handleDivisionChange(event.target.value)}
                      disabled={!selectedOrgId || loadingDivisions || divisions.length === 0}
                      sx={{ minWidth: { xs: "100%", sm: 220 } }}
                    >
                      {divisions.map((division) => (
                        <MenuItem key={division.divId} value={division.divId}>
                          {division.divName}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      size="small"
                      label="Search User"
                      value={userSearch}
                      onChange={(event) => setUserSearch(event.target.value)}
                      placeholder="Name / HRMS / User ID"
                      sx={{ minWidth: { xs: "100%", sm: 140 }, flex: 1 }}
                    />

                    {canCreateUser && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddRoundedIcon />}
                        onClick={openUserDrawer}
                        disabled={!selectedOrgId || !selectedDivisionId}
                        sx={{ borderRadius: 999, whiteSpace: "nowrap", minWidth: "fit-content" }}
                      >
                        Add User
                      </Button>
                    )}

                    <TextField
                      select
                      size="small"
                      label="Application"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (value) =>
                          value ? (
                            applications.find((app) => app.appId === value)?.appTitle ?? ""
                          ) : (
                            <Box component="span" sx={{ color: "text.secondary" }}>
                              Select Application
                            </Box>
                          ),
                      }}
                      value={selectedListAppId}
                      onChange={(event) => handleListAppChange(event.target.value)}
                      disabled={loadingApps || applications.length === 0}
                      sx={{ minWidth: { xs: "100%", sm: 220 } }}
                    >
                      <MenuItem value="">
                        Select Application
                      </MenuItem>
                      {applications.map((app) => (
                        <MenuItem key={app.appId} value={app.appId}>
                          {app.appTitle}
                        </MenuItem>
                      ))}
                    </TextField>

                   
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {loadingUsers && <LinearProgress />}

            <Box
              sx={{
                
             
                bgcolor: alpha("#F8FAFC", 0.92),
                borderBottom: "1px solid",
                borderColor: alpha("#D7E1EC", 0.75),
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "56px minmax(180px, 1fr) 130px minmax(180px, 1fr)",
                  columnGap: 1.5,
                  alignItems: "center",
                }}
              >
                <Checkbox
                  checked={allVisibleUsersSelected}
                  indeterminate={selectedUserIds.length > 0 && !allVisibleUsersSelected}
                  onChange={toggleAllVisibleUsers}
                  disabled={filteredUsers.length === 0}
                />
                <Typography variant="caption" fontWeight={800}>
                  Name
                </Typography>
                <Typography variant="caption" fontWeight={800}>
                  HRMS ID
                </Typography>
                <Typography variant="caption" fontWeight={800}>
                  Existing Roles
                </Typography>
              </Box>
            </Box>

            <List disablePadding sx={{ maxHeight: 520, overflowY: "auto", bgcolor: "#FFF" }}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const checked = selectedUserIds.includes(user.userId);
                  const userRoles =
                    getUserRoleTitles(user).join(", ") ||
                    (selectedListApp ? "No role assigned for selected application." : "-");

                  return (
                    <ListItemButton
                      key={user.userId}
                      onClick={() => toggleUser(user.userId)}
                      divider
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "56px minmax(180px, 1fr) 130px minmax(180px, 1fr)",
                        columnGap: 1.5,
                        alignItems: "center",
                        px: 2.5,
                        
                        bgcolor: checked ? alpha("#EFF6FF", 0.9) : "transparent",
                        transition: "background-color 160ms ease",
                        "&:hover": {
                          bgcolor: checked ? alpha("#DBEAFE", 0.95) : alpha("#F8FAFC", 0.96),
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center"  }}>
                        <Checkbox edge="start" checked={checked} tabIndex={-1} />
                      </Box>
                       <Stack spacing={0.35}>
                         <Typography fontWeight={700} sx={{ color: checked ? "primary.main" : "text.primary" }}>
                           {user.name}
                         </Typography>
                       </Stack>
                      <Typography variant="body2" color="text.secondary"  >
                        {user.hrmsId}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{  whiteSpace: "normal", overflowWrap: "anywhere" }}
                      >
                        {userRoles}
                      </Typography>
                    </ListItemButton>
                  );
                })
              ) : (
                <Box sx={{ p: 3 }}>
                  <EmptyState
                    title="No users found"
                    subtitle="No users are available for the current filters."
                  />
                </Box>
              )}
            </List>
          </CardContent>
        </Card>

        <Card
          sx={{
            ...cardSurface,
            position: { lg: "sticky" },
            top: { lg: 88 },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack  >
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Assign Access
                </Typography>
                
              </Box>

              <Box
                
                sx={{
                  mt: 2,
                  spacing: 2,
                  bgcolor: alpha("#F8FAFC", 0.9),
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 90 }}>
                      Application
                    </Typography>
                    <TextField
                      select
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (value) =>
                          value ? (
                            applications.find((app) => app.appId === value)?.appTitle ?? ""
                          ) : (
                            <Box component="span" sx={{ color: "text.secondary" }}>
                              Select Application
                            </Box>
                          ),
                      }}
                      value={selectedAssignAppId}
                      onChange={(event) => handleAssignAppChange(event.target.value)}
                      disabled={loadingApps || applications.length === 0}
                      sx={{ minWidth: { xs: "100%", sm: 220 }, flex: 1 }}
                    >
                      <MenuItem value="">
                        Select Application
                      </MenuItem>
                      {applications.map((app) => (
                        <MenuItem key={app.appId} value={app.appId}>
                          {app.appTitle}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 90 }}>
                      Role
                    </Typography>
                    <TextField
                      select
                      size="small"
                      value={selectedRoleId}
                      onChange={(event) => setSelectedRoleId(event.target.value)}
                      disabled={loadingRoles || roles.length === 0 || !selectedAssignAppId}
                      sx={{ minWidth: { xs: "100%", sm: 220 }, flex: 1 }}
                    >
                      {roles.map((role) => (
                        <MenuItem key={String(role.roleId)} value={String(role.roleId)}>
                          {String(role.roleName)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      Users:
                    </Box>{" "}
                    {selectedUsers.length}
                  </Typography>
                </Stack>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<AssignmentIndRoundedIcon />}
                onClick={handleAssignRole}
                disabled={
                  assigningAccess ||
                  !canAssignDashboardAccess ||
                  !selectedAssignAppId ||
                  !selectedRoleId ||
                  selectedUsers.length === 0
                }
                sx={{
                  my: 2,
                  borderRadius: 999,
                  py: 1.4,
                  boxShadow: selectedUsers.length > 0 ? "0 14px 28px rgba(37, 99, 235, 0.24)" : "none",
                }}
              >
                {assigningAccess ? "Assigning..." : "Assign Role To Selected Users"}
              </Button>

              <Button
                variant="outlined"
                color="warning"
                size="large"
                startIcon={<PersonRemoveRoundedIcon />}
                onClick={handleOpenRemoveRoleConfirm}
                disabled={!canRemoveSelectedRole || removingAccess}
                sx={{
                  mb: 2,
                  borderRadius: 999,
                  py: 1.4,
                }}
              >
                {removingAccess ? "Removing..." : "Remove Selected Role From Users"}
              </Button>

              <Button
                variant="outlined"
                color="error"
                size="large"
                startIcon={<PersonRemoveRoundedIcon />}
                onClick={handleOpenRemoveConfirm}
                disabled={!canRemoveSelectedUsers || removingAccess}
                sx={{
                  mb: 2,
                  borderRadius: 999,
                  py: 1.4,
                }}
              >
                {removingAccess ? "Removing..." : "Remove Users From Selected App"}
              </Button>

              <Box
                sx={{
                  mb: 2,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: alpha("#FCA5A5", 0.45),
                  p: 1.5,
                  bgcolor: alpha("#FEF2F2", 0.72),
                }}
              >
                <Typography variant="body2" fontWeight={800}>
                  Remove Access
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {selectedListApp
                    ? `Selected app: ${selectedListApp.appTitle}. This removes users completely from that app.`
                    : "Select an application in Users List to remove selected users from that app."}
                </Typography>
              </Box>

              <Box
                sx={{
                  mb: 2,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: alpha("#FCD34D", 0.55),
                  p: 1.5,
                  bgcolor: alpha("#FFFBEB", 0.95),
                }}
              >
                <Typography variant="body2" fontWeight={800}>
                  Remove Role
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {selectedAssignApp && selectedRole
                    ? `Selected role: ${selectedRole.roleName} in ${selectedAssignApp.appTitle}. This removes only that role from selected users.`
                    : "Select an application and role in Assign Access to remove only that role from selected users."}
                </Typography>
              </Box>

              {selectedUsers.length > 0 ? (
                <Box
                  sx={{
                    borderRadius: 2.5,
                    border: "1px dashed",
                    borderColor: alpha("#CBD5E1", 0.95),
                    p: 2,
                    bgcolor: alpha("#FCFCFD", 0.95),
                  }}
                >
                  <Typography fontWeight={800}>Selected Users</Typography>
                  <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                    {selectedUsers.slice(0, 8).map((user) => (
                      <Chip
                        key={user.userId}
                        label={`${user.name} (${user.hrmsId})`}
                        onDelete={() => toggleUser(user.userId)}
                        size="small"
                      />
                    ))}
                    {selectedUsers.length > 8 && (
                      <Chip
                        label={`+${selectedUsers.length - 8} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>
              ) : (
                 <></>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={removeConfirmOpen}
        onClose={handleCloseRemoveConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm User Removal</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {selectedListApp
              ? `Are you sure you want to remove ${selectedUsers.length} selected user${selectedUsers.length === 1 ? "" : "s"} from ${selectedListApp.appTitle}?`
              : "Are you sure you want to remove the selected users from this application?"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseRemoveConfirm} disabled={removingAccess}>
            Cancel
          </Button>
          <Button
            onClick={handleRemoveUsersFromApp}
            variant="contained"
            color="error"
            disabled={removingAccess}
          >
            {removingAccess ? "Removing..." : "Confirm Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={removeRoleConfirmOpen}
        onClose={handleCloseRemoveRoleConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Role Removal</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {selectedAssignApp && selectedRole
              ? `Are you sure you want to remove ${selectedRole.roleName} from ${selectedUsers.length} selected user${selectedUsers.length === 1 ? "" : "s"} in ${selectedAssignApp.appTitle}?`
              : "Are you sure you want to remove the selected role from these users?"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseRemoveRoleConfirm} disabled={removingAccess}>
            Cancel
          </Button>
          <Button
            onClick={handleRemoveRoleFromUsers}
            variant="contained"
            color="warning"
            disabled={removingAccess}
          >
            {removingAccess ? "Removing..." : "Confirm Remove Role"}
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={userDrawerOpen}
        onClose={closeUserDrawer}
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
            Create User
          </Typography>

          <Box component="form" id="create-user-form" onSubmit={handleCreateUser}>
            <Stack spacing={2}>
              {userFormError && <Alert severity="warning">{userFormError}</Alert>}

              <TextField
                label="Organization"
                value={selectedOrganization?.orgTitle ?? ""}
                InputProps={{ readOnly: true }}
                fullWidth
              />

              <TextField
                label="Division"
                value={selectedDivision?.divName ?? ""}
                InputProps={{ readOnly: true }}
                fullWidth
              />

              <TextField
                label="Name"
                value={userForm.name}
                onChange={handleUserFieldChange("name")}
                fullWidth
              />

              <TextField
                label="Username"
                value={userForm.username}
                onChange={handleUserFieldChange("username")}
                fullWidth
              />

              <TextField
                label="Password"
                type="password"
                value={userForm.password}
                onChange={handleUserFieldChange("password")}
                fullWidth
              />

              <TextField
                label="HRMS ID"
                value={userForm.hrmsId}
                onChange={handleUserFieldChange("hrmsId")}
                fullWidth
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
            {canCreateUser && (
              <Button
                type="submit"
                form="create-user-form"
                variant="contained"
                disabled={isCreatingUser || !selectedOrgId || !selectedDivisionId}
                sx={{ borderRadius: 999 }}
              >
                {isCreatingUser ? "Creating..." : "Create User"}
              </Button>
            )}
            <Button variant="outlined" onClick={closeUserDrawer} sx={{ borderRadius: 999 }}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ManagementWorkspace;
