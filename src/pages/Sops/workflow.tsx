import React from "react";
import { Button, Chip, Grid, Stack, Typography } from "@mui/material";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import {
  EmptyWorkspaceState,
  MetricCard,
  SopDocumentCard,
  WorkspacePanel,
} from "./components";
import SopReviewDrawer from "./SopReviewDrawer";
import { useSopsWorkflowData } from "./useSopsWorkflowData";
import type { SopDocumentRecord, SopWorkflowButtonAction } from "./types";

const SopsWorkflowPage = () => {
  const { documents, workflowTasks, applyAction, resetState, versions, audits } =
    useSopsWorkflowData();
  const [selectedDocument, setSelectedDocument] = React.useState<SopDocumentRecord | null>(null);

  const groupedTasks = React.useMemo(
    () => ({
      checker: workflowTasks.filter((task) => task.stage === "Checker Review"),
      approver: workflowTasks.filter((task) => task.stage === "Approver Review"),
      authorizer: workflowTasks.filter(
        (task) => task.stage === "Authorizer Review" || task.stage === "Authorized",
      ),
      creator: workflowTasks.filter((task) => task.stage === "Draft" || task.stage === "Rejected"),
    }),
    [workflowTasks],
  );

  const renderTaskCards = (taskIds: string[]) => {
    const cards = taskIds
      .map((taskId) => workflowTasks.find((task) => task.id === taskId))
      .filter(Boolean);

    if (!cards.length) {
      return (
        <EmptyWorkspaceState
          title="Nothing pending here"
          subtitle="As soon as a SOP enters this stage it will appear here."
        />
      );
    }

    return (
      <Stack spacing={1.5}>
        {cards.map((task) => {
          const document = documents.find((item) => item.id === task?.sopId);
          if (!task || !document) {
            return null;
          }

          return (
            <SopDocumentCard
              key={task.id}
              document={document}
              helperText={`${task.role} review • Due ${task.dueDate} • Next actions: ${task.availableActions.join(", ")}`}
              primaryLabel="Review Now"
              onPrimaryAction={() => setSelectedDocument(document)}
              onOpen={() => setSelectedDocument(document)}
            />
          );
        })}
      </Stack>
    );
  };

  return (
    <>
      <Stack spacing={3}>
        <WorkspacePanel
          title="Review Queue"
          subtitle="Open the SOP, read the structured content, add remarks, then choose the next workflow action."
          action={
            <Button variant="outlined" startIcon={<RestartAltRoundedIcon />} onClick={resetState}>
              Reset Mock Workflow
            </Button>
          }
        >
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label="Actions happen inside the review panel" size="small" />
            <Chip label="No direct grid approvals" size="small" color="primary" variant="outlined" />
          </Stack>
        </WorkspacePanel>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard
              title="Checker Reviews"
              value={groupedTasks.checker.length}
              subtitle="SOPs waiting for first content check"
              color="#2563EB"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard
              title="Approver Reviews"
              value={groupedTasks.approver.length}
              subtitle="SOPs waiting for functional approval"
              color="#D97706"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard
              title="Final Authorization"
              value={groupedTasks.authorizer.length}
              subtitle="SOPs close to release"
              color="#7C3AED"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard
              title="Returned To Creator"
              value={groupedTasks.creator.length}
              subtitle="Drafts that need correction or resubmission"
              color="#DC2626"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <WorkspacePanel
              title="Ready For Checker"
              subtitle="The checker validates content completeness and basic control points."
              action={<RateReviewRoundedIcon color="primary" />}
            >
              {renderTaskCards(groupedTasks.checker.map((task) => task.id))}
            </WorkspacePanel>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <WorkspacePanel
              title="Ready For Approver"
              subtitle="The approver confirms business and process correctness."
              action={<RateReviewRoundedIcon color="warning" />}
            >
              {renderTaskCards(groupedTasks.approver.map((task) => task.id))}
            </WorkspacePanel>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <WorkspacePanel
              title="Ready For Authorizer / Release"
              subtitle="The authorizer performs the last review before controlled release."
              action={<RateReviewRoundedIcon color="secondary" />}
            >
              {renderTaskCards(groupedTasks.authorizer.map((task) => task.id))}
            </WorkspacePanel>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <WorkspacePanel
              title="Returned To Creator"
              subtitle="These drafts need correction, revision update or resubmission."
            >
              {renderTaskCards(groupedTasks.creator.map((task) => task.id))}
            </WorkspacePanel>
          </Grid>
        </Grid>

        <WorkspacePanel
          title="Review rule for non-technical users"
          subtitle="The page should guide the user like a checklist, not like a system console."
        >
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              1. Open the SOP card.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              2. Read the structured HTML content blocks.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              3. Add a short remark if needed.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              4. Click the correct action from the review panel.
            </Typography>
          </Stack>
        </WorkspacePanel>
      </Stack>

      <SopReviewDrawer
        document={selectedDocument}
        versions={versions.filter((item) => item.sopId === selectedDocument?.id)}
        audits={audits.filter((item) => item.sopNumber === selectedDocument?.sopNumber)}
        open={Boolean(selectedDocument)}
        onClose={() => setSelectedDocument(null)}
        onAction={(action, remarks) => {
          if (!selectedDocument) {
            return;
          }

          applyAction(selectedDocument.id, action as SopWorkflowButtonAction, remarks);
        }}
      />
    </>
  );
};

export default SopsWorkflowPage;
