import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  Apartment as ApartmentIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Groups2 as Groups2Icon,
  PendingActions as PendingActionsIcon,
} from "@mui/icons-material";
import {
  useGetCompanyListQuery,
  useGetRegistrationDataQuery,
} from "../api/evidancecollection";
import {
  extractEvidenceErrorMessage,
  formatEvidenceDateTime,
  normalizeEvidenceCompanies,
  normalizeEvidenceRegistrations,
} from "../adminUtils";
import { Page } from "../../../../shared/components/common/Page";

const metricCardStyles = {
  height: "100%",
  borderRadius: 3,
  boxShadow: "0px 16px 40px rgba(15, 23, 42, 0.08)",
};

const AdminDashboard = () => {
  const {
    data: registrationResponse,
    isLoading: isRegistrationLoading,
    isFetching: isRegistrationFetching,
    error: registrationError,
  } = useGetRegistrationDataQuery();

  const {
    data: companyResponse,
    isLoading: isCompanyLoading,
    isFetching: isCompanyFetching,
    error: companyError,
  } = useGetCompanyListQuery();

  const registrations = normalizeEvidenceRegistrations(registrationResponse);
  const companies = normalizeEvidenceCompanies(companyResponse);

  const totalRegistrations = registrations.length;
  const approvedRegistrations = registrations.filter(
    (registration) => registration.statusCode === 1,
  ).length;
  const pendingRegistrations = registrations.filter(
    (registration) => registration.statusCode !== 1 && registration.statusCode !== 2,
  ).length;
  const activeRegistrations = registrations.filter(
    (registration) => registration.isActive,
  ).length;
  const activeCompanies = companies.filter((company) => company.isActive).length;

  const isLoading =
    isRegistrationLoading ||
    isRegistrationFetching ||
    isCompanyLoading ||
    isCompanyFetching;

  const recentRegistrations = [...registrations]
    .sort((first, second) => {
      const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return secondTime - firstTime;
    })
    .slice(0, 5);

  const recentCompanies = [...companies]
    .sort((first, second) => {
      const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return secondTime - firstTime;
    })
    .slice(0, 5);

  const errorMessage =
    extractEvidenceErrorMessage(registrationError) ||
    extractEvidenceErrorMessage(companyError);

  return (
    <Page module="evidance">
      <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: "#f8fafc", minHeight: "100%" }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Evidence Collection Admin Dashboard
            </Typography>
            <Typography color="text.secondary">
              Registration approvals, active users, and company onboarding summary.
            </Typography>
          </Box>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Grid container spacing={2.5}>
            {[
              {
                title: "Total Registrations",
                value: totalRegistrations,
                subtitle: `${activeRegistrations} active users`,
                icon: <Groups2Icon />,
                color: "#0f766e",
                bg: "#ecfeff",
              },
              {
                title: "Approved Requests",
                value: approvedRegistrations,
                subtitle: `${pendingRegistrations} pending review`,
                icon: <CheckCircleOutlineIcon />,
                color: "#15803d",
                bg: "#f0fdf4",
              },
              {
                title: "Pending Requests",
                value: pendingRegistrations,
                subtitle: "Awaiting admin action",
                icon: <PendingActionsIcon />,
                color: "#c2410c",
                bg: "#fff7ed",
              },
              {
                title: "Companies",
                value: companies.length,
                subtitle: `${activeCompanies} active companies`,
                icon: <ApartmentIcon />,
                color: "#1d4ed8",
                bg: "#eff6ff",
              },
            ].map((item) => (
              <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card sx={metricCardStyles}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {item.title}
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {item.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {item.subtitle}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          color: item.color,
                          backgroundColor: item.bg,
                        }}
                      >
                        {item.icon}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Card sx={metricCardStyles}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Recent User Registrations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Latest requests received in the evidence collection app.
                      </Typography>
                    </Box>
                    {isLoading ? <CircularProgress size={22} /> : null}
                  </Stack>

                  <Stack spacing={1.5}>
                    {recentRegistrations.length ? (
                      recentRegistrations.map((registration) => (
                        <Box
                          key={`${registration.id}-${registration.hrmsId}`}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box>
                              <Typography fontWeight={600}>{registration.hrmsId}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Mobile: {registration.mobileNo}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Created: {formatEvidenceDateTime(registration.createdAt)}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                size="small"
                                label={registration.isActive ? "Active" : "Inactive"}
                                color={registration.isActive ? "success" : "default"}
                                variant={registration.isActive ? "filled" : "outlined"}
                              />
                              <Chip
                                size="small"
                                label={registration.statusLabel}
                                color={
                                  registration.statusCode === 1
                                    ? "success"
                                    : registration.statusCode === 2
                                      ? "error"
                                      : "warning"
                                }
                                variant="outlined"
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      ))
                    ) : (
                      <Typography color="text.secondary">
                        No registration records found.
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Card sx={metricCardStyles}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>
                    Latest Companies
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Recently available companies from the evidence collection API.
                  </Typography>

                  <Stack spacing={1.5}>
                    {recentCompanies.length ? (
                      recentCompanies.map((company) => (
                        <Box
                          key={`${company.id}-${company.companyName}`}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={1}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography fontWeight={600} noWrap>
                                {company.companyName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {company.email}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatEvidenceDateTime(company.createdAt)}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={company.isActive ? "Active" : "Inactive"}
                              color={company.isActive ? "success" : "default"}
                              variant={company.isActive ? "filled" : "outlined"}
                            />
                          </Stack>
                        </Box>
                      ))
                    ) : (
                      <Typography color="text.secondary">
                        No company records found.
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Page>
  );
};

export default AdminDashboard;
