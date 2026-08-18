import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { createRef } from "react";
import { Page } from "../../../shared/components/common/Page";
import {
  EmptyWorkspaceState,
  getSopWorkflowActionButtons,
  SopWorkflowSidebar,
  StageChip,
} from "./components";
import SopDetailTabsPanel, { type SopDetailSection } from "./SopDetailTabsPanel";
import SopsAuthoringPage, {
  type SopsAuthoringRef,
  type SopsAuthoringSubmitPayload,
} from "./authoring";
import { canEditSopDocument, getSopSessionActor } from "./access";
import { sectionTitleSx, surfaceSx } from "./ui";
import { useSopsWorkflowData } from "./useSopsWorkflowData";
import { useModal } from "../../../shared/hooks/useModal";
import IconActionButton from "../../../shared/components/common/IconActionButton";
import ApiActionButton from "../../../shared/components/common/ApiActionButton";
import type { SopStage } from "./types";

const registerTabs = [
  { key: "all", label: "All SOPs" },
  { key: "drafts", label: "Drafts" },
  { key: "review", label: "Under Review" },
  { key: "released", label: "Released" },
  { key: "archived", label: "Archived" },
] as const;

type RegisterTab = (typeof registerTabs)[number]["key"];

const SopsRegisterPage = () => {
  const { openModal, closeModal } = useModal();
  const { documents, audits, versions, applyAction, updateDocumentDetails, createSopDocument } =
    useSopsWorkflowData();
  const [activeTab, setActiveTab] = React.useState<RegisterTab>("all");
  const [searchValue, setSearchValue] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [activeSection, setActiveSection] = React.useState<SopDetailSection>("overview");
  const currentActor = React.useMemo(() => getSopSessionActor(), []);

  const filteredDocuments = React.useMemo(() => {
    const tabFiltered = (() => {
      switch (activeTab) {
        case "drafts":
          return documents.filter((item) => item.status === "Draft" || item.status === "Rejected");
        case "review":
          return documents.filter((item) =>
            ["Checker Review", "Approver Review", "Authorizer Review", "Authorized"].includes(
              item.status,
            ),
          );
        case "released":
          return documents.filter((item) => item.status === "Released");
        case "archived":
          return documents.filter((item) => item.status === "Archived");
        default:
          return documents;
      }
    })();

    if (!searchValue.trim()) {
      return tabFiltered;
    }

    const query = searchValue.toLowerCase();
    return tabFiltered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.sopNumber.toLowerCase().includes(query) ||
        item.department.toLowerCase().includes(query),
    );
  }, [activeTab, documents, searchValue]);

  const [selectedId, setSelectedId] = React.useState(filteredDocuments[0]?.id ?? "");

  React.useEffect(() => {
    if (!filteredDocuments.some((item) => item.id === selectedId)) {
      setSelectedId(filteredDocuments[0]?.id ?? "");
    }
  }, [filteredDocuments, selectedId]);

  const selectedDocument =
    filteredDocuments.find((item) => item.id === selectedId) ?? filteredDocuments[0] ?? null;

  React.useEffect(() => {
    setRemarks("");
    setActiveSection("overview");
  }, [selectedDocument?.id]);

  const handleOpenAddSop = React.useCallback(() => {
    const formRef = createRef<SopsAuthoringRef>();
    const handleCreateSop = async (
      payload: SopsAuthoringSubmitPayload,
      mode: "draft" | "submit",
    ) => {
      const created = createSopDocument(payload, mode);
      if (created) {
        closeModal();
      }
      return created;
    };

    openModal({
      title: "Add SOP",
      width: 1180,
      showCloseButton: true,
      askDataChangeConfirm: false,
      hideFooter: false,
      component: (modalProps: any) => (
        <SopsAuthoringPage
          ref={formRef}
          {...modalProps}
          defaultOwner={currentActor.name}
          onSubmitSop={handleCreateSop}
        />
      ),
      action: (
        <Button
          variant="outlined"
          onClick={() => void formRef.current?.submit("draft")}
        >
          Save Draft
        </Button>
      ),
      action3: (
        <ApiActionButton
          onApiCall={() => formRef.current?.submit("submit") ?? Promise.resolve(false)}
        >
          Submit For Review
        </ApiActionButton>
      ),
    });
  }, [closeModal, createSopDocument, currentActor.name, openModal]);

  if (!selectedDocument) {
    return (
      <EmptyWorkspaceState
        title="No SOPs available"
        subtitle="Change the filter or create a new SOP to continue."
      />
    );
  }

  const documentVersions = versions.filter((item) => item.sopId === selectedDocument.id);
  const documentAudits = audits.filter((item) => item.sopNumber === selectedDocument.sopNumber);
  const actionButtons = getSopWorkflowActionButtons(selectedDocument.status);
  const canEditSelectedDocument = canEditSopDocument(selectedDocument, currentActor);
  
  const handleOpenEditSop = React.useCallback(() => {
    if (!selectedDocument || !canEditSelectedDocument) {
      return;
    }

    const formRef = createRef<SopsAuthoringRef>();
    const handleUpdateSop = async (payload: SopsAuthoringSubmitPayload) => {
      updateDocumentDetails(
        selectedDocument.id,
        {
          sopNumber: selectedDocument.sopNumber,
          ...payload,
        },
        {
          name: currentActor.name,
          role: currentActor.role,
        },
      );
      closeModal();
      return true;
    };

    openModal({
      title: "Edit SOP",
      width: 1180,
      showCloseButton: true,
      askDataChangeConfirm: false,
      hideFooter: false,
      component: (modalProps: any) => (
        <SopsAuthoringPage
          ref={formRef}
          {...modalProps}
          mode="edit"
          initialDocument={selectedDocument}
          defaultOwner={currentActor.name}
          onSubmitSop={handleUpdateSop}
        />
      ),
      action3: (
        <ApiActionButton
          onApiCall={() => formRef.current?.submit("save") ?? Promise.resolve(false)}
        >
          Save Updates
        </ApiActionButton>
      ),
    });
  }, [
    canEditSelectedDocument,
    closeModal,
    currentActor.name,
    currentActor.role,
    openModal,
    selectedDocument,
    updateDocumentDetails,
  ]);

  return (
    <Page module="sops">
    <>
    <>
       
      <Box
        sx={{
          ...surfaceSx,
          display: "flex",
          minHeight: "calc(100vh - 110px)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", lg: 340 },
            minWidth: { lg: 340 },
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
           

            <Stack direction="row" spacing={0.75} alignItems="center"  >
              <TextField
                fullWidth
                size="small"
                placeholder="Search SOP..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: "#F8FAFC",
                    "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
                    "&.Mui-focused fieldset": { borderColor: "#0D9488" },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    py: 0.9,
                  },
                }}
              />
              <IconActionButton
                ariaLabel="Add SOP"
                tooltip="Add SOP"
                onClick={handleOpenAddSop}
                sx={{
                  color: "#FF8A3D",
                  border: "1px solid rgba(255,138,61,0.22)",
                  backgroundColor: "rgba(255,138,61,0.08)",
                  "&:hover": {
                    color: "#E67A2E",
                    backgroundColor: "rgba(255,138,61,0.16)",
                  },
                }}
              >
                <AddOutlinedIcon fontSize="small" />
              </IconActionButton>
            </Stack>
          </Box>

          <Box
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(248,250,252,0.8)",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              {registerTabs.map((tab) => (
                <Tab key={tab.key} value={tab.key} label={tab.label} />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ px: 1.25, py: 1.25, overflowY: "auto", flex: 1 }}>
            <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {filteredDocuments.map((item) => {
                const isSelected = item.id === selectedDocument.id;
                return (
                  <ListItemButton
                    key={item.id}
                    selected={isSelected}
                    onClick={() => setSelectedId(item.id)}
                    sx={{
                      display: "block",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: isSelected
                        ? "rgba(13,148,136,0.32)"
                        : "rgba(15,23,42,0.08)",
                      background: isSelected
                        ? "linear-gradient(180deg, rgba(240,253,250,0.92) 0%, rgba(255,255,255,1) 100%)"
                        : "#FFFFFF",
                      boxShadow: isSelected
                        ? "0 14px 28px -24px rgba(13,148,136,0.45)"
                        : "0 10px 20px -24px rgba(15,23,42,0.28)",
                      px: 1.5,
                      py: 1.35,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                          {item.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#64748B",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.sopNumber}
                        </Typography>
                      </Box>
                      <StageChip stage={item.status} />
                    </Stack>

                    <ListItemText
                      primary={`${item.department} • Version ${item.version}`}
                      secondary={`Effective ${item.effectiveDate}`}
                      primaryTypographyProps={{ fontSize: "0.8rem", fontWeight: 700 }}
                      secondaryTypographyProps={{ fontSize: "0.74rem", color: "#64748B" }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 2.5,
              pt: 2.25,
              pb: 1.75,
              borderBottom: "1px solid",
              borderColor: "divider",
              background:
                "linear-gradient(135deg, rgba(14,165,233,0.10) 0%, rgba(255,255,255,1) 55%, rgba(16,185,129,0.08) 100%)",
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>
                  SOP Details
                </Typography>
                <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 0.5 }}>
                  {selectedDocument.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {selectedDocument.subject}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                  <Chip label={selectedDocument.sopNumber} size="small" />
                  <StageChip stage={selectedDocument.status} />
                  <Chip label={selectedDocument.category} size="small" />
                  <Chip label={`Version ${selectedDocument.version}`} size="small" />
                  <Chip label={selectedDocument.department} size="small" variant="outlined" />
                  </Stack>
              </Box>

              <Button
                variant="contained"
                startIcon={<EditOutlinedIcon />}
                onClick={handleOpenEditSop}
                disabled={!canEditSelectedDocument}
                sx={{ alignSelf: "flex-start" }}
              >
                Edit Details
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(248,250,252,0.8)",
            }}
          >
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

          <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, xl: 7.7 }}>
                <SopDetailTabsPanel
                  document={selectedDocument}
                  versions={documentVersions}
                  audits={documentAudits}
                  activeSection={activeSection}
                />
              </Grid>

              <Grid size={{ xs: 12, xl: 4.3 }}>
                <Box sx={{ position: { xl: "sticky" }, top: { xl: 0 } }}>
                  <SopWorkflowSidebar
                    document={selectedDocument}
                    remarks={remarks}
                    onRemarksChange={setRemarks}
                    onAction={(action, nextRemarks) =>
                      applyAction(selectedDocument.id, action, nextRemarks)
                    }
                    actionButtons={actionButtons}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  </>
    </Page>
  );
};

export default SopsRegisterPage;
