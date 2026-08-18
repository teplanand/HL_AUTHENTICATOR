import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import type {
  SopAuditRecord,
  SopDocumentRecord,
  SopStage,
  SopWorkflowButtonAction,
} from "./types";
import { normalizeStructuredContentForLevel } from "./structuredContent";
import { calculateNextReleasedVersion } from "./useSopsWorkflowData";
import { sectionTitleSx, surfaceSx } from "./ui";

const stageToneMap: Record<
  SopStage,
  { color: string; background: string; border: string }
> = {
  Draft: { color: "#475569", background: "#F1F5F9", border: "#CBD5E1" },
  "Checker Review": { color: "#1D4ED8", background: "#DBEAFE", border: "#93C5FD" },
  "Approver Review": { color: "#B45309", background: "#FEF3C7", border: "#FCD34D" },
  "Authorizer Review": { color: "#7C3AED", background: "#EDE9FE", border: "#C4B5FD" },
  Authorized: { color: "#4338CA", background: "#E0E7FF", border: "#A5B4FC" },
  Released: { color: "#047857", background: "#D1FAE5", border: "#6EE7B7" },
  Rejected: { color: "#B91C1C", background: "#FEE2E2", border: "#FCA5A5" },
  Archived: { color: "#334155", background: "#E2E8F0", border: "#CBD5E1" },
};

export const StageChip = ({ stage }: { stage: SopStage }) => {
  const tone = stageToneMap[stage];

  return (
    <Chip
      label={stage}
      size="small"
      sx={{
        fontWeight: 700,
        color: tone.color,
        bgcolor: tone.background,
        border: "1px solid",
        borderColor: tone.border,
      }}
    />
  );
};

