import React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import type {
  CommentItem,
  PriorityLevel,
  ProjectManagementStatus,
  InquiryRecord,
} from "./mockData";
import {
  AttachmentList,
  DetailsGrid,
  PriorityBadge,
  ProjectCommentsPanel,
  ProjectStatusBadge,
  TimelineList,
} from "./components";
import { projectSurfaceSx } from "./ui";

export type InquiryFormValues = {
  customer: string;
  title: string;
  requirement: string;
  priority: PriorityLevel;
  status: ProjectManagementStatus;
  owner: string;
  targetDate: string;
  attachmentNames: string[];
};

export type InquiryConversionModuleRow = {
  id: string;
  module: string;
  submodule: string;
  phase: string;
  owner: string;
  hours: string;
  progress: string;
  source: string;
};

export type InquiryConversionTeamRow = {
  id: string;
  member: string;
  role: string;
  module: string;
  submodule: string;
  plannedHours: string;
};

export type InquiryConvertFormValues = {
  projectName: string;
  projectCode: string;
  customer: string;
  leader: string;
  secondaryLeader: string;
  status: ProjectManagementStatus;
  startDate: string;
  dueDate: string;
  approvedScope: string;
  implementationNotes: string;
  moduleRows: InquiryConversionModuleRow[];
  teamRows: InquiryConversionTeamRow[];
};

type InquiryFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  value: InquiryFormValues;
  onChange: (value: InquiryFormValues) => void;
  onClose: () => void;
  onSubmit: () => void;
};

type InquiryDetailDrawerProps = {
  open: boolean;
  inquiry: InquiryRecord | null;
  onClose: () => void;
  onEdit: () => void;
  onConvert: () => void;
  comments: CommentItem[];
  attachments: Parameters<typeof AttachmentList>[0]["items"];
  activities: Parameters<typeof TimelineList>[0]["items"];
};

type InquiryConvertDrawerProps = {
  open: boolean;
  inquiry: InquiryRecord | null;
  onClose: () => void;
  onEdit: () => void;
  value: InquiryConvertFormValues;
  onChange: (value: InquiryConvertFormValues) => void;
  onSubmit: () => void;
};

type InquiryDetailSection = "overview" | "attachments" | "comments";

const inquiryFormDrawerPaperSx = {
  "& .MuiDrawer-paper": {
    width: {
      xs: "100%",
      sm: 450,
      lg: 530,
    },
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
  },
} as const;

const inquiryWorkspaceDrawerPaperSx = {
  "& .MuiDrawer-paper": {
    width: {
      xs: "100%",
      sm: 760,
      lg: 940,
    },
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
  },
} as const;

const formOptions = {
  customers: ["Atlas Pumps", "Nova Industries", "Prime Cast", "Zenith Cables"],
  priorities: ["Critical", "High", "Medium", "Low"] as PriorityLevel[],
  statuses: ["New", "Pending", "In Review", "Approved", "Rejected"] as ProjectManagementStatus[],
  owners: ["Hetal Shah", "Krina Mehta", "Jinal Desai", "Maulik Rana"],
};

const convertProjectStatusOptions = ["Planned", "Active", "On Hold"] as ProjectManagementStatus[];
const convertPeopleOptions = [
  "Hetal Shah",
  "Krina Mehta",
  "Jinal Desai",
  "Maulik Rana",
  "Harshil Vyas",
  "Pooja Mehta",
  "Nirav Patel",
  "Dhruvi Patel",
  "Apeksha Shah",
  "Bhavya Trivedi",
  "Sagar Parmar",
  "Parth Solanki",
];

const buildConvertRowId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildDateOffset = (value: string, offsetDays: number) => {
  const baseDate = new Date(value);

  if (Number.isNaN(baseDate.getTime())) {
    return "";
  }

  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + offsetDays);
  return nextDate.toISOString().slice(0, 10);
};

