import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import JoditEditor from "jodit-react";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  buildCategoryDropdownOptions,
  getCategoryContentHeaders,
  inferLevelFromCategory,
} from "./categoryUtils";
import ProtectedFileSurface from "./protected-file-surface";
import { normalizeStructuredContentForLevel, SOP_CONTENT_SECTION_TITLE } from "./structuredContent";
import type {
  SopDocumentRecord,
  SopLevel,
  SopPriority,
  SopStructuredContentBlock,
} from "./types";
import { useSopsWorkflowData } from "./useSopsWorkflowData";

export type SopDocumentEditValues = {
  sopNumber: string;
  title: string;
  level: SopLevel;
  category: string;
  division: string;
  department: string;
  subject: string;
  effectiveDate: string;
  reviewDate: string;
  keywords: string[];
  contentSource: "editor" | "file";
  contentFileName: string | null;
  contentFileUrl: string | null;
  priority: SopPriority;
  owner: string;
  checker: string;
  approver: string;
  authorizer: string;
  purpose: string;
  scope: string;
  changeSummary: string;
  structuredContent: SopStructuredContentBlock[];
};

const editTabs = [
  { key: "basics", label: "Basic Info" },
  { key: "version", label: "Version" },
  { key: "content", label: "Content" },
  // Reviewers tab intentionally hidden for now.
] as const;

type EditTabKey = (typeof editTabs)[number]["key"];

const editorConfig = {
  readonly: false,
  height: 260,
  toolbarAdaptive: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  buttons: [
    "bold",
    "italic",
    "underline",
    "|",
    "ul",
    "ol",
    "|",
    "font",
    "fontsize",
    "brush",
    "paragraph",
    "|",
    "table",
    "link",
    "|",
    "align",
    "undo",
    "redo",
    "|",
    "hr",
    "eraser",
    "fullsize",
  ],
  uploader: {
    insertImageAsBase64URI: true,
  },
  style: {
    background: "#ffffff",
    color: "#0f172a",
    font: "14px/1.7 Arial,sans-serif",
  },
};

type SopEditDialogProps = {
  open: boolean;
  document: SopDocumentRecord | null;
  canEdit: boolean;
  allowedEditorLabel: string;
  currentActorLabel: string;
  onClose: () => void;
  onSave: (values: SopDocumentEditValues) => void;
};

const createInitialValues = (
  document: SopDocumentRecord | null,
  categoryHeaders: string[] = [],
): SopDocumentEditValues => ({
  sopNumber: document?.sopNumber ?? "",
  title: document?.title ?? "",
  level: document?.level ?? "Level 2",
  category: document?.category ?? "",
  division: document?.division ?? "",
  department: document?.department ?? "",
  subject: document?.subject ?? "",
  effectiveDate: document?.effectiveDate ?? "",
  reviewDate: document?.reviewDate ?? "",
  keywords: document?.keywords ?? [],
  contentSource: document?.contentSource ?? "editor",
  contentFileName: document?.contentFileName ?? null,
  contentFileUrl: document?.contentFileUrl ?? null,
  priority: document?.priority ?? "Medium",
  owner: document?.owner ?? "",
  checker: document?.checker ?? "",
  approver: document?.approver ?? "",
  authorizer: document?.authorizer ?? "",
  purpose: document?.purpose ?? "",
  scope: document?.scope ?? "",
  changeSummary: document?.changeSummary ?? "",
  structuredContent: normalizeStructuredContentForLevel({
    level: document?.level ?? "Level 2",
    title: document?.title ?? "",
    department: document?.department ?? "",
    purpose: document?.purpose ?? "",
    scope: document?.scope ?? "",
    headers: categoryHeaders,
    existingContent: document?.structuredContent.map((block) => ({ ...block })) ?? [],
  }),
});

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read the selected PDF file."));
    };

    reader.onerror = () => reject(new Error("Unable to read the selected PDF file."));
    reader.readAsDataURL(file);
  });

