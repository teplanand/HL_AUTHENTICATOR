import React from "react";
import { Alert, Box, Button, Grid, Stack, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import { useNavigate } from "react-router";
import {
  ProjectMetricCard,
  ProjectSectionCard,
  TimelineList,
  DetailsGrid,
} from "./components";
import {
  activeWorkCards,
  dashboardMetrics,
  notificationItems,
  recentActivities,
} from "./mockData";

const ProjectManagementDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", lg: "center" }}
        spacing={1.5}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.03em" }}>
            Project Management Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            A single workspace covering inquiries, delivery, support, invoices, and notifications.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate("/project-management/inquiries")}
          >
            Create Inquiry
          </Button>
          <Button
            variant="outlined"
            startIcon={<NotificationsActiveRoundedIcon />}
            onClick={() => navigate("/project-management/reports")}
          >
            Open Reports
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={1.5}>
        {dashboardMetrics.map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.id}>
            <ProjectMetricCard
              label={card.label}
              value={card.value}
              helper={card.helper}
              color={card.color}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ProjectSectionCard
            title="Recent Activity"
            subtitle="Latest delivery, support, and invoice actions."
          >
            <TimelineList items={recentActivities} />
          </ProjectSectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ProjectSectionCard
            title="Notifications"
            subtitle="A center-style summary with read and unread states."
          >
            <TimelineList items={notificationItems} />
          </ProjectSectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ProjectSectionCard
            title="Active Work Management"
            subtitle="Current active tasks, paused tasks, and interruption history."
            action={
              <Button size="small" variant="outlined" startIcon={<PauseCircleOutlineRoundedIcon />}>
                Pause Active Work
              </Button>
            }
          >
            <Stack spacing={1.5}>
              {activeWorkCards.map((item) => (
                <Alert
                  key={item.id}
                  severity="info"
                  sx={{
                    border: "1px solid rgba(37,99,235,0.12)",
                    "& .MuiAlert-icon": { color: item.accent },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2">{item.primary}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.secondary}
                  </Typography>
                </Alert>
              ))}
            </Stack>
          </ProjectSectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ProjectSectionCard
            title="Today Snapshot"
            subtitle="Fast-glance numbers for leadership standup."
          >
            <DetailsGrid
              items={[
                { label: "Pending approval", value: "3 scope versions" },
                { label: "Current support timers", value: "2 running" },
                { label: "Projects at risk", value: "2 flagged" },
                { label: "Invoices overdue", value: "1 invoice" },
                { label: "Unassigned backlogs", value: "5 items" },
                { label: "Customer portal replies", value: "4 new comments" },
                { label: "Paused tasks", value: "3 work logs" },
                { label: "Daily utilization", value: "74% team load" },
              ]}
            />
          </ProjectSectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ProjectManagementDashboardPage;
