import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import {
 
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
 
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  buildCategoryDropdownOptions,
  getCategoryContentHeaders,
  inferLevelFromCategory,
} from "./categoryUtils";
import ProtectedFileSurface from "./protected-file-surface";
import { sectionTitleSx, surfaceSx } from "./ui";
import { sopDocuments } from "./mockData";
import { normalizeStructuredContentForLevel, SOP_CONTENT_SECTION_TITLE } from "./structuredContent";
import { useSopsWorkflowData } from "./useSopsWorkflowData";
import { useToast } from "../../../shared/hooks/useToast";
import type { SopDocumentRecord, SopLevel, SopPriority, SopStructuredContentBlock } from "./types";

const authoringSteps = [
  { key: "basics", label: "1. Basic Info" },
  { key: "content", label: "2. Content" },
] as const;
type AuthoringStep = (typeof authoringSteps)[number]["key"];

 

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

type SopsAuthoringSubmitMode = "draft" | "submit" | "save";

export type SopsAuthoringSubmitPayload = {
  title: string;
  subject: string;
  level: SopLevel;
  category: string;
  division: string;
  department: string;
  owner: string;
  checker: string;
  approver: string;
  authorizer: string;
  effectiveDate: string;
  reviewDate: string;
  keywords: string[];
  changeSummary: string;
  priority: SopPriority;
  purpose: string;
  scope: string;
  contentSource: "editor" | "file";
  contentFileName: string | null;
  contentFileUrl: string | null;
  structuredContent: SopStructuredContentBlock[];
};

type SopsAuthoringFormState = {
  title: string;
  subject: string;
  department: string;
  keywordsText: string;
  effectiveDate: string;
  reviewDate: string;
  category: string;
  level: SopLevel;
  contentSource: "editor" | "file";
  contentFileName: string | null;
  contentFileUrl: string | null;
  changeSummary: string;
  owner: string;
  checker: string;
  approver: string;
  authorizer: string;
  division: string;
  purpose: string;
  scope: string;
  priority: SopPriority;
  structuredContent: SopStructuredContentBlock[];
};

export type SopsAuthoringRef = {
  submit: (mode?: SopsAuthoringSubmitMode) => Promise<boolean>;
};

type SopsAuthoringPageProps = {
  setDisplayTitle?: (title: string) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
  mode?: "create" | "edit";
  initialDocument?: SopDocumentRecord | null;
  onSubmitSop?: (
    payload: SopsAuthoringSubmitPayload,
    mode: SopsAuthoringSubmitMode,
  ) => boolean | Promise<boolean>;
  defaultOwner?: string;
};

const createInitialFormState = (
  sourceDocument: SopDocumentRecord,
  categoryHeaders: string[],
  defaultOwner?: string,
): SopsAuthoringFormState => ({
  title: sourceDocument.title ?? "",
  subject: sourceDocument.subject ?? "",
  department: sourceDocument.department,
  keywordsText: sourceDocument.keywords.join(", "),
  effectiveDate: sourceDocument.effectiveDate,
  reviewDate: sourceDocument.reviewDate,
  category: sourceDocument.category,
  level: sourceDocument.level,
  contentSource: "file",
  contentFileName: sourceDocument.contentFileName ?? null,
  contentFileUrl: sourceDocument.contentFileUrl ?? null,
  changeSummary: sourceDocument.changeSummary ?? "",
  owner: defaultOwner?.trim() || sourceDocument.owner,
  checker: sourceDocument.checker,
  approver: sourceDocument.approver,
  authorizer: sourceDocument.authorizer,
  division: sourceDocument.division,
  purpose: sourceDocument.purpose,
  scope: sourceDocument.scope,
  priority: sourceDocument.priority,
  structuredContent: normalizeStructuredContentForLevel({
    level: sourceDocument.level,
    title: sourceDocument.title ?? "",
    department: sourceDocument.department,
    purpose: sourceDocument.purpose,
    scope: sourceDocument.scope,
    headers: categoryHeaders,
    existingContent: sourceDocument.structuredContent ?? [],
  }),
});