const SopEditDialog = ({
  open,
  document,
  canEdit,
  allowedEditorLabel,
  currentActorLabel,
  onClose,
  onSave,
}: SopEditDialogProps) => {
  const { categoryRecords } = useSopsWorkflowData();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = React.useState<EditTabKey>("basics");
  const initialCategoryHeaders = React.useMemo(
    () => getCategoryContentHeaders(categoryRecords, document?.category),
    [categoryRecords, document?.category],
  );
  const [formValues, setFormValues] = React.useState<SopDocumentEditValues>(() =>
    createInitialValues(document, initialCategoryHeaders),
  );
  const categoryOptions = React.useMemo(
    () => buildCategoryDropdownOptions(categoryRecords, formValues.category),
    [categoryRecords, formValues.category],
  );
  const categoryHeaders = React.useMemo(
    () => getCategoryContentHeaders(categoryRecords, formValues.category),
    [categoryRecords, formValues.category],
  );
  const initialCategoryHeadersKey = React.useMemo(
    () => initialCategoryHeaders.join("|"),
    [initialCategoryHeaders],
  );

  React.useEffect(() => {
    if (open) {
      setActiveTab("basics");
      setFormValues(createInitialValues(document, initialCategoryHeaders));
    }
  }, [document?.id, initialCategoryHeadersKey, open]);

  const updateField = <K extends keyof SopDocumentEditValues>(
    field: K,
    value: SopDocumentEditValues[K],
  ) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const updateStructuredContent = (index: number, html: string) => {
    setFormValues((current) => ({
      ...current,
      structuredContent: current.structuredContent.map((block, blockIndex) =>
        blockIndex === index ? { ...block, html } : block,
      ),
    }));
  };

  const keywordsText = formValues.keywords.join(", ");
  const handleContentFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type && file.type !== "application/pdf") {
      event.target.value = "";
      return;
    }

    try {
      const fileUrl = await readFileAsDataUrl(file);

      setFormValues((current) => ({
        ...current,
        contentSource: "file",
        contentFileName: file.name,
        contentFileUrl: fileUrl,
        structuredContent: [
          {
            title: SOP_CONTENT_SECTION_TITLE,
            html: `<p>Content provided through uploaded PDF file: <strong>${file.name}</strong></p>`,
          },
        ],
      }));
    } catch {
      return;
    } finally {
      event.target.value = "";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pb: 1.25 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Edit SOP Details
        </Typography>
      
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
           
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            {editTabs.map((tab) => (
              <Tab key={tab.key} value={tab.key} label={tab.label} />
            ))}
          </Tabs>

          {activeTab === "basics" ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="SOP Title"
                  value={formValues.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  disabled={!canEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formValues.subject}
                  onChange={(event) => updateField("subject", event.target.value)}
                  disabled={!canEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formValues.department}
                  onChange={(event) => updateField("department", event.target.value)}
                  disabled={!canEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Keywords"
                  value={keywordsText}
                  onChange={(event) =>
                    updateField(
                      "keywords",
                      event.target.value
                        .split(",")
                        .map((keyword) => keyword.trim())
                        .filter(Boolean),
                    )
                  }
                  disabled={!canEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Effective Date"
                  value={formValues.effectiveDate}
                  onChange={(event) => updateField("effectiveDate", event.target.value)}
                  disabled={!canEdit}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Review Date"
                  value={formValues.reviewDate}
                  onChange={(event) => updateField("reviewDate", event.target.value)}
                  disabled={!canEdit}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
          ) : null}

          {activeTab === "version" ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Current Released Version"
                  value={document?.currentReleasedVersion ?? "Not released yet"}
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Current Version"
                  value={document?.version ?? ""}
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Draft Code"
                  value={document?.draftCode ?? ""}
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Next Release Version"
                  value={
                    document?.currentReleasedVersion
                      ? `R${Number(document.currentReleasedVersion.replace("R", "")) + 1}`
                      : "R1"
                  }
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  value={formValues.priority}
                  onChange={(event) => updateField("priority", event.target.value as SopPriority)}
                  disabled={!canEdit}
                >
                  <MenuItem value="Critical">Critical</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Change Summary"
                  value={formValues.changeSummary}
                  onChange={(event) => updateField("changeSummary", event.target.value)}
                  disabled={!canEdit}
                  placeholder="Mention what was updated in this SOP."
                />
              </Grid>
            </Grid>
          ) : null}

          {activeTab === "content" ? (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="SOP Category"
                    value={formValues.category}
                    onChange={(event) => {
                      const nextCategory = event.target.value;
                      const nextLevel = inferLevelFromCategory(nextCategory, formValues.level);
                      const nextHeaders = getCategoryContentHeaders(categoryRecords, nextCategory);
                      setFormValues((current) => ({
                        ...current,
                        category: nextCategory,
                        level: nextLevel,
                        structuredContent: normalizeStructuredContentForLevel({
                          level: nextLevel,
                          title: current.title,
                          department: current.department,
                          purpose: current.purpose,
                          scope: current.scope,
                          headers: nextHeaders,
                          existingContent:
                            current.structuredContent.length > 0
                              ? current.structuredContent
                              : [{ title: SOP_CONTENT_SECTION_TITLE, html: "" }],
                        }),
                      }));
                    }}
                    disabled={!canEdit}
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Content Source"
                    value={formValues.contentSource}
                    onChange={(event) => {
                      const nextSource = event.target.value as "editor" | "file";
                      setFormValues((current) => ({
                        ...current,
                        contentSource: nextSource,
                        structuredContent:
                          nextSource === "editor"
                            ? normalizeStructuredContentForLevel({
                                level: current.level,
                                title: current.title,
                                department: current.department,
                                purpose: current.purpose,
                                scope: current.scope,
                                headers: getCategoryContentHeaders(
                                  categoryRecords,
                                  current.category,
                                ),
                                existingContent: current.structuredContent,
                              })
                            : current.structuredContent,
                      }));
                    }}
                    disabled={!canEdit}
                  >
                    <MenuItem value="editor">Content Editor</MenuItem>
                    <MenuItem value="file">File Upload</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {formValues.contentSource === "file" ? (
                <Box
                  sx={{
                    border: "1px solid rgba(148,163,184,0.18)",
                    borderRadius: 3,
                    p: 2.25,
                    bgcolor: "rgba(248,250,252,0.72)",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".pdf,application/pdf"
                    onChange={handleContentFileChange}
                  />
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Upload SOP Content File
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Only PDF file upload is allowed here.
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Button
                        variant="outlined"
                        startIcon={<UploadFileOutlinedIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!canEdit}
                      >
                        Upload File
                      </Button>
                      {formValues.contentFileName ? (
                        <Chip label={formValues.contentFileName} size="small" variant="outlined" />
                      ) : null}
                    </Stack>
                    {formValues.contentFileUrl ? (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                          Uploaded PDF Preview
                        </Typography>
                        <ProtectedFileSurface
                          file={{
                            name: formValues.contentFileName ?? "uploaded-sop.pdf",
                            url: formValues.contentFileUrl,
                            type: "pdf",
                          }}
                          watermarkText={`${formValues.sopNumber || "Draft SOP"} ${formValues.owner || "Preview"}`}
                          minHeight={420}
                        />
                      </Box>
                    ) : null}
                  </Stack>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {categoryHeaders.length ? (
                    <Alert severity="info">
                      Editors are generated from the selected category content headers.
                    </Alert>
                  ) : null}
                  {formValues.structuredContent.map((block, index) => (
                    <Box
                      key={`${block.title}-${index}`}
                      sx={{
                        border: "1px solid rgba(148,163,184,0.18)",
                        borderRadius: 3,
                        overflow: "hidden",
                        bgcolor: "rgba(248,250,252,0.72)",
                      }}
                    >
                      <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid rgba(148,163,184,0.18)" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {block.title}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: "#fff",
                          "& .jodit-container": {
                            border: "none !important",
                          },
                          "& .jodit-toolbar__box": {
                            borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                            backgroundColor: "rgba(248, 250, 252, 0.9)",
                          },
                          "& .jodit-workplace": {
                            minHeight: 340,
                          },
                        }}
                      >
                        <JoditEditor
                          value={block.html}
                          config={{ ...editorConfig, readonly: !canEdit }}
                          onBlur={(newContent) => updateStructuredContent(index, newContent)}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          ) : null}

        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          disabled={!canEdit}
          onClick={() => onSave(formValues)}
        >
          Save Updates
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SopEditDialog;
