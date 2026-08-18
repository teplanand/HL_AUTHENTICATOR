import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import AudiotrackRoundedIcon from "@mui/icons-material/AudiotrackRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { toast } from "react-toastify";

import { Page } from "../../../../shared/components/common/Page";
import {
  useCheckTransactionMutation,
  useCheckForCategoryMutation,
  useCreateCategoryMutation,
  useFilterReferenceNoMutation,
  useGetAudioMutation,
  useGetChildRefNoMutation,
  useGetImagesMutation,
  useGetRefreneceNumbersListMutation,
  useGetUserCategoriesMutation,
  useGetUserDataMutation,
  useGetVideosMutation,
  useLazyGetRemarksListQuery,
  useSaveImagesMutation,
} from "../api/evidancecollection";
import {
  getToken,
  getDecodedToken,
} from "../../../../shared/utils/auth";
import {
  buildUploadRemarksPayload,
  extractMessage,
  extractSuccess,
  formatBytes,
  formatMediaDate,
  getNumericCategoryId,
  normalizeCategories,
  normalizeMediaItems,
  normalizeReferences,
  normalizeRemarks,
  normalizeViewerProfile,
} from "./selectors";
import type {
  EvidenceCategoryOption,
  EvidenceMediaItem,
  EvidenceMediaKind,
  EvidenceViewerProfile,
  EvidenceWorkspaceMode,
  UploadPreviewItem,
} from "./types";
import { getEvidanceRouteUiPermissions } from "../utils/evidanceAccess";

 

type MediaTabKind = Extract<EvidenceMediaKind, "image" | "video" | "audio">;

const mediaTabs: { value: MediaTabKind; label: string; icon: ReactElement }[] = [
  { value: "image", label: "Images", icon: <ImageRoundedIcon fontSize="small" /> },
  { value: "video", label: "Videos", icon: <MovieRoundedIcon fontSize="small" /> },
  { value: "audio", label: "Audio", icon: <AudiotrackRoundedIcon fontSize="small" /> },
];

const emptyMediaCounts: Record<MediaTabKind, number> = {
  image: 0,
  video: 0,
  audio: 0,
};

const mediaIconMap: Record<EvidenceMediaKind, ReactElement> = {
  image: <ImageRoundedIcon />,
  video: <MovieRoundedIcon />,
  audio: <AudiotrackRoundedIcon />,
  file: <DescriptionRoundedIcon />,
};

const emptyViewerProfile: EvidenceViewerProfile = {
  name: "Authorized User",
  hrmsId: "",
  role: "Authorized User",
  company: "",
  companyId: null,
  division: "",
  canUpload: true,
  canView: true,
};

const workspaceTitleMap: Record<EvidenceWorkspaceMode, string> = {
  upload: "Evidence Intake",
  view: "Evidence Dashboard",
  admin: "Admin Viewer",
};

const warehouseAccent = "#FF8A3D";
const warehouseAccentDark = "#C2410C";
const warehouseSlate = "#0F172A";
const EVIDENCE_CHILD_CATEGORY_ID = 1;

type EvidencePhaseOption = {
  id: string;
  phaseId: number | null;
  phaseName: string;
};

const formatCategoryInlineLabel = (category: EvidenceCategoryOption | null) => {
  if (!category) {
    return "";
  }

  return category.childLabel
    ? `${category.label} / ${category.childLabel}`
    : category.label;
};

const pickPreviewKind = (file: File): EvidenceMediaKind => {
  if (file.type.startsWith("image/")) {
    return "image";
  }
  if (file.type.startsWith("video/")) {
    return "video";
  }
  if (file.type.startsWith("audio/")) {
    return "audio";
  }
  return "file";
};

const sanitizeDownloadFileName = (value: string) =>
  value.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_").trim();

const getFileExtensionFromUrl = (value: string) => {
  const cleanValue = value.split("#")[0].split("?")[0];
  const fileName = cleanValue.split("/").pop() ?? "";
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) {
    return "";
  }

  return fileName.slice(lastDotIndex);
};

const buildDownloadFileName = (item: EvidenceMediaItem) => {
  const baseName = sanitizeDownloadFileName(item.title || `${item.kind}-evidence`) || `${item.kind}-evidence`;

  if (/\.[a-z0-9]{2,6}$/i.test(baseName)) {
    return baseName;
  }

  return `${baseName}${getFileExtensionFromUrl(item.url)}`;
};

