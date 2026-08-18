import React from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ProtectedFileSurface from "./protected-file-surface";
import { createSopPdfBlob } from "./sopPdf";
import { surfaceSx } from "./ui";
import { calculateNextReleasedVersion } from "./useSopsWorkflowData";
import type { SopAuditRecord, SopDocumentRecord, SopStage } from "./types";

export type SopDetailSection = "overview" | "content" | "history";

type SopDetailTabsPanelProps = {
  document: SopDocumentRecord;
  versions: Array<{
    id?: string;
    version: string;
    revisionDate: string;
    revisedBy: string;
    changeSummary: string;
    stage: SopStage;
  }>;
  audits: SopAuditRecord[];
  activeSection: SopDetailSection;
};

const SopDetailTabsPanel = ({
  document,
  versions,
  audits,
  activeSection,
}: SopDetailTabsPanelProps) => {
  const [previewStatus, setPreviewStatus] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [previewUrl, setPreviewUrl] = React.useState("");
  const [previewError, setPreviewError] = React.useState("");

  React.useEffect(() => {
    if (activeSection !== "content") {
      return;
    }

    let active = true;
    let objectUrl = "";

    const preparePreview = async () => {
      setPreviewStatus("loading");
      setPreviewError("");
      setPreviewUrl("");

      if (document.contentSource === "file") {
        if (!document.contentFileUrl) {
          if (active) {
            setPreviewStatus("error");
            setPreviewError("Uploaded PDF preview is not available for this SOP.");
          }
          return;
        }

        if (active) {
          setPreviewUrl(document.contentFileUrl);
          setPreviewStatus("ready");
        }
        return;
      }

      try {
        const pdfBlob = await createSopPdfBlob(document);
        objectUrl = URL.createObjectURL(pdfBlob);

        if (!active) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        setPreviewUrl(objectUrl);
        setPreviewStatus("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setPreviewStatus("error");
        setPreviewError(
          error instanceof Error ? error.message : "Unable to generate SOP content preview.",
        );
      }
    };

    void preparePreview();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [activeSection, document]);

  if (activeSection === "overview") {
    return (
      <Stack spacing={2}>
        <Box sx={{ ...surfaceSx, p: 2.25 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              SOP Metadata
            </Typography>
            <Chip
              label={`Next release: ${calculateNextReleasedVersion(document.currentReleasedVersion)}`}
              size="small"
              variant="outlined"
            />
          </Stack>
          <Grid container spacing={1.25} sx={{ mt: 1 }}>
            {[
              { label: "Reference Number", value: document.sopNumber },
              { label: "Title", value: document.title },
              { label: "Department", value: document.department },
              { label: "Division", value: document.division },
              { label: "Category", value: document.category },
              { label: "Level", value: document.level },
              { label: "Subject", value: document.subject },
              { label: "Version", value: document.version },
              { label: "Draft Code", value: document.draftCode },
              { label: "Effective Date", value: document.effectiveDate },
              { label: "Review Date", value: document.reviewDate },
              { label: "Priority", value: document.priority },
              { label: "Status", value: document.status },
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
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Purpose
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
            {document.purpose}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Scope
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
            {document.scope}
          </Typography>
        </Box>

        <Box sx={{ ...surfaceSx, p: 2.25 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Creator
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
                {document.owner}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Checker
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
                {document.checker}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Approver
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
                {document.approver}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Authorizer
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
                {document.authorizer}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Keywords
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {document.keywords.length ? (
              document.keywords.map((keyword) => (
                <Chip key={keyword} label={keyword} size="small" variant="outlined" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No keywords configured.
              </Typography>
            )}
          </Stack>
          
        </Box>
      </Stack>
    );
  }

  if (activeSection === "content") {
    return (
      <Box sx={{ ...surfaceSx, p: 2.25 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              SOP Content Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              If an uploaded PDF is available, it is previewed directly. Otherwise, a PDF is generated from the saved HTML content and shown here.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              label={
                document.contentSource === "file" ? "Source: Uploaded PDF" : "Source: Content Editor"
              }
              size="small"
              variant="outlined"
            />
            {document.contentFileName ? (
              <Chip label={document.contentFileName} size="small" variant="outlined" />
            ) : null}
          </Stack>
        </Stack>

        <Box sx={{ mt: 2, minHeight: 620 }}>
          {previewStatus === "loading" || previewStatus === "idle" ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{
                minHeight: 620,
                bgcolor: "#020617",
                borderRadius: 3,
                border: "1px solid rgba(148,163,184,0.18)",
              }}
            >
              <CircularProgress size={26} />
              <Typography variant="body2" color="common.white">
                {document.contentSource === "file"
                  ? "Loading uploaded PDF preview..."
                  : "Generating PDF from SOP content..."}
              </Typography>
            </Stack>
          ) : null}

          {previewStatus === "error" ? (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {previewError}
            </Alert>
          ) : null}

          {previewStatus === "ready" && previewUrl ? (
            <ProtectedFileSurface
              file={{
                name: document.contentFileName ?? `${document.sopNumber}-${document.version}.pdf`,
                url: previewUrl,
                type: "pdf",
              }}
              watermarkText={`${document.sopNumber} ${document.owner}`}
            />
          ) : null}
        </Box>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Box sx={{ ...surfaceSx, p: 2.25 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Version Trail
          </Typography>
          <HistoryRoundedIcon color="action" fontSize="small" />
        </Stack>
        <Stack spacing={1.25} sx={{ mt: 1.5 }}>
          {versions.slice(0, 6).map((version) => (
            <Box key={version.id ?? `${version.version}-${version.revisionDate}`} sx={{ ...surfaceSx, p: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedRoundedIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Version {version.version}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.4 }}>
                {version.revisionDate} • {version.revisedBy}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                {version.changeSummary}
              </Typography>
            </Box>
          ))}
        </Stack>
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
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {audit.newValue}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

export default SopDetailTabsPanel;
