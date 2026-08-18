import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AltRouteRoundedIcon from "@mui/icons-material/AltRouteRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { MetricCard } from "./components";
import { sectionTitleSx, surfaceSx } from "./ui";
import { sopWorkflowConfigurations, sopWorkflowStages } from "./mockData";
import type {
  SopWorkflowConfigurationRecord,
  SopWorkflowStageRecord,
} from "./types";

const fixedWorkflowNotes = [
  "Stage sequence is fixed for every SOP.",
  "Return and reject actions always move the document back to the creator.",
  "Release happens only after authorizer completion.",
  "All workflow actions are captured in audit history.",
];

const getStageTone = (sequence: number) => {
  const tones = [
    { accent: "#2563EB", soft: "#DBEAFE" },
    { accent: "#7C3AED", soft: "#EDE9FE" },
    { accent: "#D97706", soft: "#FEF3C7" },
    { accent: "#059669", soft: "#D1FAE5" },
    { accent: "#475569", soft: "#E2E8F0" },
  ];

  return tones[(sequence - 1) % tones.length];
};

const WorkflowStageCard = ({ stage }: { stage: SopWorkflowStageRecord }) => {
  const tone = getStageTone(stage.sequence);

  return (
    <Box
      sx={{
        ...surfaceSx,
        p: 2,
        borderColor: `${tone.accent}33`,
        background: `linear-gradient(180deg, ${tone.soft}AA 0%, rgba(255,255,255,0.98) 100%)`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "999px",
            bgcolor: tone.accent,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {stage.sequence}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {stage.stageName}
            </Typography>
            <Chip
              size="small"
              label={stage.dueDays > 0 ? `${stage.dueDays} day SLA` : "Immediate"}
              sx={{
                bgcolor: `${tone.accent}14`,
                color: tone.accent,
                fontWeight: 700,
              }}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Owner: {stage.roleResponsible}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
            {stage.availableActions.map((action) => (
              <Chip key={action} size="small" label={action} variant="outlined" />
            ))}
            {stage.escalationAfterDays > 0 ? (
              <Chip
                size="small"
                label={`Escalate after ${stage.escalationAfterDays} days`}
                variant="outlined"
              />
            ) : null}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

const WorkflowConfigurationPage = () => {
  const configuration = sopWorkflowConfigurations[0];

  const scopeFields: Array<{
    key: keyof Pick<
      SopWorkflowConfigurationRecord,
      "scopeCompany" | "scopeDivision" | "scopeDepartment"
    >;
    label: string;
  }> = [
    { key: "scopeCompany", label: "Company" },
    { key: "scopeDivision", label: "Division" },
    { key: "scopeDepartment", label: "Department" },
  ];

  const roleFields: Array<{
    key: keyof Pick<
      SopWorkflowConfigurationRecord,
      | "creatorRole"
      | "checkerRole"
      | "approverRole"
      | "authorizerRole"
      | "escalationRole"
    >;
    label: string;
  }> = [
    { key: "creatorRole", label: "Creator Role" },
    { key: "checkerRole", label: "Checker Role" },
    { key: "approverRole", label: "Approver Role" },
    { key: "authorizerRole", label: "Authorizer Role" },
    { key: "escalationRole", label: "Escalation Role" },
  ];

  return (
    <Stack spacing={3}>
      <Card sx={surfaceSx}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  label="Fixed Workflow"
                  sx={{ bgcolor: "#DBEAFE", color: "#1D4ED8", fontWeight: 700 }}
                />
                <Chip
                  size="small"
                  label={`${sopWorkflowStages.length} Stages`}
                  variant="outlined"
                />
              </Stack>
              <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 1.5 }}>
                Workflow Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Workflow route, action set, and return logic are system-managed.
                Only operational settings required for daily use remain configurable.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined">Save Changes</Button>
              <Button variant="contained">Publish Config</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Workflow Route"
            value="Fixed"
            subtitle="Single SOP approval route shared across all records"
            color="#2563EB"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Reminder Cadence"
            value={configuration.reminderFrequency}
            subtitle="Automatic reminder interval for pending approvers"
            color="#D97706"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Escalation Owner"
            value={configuration.escalationRole}
            subtitle="Single escalation owner for overdue workflow tasks"
            color="#7C3AED"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Audit Trail"
            value={configuration.auditRequired ? "Required" : "Optional"}
            subtitle="All actions remain logged before release is completed"
            color="#059669"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={surfaceSx}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SettingsSuggestRoundedIcon color="primary" />
                <Typography variant="h6" sx={sectionTitleSx}>
                  Minimum Configurable Settings
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This screen now keeps only the required controls such as scope,
                role mapping, reminders, escalation, and audit settings.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Scope Mapping
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                {scopeFields.map((field) => (
                  <Grid key={field.key} size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label={field.label}
                      defaultValue={configuration[field.key]}
                    />
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Role Mapping
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                {roleFields.map((field) => (
                  <Grid key={field.key} size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={field.label}
                      defaultValue={configuration[field.key]}
                    />
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Operational Controls
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    defaultValue={configuration.activeStatus}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Reminder Frequency"
                    defaultValue={configuration.reminderFrequency}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    select
                    label="Audit Trail"
                    defaultValue={configuration.auditRequired ? "Required" : "Optional"}
                  >
                    <MenuItem value="Required">Required</MenuItem>
                    <MenuItem value="Optional">Optional</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  border: "1px dashed rgba(37, 99, 235, 0.28)",
                  bgcolor: "rgba(219, 234, 254, 0.45)",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#1D4ED8" }}>
                  Static behavior has been removed from the editable form.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Stage sequence, action rules, and return path remain fixed in the
                  system, so users only maintain the settings that actually change.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            <Card sx={surfaceSx}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AltRouteRoundedIcon color="primary" />
                  <Typography variant="h6" sx={sectionTitleSx}>
                    Fixed Workflow Route
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This flow remains the same for all SOPs, so it is shown here as a
                  read-only preview.
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 2.5 }}>
                  {sopWorkflowStages.map((stage) => (
                    <WorkflowStageCard key={stage.id} stage={stage} />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={surfaceSx}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <NotificationsActiveRoundedIcon color="primary" />
                  <Typography variant="h6" sx={sectionTitleSx}>
                    System Managed Rules
                  </Typography>
                </Stack>

                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  {fixedWorkflowNotes.map((note) => (
                    <Box
                      key={note}
                      sx={{
                        ...surfaceSx,
                        p: 1.5,
                        borderColor: "rgba(148, 163, 184, 0.24)",
                        boxShadow: "none",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {note}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={surfaceSx}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ShieldRoundedIcon color="primary" />
                  <Typography variant="h6" sx={sectionTitleSx}>
                    Control Summary
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                  <Chip label={`Status: ${configuration.activeStatus}`} />
                  <Chip label={`Reminder: ${configuration.reminderFrequency}`} />
                  <Chip label={`Escalation: ${configuration.escalationRole}`} />
                  <Chip
                    label={`Audit: ${configuration.auditRequired ? "Required" : "Optional"}`}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default WorkflowConfigurationPage;
