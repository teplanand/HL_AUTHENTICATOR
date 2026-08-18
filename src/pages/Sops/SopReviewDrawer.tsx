import React from "react";
import {
  Box,
  Button,
  Chip,
  Drawer,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { StageChip } from "./components";
import SopDetailTabsPanel, { type SopDetailSection } from "./SopDetailTabsPanel";
import { sectionTitleSx, surfaceSx } from "./ui";
import { calculateNextReleasedVersion } from "./useSopsWorkflowData";
import type { SopAuditRecord, SopDocumentRecord, SopStage, SopWorkflowButtonAction } from "./types";

type SopReviewDrawerProps = {
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
};

const SopReviewDrawer = ({
  document,
  versions,
  audits,
  open,
  onClose,
  onAction,
}: SopReviewDrawerProps) => {
  const [remarks, setRemarks] = React.useState("");
  const [activeSection, setActiveSection] = React.useState<SopDetailSection>("overview");

  React.useEffect(() => {
    if (open) {
      setRemarks("");
      setActiveSection("overview");
    }
  }, [open, document?.id]);

  if (!document) {
    return null;
  }

  const actionButtons = (() => {
    switch (document.status) {
      case "Draft":
      case "Rejected":
        return ["Submit", "Archive"] as const;
      case "Checker Review":
      case "Approver Review":
        return ["Return", "Approve"] as const;
      case "Authorizer Review":
        return ["Return", "Authorize"] as const;
      case "Authorized":
        return ["Return", "Release", "Archive"] as const;
      case "Released":
        return ["Revise", "Archive"] as const;
      default:
        return [] as const;
    }
  })();
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

                <Box sx={{ p: 2 }}>
                  <SopDetailTabsPanel
                    document={document}
                    versions={versions}
                    audits={audits}
                    activeSection={activeSection}
                  />
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4.2 }}>
              <Stack spacing={1} sx={{ position: { lg: "sticky" }, top: { lg: 24 } }}>
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
                    onChange={(event) => setRemarks(event.target.value)}
                    sx={{ mt: 2 }}
                    placeholder="Example: Content checked, ready for next approval"
                  />
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ mt: 2 }}
                  >
                    {actionButtons.map((action) => (
                      <Button
                        key={action}
                        variant={
                          action === "Approve" ||
                          action === "Authorize" ||
                          action === "Release"
                            ? "contained"
                            : "outlined"
                        }
                        color={
                          action === "Reject" || action === "Archive"
                            ? "error"
                            : action === "Return"
                              ? "warning"
                              : "primary"
                        }
                        sx={{ minWidth: 132 }}
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
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default SopReviewDrawer;
