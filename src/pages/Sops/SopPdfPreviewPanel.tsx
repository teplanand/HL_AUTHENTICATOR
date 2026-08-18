import React from "react";
import { Alert, Box, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import ProtectedFileSurface from "./protected-file-surface";
import { createSopPdfBlob } from "./sopPdf";
import { StageChip } from "./components";
import { sectionTitleSx } from "./ui";
import type { SopDocumentRecord } from "./types";

type SopPdfPreviewPanelProps = {
  document: SopDocumentRecord;
  minHeight?: number;
  title?: string;
  subtitle?: string;
};

const SopPdfPreviewPanel = ({
  document,
  minHeight = 620,
  title = document.title,
  subtitle = "If an uploaded PDF is available, the same file is shown in protected preview. Otherwise, a PDF is generated from the saved SOP content.",
}: SopPdfPreviewPanelProps) => {
  const [previewUrl, setPreviewUrl] = React.useState("");
  const [pdfStatus, setPdfStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [pdfError, setPdfError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    let objectUrl = "";

    const preparePreview = async () => {
      setPdfStatus("loading");
      setPdfError("");
      setPreviewUrl("");

      if (document.contentSource === "file") {
        if (!document.contentFileUrl) {
          if (active) {
            setPdfStatus("error");
            setPdfError("Uploaded PDF preview is not available for this released SOP.");
          }
          return;
        }

        if (active) {
          setPreviewUrl(document.contentFileUrl);
          setPdfStatus("ready");
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
        setPdfStatus("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setPdfStatus("error");
        setPdfError(
          error instanceof Error ? error.message : "Unable to generate SOP PDF from saved content.",
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
  }, [document]);

  return (
    <Stack spacing={2}>
      <Stack spacing={1.25}>
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>
          Protected PDF Viewer
        </Typography>
        <Typography variant="h5" sx={sectionTitleSx}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Chip label={document.sopNumber} size="small" />
          <StageChip stage={document.status} />
          <Chip label={document.category} size="small" />
          <Chip label={`Version ${document.version}`} size="small" />
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

      <Box sx={{ minHeight }}>
        {pdfStatus === "loading" || pdfStatus === "idle" ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
            sx={{
              minHeight,
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

        {pdfStatus === "error" ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {pdfError}
          </Alert>
        ) : null}

        {pdfStatus === "ready" && previewUrl ? (
          <ProtectedFileSurface
            file={{
              name: document.contentFileName ?? `${document.sopNumber}-${document.version}.pdf`,
              url: previewUrl,
              type: "pdf",
            }}
            watermarkText={`${document.sopNumber} ${document.owner}`}
            minHeight={minHeight}
          />
        ) : null}
      </Box>
    </Stack>
  );
};

export default SopPdfPreviewPanel;