const triggerBrowserDownload = (href: string, fileName: string) => {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.target = "_self";
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

const fetchDownloadBlob = async (url: string, token: string | null) => {
  const attempts: RequestInit[] = [
    {
      mode: "cors",
      credentials: "include",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    },
    {
      mode: "cors",
    },
  ];

  let lastError: unknown = null;

  for (const options of attempts) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Download failed");
};

const downloadMediaItem = async (item: EvidenceMediaItem) => {
  if (!item.url) {
    throw new Error("Missing media url");
  }

  const fileName = buildDownloadFileName(item);

  if (item.url.startsWith("data:")) {
    triggerBrowserDownload(item.url, fileName);
    return;
  }

  try {
    const token = getToken();
    const blob = await fetchDownloadBlob(item.url, token);
    const blobUrl = URL.createObjectURL(blob);

    try {
      triggerBrowserDownload(blobUrl, fileName);
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    }
  } catch (error) {
    console.error("Unable to download media as a file", error);
    throw new Error("The file could not be downloaded directly.");
  }
};

const PreviewDialog = ({
  item,
  items,
  open,
  onClose,
  onPrevious,
  onNext,
  onDownload,
  canDownload,
}: {
  item: EvidenceMediaItem | null;
  items: EvidenceMediaItem[];
  open: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onDownload: () => void;
  canDownload: boolean;
}) => {
  const theme = useMuiTheme();

  const currentIndex = item
    ? items.findIndex((candidate) => candidate.id === item.id)
    : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < items.length - 1;

  if (!item) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        className: "overflow-hidden rounded-2xl",
      }}
    >
      <DialogTitle className="flex items-center justify-between gap-4">
        <Box className="min-w-0">
          <Typography variant="h6" fontWeight={800} noWrap>
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {item.remark || item.sourceLabel || "Evidence preview"}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            onClick={onDownload}
            disabled={!canDownload}
            sx={{ borderRadius: 999, textTransform: "none" }}
          >
            Download
          </Button>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        className="p-0"
        sx={{
          position: "relative",
          bgcolor: theme.palette.mode === "dark" ? "#020617" : "#0F172A",
        }}
      >
        {items.length > 1 ? (
          <>
            <IconButton
              onClick={onPrevious}
              disabled={!hasPrevious}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                color: "#fff",
                bgcolor: "rgba(15, 23, 42, 0.54)",
                backdropFilter: "blur(8px)",
                "&:hover": {
                  bgcolor: "rgba(15, 23, 42, 0.74)",
                },
                "&.Mui-disabled": {
                  color: "rgba(255,255,255,0.35)",
                  bgcolor: "rgba(15,23,42,0.28)",
                },
              }}
            >
              <ChevronLeftRoundedIcon />
            </IconButton>
            <IconButton
              onClick={onNext}
              disabled={!hasNext}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                color: "#fff",
                bgcolor: "rgba(15, 23, 42, 0.54)",
                backdropFilter: "blur(8px)",
                "&:hover": {
                  bgcolor: "rgba(15, 23, 42, 0.74)",
                },
                "&.Mui-disabled": {
                  color: "rgba(255,255,255,0.35)",
                  bgcolor: "rgba(15,23,42,0.28)",
                },
              }}
            >
              <ChevronRightRoundedIcon />
            </IconButton>
            <Chip
              label={`${currentIndex + 1} / ${items.length}`}
              size="small"
              sx={{
                position: "absolute",
                left: "50%",
                bottom: 16,
                transform: "translateX(-50%)",
                zIndex: 2,
                color: "#fff",
                bgcolor: "rgba(15, 23, 42, 0.62)",
                fontWeight: 700,
              }}
            />
          </>
        ) : null}
        {item.kind === "image" ? (
          <Box
            component="img"
            src={item.url}
            alt={item.title}
            className="block max-h-[78vh] w-full object-contain"
          />
        ) : null}
        {item.kind === "video" ? (
          <Box className="p-2">
            <Box
              component="video"
              src={item.url}
              controls
              className="max-h-[74vh] w-full rounded-xl bg-black"
            />
          </Box>
        ) : null}
        {item.kind === "audio" ? (
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            className="min-h-80 p-4 text-white"
          >
            <AudiotrackRoundedIcon className="!text-[56px]" />
            <Typography variant="h6" fontWeight={700}>
              {item.title}
            </Typography>
            <audio controls src={item.url} style={{ width: "100%", maxWidth: 560 }} />
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const buildSparklinePath = (values: number[], width = 320, height = 96) => {
  const safeValues = values.length > 1 ? values : [0, values[0] ?? 0];
  const minValue = Math.min(...safeValues);
  const maxValue = Math.max(...safeValues);
  const range = maxValue - minValue || 1;

  const points = safeValues.map((value, index) => {
    const x = (index / (safeValues.length - 1)) * width;
    const y = 14 + ((maxValue - value) / range) * (height - 28);
    return { x, y };
  });

  const linePath = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");

  return {
    linePath,
    latestPoint: points[points.length - 1],
    width,
    height,
  };
};

const buildTrendSeries = (primary: number, secondary = 0) => {
  const base = Math.max(primary, 1);
  const pattern = [1.04, 1.1, 0.94, 0.76, 0.7, 0.9, 1.08, 1.03, 0.82, 0.88, 1.06];

  return pattern.map((multiplier, index) =>
    Number((base * multiplier + secondary * (index % 3 === 0 ? 0.6 : 0.25)).toFixed(2)),
  );
};

const EvidenceTrendCard = ({
  title,
  value,
  subtitle,
  series,
}: {
  title: string;
  value: string;
  subtitle: string;
  series: number[];
}) => {
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === "dark";
  const { linePath, latestPoint, width, height } = buildSparklinePath(series);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: theme.palette.divider,
        bgcolor: theme.palette.background.paper,
        p: 2,
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, fontWeight: 800, letterSpacing: "0.12em" }}
          >
            {title}
          </Typography>
          <Typography
            variant="h6"
            sx={{ mt: 0.75, fontWeight: 800, color: theme.palette.text.primary }}
          >
            {value}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, fontWeight: 700, pt: 0.5 }}
        >
          {subtitle}
        </Typography>
      </Stack>

      <Box sx={{ mt: 1.5 }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[92px] w-full">
          <defs>
            <linearGradient id={`trend-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path
            d={`M 0 ${height * 0.35} L ${width} ${height * 0.35}`}
            stroke={isDark ? "#7F1D1D" : "#F8B4B4"}
            strokeWidth="1.2"
            strokeDasharray="5 8"
            fill="none"
            opacity={isDark ? 0.7 : 0.45}
          />
          <path
            d={`M 0 ${height * 0.7} L ${width} ${height * 0.7}`}
            stroke={isDark ? "#334155" : "#C7D2FE"}
            strokeWidth="1.2"
            strokeDasharray="5 8"
            fill="none"
            opacity={isDark ? 0.85 : 0.7}
          />
          <path
            d={linePath}
            fill="none"
            stroke={`url(#trend-${title})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={latestPoint.x}
            cy={latestPoint.y}
            r="5"
            fill={theme.palette.background.paper}
            stroke={`url(#trend-${title})`}
            strokeWidth="3"
          />
        </svg>
      </Box>
    </Paper>
  );
};

const EvidenceDashboard = () => {
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === "dark";

  const [getUserData] = useGetUserDataMutation();
  const [getUserCategories] = useGetUserCategoriesMutation();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [getReferenceNumbers] = useGetRefreneceNumbersListMutation();
  const [filterReferenceNumbers] = useFilterReferenceNoMutation();
  const [getChildReferenceNumbers] = useGetChildRefNoMutation();
  const [checkForCategory] = useCheckForCategoryMutation();
  const [getImages] = useGetImagesMutation();
  const [getVideos] = useGetVideosMutation();
  const [getAudio] = useGetAudioMutation();
  const [checkTransaction] = useCheckTransactionMutation();
  const [saveImages, { isLoading: isUploading }] = useSaveImagesMutation();
  const [triggerRemarks] = useLazyGetRemarksListQuery();
  const evidenceRoutePermissions = useMemo(
    () => getEvidanceRouteUiPermissions("/evidance/client-dashboard"),
    [],
  );

  const [sessionReady, setSessionReady] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [workspaceMode, setWorkspaceMode] =
    useState<EvidenceWorkspaceMode>("view");
  const [viewerProfile, setViewerProfile] =
    useState<EvidenceViewerProfile>(emptyViewerProfile);
  const [categories, setCategories] = useState<EvidenceCategoryOption[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [uploadCategoryId, setUploadCategoryId] = useState("");
  const [uploadReferenceNo, setUploadReferenceNo] = useState("");
  const [uploadRemarks, setUploadRemarks] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<UploadPreviewItem[]>([]);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const [viewCategoryId, setViewCategoryId] = useState("");
  const [referenceSearch, setReferenceSearch] = useState("");
  const deferredReferenceSearch = useDeferredValue(referenceSearch);
  const [referenceOptions, setReferenceOptions] = useState(
    normalizeReferences([]),
  );
  const [childReferenceMap, setChildReferenceMap] = useState<
    Record<string, ReturnType<typeof normalizeReferences>>
  >({});
  const [childReferenceLoadingFor, setChildReferenceLoadingFor] = useState("");
  const [childReferenceSearch, setChildReferenceSearch] = useState("");
  const [selectedChildReferenceNo, setSelectedChildReferenceNo] = useState("");
  const [childPhaseMap, setChildPhaseMap] = useState<Record<string, EvidencePhaseOption[]>>(
    {},
  );
  const [childPhaseLoadingFor, setChildPhaseLoadingFor] = useState("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [selectedReferenceNo, setSelectedReferenceNo] = useState("");
  const [remarkOptions, setRemarkOptions] = useState(normalizeRemarks([]));
  const [selectedRemark, setSelectedRemark] = useState("");
  const [activeMediaTab, setActiveMediaTab] = useState<MediaTabKind>("image");
  const [mediaCounts, setMediaCounts] = useState<Record<MediaTabKind, number>>(emptyMediaCounts);
  const [mediaItems, setMediaItems] = useState<EvidenceMediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [selectedMediaItem, setSelectedMediaItem] = useState<EvidenceMediaItem | null>(
    null,
  );
  const [transactionStatus, setTransactionStatus] = useState({
    checked: false,
    valid: false,
    message: "",
  });
  const isUploadWorkspace = workspaceMode === "upload";
  const activeWorkspaceTitle = workspaceTitleMap[workspaceMode];
  const canCreateEvidence = evidenceRoutePermissions.create;
  const canDownloadEvidence = evidenceRoutePermissions.download;
  const warehouseFieldSx = useMemo(
    () => ({
      "& .MuiOutlinedInput-root": {
        borderRadius: 2.5,
        bgcolor: "#F8FAFC",
        "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
        "&:hover fieldset": { borderColor: "rgba(15,23,42,0.2)" },
        "&.Mui-focused fieldset": { borderColor: warehouseAccent, borderWidth: "1.5px" },
      },
      "& .MuiInputBase-input": {
        fontSize: "0.84rem",
        fontWeight: 600,
      },
    }),
    [],
  );

  const filteredCategories = useMemo(() => {
    const normalizedQuery = categorySearch.trim().toLowerCase();
    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((category) =>
      `${category.label} ${category.childLabel} ${category.subtitle}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [categories, categorySearch]);

  const uploadCategory = useMemo(
    () => categories.find((category) => category.id === uploadCategoryId) ?? null,
    [categories, uploadCategoryId],
  );
  const viewCategory = useMemo(
    () => categories.find((category) => category.id === viewCategoryId) ?? null,
    [categories, viewCategoryId],
  );
  const selectedReferenceOption = useMemo(
    () =>
      referenceOptions.find((reference) => reference.refNo === selectedReferenceNo) ?? null,
    [referenceOptions, selectedReferenceNo],
  );
  const selectedChildReferences = useMemo(
    () => childReferenceMap[selectedReferenceNo] ?? [],
    [childReferenceMap, selectedReferenceNo],
  );
  const filteredChildReferences = useMemo(() => {
    const normalizedQuery = childReferenceSearch.trim().toLowerCase();

    if (!normalizedQuery) {
      return selectedChildReferences;
    }

    return selectedChildReferences.filter((reference) =>
      `${reference.refNo} ${reference.label} ${reference.subtitle}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [childReferenceSearch, selectedChildReferences]);
 
  const selectedChildPhases = useMemo(
    () => childPhaseMap[selectedChildReferenceNo] ?? [],
    [childPhaseMap, selectedChildReferenceNo],
  );
  const uploadSummary = useMemo(
    () => ({
      files: uploadFiles.length,
      totalSize: formatBytes(uploadFiles.reduce((total, file) => total + file.size, 0)),
    }),
    [uploadFiles],
  );
  const selectedMediaIndex = useMemo(
    () =>
      selectedMediaItem
        ? mediaItems.findIndex((item) => item.id === selectedMediaItem.id)
        : -1,
    [mediaItems, selectedMediaItem],
  );
  
 
 
  const ui = useMemo(
    () => ({
      shell: isDark ? theme.palette.background.paper : "#FFFFFF",
      panel: isDark ? theme.palette.background.paper : "#FFFFFF",
      panelAlt: isDark ? alpha(theme.palette.background.default, 0.5) : "#F8FAFC",
      workspace: isDark ? alpha(warehouseAccent, 0.1) : "#FFF7F1",
      selectedWarm: isDark ? alpha(warehouseAccent, 0.14) : "#FFF4ED",
      selectedSuccess: isDark ? alpha("#10B981", 0.14) : "#F2FBF7",
      softDanger: isDark ? alpha("#FB7185", 0.12) : "#FFF7F8",
      chipDanger: isDark ? alpha("#FB7185", 0.16) : "#FFF1F2",
      verified: isDark ? alpha("#10B981", 0.16) : "#ECFDF5",
      invalid: isDark ? alpha("#EF4444", 0.14) : "#FEF2F2",
      textStrong: isDark ? theme.palette.text.primary : warehouseSlate,
      textMuted: isDark ? theme.palette.text.secondary : "#64748B",
      textSoft: isDark ? alpha(theme.palette.text.secondary, 0.82) : "#334155",
      border: isDark ? theme.palette.divider : "rgba(15,23,42,0.08)",
      searchBg: isDark ? alpha(theme.palette.background.default, 0.78) : "#F8FAFC",
      heroFallback: isDark
        ? "linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,1) 100%)"
        : "linear-gradient(135deg, rgba(255,244,237,1) 0%, rgba(248,250,252,1) 52%, rgba(255,255,255,1) 100%)",
      heroOverlay: isDark
        ? "linear-gradient(180deg, rgba(2,6,23,0.08) 0%, rgba(2,6,23,0.88) 100%)"
        : "linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(15,23,42,0.78) 100%)",
      mediaFallback: isDark
        ? "linear-gradient(135deg, rgba(2,6,23,0.98) 0%, rgba(30,41,59,0.92) 100%)"
        : "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(194,65,12,0.92) 100%)",
      shadowWarm: isDark
        ? "0 18px 32px -28px rgba(255,138,61,0.45)"
        : "0 12px 24px -22px rgba(255,138,61,0.3)",
      shadowSuccess: isDark
        ? "0 18px 32px -28px rgba(16,185,129,0.35)"
        : "0 14px 28px -24px rgba(16,185,129,0.45)",
      shadowSoft: isDark
        ? "0 18px 36px -30px rgba(2,6,23,0.7)"
        : "0 10px 24px -28px rgba(15,23,42,0.16)",
    }),
    [isDark, theme],
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        if (!isMounted) {
          return;
        }

        const token = getToken();
        if (!token) {
          throw new Error("Evidence collection session token not found.");
        }

        const tokenPayload = getDecodedToken<Record<string, unknown>>();
        const [userResponse, categoryResponse] = await Promise.all([
          getUserData({}).unwrap().catch(() => null),
          getUserCategories({}).unwrap(),
        ]);

        if (!isMounted) {
          return;
        }

        const normalizedProfile = normalizeViewerProfile(tokenPayload, userResponse);
        const normalizedCategories = normalizeCategories(categoryResponse);

        setViewerProfile(normalizedProfile);
        setCategories(normalizedCategories);

        if (normalizedCategories.length) {
          setUploadCategoryId((current) => current || normalizedCategories[0].id);
          setViewCategoryId((current) => current || normalizedCategories[0].id);
        }

        if (!normalizedProfile.canUpload) {
          setWorkspaceMode("view");
        }

        setSessionReady(true);
      } catch (error) {
        console.error("Failed to initialize evidence collection", error);
        toast.error("Evidence collection category loading failed.");
      } finally {
        if (isMounted) {
          setBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [getUserCategories, getUserData]);

  useEffect(() => {
    const previewEntries = uploadFiles.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      name: file.name,
      sizeLabel: formatBytes(file.size),
      mimeType: file.type || "application/octet-stream",
      isImage: file.type.startsWith("image/"),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));

    setUploadPreviews(previewEntries);

    return () => {
      previewEntries.forEach((entry) => {
        if (entry.previewUrl) {
          URL.revokeObjectURL(entry.previewUrl);
        }
      });
    };
  }, [uploadFiles]);

  useEffect(() => {
    if (!sessionReady || !viewCategory) {
      return;
    }

    const numericCategoryId = getNumericCategoryId(viewCategory);
    if (!numericCategoryId) {
      return;
    }

    let isMounted = true;
    setReferencesLoading(true);
    setSelectedReferenceNo("");
    setSelectedChildReferenceNo("");
    setSelectedPhaseId(null);
    setChildReferenceSearch("");
    setChildReferenceMap({});
    setChildReferenceLoadingFor("");
    setChildPhaseMap({});
    setChildPhaseLoadingFor("");
    setRemarkOptions(normalizeRemarks([]));
    setSelectedRemark("");
    setMediaCounts(emptyMediaCounts);
    setMediaItems([]);
    setTransactionStatus({ checked: false, valid: false, message: "" });

    const loadReferences = async () => {
      try {
        const payload =
          deferredReferenceSearch.trim().length >= 2
            ? await filterReferenceNumbers({
                CategoryId: numericCategoryId,
                RefNo: deferredReferenceSearch.trim(),
              }).unwrap()
            : await getReferenceNumbers({
                CategoryId: numericCategoryId,
                PageNo: 0,
              }).unwrap();

        if (!isMounted) {
          return;
        }

        setReferenceOptions(normalizeReferences(payload));
      } catch (error) {
        console.error("Failed to fetch evidence references", error);
        if (isMounted) {
          setReferenceOptions([]);
        }
      } finally {
        if (isMounted) {
          setReferencesLoading(false);
        }
      }
    };

    void loadReferences();

    return () => {
      isMounted = false;
    };
  }, [
    deferredReferenceSearch,
    filterReferenceNumbers,
    getReferenceNumbers,
    sessionReady,
    viewCategory,
  ]);

  const handleReferenceSelect = async (referenceNo: string) => {
    setSelectedReferenceNo(referenceNo);
    setSelectedChildReferenceNo("");
    setSelectedPhaseId(null);
    setChildReferenceSearch("");

    if (!viewCategory) {
      return;
    }

    const numericCategoryId = getNumericCategoryId(viewCategory);
    if (!numericCategoryId) {
      return;
    }

    if (!viewCategory.childLabel) {
      setChildReferenceMap((current) => ({
        ...current,
        [referenceNo]: [],
      }));
      return;
    }

    if (childReferenceMap[referenceNo]) {
      return;
    }

    setChildReferenceLoadingFor(referenceNo);

    try {
      const childResponse = await getChildReferenceNumbers({
        CategoryId: numericCategoryId,
        PageNo: 0,
        RefNo: referenceNo,
        ChildCategoryId: EVIDENCE_CHILD_CATEGORY_ID,
      }).unwrap();

      setChildReferenceMap((current) => ({
        ...current,
        [referenceNo]: normalizeReferences(childResponse),
      }));
    } catch (error) {
      console.error("Failed to fetch child references", error);
      setChildReferenceMap((current) => ({
        ...current,
        [referenceNo]: [],
      }));
    } finally {
      setChildReferenceLoadingFor((current) =>
        current === referenceNo ? "" : current,
      );
    }
  };

  const normalizePhaseOptions = (payload: unknown) => {
    const list =
      Array.isArray((payload as { data?: unknown } | null)?.data)
        ? ((payload as { data: unknown[] }).data ?? [])
        : [];

    return list.map<EvidencePhaseOption>((entry, index) => {
      const record =
        entry && typeof entry === "object" && !Array.isArray(entry)
          ? (entry as Record<string, unknown>)
          : {};
      const rawPhaseId = record.phaseId ?? record.PhaseId ?? record.id ?? record.Id;
      const parsedPhaseId = Number(rawPhaseId);
      const phaseNameCandidate =
        record.phaseName ?? record.PhaseName ?? record.name ?? record.Name;

      return {
        id: `${String(rawPhaseId ?? index)}-${String(phaseNameCandidate ?? index)}`,
        phaseId: Number.isFinite(parsedPhaseId) ? parsedPhaseId : null,
        phaseName:
          typeof phaseNameCandidate === "string" && phaseNameCandidate.trim()
            ? phaseNameCandidate.trim()
            : `Phase ${index + 1}`,
      };
    });
  };

  const handleChildReferenceSelect = async (
    referenceNo: string,
    childReferenceNo: string,
  ) => {
    setSelectedChildReferenceNo(childReferenceNo);
    setSelectedPhaseId(null);

    if (childPhaseMap[childReferenceNo]) {
      setSelectedPhaseId(childPhaseMap[childReferenceNo][0]?.phaseId ?? null);
      return;
    }

    setChildPhaseLoadingFor(childReferenceNo);

    try {
      const response = await checkForCategory({
        RefNo: referenceNo,
        ChildRefNo: childReferenceNo,
      }).unwrap();

      const phases = normalizePhaseOptions(response);

      setChildPhaseMap((current) => ({
        ...current,
        [childReferenceNo]: phases,
      }));
      setSelectedPhaseId(phases[0]?.phaseId ?? null);
    } catch (error) {
      console.error("Failed to fetch child reference phases", error);
      setChildPhaseMap((current) => ({
        ...current,
        [childReferenceNo]: [],
      }));
    } finally {
      setChildPhaseLoadingFor((current) =>
        current === childReferenceNo ? "" : current,
      );
    }
  };

  useEffect(() => {
    if (!sessionReady || !selectedReferenceNo || !viewCategory) {
      return;
    }

    const numericCategoryId = getNumericCategoryId(viewCategory);
    if (!numericCategoryId) {
      return;
    }

    let isMounted = true;

    const loadReferenceMetadata = async () => {
      try {
        const [remarksResponse, transactionResponse] = await Promise.all([
          triggerRemarks(selectedReferenceNo, true).unwrap().catch(() => []),
          checkTransaction({
            RefNo: selectedReferenceNo,
            CatId: numericCategoryId,
          }).unwrap().catch(() => null),
        ]);

        if (!isMounted) {
          return;
        }

        setRemarkOptions(normalizeRemarks(remarksResponse));
        setTransactionStatus({
          checked: true,
          valid: Boolean(transactionResponse) && extractSuccess(transactionResponse),
          message:
            extractMessage(transactionResponse) ||
            "Reference checked against evidence transactions.",
        });
      } catch (error) {
        console.error("Failed to fetch reference metadata", error);
      }
    };

    void loadReferenceMetadata();

    return () => {
      isMounted = false;
    };
  }, [checkTransaction, selectedReferenceNo, sessionReady, triggerRemarks, viewCategory]);

  useEffect(() => {
    if (!sessionReady || !selectedReferenceNo || !viewCategory) {
      setMediaCounts(emptyMediaCounts);
      return;
    }

    const numericCategoryId = getNumericCategoryId(viewCategory);
    if (!numericCategoryId) {
      setMediaCounts(emptyMediaCounts);
      return;
    }

    let isMounted = true;

    const loadMediaCounts = async () => {
      try {
        const payload = {
          RefNo: selectedReferenceNo,
          CatId: numericCategoryId,
          ...(selectedChildReferenceNo ? { ChildRefNo: selectedChildReferenceNo } : {}),
          ...(selectedPhaseId ? { PhaseId: selectedPhaseId } : {}),
          ...(selectedRemark ? { Remarks: selectedRemark } : {}),
        };

        const [imagesResponse, videosResponse, audioResponse] = await Promise.all([
          getImages(payload).unwrap(),
          getVideos(payload).unwrap(),
          getAudio(payload).unwrap(),
        ]);

        if (!isMounted) {
          return;
        }

        setMediaCounts({
          image: normalizeMediaItems(imagesResponse, "image").length,
          video: normalizeMediaItems(videosResponse, "video").length,
          audio: normalizeMediaItems(audioResponse, "audio").length,
        });
      } catch (error) {
        console.error("Failed to fetch evidence media counts", error);
        if (isMounted) {
          setMediaCounts(emptyMediaCounts);
        }
      }
    };

    void loadMediaCounts();

    return () => {
      isMounted = false;
    };
  }, [
    getAudio,
    getImages,
    getVideos,
    selectedChildReferenceNo,
    selectedPhaseId,
    selectedReferenceNo,
    selectedRemark,
    sessionReady,
    viewCategory,
  ]);

  useEffect(() => {
    if (!sessionReady || !selectedReferenceNo || !viewCategory) {
      return;
    }

    const numericCategoryId = getNumericCategoryId(viewCategory);
    if (!numericCategoryId) {
      return;
    }

    let isMounted = true;
    setMediaLoading(true);

    const loadMedia = async () => {
      try {
        const payload = {
          RefNo: selectedReferenceNo,
          CatId: numericCategoryId,
          ...(selectedChildReferenceNo ? { ChildRefNo: selectedChildReferenceNo } : {}),
          ...(selectedPhaseId ? { PhaseId: selectedPhaseId } : {}),
          ...(selectedRemark ? { Remarks: selectedRemark } : {}),
        };

        const response =
          activeMediaTab === "video"
            ? await getVideos(payload).unwrap()
            : activeMediaTab === "audio"
              ? await getAudio(payload).unwrap()
              : await getImages(payload).unwrap();

        if (!isMounted) {
          return;
        }

        setMediaItems(normalizeMediaItems(response, activeMediaTab));
      } catch (error) {
        console.error("Failed to fetch evidence media", error);
        if (isMounted) {
          setMediaItems([]);
        }
      } finally {
        if (isMounted) {
          setMediaLoading(false);
        }
      }
    };

    void loadMedia();

    return () => {
      isMounted = false;
    };
  }, [
    activeMediaTab,
    getAudio,
    getImages,
    getVideos,
    selectedChildReferenceNo,
    selectedPhaseId,
    selectedReferenceNo,
    selectedRemark,
    sessionReady,
    viewCategory,
  ]);

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    if (!canCreateEvidence) {
      event.target.value = "";
      return;
    }

    const files = Array.from(event.target.files ?? []);
    setUploadFiles((currentFiles) => [...currentFiles, ...files]);
    event.target.value = "";
  };

  const openFilePicker = () => {
    if (!canCreateEvidence) {
      return;
    }

    uploadInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!canCreateEvidence) {
      toast.error("Upload access is not available.");
      return;
    }

    const numericCategoryId = getNumericCategoryId(uploadCategory);

    if (!numericCategoryId || !uploadReferenceNo.trim() || uploadFiles.length === 0) {
      toast.error("Category, reference number and files are required.");
      return;
    }

    try {
      const response = await saveImages({
        CategoryId: numericCategoryId,
        ReferenceNo: uploadReferenceNo.trim(),
        Remarks: buildUploadRemarksPayload(uploadRemarks),
        Files: uploadFiles,
      }).unwrap();

      toast.success(extractMessage(response) || "Evidence uploaded successfully.");

      setUploadFiles([]);
      setUploadRemarks("");
      setReferenceSearch(uploadReferenceNo.trim());
      setSelectedReferenceNo(uploadReferenceNo.trim());
      setWorkspaceMode("view");
    } catch (error) {
      console.error("Failed to upload evidence", error);
      toast.error("Evidence upload failed. Please verify category and files.");
    }
  };

  const handleDownloadItem = async (item: EvidenceMediaItem) => {
    if (!canDownloadEvidence) {
      toast.error("Download access is not available.");
      return;
    }

    try {
      await downloadMediaItem(item);
    } catch (error) {
      console.error("Failed to download evidence item", error);
      toast.error(`Unable to download ${item.title}.`);
    }
  };

  const handleDownloadAll = async () => {
    if (!canDownloadEvidence) {
      toast.error("Download access is not available.");
      return;
    }

    if (!mediaItems.length) {
      toast.info(`No ${activeMediaTab}s available to download.`);
      return;
    }

    setIsDownloadingAll(true);
    let successCount = 0;

    try {
      for (const item of mediaItems) {
        try {
          await downloadMediaItem(item);
          successCount += 1;
        } catch (error) {
          console.error("Failed to download evidence item", error);
        }
      }

      if (successCount === mediaItems.length) {
        toast.success(`Downloaded ${successCount} ${activeMediaTab}${successCount > 1 ? "s" : ""}.`);
      } else if (successCount > 0) {
        toast.warn(`Downloaded ${successCount} of ${mediaItems.length} ${activeMediaTab}${mediaItems.length > 1 ? "s" : ""}.`);
      } else {
        toast.error(`Unable to download ${activeMediaTab} files.`);
      }
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!canCreateEvidence) {
      toast.error("Create access is not available.");
      return;
    }

    const categoryName = newCategoryName.trim();

    if (!categoryName) {
      toast.error("Category name is required.");
      return;
    }

    if (!viewerProfile.companyId) {
      toast.error("Company information is not available for category creation.");
      return;
    }

    try {
      const response = await createCategory({
        CategoryName: categoryName,
        CompanyId: viewerProfile.companyId,
      }).unwrap();

      const refreshedCategoryResponse = await getUserCategories({}).unwrap().catch(() => []);
      const nextCategories = normalizeCategories(refreshedCategoryResponse);
      setCategories(nextCategories);

      const matchedCategory =
        nextCategories.find(
          (category) => category.label.trim().toLowerCase() === categoryName.toLowerCase(),
        ) ?? nextCategories[0] ?? null;

      if (matchedCategory) {
        setUploadCategoryId(matchedCategory.id);
        setViewCategoryId(matchedCategory.id);
      }

      setCategorySearch("");
      setNewCategoryName("");
      setCategoryDrawerOpen(false);
      toast.success(extractMessage(response) || "Category created successfully.");
    } catch (error) {
      console.error("Failed to create category", error);
      toast.error("Category creation failed. Please verify the category details.");
    }
  };

  return (
    <Page module="evidance">
      <Box sx={{ display: "grid", gap: 2.5 }}>
        {(!canCreateEvidence || !canDownloadEvidence) && (
          <Alert severity="info">
            {[
              !canCreateEvidence ? "create/upload" : null,
              !canDownloadEvidence ? "download" : null,
            ]
              .filter(Boolean)
              .join(" and ")}{" "}
            access is currently restricted on this page.
          </Alert>
        )}

        <Card
          sx={{
            display: "flex",
            minHeight: "calc(100vh - 96px)",
            overflow: "hidden",
            borderRadius: 3,
            border: `1px solid ${ui.border}`,
            boxShadow: "none",
            bgcolor: ui.shell,
          }}
        >
        <Box
          sx={{
            width: { xs: "100%", lg: 270 },
            minWidth: { lg: 270 },
            borderRight: { lg: `1px solid ${ui.border}` },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Stack spacing={2} sx={{ px: 2, pt: 2, pb: 1.5, borderBottom: `1px solid ${ui.border}` }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <TextField
                size="small"
                placeholder="Search category..."
                value={categorySearch}
                onChange={(event) => setCategorySearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, ...warehouseFieldSx }}
              />
            </Stack>
          </Stack>

          {bootstrapping ? <LinearProgress /> : null}

          <Stack spacing={1.25} sx={{ p: 1.5, overflowY: "auto", flex: 1 }}>
            {filteredCategories.map((category) => {
              const selected = category.id === uploadCategoryId || category.id === viewCategoryId;

              return (
                <Paper
                  key={category.id}
                  variant="outlined"
                  onClick={() => {
                    setUploadCategoryId(category.id);
                    setViewCategoryId(category.id);
                    setReferenceSearch("");
                  }}
                  sx={{
                    p: 1.75,
                    borderRadius: 2.5,
                    cursor: "pointer",
                    borderColor: selected ? "rgba(255,138,61,0.36)" : "rgba(15,23,42,0.06)",
                    borderLeftWidth: 3,
                    borderLeftStyle: "solid",
                    borderLeftColor: selected ? warehouseAccent : "transparent",
                    bgcolor: selected ? ui.selectedWarm : ui.panel,
                    boxShadow: selected ? ui.shadowWarm : ui.shadowSoft,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 800, color: ui.textSoft }} noWrap>
                    {category.label}
                  </Typography>
                  {category.childLabel ? (
                    <Typography variant="body2" sx={{ mt: 0.5, color: ui.textMuted }} noWrap>
                      {category.childLabel}
                    </Typography>
                  ) : null}
                </Paper>
              );
            })}

            {!bootstrapping && !filteredCategories.length ? (
              <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 3, textAlign: "center", color: ui.textMuted }}>
                No category data available.
              </Paper>
            ) : null}
          </Stack>
        </Box>

        <Box
          sx={{
            width: { xs: "100%", lg: 290 },
            minWidth: { lg: 290 },
            borderRight: { lg: `1px solid ${ui.border}` },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 1.25, py: 1.25, overflowY: "auto", flex: 1 }}>

             <TextField
              fullWidth
              size="small"
              placeholder={isUploadWorkspace ? "Reference for upload..." : "Search reference..."}
              value={isUploadWorkspace ? uploadReferenceNo : referenceSearch}
              onChange={(event) =>
                isUploadWorkspace
                  ? setUploadReferenceNo(event.target.value)
                  : setReferenceSearch(event.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" sx={{ color: "#94A3B8" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5, ...warehouseFieldSx }}
            />


            {isUploadWorkspace ? (
              <Stack spacing={1.5}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    borderColor: "rgba(255,138,61,0.2)",
                    bgcolor: ui.workspace,
                    p: 1.75,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        display: "grid",
                        placeItems: "center",
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: "rgba(255,138,61,0.12)",
                        color: warehouseAccentDark,
                      }}
                    >
                      <UploadFileRoundedIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: ui.textSoft }}>
                        Collector workspace
                      </Typography>
                      <Typography variant="body2" sx={{ color: ui.textMuted }}>
                        Prepare category, reference and upload batch.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {uploadPreviews.map((preview, index) => (
                  <Paper
                    key={preview.id}
                    variant="outlined"
                    sx={{
                      overflow: "hidden",
                      borderRadius: 2.5,
                      borderColor: ui.border,
                    }}
                  >
                    <Box
                      sx={{
                        height: 126,
                        display: "grid",
                        placeItems: "center",
                        color: ui.textMuted,
                        bgcolor:
                          preview.isImage && preview.previewUrl
                            ? undefined
                            : alpha(theme.palette.text.primary, isDark ? 0.08 : 0.04),
                        backgroundImage:
                          preview.isImage && preview.previewUrl ? `url(${preview.previewUrl})` : "none",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                    >
                      {!preview.isImage ? mediaIconMap[pickPreviewKind(uploadFiles[index])] : null}
                    </Box>
                    <Stack spacing={0.5} sx={{ p: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                        {preview.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: ui.textMuted }}>
                        {preview.sizeLabel} | {preview.mimeType || "Unknown type"}
                      </Typography>
                      <Button
                        size="small"
                        color="inherit"
                        sx={{ alignSelf: "flex-start", px: 0, minWidth: 0 }}
                        disabled={!canCreateEvidence}
                        onClick={() =>
                          setUploadFiles((currentFiles) =>
                            currentFiles.filter((_, fileIndex) => fileIndex !== index),
                          )
                        }
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Paper>
                ))}

                {!uploadPreviews.length ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      p: 3,
                      textAlign: "center",
                      color: ui.textMuted,
                      borderStyle: "dashed",
                      borderColor: "rgba(255,138,61,0.25)",
                    }}
                  >
                    Queue is empty. Add files from the workspace panel.
                  </Paper>
                ) : null}
              </Stack>
            ) : (
              <Stack spacing={1}>
                {referencesLoading ? <LinearProgress /> : null}

                {referenceOptions.map((reference) => {
                  const isSelected = selectedReferenceNo === reference.refNo;

                  return (
                    <Paper
                      key={reference.id}
                      variant="outlined"
                      onClick={() => void handleReferenceSelect(reference.refNo)}
                      sx={{
                        p: 1.75,
                        borderRadius: 2.5,
                        cursor: "pointer",
                        borderColor: isSelected
                          ? "rgba(255,138,61,0.3)"
                          : ui.border,
                        bgcolor: isSelected ? ui.selectedWarm : ui.panel,
                        boxShadow: isSelected ? ui.shadowWarm : ui.shadowSoft,
                      }}
                    >
                      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 800, color: ui.textStrong }}
                            noWrap
                          >
                            {reference.refNo}
                          </Typography>
                          <Typography variant="caption" sx={{ color: ui.textMuted }} noWrap>
                            {isSelected
                              ? childReferenceLoadingFor === reference.refNo
                                ? "Loading linked child references..."
                                : viewCategory?.childLabel
                                  ? `${viewCategory.childLabel} can be selected in workspace`
                                  : "Open evidence in workspace"
                              : "Tap to inspect evidence"}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={isSelected ? "Open" : "View"}
                          sx={{
                            bgcolor: isSelected ? ui.selectedWarm : ui.panelAlt,
                            color: isSelected ? warehouseAccentDark : ui.textMuted,
                            fontWeight: 700,
                          }}
                        />
                      </Stack>
                    </Paper>
                  );
                })}

                {!referencesLoading && !referenceOptions.length ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      p: 3,
                      textAlign: "center",
                      color: ui.textMuted,
                    }}
                  >
                    No matching reference numbers found.
                  </Paper>
                ) : null}
              </Stack>
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ px: { xs: 2, lg: 2.5 }, pt: 2.5, pb: 1.5, borderBottom: `1px solid ${ui.border}` }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "flex-start" }}
              spacing={2}
            >
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Typography variant="body2" sx={{ color: ui.textMuted }}>
                    Evidence Collection
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                    {">"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: ui.textMuted }}>
                    {formatCategoryInlineLabel(viewCategory) || "Category"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                    {">"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: ui.textSoft, fontWeight: 800 }}>
                    {selectedReferenceNo || (isUploadWorkspace ? "Collector workspace" : activeWorkspaceTitle)}
                  </Typography>
                </Stack>

                <Typography variant="h4" sx={{ mt: 1, fontWeight: 800, color: warehouseSlate }}>
                  {isUploadWorkspace
                    ? activeWorkspaceTitle
                    : selectedReferenceOption?.label || activeWorkspaceTitle}
                </Typography>

                 
              </Box>

              {/* <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {workspaceTabs.map((tab) => (
                  <Button
                    key={tab.value}
                    variant={workspaceMode === tab.value ? "contained" : "outlined"}
                    disabled={tab.value === "upload" && !viewerProfile.canUpload}
                    onClick={() => {
                      if (tab.value === "upload" && !viewerProfile.canUpload) {
                        return;
                      }
                      setWorkspaceMode(tab.value);
                    }}
                    sx={{
                      borderRadius: 999,
                      px: 2,
                      boxShadow: "none",
                      textTransform: "none",
                      ...(workspaceMode === tab.value
                        ? { bgcolor: "#1E3A8A" }
                        : { borderColor: ui.border, color: ui.textMuted }),
                    }}
                  >
                    {tab.label}
                  </Button>
                ))}
              </Stack> */}
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, lg: 2.5 }, overflowY: "auto", flex: 1, bgcolor: ui.panelAlt }}>
            {isUploadWorkspace ? (
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, xl: 7 }}>
                  <Stack spacing={2.5}>
                    <Paper
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        borderColor: ui.border,
                        p: 2.5,
                        bgcolor: ui.panel,
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            select
                            fullWidth
                            label="Category"
                            value={uploadCategoryId}
                            onChange={(event) => setUploadCategoryId(event.target.value)}
                            SelectProps={{
                              renderValue: (selected) =>
                                formatCategoryInlineLabel(
                                  categories.find((category) => category.id === selected) ?? null,
                                ),
                            }}
                            sx={warehouseFieldSx}
                          >
                            {categories.map((category) => (
                              <MenuItem key={category.id} value={category.id}>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {category.label}
                                  </Typography>
                                  {category.childLabel ? (
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                      {category.childLabel}
                                    </Typography>
                                  ) : null}
                                </Box>
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Reference number"
                            placeholder="Ex. TRF-00045"
                            value={uploadReferenceNo}
                            onChange={(event) => setUploadReferenceNo(event.target.value)}
                            disabled={!canCreateEvidence}
                            sx={warehouseFieldSx}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Remarks"
                            placeholder="Upload note, shift remark, issue summary..."
                            value={uploadRemarks}
                            onChange={(event) => setUploadRemarks(event.target.value)}
                            disabled={!canCreateEvidence}
                            sx={warehouseFieldSx}
                          />
                        </Grid>
                      </Grid>
                    </Paper>

                    <Paper
                      variant="outlined"
                      onClick={openFilePicker}
                      sx={{
                        borderRadius: 3,
                        borderStyle: "dashed",
                        borderWidth: 2,
                        borderColor: "rgba(255,138,61,0.26)",
                        background: isDark
                          ? "linear-gradient(180deg, rgba(255,138,61,0.12) 0%, rgba(15,23,42,0.92) 100%)"
                          : "linear-gradient(180deg, rgba(255,138,61,0.06) 0%, rgba(255,255,255,1) 100%)",
                        p: 4,
                        cursor: canCreateEvidence ? "pointer" : "not-allowed",
                        opacity: canCreateEvidence ? 1 : 0.7,
                      }}
                    >
                      <Stack spacing={1.5} alignItems="center" textAlign="center">
                        <CloudUploadRoundedIcon className="!text-[42px]" sx={{ color: warehouseAccent }} />
                        <Typography variant="h5" fontWeight={800}>
                          Drop or choose evidence files
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Image, video, audio or PDF files can be attached in one evidence batch.
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<UploadFileRoundedIcon />}
                          disabled={!canCreateEvidence}
                          onClick={(event) => {
                            event.stopPropagation();
                            openFilePicker();
                          }}
                          sx={{
                            borderRadius: 999,
                            px: 2.5,
                            boxShadow: "none",
                            bgcolor: warehouseAccent,
                            "&:hover": { bgcolor: "#df6f22" },
                          }}
                        >
                          Choose files
                        </Button>
                        <input
                          hidden
                          multiple
                          ref={uploadInputRef}
                          type="file"
                          accept="image/*,video/*,audio/*,.pdf"
                          disabled={!canCreateEvidence}
                          onChange={handleFileSelection}
                        />
                      </Stack>
                    </Paper>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, xl: 5 }}>
                  <Stack spacing={2.5}>
                    <Paper
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        borderColor: ui.border,
                        p: 2,
                        bgcolor: ui.panel,
                      }}
                    >
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip label={`${uploadSummary.files} files`} />
                        <Chip label={uploadSummary.totalSize} />
                        <Chip label={formatCategoryInlineLabel(uploadCategory) || "No category"} />
                      </Stack>

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                          mt: 2,
                          borderRadius: 999,
                          boxShadow: "none",
                          bgcolor: warehouseAccent,
                          "&:hover": { bgcolor: "#df6f22" },
                        }}
                        startIcon={
                          isUploading ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <UploadFileRoundedIcon />
                          )
                        }
                        disabled={
                          isUploading ||
                          !canCreateEvidence ||
                          !uploadCategory ||
                          !uploadReferenceNo.trim() ||
                          uploadFiles.length === 0
                        }
                        onClick={() => void handleUpload()}
                      >
                        {isUploading ? "Uploading..." : "Upload evidence"}
                      </Button>
                    </Paper>

                    <Grid container spacing={2}>
                      {uploadPreviews.map((preview, index) => (
                        <Grid key={preview.id} size={{ xs: 12, sm: 6 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              overflow: "hidden",
                              borderRadius: 3,
                              borderColor: ui.border,
                              bgcolor: ui.panel,
                            }}
                          >
                            <Box
                              sx={{
                                height: 164,
                                display: "grid",
                                placeItems: "center",
                                color: ui.textMuted,
                                bgcolor:
                                  preview.isImage && preview.previewUrl
                                    ? undefined
                                    : alpha(theme.palette.text.primary, isDark ? 0.08 : 0.04),
                                backgroundImage:
                                  preview.isImage && preview.previewUrl ? `url(${preview.previewUrl})` : "none",
                                backgroundPosition: "center",
                                backgroundSize: "cover",
                              }}
                            >
                              {!preview.isImage ? mediaIconMap[pickPreviewKind(uploadFiles[index])] : null}
                            </Box>
                            <Stack spacing={0.75} sx={{ p: 1.5 }}>
                              <Typography variant="body2" fontWeight={800} noWrap>
                                {preview.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {preview.sizeLabel} | {preview.mimeType || "Unknown type"}
                              </Typography>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}

                      {!uploadPreviews.length ? (
                        <Grid size={{ xs: 12 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              borderRadius: 3,
                              p: 4,
                              textAlign: "center",
                              color: ui.textMuted,
                              bgcolor: ui.panel,
                            }}
                          >
                            Selected files will appear here for quick review.
                          </Paper>
                        </Grid>
                      ) : null}
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>
            ) : (
              <Stack spacing={2.5}>
                {/* <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, xl: 7 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        overflow: "hidden",
                        borderRadius: 3,
                        borderColor: ui.border,
                        bgcolor: ui.panel,
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          minHeight: 380,
                          display: "flex",
                          alignItems: "flex-end",
                          background:
                            selectedHeroItem?.kind === "image" && selectedHeroItem.previewUrl
                              ? `center / cover no-repeat url(${selectedHeroItem.previewUrl})`
                              : ui.heroFallback,
                        }}
                      >
                        {selectedHeroItem?.kind && selectedHeroItem.kind !== "image" ? (
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              display: "grid",
                              placeItems: "center",
                              color: ui.textStrong,
                            }}
                          >
                            {mediaIconMap[selectedHeroItem.kind]}
                          </Box>
                        ) : null}
                        <Box
                          sx={{
                            width: "100%",
                            p: 2.25,
                            background: ui.heroOverlay,
                            color: "#fff",
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {selectedHeroItem?.title || "Pick a reference to load evidence"}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, color: "rgba(255,255,255,0.82)" }}>
                            {selectedHeroItem?.remark ||
                              selectedReferenceOption?.subtitle ||
                              "Media is fetched only on demand to keep the module responsive."}
                          </Typography>
                          {selectedHeroItem ? (
                            <Button
                              variant="contained"
                              startIcon={<VisibilityRoundedIcon />}
                              sx={{
                                mt: 1.5,
                                borderRadius: 999,
                                boxShadow: "none",
                                bgcolor: isDark ? alpha("#FFFFFF", 0.12) : "#FFFFFF",
                                color: isDark ? "#FFFFFF" : "#0F172A",
                                backdropFilter: isDark ? "blur(8px)" : undefined,
                                "&:hover": {
                                  bgcolor: isDark ? alpha("#FFFFFF", 0.18) : "#FFFFFF",
                                },
                              }}
                              onClick={() => setSelectedMediaItem(selectedHeroItem)}
                            >
                              Open preview
                            </Button>
                          ) : null}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, xl: 5 }}>
                    <Stack spacing={2}>
                      {metricsCards.map((metric) => (
                        <EvidenceTrendCard
                          key={metric.title}
                          title={metric.title}
                          value={metric.value}
                          subtitle={metric.subtitle}
                          series={metric.series}
                        />
                      ))}

                      <Paper
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          borderColor: ui.border,
                          bgcolor: ui.panel,
                          p: 2,
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              display: "grid",
                              placeItems: "center",
                              width: 46,
                              height: 46,
                              borderRadius: 2,
                              bgcolor: transactionStatus.valid ? ui.verified : ui.invalid,
                              color: transactionStatus.valid ? "#059669" : "#DC2626",
                            }}
                          >
                            {transactionStatus.valid ? <VerifiedRoundedIcon /> : <LockOpenRoundedIcon />}
                          </Box>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 800 }}>
                              {transactionStatus.valid ? "Transaction verified" : "Awaiting validation"}
                            </Typography>
                            <Typography variant="body2" sx={{ color: ui.textMuted }}>
                              {transactionStatus.message || "Select a reference to validate evidence mapping."}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Stack>
                  </Grid>
                </Grid> */}

                <Box
                  
                >
                  {/* <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      borderBottom: `1px solid ${ui.border}`,
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 800, color: ui.textStrong }}>
                        Alerts & Evidence Feed
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip
                          label={`${mediaItems.length} loaded`}
                          sx={{ bgcolor: ui.chipDanger, color: "#BE123C", fontWeight: 800 }}
                        />
                        <TextField
                          select
                          size="small"
                          label="Remarks"
                          value={selectedRemark}
                          onChange={(event) => setSelectedRemark(event.target.value)}
                          disabled={!selectedReferenceNo}
                          sx={{ minWidth: 220 }}
                        >
                          {remarkOptions.map((remark) => (
                            <MenuItem key={remark.id} value={remark.value}>
                              {remark.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                    </Stack>
                  </Box> */}

                  <Stack spacing={2}>
                    {selectedReferenceNo ? (
                      <>
                        {viewCategory?.childLabel ? (
                          <Paper
                            variant="outlined"
                            sx={{
                              borderRadius: 3,
                              borderColor: ui.border,
                              bgcolor: ui.panel,
                              p: 2.25,
                            }}
                          >
                            <Stack spacing={2}>
                              <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={1.5}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", md: "center" }}
                              >
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 800, color: ui.textStrong }}>
                                    {viewCategory.childLabel}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: ui.textMuted }}>
                                    Select linked child reference for main reference {selectedReferenceNo}.
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`${selectedChildReferences.length} linked`}
                                  sx={{
                                    bgcolor: ui.panelAlt,
                                    color: ui.textMuted,
                                    fontWeight: 700,
                                  }}
                                />
                              </Stack>

                              <TextField
                                fullWidth
                                size="small"
                                placeholder={`Search ${viewCategory.childLabel.toLowerCase()}...`}
                                value={childReferenceSearch}
                                onChange={(event) => setChildReferenceSearch(event.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <SearchRoundedIcon fontSize="small" sx={{ color: "#94A3B8" }} />
                                    </InputAdornment>
                                  ),
                                }}
                                disabled={
                                  childReferenceLoadingFor === selectedReferenceNo ||
                                  !selectedChildReferences.length
                                }
                                sx={warehouseFieldSx}
                              />

                              {childReferenceLoadingFor === selectedReferenceNo ? (
                                <Stack spacing={1}>
                                  <LinearProgress />
                                  <Typography variant="caption" sx={{ color: ui.textMuted }}>
                                    Loading child references for {selectedReferenceNo}...
                                  </Typography>
                                </Stack>
                              ) : filteredChildReferences.length ? (
                                <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 0.5 }}>
                                  <Grid container spacing={1.25}>
                                    {filteredChildReferences.map((childReference) => {
                                      const isSelectedChild =
                                        selectedChildReferenceNo === childReference.refNo;

                                      return (
                                        <Grid key={childReference.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                                          <Paper
                                            variant="outlined"
                                            onClick={() =>
                                              void handleChildReferenceSelect(
                                                selectedReferenceNo,
                                                childReference.refNo,
                                              )
                                            }
                                            sx={{
                                              p: 1.5,
                                              borderRadius: 2.5,
                                              cursor: "pointer",
                                              borderColor: isSelectedChild
                                                ? "rgba(255,138,61,0.32)"
                                                : ui.border,
                                              bgcolor: isSelectedChild ? ui.selectedWarm : ui.panelAlt,
                                              boxShadow: isSelectedChild
                                                ? ui.shadowWarm
                                                : "none",
                                            }}
                                          >
                                            <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                                              {childReference.refNo}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: ui.textMuted }} noWrap>
                                              {isSelectedChild
                                                ? "Selected child reference"
                                                : "Click to load phases and media"}
                                            </Typography>
                                          </Paper>
                                        </Grid>
                                      );
                                    })}
                                  </Grid>
                                </Box>
                              ) : (
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2.5,
                                    p: 3,
                                    textAlign: "center",
                                    color: ui.textMuted,
                                    bgcolor: ui.panelAlt,
                                  }}
                                >
                                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                                    No linked {viewCategory.childLabel.toLowerCase()} found
                                  </Typography>
                                  <Typography variant="body2">
                                    Media will continue using reference {selectedReferenceNo} directly.
                                  </Typography>
                                </Paper>
                              )}
                            </Stack>
                          </Paper>
                        ) : null}

                        <Paper
                          variant="outlined"
                          sx={{
                            borderRadius: 3,
                            borderColor: ui.border,
                            bgcolor: ui.panel,
                            p: 2.25,
                          }}
                        >
                          <Stack spacing={1.75}>
                            {selectedChildReferenceNo ? (
                              <Stack spacing={1.5}>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 800, color: ui.textStrong }}>
                                    Phases
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: ui.textMuted }}>
                                    Phase-wise evidence for child reference {selectedChildReferenceNo}.
                                  </Typography>
                                </Box>

                                {childPhaseLoadingFor === selectedChildReferenceNo ? (
                                  <LinearProgress />
                                ) : selectedChildPhases.length ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      width: "100%",
                                      borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                                      overflowX: "auto",
                                    }}
                                  >
                                    {selectedChildPhases.map((phase) => (
                                      <Button
                                        key={phase.id}
                                        variant={selectedPhaseId === phase.phaseId ? "contained" : "outlined"}
                                        onClick={() => setSelectedPhaseId(phase.phaseId)}
                                        sx={{
                                          flex: 1,
                                          minWidth: 140,
                                          borderRadius: 0,
                                          textTransform: "none",
                                          boxShadow: "none",
                                          border: "none",
                                          borderBottom: "3px solid",
                                          borderBottomColor:
                                            selectedPhaseId === phase.phaseId
                                              ? warehouseAccentDark
                                              : "transparent",
                                          py: 1.25,
                                          ...(selectedPhaseId === phase.phaseId
                                            ? {
                                                bgcolor: "transparent",
                                                color: warehouseAccentDark,
                                              }
                                            : {
                                                color: ui.textMuted,
                                                backgroundColor: "transparent",
                                              }),
                                          "&:hover": {
                                            backgroundColor: alpha(warehouseAccent, 0.06),
                                            borderBottomColor:
                                              selectedPhaseId === phase.phaseId
                                                ? warehouseAccentDark
                                                : alpha(warehouseAccentDark, 0.24),
                                          },
                                        }}
                                      >
                                        {phase.phaseName}
                                      </Button>
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography variant="body2" sx={{ color: ui.textMuted }}>
                                    No phase data returned for this child reference. Media is shown without phase filter.
                                  </Typography>
                                )}
                              </Stack>
                            ) : null}

                            <Stack
                              direction={{ xs: "column", lg: "row" }}
                              spacing={1.5}
                              justifyContent="space-between"
                              alignItems={{ xs: "stretch", lg: "center" }}
                              sx={
                                selectedChildReferenceNo
                                  ? {
                                      pt: 0.5,
                                    }
                                  : undefined
                              }
                            >
                              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {mediaTabs.map((tab) => (
                                  <Button
                                    key={tab.value}
                                    variant={activeMediaTab === tab.value ? "contained" : "outlined"}
                                    startIcon={tab.icon}
                                    disabled={!selectedReferenceNo}
                                    onClick={() => setActiveMediaTab(tab.value)}
                                    sx={{
                                      borderRadius: 999,
                                      textTransform: "none",
                                      boxShadow: "none",
                                      ...(activeMediaTab === tab.value
                                        ? { bgcolor: warehouseSlate }
                                        : {
                                            borderColor: "rgba(255,138,61,0.24)",
                                            color: ui.textMuted,
                                            backgroundColor: "rgba(255,138,61,0.05)",
                                          }),
                                    }}
                                  >
                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                      <Box component="span">{tab.label}</Box>
                                      <Box
                                        component="span"
                                        sx={{
                                          minWidth: 24,
                                          px: 0.9,
                                          py: 0.15,
                                          borderRadius: 999,
                                          fontSize: "0.72rem",
                                          fontWeight: 700,
                                          lineHeight: 1.6,
                                          textAlign: "center",
                                          bgcolor:
                                            activeMediaTab === tab.value
                                              ? "rgba(255,255,255,0.18)"
                                              : "rgba(255,138,61,0.12)",
                                          color:
                                            activeMediaTab === tab.value
                                              ? "#FFFFFF"
                                              : warehouseSlate,
                                        }}
                                      >
                                        {mediaCounts[tab.value]}
                                      </Box>
                                    </Stack>
                                  </Button>
                                ))}
                              </Stack>

                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1}
                                alignItems={{ xs: "stretch", sm: "center" }}
                                sx={{ width: { xs: "100%", lg: "auto" } }}
                              >
                                <Button
                                  variant="outlined"
                                  startIcon={<DownloadRoundedIcon />}
                                  onClick={() => void handleDownloadAll()}
                                  disabled={
                                    !canDownloadEvidence ||
                                    !selectedReferenceNo ||
                                    !mediaItems.length ||
                                    isDownloadingAll
                                  }
                                  sx={{
                                    borderRadius: 999,
                                    textTransform: "none",
                                    boxShadow: "none",
                                    minWidth: { xs: "100%", sm: "fit-content" },
                                  }}
                                >
                                  {isDownloadingAll ? "Downloading..." : "Download all"}
                                </Button>
                                <TextField
                                  select
                                  size="small"
                                  label="Remarks"
                                  value={selectedRemark}
                                  onChange={(event) => setSelectedRemark(event.target.value)}
                                  disabled={!selectedReferenceNo}
                                  sx={{
                                    minWidth: { xs: "100%", sm: 220 },
                                    width: { xs: "100%", lg: "auto" },
                                    ...warehouseFieldSx,
                                  }}
                                >
                                  {remarkOptions.map((remark) => (
                                    <MenuItem key={remark.id} value={remark.value}>
                                      {remark.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Stack>
                            </Stack>

                            {mediaLoading ? <LinearProgress /> : null}

                            <Grid container spacing={2}>
                              {mediaItems.map((item) => (
                                <Grid key={item.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      height: "100%",
                                      overflow: "hidden",
                                      borderRadius: 3,
                                      borderColor: ui.border,
                                    }}
                                  >
                                    <Box
                                      role={item.kind === "image" ? "button" : undefined}
                                      tabIndex={item.kind === "image" ? 0 : undefined}
                                      onClick={
                                        item.kind === "image"
                                          ? () => setSelectedMediaItem(item)
                                          : undefined
                                      }
                                      onKeyDown={
                                        item.kind === "image"
                                          ? (event) => {
                                              if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                setSelectedMediaItem(item);
                                              }
                                            }
                                          : undefined
                                      }
                                      sx={{
                                        height: 220,
                                        display: "grid",
                                        placeItems: "center",
                                        color: "#FFFFFF",
                                        cursor: item.kind === "image" ? "pointer" : "default",
                                        background:
                                          item.kind === "image" && item.previewUrl
                                            ? `center / cover no-repeat url(${item.previewUrl})`
                                            : ui.mediaFallback,
                                        "&:focus-visible": item.kind === "image"
                                          ? {
                                              outline: `3px solid ${alpha(warehouseAccent, 0.42)}`,
                                              outlineOffset: -3,
                                            }
                                          : undefined,
                                      }}
                                    >
                                      {item.kind !== "image" ? mediaIconMap[item.kind] : null}
                                    </Box>
                                    <Stack spacing={0.85} sx={{ p: 1.75 }}>
                                      <Typography variant="body2" fontWeight={800} noWrap>
                                        {item.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" noWrap>
                                        {item.remark || "No remark supplied"}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatMediaDate(item.createdAt)}
                                      </Typography>
                                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        <Button
                                          variant="outlined"
                                          startIcon={<VisibilityRoundedIcon />}
                                          sx={{
                                            alignSelf: "flex-start",
                                            borderRadius: 999,
                                            color: warehouseAccentDark,
                                            borderColor: "rgba(255,138,61,0.24)",
                                            "&:hover": {
                                              borderColor: "rgba(255,138,61,0.36)",
                                              bgcolor: "rgba(255,138,61,0.06)",
                                            },
                                          }}
                                          onClick={() => setSelectedMediaItem(item)}
                                        >
                                          Open
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          startIcon={<DownloadRoundedIcon />}
                                          sx={{
                                            alignSelf: "flex-start",
                                            borderRadius: 999,
                                            color: ui.textStrong,
                                            borderColor: ui.border,
                                            "&:hover": {
                                              borderColor: alpha(theme.palette.text.primary, 0.18),
                                              bgcolor: alpha(theme.palette.text.primary, 0.03),
                                            },
                                          }}
                                          onClick={() => void handleDownloadItem(item)}
                                          disabled={!canDownloadEvidence}
                                        >
                                          Download
                                        </Button>
                                      </Stack>
                                    </Stack>
                                  </Paper>
                                </Grid>
                              ))}

                              {!mediaLoading && !mediaItems.length ? (
                                <Grid size={{ xs: 12 }}>
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      borderRadius: 3,
                                      p: 5,
                                      textAlign: "center",
                                      color: ui.textMuted,
                                    }}
                                  >
                                    <CollectionsRoundedIcon className="mb-1 !text-[42px]" />
                                    <Typography variant="h6" fontWeight={800}>
                                      No {activeMediaTab}s found
                                    </Typography>
                                    <Typography variant="body2">
                                      No media was returned for this selection, or the API response did not contain a usable file path.
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ) : null}
                            </Grid>
                          </Stack>
                        </Paper>
                      </>
                    ) : (
                      <Paper
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          p: 5,
                          textAlign: "center",
                          color: ui.textMuted,
                        }}
                      >
                        <FolderOpenRoundedIcon className="mb-1 !text-[40px]" />
                        <Typography variant="h6" fontWeight={800}>
                          Pick a reference to load evidence
                        </Typography>
                        <Typography variant="body2">
                          Search and select a reference from the middle panel to populate the dashboard.
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Card>

      <Drawer
        anchor="left"
        open={categoryDrawerOpen}
        onClose={() => {
          if (isCreatingCategory) {
            return;
          }
          setCategoryDrawerOpen(false);
        }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            p: 3,
            bgcolor: ui.panel,
          },
        }}
      >
        <Stack spacing={3} sx={{ height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: warehouseSlate }}>
                Add Category
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, color: ui.textMuted }}>
                Create a new evidence category in the same warehouse-style workspace.
              </Typography>
            </Box>
            <IconButton
              onClick={() => setCategoryDrawerOpen(false)}
              disabled={isCreatingCategory}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: ui.border,
              p: 2,
              bgcolor: ui.panelAlt,
            }}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Category name"
                placeholder="Ex. Dispatch Evidence"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                disabled={isCreatingCategory || !canCreateEvidence}
                sx={warehouseFieldSx}
              />
              <TextField
                fullWidth
                label="Company"
                value={viewerProfile.company || "Not available"}
                disabled
                sx={warehouseFieldSx}
              />
            </Stack>
          </Paper>

          <Box sx={{ mt: "auto" }}>
            <Stack direction="row" spacing={1.25} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => setCategoryDrawerOpen(false)}
                disabled={isCreatingCategory}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => void handleCreateCategory()}
                disabled={isCreatingCategory || !canCreateEvidence || !newCategoryName.trim()}
                startIcon={isCreatingCategory ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: "none",
                  bgcolor: warehouseAccent,
                  "&:hover": { bgcolor: "#df6f22" },
                }}
              >
                {isCreatingCategory ? "Creating..." : "Create category"}
              </Button>
            </Stack>
          </Box>
        </Stack>
        </Drawer>

        <PreviewDialog
          item={selectedMediaItem}
          items={mediaItems}
          open={Boolean(selectedMediaItem)}
          canDownload={canDownloadEvidence}
          onClose={() => setSelectedMediaItem(null)}
          onDownload={() => {
            if (selectedMediaItem) {
              void handleDownloadItem(selectedMediaItem);
            }
          }}
          onPrevious={() => {
            if (selectedMediaIndex > 0) {
              setSelectedMediaItem(mediaItems[selectedMediaIndex - 1]);
            }
          }}
          onNext={() => {
            if (selectedMediaIndex >= 0 && selectedMediaIndex < mediaItems.length - 1) {
              setSelectedMediaItem(mediaItems[selectedMediaIndex + 1]);
            }
          }}
        />
      </Box>
    </Page>
  );
};

export default EvidenceDashboard;
