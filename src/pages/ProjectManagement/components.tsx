import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import type {
  AttachmentItem,
  CommentItem,
  PriorityLevel,
  ProjectManagementStatus,
  TimelineItem,
} from "./mockData";
import { projectSectionTitleSx, projectSurfaceSx } from "./ui";

const statusColorMap: Record<string, { bg: string; color: string }> = {
  New: { bg: "#DBEAFE", color: "#1D4ED8" },
  Pending: { bg: "#FEF3C7", color: "#B45309" },
  "In Review": { bg: "#EDE9FE", color: "#7C3AED" },
  Approved: { bg: "#DCFCE7", color: "#15803D" },
  Rejected: { bg: "#FEE2E2", color: "#B91C1C" },
  Active: { bg: "#DBEAFE", color: "#1D4ED8" },
  Planned: { bg: "#E2E8F0", color: "#475569" },
  "On Hold": { bg: "#FCE7F3", color: "#BE185D" },
  Completed: { bg: "#DCFCE7", color: "#15803D" },
  Overdue: { bg: "#FEE2E2", color: "#B91C1C" },
  Blocked: { bg: "#FEE2E2", color: "#B91C1C" },
  Paused: { bg: "#FEF3C7", color: "#B45309" },
  Open: { bg: "#DBEAFE", color: "#1D4ED8" },
  Resolved: { bg: "#DCFCE7", color: "#15803D" },
  Sent: { bg: "#E0F2FE", color: "#0369A1" },
  Paid: { bg: "#DCFCE7", color: "#15803D" },
  "Partially Paid": { bg: "#FEF3C7", color: "#B45309" },
  "Request Changes": { bg: "#FEF3C7", color: "#B45309" },
};

const priorityColorMap: Record<PriorityLevel, { bg: string; color: string }> = {
  Critical: { bg: "#FEE2E2", color: "#B91C1C" },
  High: { bg: "#FFEDD5", color: "#C2410C" },
  Medium: { bg: "#FEF3C7", color: "#B45309" },
  Low: { bg: "#DCFCE7", color: "#15803D" },
};

const attachmentIconMap = {
  PDF: DescriptionOutlinedIcon,
  Image: ImageOutlinedIcon,
  Video: OndemandVideoOutlinedIcon,
  Doc: InsertDriveFileOutlinedIcon,
  Sheet: GridViewRoundedIcon,
  Archive: InsertDriveFileOutlinedIcon,
} as const;

export const ProjectStatusBadge = ({ status }: { status: ProjectManagementStatus | string }) => {
  const palette = statusColorMap[status] || { bg: "#E2E8F0", color: "#334155" };

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontWeight: 800,
        bgcolor: palette.bg,
        color: palette.color,
      }}
    />
  );
};

export const PriorityBadge = ({ priority }: { priority: PriorityLevel }) => {
  const palette = priorityColorMap[priority];

  return (
    <Chip
      label={priority}
      size="small"
      sx={{
        fontWeight: 800,
        bgcolor: palette.bg,
        color: palette.color,
      }}
    />
  );
};

export const ProjectSectionCard = ({
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
  <Card sx={projectSurfaceSx}>
    <CardContent >
        {action}
      {children}
    </CardContent>
  </Card>
);

export const ProjectMetricCard = ({
  label,
  value,
  helper,
  color,
}: {
  label: string;
  value: string;
  helper: string;
  color: string;
}) => (
  <Card sx={projectSurfaceSx}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1.1, color, fontWeight: 900, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {helper}
      </Typography>
    </CardContent>
  </Card>
);

export const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ mt: 0.35, fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

export const DetailsGrid = ({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
      gap: 1.5,
    }}
  >
    {items.map((item) => (
      <DetailItem key={item.label} label={item.label} value={item.value} />
    ))}
  </Box>
);

export const TimelineList = ({ items }: { items: TimelineItem[] }) => (
  <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
    {items.map((item) => (
      <ListItem
        key={item.id}
        disableGutters
        sx={{
          alignItems: "flex-start",
          px: 0,
          py: 0,
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: item.color || "#2563EB",
            mt: 0.9,
            mr: 1.25,
            flexShrink: 0,
          }}
        />
        <ListItemText
          primary={
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {item.title}
            </Typography>
          }
          secondary={
            <Stack spacing={0.25} sx={{ mt: 0.25 }}>
              <Typography variant="body2" color="text.secondary">
                {item.subtitle}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[item.actor, item.time].filter(Boolean).join(" • ")}
              </Typography>
            </Stack>
          }
        />
      </ListItem>
    ))}
  </List>
);