export const MetricCard = ({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}) => (
  <Box
    sx={{
      ...surfaceSx,
      p: 2.25,
      position: "relative",
      overflow: "hidden",
      minHeight: 148,
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: -32,
        right: -32,
        width: 112,
        height: 112,
        borderRadius: "999px",
        bgcolor: `${color}18`,
      }}
    />
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
    <Typography variant="h4" sx={{ mt: 2, fontWeight: 900, color }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
      {subtitle}
    </Typography>
  </Box>
);

export const DocumentDrawer = ({
  document,
  versions,
  audits,
  open,
  onClose,
}: {
  document: SopDocumentRecord | null;
  versions: Array<{
    version: string;
    revisionDate: string;
    revisedBy: string;
    changeSummary: string;
    stage: SopStage;
  }>;
  audits: SopAuditRecord[];
  open: boolean;
  onClose: () => void;
}) => {
  if (!document) {
    return null;
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", md: 520 }, p: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>
              SOP Quick View
            </Typography>
            <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 0.5 }}>
              {document.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
              <Chip label={document.sopNumber} size="small" />
              <StageChip stage={document.status} />
              <Chip label={`${document.level} / ${document.version}`} size="small" />
            </Stack>
          </Box>

          <Grid container spacing={1.5}>
            {[
              { label: "Department", value: document.department },
              { label: "Owner", value: document.owner },
              { label: "Effective", value: document.effectiveDate },
              { label: "Review", value: document.reviewDate },
            ].map((item) => (
              <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                <Box sx={{ ...surfaceSx, p: 1.75 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.75 }}>
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ ...surfaceSx, p: 2.25 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Scope
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {document.scope}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Change Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {document.changeSummary}
            </Typography>
          </Box>

          <Box sx={{ ...surfaceSx, p: 2.25 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Version Trail
              </Typography>
              <HistoryRoundedIcon color="action" fontSize="small" />
            </Stack>
            <List disablePadding sx={{ mt: 1.5 }}>
              {versions.map((version) => (
                <ListItem key={`${version.version}-${version.revisionDate}`} disableGutters sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${stageToneMap[version.stage].color}20`, color: stageToneMap[version.stage].color }}>
                      <VerifiedRoundedIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${version.version} • ${version.revisionDate}`}
                    secondary={`${version.revisedBy} • ${version.changeSummary}`}
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ ...surfaceSx, p: 2.25 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Recent Audit Events
              </Typography>
              <ShieldRoundedIcon color="action" fontSize="small" />
            </Stack>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {audits.slice(0, 3).map((audit) => (
                <Box key={audit.id}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {audit.action} by {audit.user}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {audit.timestamp} • {audit.ipAddress} • {audit.device}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
};

export const SecureViewerPanel = ({ document }: { document: SopDocumentRecord }) => (
  <Box sx={{ ...surfaceSx, p: 0, overflow: "hidden", minHeight: 580 }}>
    <Box
      sx={{
        px: 3,
        py: 2,
        bgcolor: "#0F172A",
        color: "#F8FAFC",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.75 }}>
          Secure View Session
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {document.sopNumber} • {document.title}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        <Chip label="Download Disabled" size="small" sx={{ bgcolor: "rgba(248,250,252,0.12)", color: "#F8FAFC" }} />
        <Chip label="Watermark Enabled" size="small" sx={{ bgcolor: "rgba(248,250,252,0.12)", color: "#F8FAFC" }} />
      </Stack>
    </Box>

    <Box
      sx={{
        position: "relative",
        minHeight: 500,
        p: 3,
        background:
          "linear-gradient(145deg, rgba(241,245,249,1) 0%, rgba(226,232,240,0.65) 100%)",
      }}
    >
      

      <Stack spacing={2} sx={{ position: "relative" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DescriptionRoundedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {document.title}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {document.purpose}
        </Typography>
        <Divider />
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Procedure Snapshot
        </Typography>
        {[
          "1. Confirm latest released version and verify training requirement.",
          "2. Review prerequisites, reference documents, and safety checks.",
          "3. Execute approved procedure steps and record each checkpoint.",
          "4. Capture deviations, linked records, and revision triggers.",
        ].map((line) => (
          <Typography key={line} variant="body2" color="text.secondary">
            {line}
          </Typography>
        ))}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Session Access Controls
          </Typography>
          <Stack spacing={1.25}>
            {[
              { label: "Viewer session duration", value: 78 },
              { label: "Watermark render integrity", value: 100 },
              { label: "Copy/print/download protection", value: 100 },
            ].map((item) => (
              <Box key={item.label}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.value}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={item.value}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "rgba(148, 163, 184, 0.18)",
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  </Box>
);

export const WorkspacePanel = ({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Box sx={{ ...surfaceSx, p: 2.25 }}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1.5}
    >
      <Box>
        <Typography variant="h6" sx={sectionTitleSx}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
    <Box sx={{ mt: 2 }}>{children}</Box>
  </Box>
);

export const SopDocumentCard = ({
  document,
  helperText,
  primaryLabel,
  onPrimaryAction,
  onOpen,
}: {
  document: SopDocumentRecord;
  helperText?: string;
  primaryLabel?: string;
  onPrimaryAction?: () => void;
  onOpen?: () => void;
}) => (
  <Box sx={{ ...surfaceSx, p: 2 }}>
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      spacing={1.5}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
          <Chip label={document.sopNumber} size="small" />
          <StageChip stage={document.status} />
          <Chip label={`${document.level} / ${document.version}`} size="small" variant="outlined" />
        </Stack>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {document.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {document.department} • Owner: {document.owner}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {helperText ?? document.changeSummary}
        </Typography>
      </Box>
      <Stack direction={{ xs: "row", md: "column" }} spacing={1} alignItems={{ md: "flex-end" }}>
        {onOpen ? (
          <Button variant="outlined" size="small" onClick={onOpen} endIcon={<ArrowForwardRoundedIcon />}>
            Open SOP
          </Button>
        ) : null}
        {onPrimaryAction ? (
          <Button variant="contained" size="small" onClick={onPrimaryAction}>
            {primaryLabel ?? "Continue"}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  </Box>
);

export const EmptyWorkspaceState = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <Box
    sx={{
      ...surfaceSx,
      p: 3,
      textAlign: "center",
      borderStyle: "dashed",
      borderColor: "rgba(148,163,184,0.3)",
    }}
  >
    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
      {subtitle}
    </Typography>
  </Box>
);

export const getSopWorkflowActionButtons = (
  stage: SopStage,
): SopWorkflowButtonAction[] => {
  switch (stage) {
    case "Draft":
    case "Rejected":
      return ["Submit", "Archive"];
    case "Released":
      return ["Revise", "Archive"];
    case "Checker Review":
    case "Approver Review":
      return ["Return", "Approve"];
    case "Authorizer Review":
      return ["Return", "Authorize"];
    case "Authorized":
      return ["Return", "Release", "Archive"];
    default:
      return [];
  }
};

export const SopWorkflowSidebar = ({
  document,
  remarks,
  onRemarksChange,
  onAction,
  actionButtons = getSopWorkflowActionButtons(document.status),
  actionDirection = "row",
  prominentActions = ["Approve", "Submit", "Revise", "Authorize", "Release"],
}: {
  document: SopDocumentRecord;
  remarks: string;
  onRemarksChange: (value: string) => void;
  onAction?: (action: SopWorkflowButtonAction, remarks: string) => void;
  actionButtons?: SopWorkflowButtonAction[];
  actionDirection?: "row" | "column";
  prominentActions?: SopWorkflowButtonAction[];
}) => {
  const projectedReleaseVersion = calculateNextReleasedVersion(
    document.currentReleasedVersion,
  );

  return (
    <Stack spacing={2}>
      <Box sx={{ ...surfaceSx, p: 2.25 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Take Action
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Add a short note if needed, then choose the next step.
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Remarks"
          value={remarks}
          onChange={(event) => onRemarksChange(event.target.value)}
          sx={{ mt: 2 }}
          placeholder="Example: Content checked, ready for next approval"
        />
        <Stack
          direction={actionDirection}
          spacing={1}
          useFlexGap={actionDirection === "row"}
          sx={{ mt: 1 }}
        >
          {actionButtons.map((action) => (
            <Button
              key={action}
              fullWidth={actionDirection === "column"}
              sx={actionDirection === "row" ? { flex: 1, flexGrow: 1 } : undefined}
              variant={prominentActions.includes(action) ? "contained" : "outlined"}
              color={
                action === "Archive"
                  ? "error"
                  : action === "Return"
                    ? "warning"
                    : "primary"
              }
              onClick={() => onAction?.(action, remarks)}
            >
              {action}
            </Button>
          ))}
        </Stack>
      </Box>

      <Box sx={{ ...surfaceSx, p: 2.25 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          People Involved
        </Typography>
        <Stack spacing={1.25} sx={{ mt: 1.5 }}>
          {[
            { label: "Creator", value: document.owner },
            { label: "Checker", value: document.checker },
            { label: "Approver", value: document.approver },
            { label: "Authorizer", value: document.authorizer },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                py: 0.75,
                borderBottom: "1px solid rgba(148,163,184,0.14)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "right" }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ ...surfaceSx, p: 2.25 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Workflow Notes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {document.workflowLabel}
        </Typography>
        <Chip
          label={
            document.status === "Released"
              ? `Current released version ${document.currentReleasedVersion ?? document.version}`
              : `Release will publish ${projectedReleaseVersion}`
          }
          size="small"
          variant="outlined"
          sx={{ mt: 1.5 }}
        />
      </Box>
    </Stack>
  );
};

export const SopReviewDrawer = ({
  document,
  versions,
  audits,
  open,
  onClose,
  onAction,
}: {
  document: SopDocumentRecord | null;
  versions: Array<{
    version: string;
    revisionDate: string;
    revisedBy: string;
    changeSummary: string;
    stage: SopStage;
  }>;
  audits: SopAuditRecord[];
  open: boolean;
  onClose: () => void;
  onAction?: (action: SopWorkflowButtonAction, remarks: string) => void;
}) => {
  const [remarks, setRemarks] = React.useState("");
  const [activeSection, setActiveSection] = React.useState<"overview" | "content" | "history">(
    "overview",
  );
  const [expandedContentSection, setExpandedContentSection] = React.useState<string | false>(
    false,
  );

  React.useEffect(() => {
    if (open) {
      setRemarks("");
      setActiveSection("overview");
      setExpandedContentSection(document?.structuredContent[0]?.title ?? false);
    }
  }, [open, document?.id]);

  if (!document) {
    return null;
  }

  const contentBlocks = normalizeStructuredContentForLevel({
    level: document.level,
    title: document.title,
    department: document.department,
    purpose: document.purpose,
    scope: document.scope,
    existingContent: document.structuredContent,
  });

  const projectedReleaseVersion = calculateNextReleasedVersion(
    document.currentReleasedVersion,
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", lg: 980 }, p: { xs: 2, md: 3 } }}>
        <Stack spacing={2.5}>
          <Box
            sx={{
              ...surfaceSx,
              p: 2.5,
              background:
                "linear-gradient(135deg, rgba(14,165,233,0.10) 0%, rgba(255,255,255,1) 55%, rgba(16,185,129,0.08) 100%)",
            }}
          >
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>
              SOP Review Workspace
            </Typography>
            <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 0.5 }}>
              {document.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Read the SOP first, then add a short remark and take the next action.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
              <Chip label={document.sopNumber} size="small" />
              <StageChip stage={document.status} />
              <Chip label={`${document.level} / ${document.version}`} size="small" />
              <Chip label={document.department} size="small" variant="outlined" />
            </Stack>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 7.8 }}>
              <Stack spacing={2}>
                <Box sx={{ ...surfaceSx, p: 1 }}>
                  <Tabs
                    value={activeSection}
                    onChange={(_, value) => setActiveSection(value)}
                    variant="scrollable"
                    allowScrollButtonsMobile
                  >
                    <Tab value="overview" label="Overview" />
                    <Tab value="content" label="SOP Content" />
                    <Tab value="history" label="History" />
                  </Tabs>
                </Box>

<Box sx={{ p:2}}>
                {activeSection === "overview" ? (
                  <Stack spacing={2}  >
                    <Box sx={{ ...surfaceSx, p: 2.25 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Quick Summary
                        </Typography>
                        <Chip
                          label={`Next release: ${projectedReleaseVersion}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                      <Grid container spacing={1.25} sx={{ mt: 1 }}>
                        {[
                          { label: "Department", value: document.department },
                          { label: "Owner", value: document.owner },
                          { label: "Effective Date", value: document.effectiveDate },
                          {
                            label: "Current Released Version",
                            value: document.currentReleasedVersion ?? "Not released yet",
                          },
                        ].map((item) => (
                          <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                            <Box
                              sx={{
                                border: "1px solid rgba(148,163,184,0.16)",
                                borderRadius: 2.5,
                                p: 1.25,
                                bgcolor: "rgba(248,250,252,0.75)",
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                {item.label}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.35 }}>
                                {item.value}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    <Box sx={{ ...surfaceSx, p: 2.25 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            Purpose
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
                            {document.purpose}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            Scope
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
                            {document.scope}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                    </Box>
                  </Stack>
                ) : null}

                {activeSection === "content" ? (
                  <Box sx={{ ...surfaceSx, p: 2.25 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      SOP Content
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      Read the complete SOP content before taking any approval action.
                    </Typography>
                    <Stack spacing={1.25} sx={{ mt: 2 }}>
                      {contentBlocks.map((block, index) => (
                        <Accordion
                          key={block.title}
                          sx={{
                            border: "1px solid rgba(148, 163, 184, 0.18)",
                            borderRadius: "12px !important",
                            overflow: "hidden",
                            bgcolor: "rgba(255,255,255,0.92)",
                            boxShadow: "none",
                          }}
                          expanded={expandedContentSection === block.title}
                          onChange={(_, expanded) =>
                            setExpandedContentSection(expanded ? block.title : false)
                          }
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreRoundedIcon />}
                            sx={{
                              px: 2,
                              bgcolor: "rgba(248,250,252,0.95)",
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                            }}
                          >
                             
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {block.title} 
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails
                            sx={{
                              px: 2.25,
                              py: 2,
                              color: "text.secondary",
                              fontSize: "0.95rem",
                              lineHeight: 1.75,
                              "& p": { my: 0, mb: 1.4 },
                              "& ul, & ol": { pl: 3, my: 0.75 },
                              "& li": { mb: 0.5 },
                              "& table": { width: "100%", borderCollapse: "collapse", mt: 1.5 },
                              "& th, & td": {
                                border: "1px solid rgba(148,163,184,0.24)",
                                px: 1.25,
                                py: 0.9,
                                textAlign: "left",
                              },
                            }}
                          >
                            <Box
                              dangerouslySetInnerHTML={{ __html: block.html }}
                            />
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                {activeSection === "history" ? (
                  <Stack spacing={2}>
                    <Box sx={{ ...surfaceSx, p: 2.25 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Version Trail
                        </Typography>
                        <HistoryRoundedIcon color="action" fontSize="small" />
                      </Stack>
                      <List disablePadding sx={{ mt: 1.5 }}>
                        {versions.slice(0, 6).map((version) => (
                          <ListItem
                            key={`${version.version}-${version.revisionDate}`}
                            disableGutters
                            sx={{ py: 1, alignItems: "flex-start" }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: `${stageToneMap[version.stage].color}20`,
                                  color: stageToneMap[version.stage].color,
                                }}
                              >
                                <VerifiedRoundedIcon fontSize="small" />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${version.version} • ${version.revisionDate}`}
                              secondary={`${version.revisedBy} • ${version.changeSummary}`}
                              primaryTypographyProps={{ fontWeight: 700 }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Box sx={{ ...surfaceSx, p: 2.25 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Recent Audit Events
                        </Typography>
                        <ShieldRoundedIcon color="action" fontSize="small" />
                      </Stack>
                      <Stack spacing={1.5} sx={{ mt: 1.75 }}>
                        {audits.slice(0, 5).map((audit) => (
                          <Box
                            key={audit.id}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "14px 1fr",
                              gap: 1.25,
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor: "primary.main",
                                  boxShadow: "0 0 0 4px rgba(37,99,235,0.12)",
                                }}
                              />
                            </Box>
                            <Box
                              sx={{
                                pb: 1.5,
                                borderLeft: "2px solid rgba(148,163,184,0.18)",
                                pl: 1.5,
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {audit.action} by {audit.user}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {audit.timestamp}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                {audit.newValue}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                ) : null}

</Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4.2 }}>
              <Box sx={{ position: { lg: "sticky" }, top: { lg: 24 } }}>
                <SopWorkflowSidebar
                  document={document}
                  remarks={remarks}
                  onRemarksChange={setRemarks}
                  onAction={onAction}
                  actionDirection="column"
                  prominentActions={["Approve", "Authorize", "Release"]}
                />
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Drawer>
  );
};