export const buildInitialInquiryConvertFormValues = (
  inquiry?: InquiryRecord | null,
  projectCode = "",
): InquiryConvertFormValues => ({
  projectName: inquiry ? `${inquiry.customer} ${inquiry.title}` : "",
  projectCode,
  customer: inquiry?.customer ?? "",
  leader: inquiry?.owner ?? "Krina Mehta",
  secondaryLeader: "Maulik Rana",
  status: "Planned",
  startDate: inquiry?.targetDate ?? "",
  dueDate: inquiry?.targetDate ? buildDateOffset(inquiry.targetDate, 30) : "",
  approvedScope: inquiry ? `${inquiry.inquiryNo} / v2.0` : "",
  implementationNotes: inquiry?.requirement ?? "",
  moduleRows: inquiry
    ? [
        {
          id: buildConvertRowId("module"),
          module: "Platform Setup",
          submodule: "Requirement & Access",
          phase: "Analysis",
          owner: inquiry.owner,
          hours: "16",
          progress: "0",
          source: "PM sizing from inquiry baseline",
        },
        {
          id: buildConvertRowId("module"),
          module: "Delivery",
          submodule: inquiry.title,
          phase: "Development",
          owner: "Nirav Patel",
          hours: "40",
          progress: "0",
          source: "Initial development estimate",
        },
      ]
    : [],
  teamRows: inquiry
    ? [
        {
          id: buildConvertRowId("team"),
          member: inquiry.owner,
          role: "Project Lead",
          module: "Platform Setup",
          submodule: "Requirement & Access",
          plannedHours: "20",
        },
        {
          id: buildConvertRowId("team"),
          member: "Nirav Patel",
          role: "Developer",
          module: "Delivery",
          submodule: inquiry.title,
          plannedHours: "40",
        },
      ]
    : [],
});

const drawerActionButtonSx = {
  borderRadius: 999,
  px: 2.5,
} as const;

const getCommentInitials = (author: string) =>
  author
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const buildCommentTimestamp = () =>
  `Today, ${new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())}`;

const findCommentById = (items: CommentItem[], commentId: string): CommentItem | null => {
  for (const item of items) {
    if (item.id === commentId) {
      return item;
    }

    const replyMatch = item.replies?.length ? findCommentById(item.replies, commentId) : null;

    if (replyMatch) {
      return replyMatch;
    }
  }

  return null;
};

const appendReplyToThread = (
  items: CommentItem[],
  targetCommentId: string,
  nextReply: CommentItem,
): CommentItem[] =>
  items.map((item) => {
    if (item.id === targetCommentId) {
      return {
        ...item,
        replies: [...(item.replies ?? []), nextReply],
      };
    }

    if (!item.replies?.length) {
      return item;
    }

    return {
      ...item,
      replies: appendReplyToThread(item.replies, targetCommentId, nextReply),
    };
  });

const commentChannelPalette = {
  Internal: {
    bubbleBg: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    bubbleColor: "#FFFFFF",
    avatarBg: "#1D4ED8",
    chipBg: "rgba(37,99,235,0.12)",
    chipColor: "#1D4ED8",
    align: "flex-end",
  },
  Customer: {
    bubbleBg: "#F8FAFC",
    bubbleColor: "#0F172A",
    avatarBg: "#0EA5E9",
    chipBg: "rgba(14,165,233,0.1)",
    chipColor: "#0369A1",
    align: "flex-start",
  },
} as const;

const ChatAttachmentPreview = ({
  name,
  onRemove,
  compact = false,
}: {
  name: string;
  onRemove?: () => void;
  compact?: boolean;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.75,
      px: compact ? 1 : 1.1,
      py: compact ? 0.6 : 0.8,
      borderRadius: 2,
      bgcolor: compact ? "rgba(255,255,255,0.14)" : "rgba(148,163,184,0.12)",
      border: compact ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(148,163,184,0.24)",
      minWidth: 0,
    }}
  >
    <AttachFileRoundedIcon sx={{ fontSize: 18, opacity: 0.9 }} />
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        color: "inherit",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </Typography>
    {onRemove ? (
      <IconButton size="small" onClick={onRemove} sx={{ ml: "auto", color: "inherit" }}>
        <CloseRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    ) : null}
  </Box>
);