export const ProjectTimelineRail = ({ items }: { items: TimelineItem[] }) => (
  <List
    disablePadding
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 1.75,
      pl: { xs: 0.25, sm: 0.5 },
    }}
  >
    {items.map((item, index) => {
      const accent = item.color || "#2563EB";

      return (
        <ListItem
          key={item.id}
          disableGutters
          sx={{
            alignItems: "stretch",
            px: 0,
            py: 0,
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 28,
              flexShrink: 0,
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {index < items.length - 1 ? (
              <Box
                sx={{
                  position: "absolute",
                  top: 24,
                  bottom: -28,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 2,
                  borderRadius: 999,
                  background: `linear-gradient(180deg, ${accent}33 0%, rgba(148,163,184,0.18) 100%)`,
                }}
              />
            ) : null}
            <Box
              sx={{
                mt: 0.55,
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: accent,
                border: "4px solid rgba(255,255,255,0.96)",
                boxShadow: `0 0 0 4px ${accent}22, 0 14px 24px ${accent}22`,
                zIndex: 1,
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              borderRadius: 3,
              border: "1px solid rgba(148,163,184,0.16)",
              bgcolor: "rgba(255,255,255,0.88)",
              boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
              px: 1.6,
              py: 1.35,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                bgcolor: accent,
              }}
            />
            <ListItemText
              sx={{ m: 0 }}
              primary={
                <Stack spacing={0.9}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={0.75}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                      {item.title}
                    </Typography>
                    {item.time ? (
                      <Chip
                        size="small"
                        label={item.time}
                        sx={{
                          height: 24,
                          fontWeight: 800,
                          bgcolor: `${accent}12`,
                          color: accent,
                          borderRadius: 999,
                        }}
                      />
                    ) : null}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {item.subtitle}
                  </Typography>
                </Stack>
              }
              secondary={
                item.actor ? (
                  <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 1.1 }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: 12,
                        fontWeight: 800,
                        bgcolor: `${accent}16`,
                        color: accent,
                      }}
                    >
                      {item.actor
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {item.actor}
                    </Typography>
                  </Stack>
                ) : null
              }
            />
          </Box>
        </ListItem>
      );
    })}
  </List>
);