function SopsAuthoringPage(
  {
    setDisplayTitle,
    setHideFooter,
    setWidth,
    mode = "create",
    initialDocument,
    onSubmitSop,
    defaultOwner,
  }: SopsAuthoringPageProps,
  ref: Ref<SopsAuthoringRef>,
) {
  const { categoryRecords, calculateNextReleasedVersion } = useSopsWorkflowData();
  const { showToast } = useToast();
  const sample = initialDocument ?? sopDocuments[0];
  const isEditMode = mode === "edit";
  const initialHeaders = useMemo(
    () => getCategoryContentHeaders(categoryRecords, sample.category),
    [categoryRecords, sample.category],
  );
  const [activeStep, setActiveStep] = useState<AuthoringStep>("basics");
  const [formValues, setFormValues] = useState<SopsAuthoringFormState>(() =>
    createInitialFormState(sample, initialHeaders, defaultOwner),
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDrawerMode = Boolean(setDisplayTitle || setHideFooter || setWidth);

  useEffect(() => {
    setDisplayTitle?.(isEditMode ? "Edit SOP" : "Add SOP");
    setHideFooter?.(false);
    setWidth?.(1180);
  }, [isEditMode, setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setFormValues((current) => {
      if (
        !initialDocument &&
        (current.title || current.subject || current.keywordsText || current.contentFileName)
      ) {
        return current;
      }

      return createInitialFormState(sample, initialHeaders, defaultOwner);
    });
  }, [defaultOwner, initialDocument, initialHeaders, sample]);

  const projectedVersion = calculateNextReleasedVersion(
    isEditMode ? sample.currentReleasedVersion : null,
  );
  const categoryOptions = useMemo(
    () => buildCategoryDropdownOptions(categoryRecords, formValues.category),
    [categoryRecords, formValues.category],
  );
 

  const updateField = useCallback(
    <K extends keyof SopsAuthoringFormState>(field: K, value: SopsAuthoringFormState[K]) => {
      setFormValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

 

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
    } finally {
      event.target.value = "";
    }
  };

  const handleCategoryChange = (nextCategory: string) => {
    setFormValues((current) => {
      const nextLevel = inferLevelFromCategory(nextCategory, current.level);
      return {
        ...current,
        category: nextCategory,
        level: nextLevel,
        structuredContent: normalizeStructuredContentForLevel({
          level: nextLevel,
          title: current.title,
          department: current.department,
          purpose: current.purpose,
          scope: current.scope,
          headers: getCategoryContentHeaders(categoryRecords, nextCategory),
          existingContent: current.structuredContent,
        }),
      };
    });
  };

  const buildPayload = (): SopsAuthoringSubmitPayload | null => {
    if (!formValues.title.trim()) {
      showToast("SOP title is required", "warning");
      setActiveStep("basics");
      return null;
    }

    if (!formValues.department.trim()) {
      showToast("Department is required", "warning");
      setActiveStep("basics");
      return null;
    }

    if (!formValues.category.trim()) {
      showToast("Category is required", "warning");
      setActiveStep("content");
      return null;
    }

    return {
      title: formValues.title.trim(),
      subject: formValues.subject.trim(),
      level: formValues.level,
      category: formValues.category.trim(),
      division: formValues.division.trim(),
      department: formValues.department.trim(),
      owner: formValues.owner.trim(),
      checker: formValues.checker.trim(),
      approver: formValues.approver.trim(),
      authorizer: formValues.authorizer.trim(),
      effectiveDate: formValues.effectiveDate,
      reviewDate: formValues.reviewDate,
      keywords: formValues.keywordsText
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      changeSummary: formValues.changeSummary.trim(),
      priority: formValues.priority,
      purpose: formValues.purpose.trim(),
      scope: formValues.scope.trim(),
      contentSource: formValues.contentSource,
      contentFileName: formValues.contentFileName,
      contentFileUrl: formValues.contentFileUrl,
      structuredContent: formValues.structuredContent,
    };
  };

  useImperativeHandle(
    ref,
    () => ({
      submit: async (mode: SopsAuthoringSubmitMode = "draft") => {
        const payload = buildPayload();
        if (!payload) {
          return false;
        }

        const success = onSubmitSop ? await onSubmitSop(payload, mode) : true;
        return Boolean(success);
      },
    }),
    [onSubmitSop, formValues],
  );

  return (
    <Stack spacing={3}>
      {!isDrawerMode ? (
        <Card sx={surfaceSx}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h5" sx={{ ...sectionTitleSx }}>
                {isEditMode ? "SOP Edit Workspace" : "SOP Authoring Workspace"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode
                  ? "Update the SOP in the same workflow-friendly layout used for creation."
                  : "Create the SOP one step at a time. This layout is designed for normal business users, not only system users."}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: isDrawerMode ? 12 : 8 }}>
          <Card sx={surfaceSx}>
            <CardContent>
              <Tabs
                value={activeStep}
                onChange={(_, value) => setActiveStep(value)}
                variant="scrollable"
                allowScrollButtonsMobile
                sx={{ mb: 3 }}
              >
                {authoringSteps.map((step) => (
                  <Tab key={step.key} value={step.key} label={step.label} />
                ))}
              </Tabs>

              {activeStep === "basics" ? (
                <Stack spacing={2}>
                  <Typography variant="h6" sx={sectionTitleSx}>
                    Basic SOP Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start with the main SOP details. These values will be used in the register and the generated PDF.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <TextField
                        fullWidth
                        label="SOP Title"
                        value={formValues.title}
                        onChange={(event) => updateField("title", event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Subject"
                        value={formValues.subject}
                        onChange={(event) => updateField("subject", event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Department"
                        value={formValues.department}
                        onChange={(event) => updateField("department", event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Keywords"
                        placeholder="keyword1, keyword2"
                        value={formValues.keywordsText}
                        onChange={(event) => updateField("keywordsText", event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Effective Date"
                        value={formValues.effectiveDate}
                        onChange={(event) => updateField("effectiveDate", event.target.value)}
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
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        select
                        label="Priority"
                        value={formValues.priority}
                        onChange={(event) => updateField("priority", event.target.value as SopPriority)}
                      >
                        <MenuItem value="Critical">Critical</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Low">Low</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Change Summary"
                        value={formValues.changeSummary}
                        onChange={(event) => updateField("changeSummary", event.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              ) : null}

              {activeStep === "content" ? (
                <Stack spacing={2}>
                  <Typography variant="h6" sx={sectionTitleSx}>
                    SOP Content
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose category first and upload the SOP PDF file below.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="SOP Category"
                        value={formValues.category}
                        onChange={(event) => handleCategoryChange(event.target.value)}
                      >
                        {categoryOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    {/* <Grid size={{ xs: 12, md: 6 }}>
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
                      >
                        <MenuItem value="editor">Content Editor</MenuItem>
                        <MenuItem value="file">File Upload</MenuItem>
                      </TextField>
                    </Grid> */}
                  </Grid>

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
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        After PDF upload, its protected preview will appear below.
                      </Alert>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Button
                          variant="outlined"
                          startIcon={<UploadFileOutlinedIcon />}
                          onClick={() => fileInputRef.current?.click()}
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
                            watermarkText={`${formValues.title || "Draft SOP"} ${formValues.owner || "Preview"}`}
                            minHeight={420}
                          />
                        </Box>
                      ) : null}
                    </Stack>
                  </Box>

                  {/* <Stack spacing={2}>
                    {categoryHeaders.length ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Editors are generated from the selected category content headers.
                      </Alert>
                    ) : null}
                    {formValues.structuredContent.map((block, index) => (
                      <Accordion
                        key={`${block.title}-${index}`}
                        defaultExpanded
                        disableGutters
                        sx={{
                          ...surfaceSx,
                          overflow: "hidden",
                          "&::before": { display: "none" },
                          borderRadius: "16px !important",
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreRoundedIcon />}
                          sx={{
                            px: 2,
                            py: 0.5,
                            bgcolor: "rgba(248, 250, 252, 0.85)",
                            borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
                          }}
                        >
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <Chip label="Content" size="small" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {block.title}
                            </Typography>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                          <Box
                            sx={{
                              bgcolor: "background.paper",
                              "& .jodit-container": {
                                border: "none !important",
                              },
                              "& .jodit-toolbar__box": {
                                borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                                backgroundColor: "rgba(248, 250, 252, 0.9)",
                              },
                              "& .jodit-workplace": {
                                minHeight: 360,
                              },
                            }}
                          >
                            <JoditEditor
                              value={block.html}
                              config={editorConfig}
                              onBlur={(newContent) => updateStructuredContent(index, newContent)}
                            />
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack> */}
                </Stack>
              ) : null}
            </CardContent>
          </Card>
        </Grid>

        {!isDrawerMode ? (
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              <Card sx={surfaceSx}>
                <CardContent>
                  <Typography variant="h6" sx={sectionTitleSx}>
                    Workflow Route
                  </Typography>
                  <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                    {[
                      "Draft",
                      "Checker Review",
                      "Approver Review",
                      "Authorizer Review",
                      "Released",
                    ].map((step) => (
                      <Chip key={step} label={step} variant="outlined" />
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={surfaceSx}>
                <CardContent>
                  <Typography variant="h6" sx={sectionTitleSx}>
                    Validation Notes
                  </Typography>
                  <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                    {[
                      `Current step: ${authoringSteps.find((item) => item.key === activeStep)?.label}`,
                      isEditMode
                        ? `Editing ${sample.sopNumber} in shared drawer workspace`
                        : "New SOP will be created as a fresh register entry",
                      `System will release this draft as version ${projectedVersion}`,
                      "Category content headers decide the editor sections",
                    ].map((item) => (
                      <Chip key={item} label={item} variant="outlined" />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        ) : null}
      </Grid>
    </Stack>
  );
}

export default forwardRef(SopsAuthoringPage);