const InquiryChatMessage = ({
  item,
  level = 0,
  onReply,
  onMention,
}: {
  item: CommentItem;
  level?: number;
  onReply: (item: CommentItem) => void;
  onMention: (item: CommentItem) => void;
}) => {
  const palette = commentChannelPalette[item.channel];
  const isInternal = item.channel === "Internal";

  return (
    <Box
      sx={{
        pl: level ? { xs: 2, sm: 4 } : 0,
        position: "relative",
      }}
    >
      {level ? (
        <Box
          sx={{
            position: "absolute",
            left: { xs: 6, sm: 18 },
            top: 0,
            bottom: 0,
            width: 2,
            borderRadius: 999,
            bgcolor: "rgba(148,163,184,0.2)",
          }}
        />
      ) : null}
      <Stack spacing={1.1} alignItems={palette.align}>
        <Stack
          direction={isInternal ? "row-reverse" : "row"}
          spacing={1.1}
          alignItems="flex-end"
          sx={{ width: "100%" }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: palette.avatarBg,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {getCommentInitials(item.author)}
          </Avatar>
          <Box
            sx={{
              maxWidth: { xs: "calc(100% - 52px)", sm: "78%" },
              minWidth: 0,
            }}
          >
            <Stack
              direction={isInternal ? "row-reverse" : "row"}
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 0.6 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {item.author}
              </Typography>
              <Chip
                size="small"
                label={`${item.role} • ${item.channel}`}
                sx={{
                  bgcolor: palette.chipBg,
                  color: palette.chipColor,
                  fontWeight: 700,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {item.time}
              </Typography>
            </Stack>
            <Box
              sx={{
                px: 1.5,
                py: 1.2,
                borderRadius: isInternal ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                bgcolor: isInternal ? undefined : "#F8FAFC",
                background: palette.bubbleBg,
                color: palette.bubbleColor,
                boxShadow: isInternal
                  ? "0 14px 28px rgba(37,99,235,0.18)"
                  : "0 10px 24px rgba(15,23,42,0.06)",
                border: isInternal ? "none" : "1px solid rgba(148,163,184,0.16)",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "inherit",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {item.message}
              </Typography>
              {item.attachments?.length ? (
                <Stack spacing={0.75} sx={{ mt: 1.1 }}>
                  {item.attachments.map((attachmentName, index) => (
                    <ChatAttachmentPreview
                      key={`${attachmentName}-${index}`}
                      name={attachmentName}
                      compact
                    />
                  ))}
                </Stack>
              ) : null}
            </Box>
            <Stack
              direction={isInternal ? "row-reverse" : "row"}
              spacing={0.5}
              sx={{ mt: 0.75 }}
            >
              <Button size="small" variant="text" onClick={() => onReply(item)}>
                Reply
              </Button>
              <Button size="small" variant="text" onClick={() => onMention(item)}>
                Mention
              </Button>
            </Stack>
          </Box>
        </Stack>
        {item.replies?.length ? (
          <Stack spacing={1.1} sx={{ width: "100%" }}>
            {item.replies.map((reply) => (
              <InquiryChatMessage
                key={reply.id}
                item={reply}
                level={level + 1}
                onReply={onReply}
                onMention={onMention}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
};

const DrawerShell = ({
  title,
  subtitle,
  headerActions,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => (
  <Box
    sx={{
      px: 2,
      pt: { xs: 8, sm: 9 },
      pb: footer ? 2 : 0,
      display: "flex",
      flexDirection: "column",
      minHeight: "100%",
      boxSizing: "border-box",
    }}
  >
    <Box sx={{ mt: 1, mb: subtitle ? 1 : 0.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "flex-start" }}
        spacing={1.25}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              lineHeight: 1.2,
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {headerActions ? (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {headerActions}
          </Stack>
        ) : null}
      </Stack>
    </Box>
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        pt: 1.25,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </Box>
    {footer ? (
      <Box sx={{ pt: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
          {footer}
        </Stack>
      </Box>
    ) : null}
  </Box>
);

export const buildInitialInquiryFormValues = (
  inquiry?: InquiryRecord | null,
): InquiryFormValues => ({
  customer: inquiry?.customer ?? "",
  title: inquiry?.title ?? "",
  requirement: inquiry?.requirement ?? "",
  priority: inquiry?.priority ?? "Medium",
  status: inquiry?.status ?? "New",
  owner: inquiry?.owner ?? "Hetal Shah",
  targetDate: inquiry?.targetDate ?? "",
  attachmentNames: Array.from(
    { length: inquiry?.attachmentCount ?? 0 },
    (_, index) => `Attachment ${index + 1}`,
  ),
});

export const InquiryFormDrawer = ({
  open,
  mode,
  value,
  onChange,
  onClose,
  onSubmit,
}: InquiryFormDrawerProps) => {
  const title = mode === "edit" ? "Edit Inquiry" : "Create Inquiry";
 
  const handleFieldChange =
    (field: keyof InquiryFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...value,
        [field]: event.target.value,
      });
    };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    onChange({
      ...value,
      attachmentNames: [...value.attachmentNames, ...files.map((file) => file.name)],
    });

    event.target.value = "";
  };

  const handleAttachmentDelete = (attachmentIndex: number) => {
    onChange({
      ...value,
      attachmentNames: value.attachmentNames.filter((_, index) => index !== attachmentIndex),
    });
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={inquiryFormDrawerPaperSx}>
      <DrawerShell
        title={title}
        subtitle={''}
        headerActions={
          <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
            Close
          </Button>
        }
        footer={
          <Button variant="contained" onClick={onSubmit} sx={drawerActionButtonSx}>
            {mode === "edit" ? "Save Changes" : "Save Inquiry"}
          </Button>
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
            marginTop: 2,
          }}
        >
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              select
              label="Customer"
              value={value.customer}
              onChange={handleFieldChange("customer")}
              size="small"
              fullWidth
            >
              <MenuItem value="">Select customer</MenuItem>
              {formOptions.customers.map((customer) => (
                <MenuItem key={customer} value={customer}>
                  {customer}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Inquiry Title"
              value={value.title}
              onChange={handleFieldChange("title")}
              size="small"
              fullWidth
            />
          </Box>

          <TextField
            select
            label="Priority"
            value={value.priority}
            onChange={handleFieldChange("priority")}
            size="small"
            fullWidth
          >
            {formOptions.priorities.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priority}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={value.status}
            onChange={handleFieldChange("status")}
            size="small"
            fullWidth
          >
            {formOptions.statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Owner"
            value={value.owner}
            onChange={handleFieldChange("owner")}
            size="small"
            fullWidth
          >
            <MenuItem value="">Select owner</MenuItem>
            {formOptions.owners.map((owner) => (
              <MenuItem key={owner} value={owner}>
                {owner}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Target Date"
            type="date"
            value={value.targetDate}
            onChange={handleFieldChange("targetDate")}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Requirement"
              value={value.requirement}
              onChange={handleFieldChange("requirement")}
              multiline
              minRows={5}
              fullWidth
            />
          </Box>

          <Box
            sx={{
              gridColumn: "1 / -1",
              border: "1px solid rgba(148,163,184,0.35)",
              borderRadius: 1,
              px: 1.5,
              py: 1.25,
            }}
          >
            <Stack spacing={1.25}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
                spacing={1}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Attachments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload one or more files for this inquiry.
                  </Typography>
                </Box>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<UploadFileRoundedIcon />}
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                >
                  Upload Files
                  <Box
                    component="input"
                    type="file"
                    multiple
                    onChange={handleAttachmentChange}
                    sx={{ display: "none" }}
                  />
                </Button>
              </Stack>

              {value.attachmentNames.length ? (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {value.attachmentNames.map((attachmentName, index) => (
                    <Chip
                      key={`${attachmentName}-${index}`}
                      label={attachmentName}
                      onDelete={() => handleAttachmentDelete(index)}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attachments selected yet.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </DrawerShell>
    </Drawer>
  );
};

export const InquiryDetailDrawer = ({
  open,
  inquiry,
  onClose,
  onEdit,
  onConvert,
  comments,
  attachments,
  activities,
}: InquiryDetailDrawerProps) => {
  const [activeSection, setActiveSection] =
    React.useState<InquiryDetailSection>("overview");

  React.useEffect(() => {
    if (!open) {
      setActiveSection("overview");
    }
  }, [open]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={inquiryWorkspaceDrawerPaperSx}>
      <DrawerShell
        title={inquiry?.inquiryNo ? `Inquiry Detail - ${inquiry.inquiryNo}` : "Inquiry Detail"}
        subtitle=""
        headerActions={
          <>
            {inquiry ? (
              <Button
                variant="contained"
                startIcon={<CompareArrowsRoundedIcon />}
                onClick={onConvert}
                sx={drawerActionButtonSx}
              >
                Convert
              </Button>
            ) : null}
            <Button
              variant="outlined"
              startIcon={<EditRoundedIcon />}
              onClick={onEdit}
              sx={drawerActionButtonSx}
            >
              Edit
            </Button>
            <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
              Close
            </Button>
          </>
        }
      >
        <Box
          sx={{
            borderBottom: "1px solid rgba(148,163,184,0.18)",
            mb: 1,
          }}
        >
          <Tabs
            value={activeSection}
            onChange={(_, value) => setActiveSection(value)}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            <Tab value="overview" label="Overview" />
            <Tab value="attachments" label="Attachments" />
            <Tab value="comments" label="Comments" />
          </Tabs>
        </Box>
        {inquiry ? (
          <>
            {activeSection === "overview" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {inquiry.inquiryNo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overview and requirement summary
                      </Typography>
                    </Box>
                  </Stack>
                  <DetailsGrid
                    items={[
                      { label: "Inquiry No", value: inquiry.inquiryNo },
                      { label: "Customer", value: inquiry.customer },
                      { label: "Status", value: <ProjectStatusBadge status={inquiry.status} /> },
                      { label: "Priority", value: <PriorityBadge priority={inquiry.priority} /> },
                      { label: "Owner", value: inquiry.owner },
                      { label: "Target Date", value: inquiry.targetDate },
                      { label: "Created On", value: inquiry.createdOn },
                      { label: "Updated On", value: inquiry.updatedOn },
                    ]}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Requirement
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      {inquiry.requirement}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : null}

            {activeSection === "attachments" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Attachments
                </Typography>
                <AttachmentList items={attachments} />
              </Box>
            ) : null}

            {activeSection === "comments" ? (
              <Box
                sx={{
                  ...projectSurfaceSx,
                  p: 0,
                  overflow: "hidden",
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                }}
              >
                <ProjectCommentsPanel
                  items={comments}
                  threadKey={inquiry.id}
                  currentAuthor={inquiry.owner}
                  currentRole="Project Manager"
                />
              </Box>
            ) : null}
          </>
        ) : null}
      </DrawerShell>
    </Drawer>
  );
};

export const InquiryConvertDrawer = ({
  open,
  inquiry,
  onClose,
  onEdit,
  value,
  onChange,
  onSubmit,
}: InquiryConvertDrawerProps) => {
  const totalModuleHours = React.useMemo(
    () =>
      value.moduleRows.reduce(
        (sum, row) => sum + (Number.isFinite(Number(row.hours)) ? Number(row.hours) : 0),
        0,
      ),
    [value.moduleRows],
  );
  const totalTeamHours = React.useMemo(
    () =>
      value.teamRows.reduce(
        (sum, row) =>
          sum + (Number.isFinite(Number(row.plannedHours)) ? Number(row.plannedHours) : 0),
        0,
      ),
    [value.teamRows],
  );

  const handleFieldChange =
    (field: keyof InquiryConvertFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...value,
        [field]: event.target.value,
      });
    };

  const handleModuleRowChange =
    (rowId: string, field: keyof InquiryConversionModuleRow) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...value,
        moduleRows: value.moduleRows.map((row) =>
          row.id === rowId ? { ...row, [field]: event.target.value } : row,
        ),
      });
    };

  const handleTeamRowChange =
    (rowId: string, field: keyof InquiryConversionTeamRow) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...value,
        teamRows: value.teamRows.map((row) =>
          row.id === rowId ? { ...row, [field]: event.target.value } : row,
        ),
      });
    };

  const addModuleRow = () => {
    onChange({
      ...value,
      moduleRows: [
        ...value.moduleRows,
        {
          id: buildConvertRowId("module"),
          module: "",
          submodule: "",
          phase: "Development",
          owner: value.leader,
          hours: "",
          progress: "0",
          source: "",
        },
      ],
    });
  };

  const addTeamRow = () => {
    onChange({
      ...value,
      teamRows: [
        ...value.teamRows,
        {
          id: buildConvertRowId("team"),
          member: "",
          role: "Developer",
          module: "",
          submodule: "",
          plannedHours: "",
        },
      ],
    });
  };

  const removeModuleRow = (rowId: string) => {
    onChange({
      ...value,
      moduleRows: value.moduleRows.filter((row) => row.id !== rowId),
    });
  };

  const removeTeamRow = (rowId: string) => {
    onChange({
      ...value,
      teamRows: value.teamRows.filter((row) => row.id !== rowId),
    });
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={inquiryWorkspaceDrawerPaperSx}>
      <DrawerShell
        title={inquiry?.inquiryNo ? `Convert to Project - ${inquiry.inquiryNo}` : "Convert to Project"}
        subtitle="Capture project setup, module estimates, and team ownership before creating the project."
        headerActions={
          <>
            <Button variant="outlined" onClick={onEdit} sx={drawerActionButtonSx}>
              Edit Inquiry
            </Button>
            <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
              Close
            </Button>
          </>
        }
        footer={
          <Button variant="contained" onClick={onSubmit} sx={drawerActionButtonSx}>
            Confirm Conversion
          </Button>
        }
      >
        {inquiry ? (
          <Stack spacing={2}>
            <Alert severity="warning">
              Inquiry baseline, approved scope, planning modules, and team allocation will be stored as the project delivery plan.
            </Alert>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                gap: 1.25,
              }}
            >
              {[
                {
                  label: "Module Estimates",
                  value: `${value.moduleRows.length} rows`,
                  helper: `${totalModuleHours}h captured for schedule planning`,
                  color: "#2563EB",
                },
                {
                  label: "Team Allocation",
                  value: `${value.teamRows.length} rows`,
                  helper: `${totalTeamHours}h assigned across delivery team`,
                  color: "#7C3AED",
                },
                {
                  label: "Coverage Gap",
                  value: `${Math.max(totalModuleHours - totalTeamHours, 0)}h`,
                  helper: "Unallocated hours that still need team mapping",
                  color: totalModuleHours > totalTeamHours ? "#DC2626" : "#059669",
                },
              ].map((card) => (
                <Box
                  key={card.label}
                  sx={{
                    borderRadius: 2.5,
                    border: "1px solid rgba(148,163,184,0.16)",
                    bgcolor: "rgba(248,250,252,0.74)",
                    p: 1.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    {card.label}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.8, fontWeight: 900, color: card.color }}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.6, display: "block" }}>
                    {card.helper}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ ...projectSurfaceSx, p: 2 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 2,
                }}
              >
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Project Setup
                  </Typography>
                </Box>
                <TextField label="Inquiry No" value={inquiry.inquiryNo} size="small" disabled fullWidth />
                <TextField label="Customer" value={value.customer} size="small" disabled fullWidth />
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <TextField
                    label="Project Name"
                    value={value.projectName}
                    onChange={handleFieldChange("projectName")}
                    size="small"
                    fullWidth
                  />
                </Box>
                <TextField
                  label="Project Code"
                  value={value.projectCode}
                  onChange={handleFieldChange("projectCode")}
                  size="small"
                  fullWidth
                />
                <TextField
                  select
                  label="Project Status"
                  value={value.status}
                  onChange={handleFieldChange("status")}
                  size="small"
                  fullWidth
                >
                  {convertProjectStatusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Primary Leader"
                  value={value.leader}
                  onChange={handleFieldChange("leader")}
                  size="small"
                  fullWidth
                >
                  {convertPeopleOptions.map((person) => (
                    <MenuItem key={person} value={person}>
                      {person}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Secondary Leader"
                  value={value.secondaryLeader}
                  onChange={handleFieldChange("secondaryLeader")}
                  size="small"
                  fullWidth
                >
                  {convertPeopleOptions.map((person) => (
                    <MenuItem key={person} value={person}>
                      {person}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Planned Start Date"
                  type="date"
                  value={value.startDate}
                  onChange={handleFieldChange("startDate")}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Target Go-Live"
                  type="date"
                  value={value.dueDate}
                  onChange={handleFieldChange("dueDate")}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <TextField
                    label="Approved Scope Link"
                    value={value.approvedScope}
                    onChange={handleFieldChange("approvedScope")}
                    size="small"
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <TextField
                    label="Implementation Notes"
                    value={value.implementationNotes}
                    onChange={handleFieldChange("implementationNotes")}
                    multiline
                    minRows={4}
                    fullWidth
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ ...projectSurfaceSx, p: 2 }}>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Module Planning Input
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ahiya module, submodule, phase, estimate time, ane owner capture karo.
                    </Typography>
                  </Box>
                  <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={addModuleRow}>
                    Add Module Row
                  </Button>
                </Stack>

                {value.moduleRows.map((row, index) => (
                  <Box
                    key={row.id}
                    sx={{
                      border: "1px solid rgba(148,163,184,0.18)",
                      borderRadius: 2,
                      p: 1.5,
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          Module Row {index + 1}
                        </Typography>
                        <IconButton size="small" onClick={() => removeModuleRow(row.id)}>
                          <CloseRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                          gap: 1.25,
                        }}
                      >
                        <TextField label="Module" value={row.module} onChange={handleModuleRowChange(row.id, "module")} size="small" fullWidth />
                        <TextField label="Submodule" value={row.submodule} onChange={handleModuleRowChange(row.id, "submodule")} size="small" fullWidth />
                        <TextField label="Phase" value={row.phase} onChange={handleModuleRowChange(row.id, "phase")} size="small" fullWidth />
                        <TextField select label="Owner" value={row.owner} onChange={handleModuleRowChange(row.id, "owner")} size="small" fullWidth>
                          {convertPeopleOptions.map((person) => (
                            <MenuItem key={person} value={person}>
                              {person}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField label="Est. Hours" value={row.hours} onChange={handleModuleRowChange(row.id, "hours")} size="small" fullWidth />
                        <TextField label="Progress %" value={row.progress} onChange={handleModuleRowChange(row.id, "progress")} size="small" fullWidth />
                        <Box sx={{ gridColumn: "1 / -1" }}>
                          <TextField label="Estimate Source / Notes" value={row.source} onChange={handleModuleRowChange(row.id, "source")} size="small" fullWidth />
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box sx={{ ...projectSurfaceSx, p: 2 }}>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Team Allocation Input
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ahiya team ma kon kaya module par kam karse ane ketla kalak assign thase te capture karo.
                    </Typography>
                  </Box>
                  <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={addTeamRow}>
                    Add Team Row
                  </Button>
                </Stack>

                {value.teamRows.map((row, index) => (
                  <Box
                    key={row.id}
                    sx={{
                      border: "1px solid rgba(148,163,184,0.18)",
                      borderRadius: 2,
                      p: 1.5,
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          Team Row {index + 1}
                        </Typography>
                        <IconButton size="small" onClick={() => removeTeamRow(row.id)}>
                          <CloseRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                          gap: 1.25,
                        }}
                      >
                        <TextField select label="Member" value={row.member} onChange={handleTeamRowChange(row.id, "member")} size="small" fullWidth>
                          {convertPeopleOptions.map((person) => (
                            <MenuItem key={person} value={person}>
                              {person}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField label="Role" value={row.role} onChange={handleTeamRowChange(row.id, "role")} size="small" fullWidth />
                        <TextField label="Module" value={row.module} onChange={handleTeamRowChange(row.id, "module")} size="small" fullWidth />
                        <TextField label="Submodule" value={row.submodule} onChange={handleTeamRowChange(row.id, "submodule")} size="small" fullWidth />
                        <TextField label="Planned Hours" value={row.plannedHours} onChange={handleTeamRowChange(row.id, "plannedHours")} size="small" fullWidth />
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </DrawerShell>
    </Drawer>
  );
};
