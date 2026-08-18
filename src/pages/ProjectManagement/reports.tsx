import React from "react";
import { Box, Button, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import {
  ProgressSummary,
  ProjectMetricCard,
  ProjectSectionCard,
} from "./components";
import { reportCards, workloadRows } from "./mockData";

const ProjectManagementReportsPage = () => {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.03em" }}>
          Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Progress, hours, workload, support, and invoice reports with an export-first layout.
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        {reportCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.id}>
            <ProjectMetricCard
              label={card.title}
              value={card.value}
              helper={card.helper}
              color={card.color}
            />
          </Grid>
        ))}
      </Grid>

      <ProjectSectionCard
        title="Project Progress Report"
        subtitle="Project and module progress with filters and export options."
        action={
          <Button variant="contained" startIcon={<DownloadRoundedIcon />}>
            Export
          </Button>
        }
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
          <TextField select size="small" label="Project" defaultValue="all" sx={{ minWidth: 160 }}>
            <MenuItem value="all">All Projects</MenuItem>
            <MenuItem value="Atlas Traceability">Atlas Traceability</MenuItem>
          </TextField>
          <TextField select size="small" label="Module" defaultValue="all" sx={{ minWidth: 160 }}>
            <MenuItem value="all">All Modules</MenuItem>
            <MenuItem value="Platform Setup">Platform Setup</MenuItem>
            <MenuItem value="Operations">Operations</MenuItem>
          </TextField>
        </Stack>
        <Stack spacing={1.5}>
          <ProgressSummary label="Atlas Traceability" value={64} helper="Operations and setup work combined." />
          <ProgressSummary label="Nova Line Revamp" value={38} helper="Waiting for stakeholder sign-off." color="#D97706" />
          <ProgressSummary label="Prime Inspection Mobile" value={12} helper="Planning phase." color="#7C3AED" />
        </Stack>
      </ProjectSectionCard>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ProjectSectionCard title="Estimated vs Actual Hours" subtitle="Charts/table concept with project/user/module filters.">
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
              <TextField select size="small" label="User" defaultValue="all" sx={{ minWidth: 150 }}>
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="Nirav Patel">Nirav Patel</MenuItem>
              </TextField>
              <TextField select size="small" label="Module" defaultValue="all" sx={{ minWidth: 150 }}>
                <MenuItem value="all">All Modules</MenuItem>
                <MenuItem value="Operations">Operations</MenuItem>
              </TextField>
            </Stack>
            <ProgressSummary label="Atlas Traceability" value={56} helper="233 actual vs 420 planned hours." />
            <ProgressSummary label="Nova Line Revamp" value={51} helper="162 actual vs 320 planned hours." color="#D97706" />
          </ProjectSectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ProjectSectionCard title="Team Workload Report" subtitle="User workload, active work, and assigned hours.">
            <Stack spacing={1.25}>
              {workloadRows.map((row) => (
                <ProgressSummary
                  key={row.id}
                  label={`${row.user} • ${row.activeWork} active`}
                  value={Math.round((row.assignedHours / row.capacity) * 100)}
                  helper={`${row.assignedHours}h assigned of ${row.capacity}h capacity • ${row.status}`}
                  color={row.status === "High" ? "#DC2626" : row.status === "Balanced" ? "#2563EB" : "#059669"}
                />
              ))}
            </Stack>
          </ProjectSectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ProjectSectionCard title="Support Report" subtitle="Support count, priority, and resolution time.">
            <ProgressSummary label="Critical Tickets Closed" value={80} helper="4 of 5 closed within same day." color="#DC2626" />
            <ProgressSummary label="Average Resolution Time" value={46} helper="4.6 hours target tracking." color="#7C3AED" />
          </ProjectSectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ProjectSectionCard title="Invoice Report" subtitle="Invoiced, paid, pending, and overdue values.">
            <ProgressSummary label="Paid Value Ratio" value={68} helper="Paid versus invoiced this month." color="#059669" />
            <ProgressSummary label="Overdue Exposure" value={22} helper="One invoice currently beyond due date." color="#D97706" />
          </ProjectSectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ProjectManagementReportsPage;