const renderComment = (item: CommentItem, isReply = false) => (
  <Box
    key={item.id}
    sx={{
      pl: isReply ? 3 : 0,
      borderLeft: isReply ? "2px solid rgba(148,163,184,0.22)" : "none",
      ml: isReply ? 1.25 : 0,
    }}
  >
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Avatar sx={{ width: 34, height: 34, bgcolor: item.channel === "Customer" ? "#0EA5E9" : "#2563EB" }}>
        {item.author
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={0.75} alignItems={{ sm: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {item.author}
          </Typography>
          <Chip
            label={`${item.role} • ${item.channel}`}
            size="small"
            variant="outlined"
            sx={{ width: "fit-content" }}
          />
          <Typography variant="caption" color="text.secondary">
            {item.time}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {item.message}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button size="small" variant="text">
            Reply
          </Button>
          <Button size="small" variant="text">
            Mention User
          </Button>
        </Stack>
      </Box>
    </Stack>
    {item.replies?.length ? (
      <Stack spacing={1.25} sx={{ mt: 1.25 }}>
        {item.replies.map((reply) => renderComment(reply, true))}
      </Stack>
    ) : null}
  </Box>
);

export const CommentThreadList = ({ items }: { items: CommentItem[] }) => (
  <Stack spacing={1.75}>{items.map((item) => renderComment(item))}</Stack>
);

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

const ProjectCommentMessage = ({
  item,
  level = 0,
  onReply,
  onMention,
  interactive,
}: {
  item: CommentItem;
  level?: number;
  onReply: (item: CommentItem) => void;
  onMention: (item: CommentItem) => void;
  interactive: boolean;
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
              fontSize: "0.9rem",
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
            {interactive ? (
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
            ) : null}
          </Box>
        </Stack>
        {item.replies?.length ? (
          <Stack spacing={1.1} sx={{ width: "100%" }}>
            {item.replies.map((reply) => (
              <ProjectCommentMessage
                key={reply.id}
                item={reply}
                level={level + 1}
                onReply={onReply}
                onMention={onMention}
                interactive={interactive}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
};

export const ProjectCommentsPanel = ({
  items,
  threadKey,
  currentAuthor = "Project Manager",
  currentRole = "Project Manager",
  composeChannel = "Internal",
  showComposer = true,
  showChannelLegend = true,
  placeholder = "Write a comment, mention teammate, or share context...",
}: {
  items: CommentItem[];
  threadKey?: string;
  currentAuthor?: string;
  currentRole?: string;
  composeChannel?: CommentItem["channel"];
  showComposer?: boolean;
  showChannelLegend?: boolean;
  placeholder?: string;
}) => {
  const [chatComments, setChatComments] = React.useState<CommentItem[]>(items);
  const [draftMessage, setDraftMessage] = React.useState("");
  const [draftAttachments, setDraftAttachments] = React.useState<string[]>([]);
  const [replyTarget, setReplyTarget] = React.useState<CommentItem | null>(null);

  React.useEffect(() => {
    setChatComments(items);
    setDraftMessage("");
    setDraftAttachments([]);
    setReplyTarget(null);
  }, [items, threadKey]);

  const handleDraftAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setDraftAttachments((currentItems) => [
      ...currentItems,
      ...files.map((file) => file.name),
    ]);
    event.target.value = "";
  };

  const handleRemoveDraftAttachment = (attachmentIndex: number) => {
    setDraftAttachments((currentItems) =>
      currentItems.filter((_, index) => index !== attachmentIndex),
    );
  };

  const handleReply = (item: CommentItem) => {
    if (!showComposer) {
      return;
    }

    setReplyTarget(item);
  };

  const handleMention = (item: CommentItem) => {
    if (!showComposer) {
      return;
    }

    setDraftMessage((currentValue) =>
      currentValue.includes(`@${item.author}`)
        ? currentValue
        : `${currentValue}${currentValue ? " " : ""}@${item.author} `,
    );
  };

  const handleSendComment = () => {
    if (!draftMessage.trim() && !draftAttachments.length) {
      return;
    }

    const nextComment: CommentItem = {
      id: `comment-${Date.now()}`,
      author: currentAuthor,
      role: currentRole,
      message: draftMessage.trim() || "Shared attachment(s).",
      time: buildCommentTimestamp(),
      channel: composeChannel,
      attachments: draftAttachments.length ? draftAttachments : undefined,
    };

    setChatComments((currentItems) => {
      if (!replyTarget) {
        return [...currentItems, nextComment];
      }

      const targetComment = findCommentById(currentItems, replyTarget.id);

      if (!targetComment) {
        return [...currentItems, nextComment];
      }

      return appendReplyToThread(currentItems, replyTarget.id, nextComment);
    });

    setDraftMessage("");
    setDraftAttachments([]);
    setReplyTarget(null);
  };

  return (
    <Box
      sx={{
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: showComposer ? "minmax(0, 1fr) auto" : "minmax(0, 1fr)",
        height: "100%",
        minHeight: 0,
        width: "100%",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 2,
          minHeight: 0,
          overflowY: "auto",
          bgcolor: "#F8FAFC",
          backgroundImage:
            "radial-gradient(circle at top left, rgba(37,99,235,0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(14,165,233,0.08), transparent 26%)",
        }}
      >
        <Stack spacing={1.75}>
          {chatComments.map((item) => (
            <ProjectCommentMessage
              key={item.id}
              item={item}
              onReply={handleReply}
              onMention={handleMention}
              interactive={showComposer}
            />
          ))}
        </Stack>
      </Box>

      {showComposer ? (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(148,163,184,0.16)",
            bgcolor: "#FFFFFF",
            flexShrink: 0,
            boxShadow: "0 -10px 24px rgba(15,23,42,0.04)",
          }}
        >
          <Stack spacing={1.25}>
            {replyTarget ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 1,
                  px: 1.25,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "rgba(37,99,235,0.06)",
                  border: "1px solid rgba(37,99,235,0.12)",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: "#1D4ED8", fontWeight: 800 }}>
                    Replying to {replyTarget.author}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {replyTarget.message}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setReplyTarget(null)}>
                  <CloseRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ) : null}

            <TextField
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder={placeholder}
              multiline
              minRows={3}
              fullWidth
            />

            {draftAttachments.length ? (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {draftAttachments.map((attachmentName, index) => (
                  <ChatAttachmentPreview
                    key={`${attachmentName}-${index}`}
                    name={attachmentName}
                    onRemove={() => handleRemoveDraftAttachment(index)}
                  />
                ))}
              </Stack>
            ) : null}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              spacing={1}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<UploadFileRoundedIcon />}
                >
                  Upload File
                  <Box
                    component="input"
                    type="file"
                    multiple
                    onChange={handleDraftAttachmentChange}
                    sx={{ display: "none" }}
                  />
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() =>
                    setDraftMessage(
                      (currentValue) => `${currentValue}${currentValue ? " " : ""}@team `,
                    )
                  }
                >
                  Mention Team
                </Button>
              </Stack>
              <Button
                variant="contained"
                endIcon={<SendRoundedIcon />}
                onClick={handleSendComment}
                disabled={!draftMessage.trim() && !draftAttachments.length}
              >
                Send
              </Button>
            </Stack>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export const AttachmentList = ({ items }: { items: AttachmentItem[] }) => (
  <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    {items.map((item, index) => {
      const AttachmentIcon = attachmentIconMap[item.kind];

      return (
        <React.Fragment key={item.id}>
          <ListItem disableGutters sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: "rgba(37,99,235,0.12)", color: "#2563EB" }}>
                <AttachmentIcon fontSize="small" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.name}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {item.kind} • {item.size} • {item.uploadedBy} • {item.uploadedAt}
                </Typography>
              }
            />
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="text">
                Preview
              </Button>
              <Button size="small" variant="text">
                Download
              </Button>
              <Button size="small" variant="text" color="error">
                Delete
              </Button>
            </Stack>
          </ListItem>
          {index < items.length - 1 ? <Divider /> : null}
        </React.Fragment>
      );
    })}
  </List>
);

export const ProgressSummary = ({
  label,
  value,
  helper,
  color = "#2563EB",
}: {
  label: string;
  value: number;
  helper: string;
  color?: string;
}) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800, color }}>
        {value}%
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{
        height: 8,
        borderRadius: 999,
        bgcolor: "rgba(148,163,184,0.16)",
        "& .MuiLinearProgress-bar": {
          bgcolor: color,
          borderRadius: 999,
        },
      }}
    />
    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
      {helper}
    </Typography>
  </Box>
);
