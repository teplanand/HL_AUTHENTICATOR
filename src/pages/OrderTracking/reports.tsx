import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useToast } from "../../../shared/hooks/useToast";
import {
  useGetBranchWiseOrderAwaitingClearanceReportMutation,
  useGetBranchWiseOrderBookingReportMutation,
} from "./api/ordertracking";

const ORDER_TRACKING_BRANCH_OPTIONS = [
  "AB BENZLERS(SWEDEN)-GEAR",
  "BENZLERS - GMBH",
  "BENZLERS(NETHERLAND)-GEAR",
  "DUBAI - SOUTH AFRICA",
  "DUBAI-GEAR",
  "No Sales Credit",
  "RADICON(THAILAND)-GEAR",
  "RADICON(UK)-GEAR",
  "RADICON(USA)-GEAR",
  "SAARC",
  "SINGAPORE-GEAR",
] as const;

const SAMPLE_REPORTS = [
  {
    id: "branch-wise-order-booking",
    label: "Branch Wise Products",
  },
  {
    id: "branch-wise-order-awaiting-clearance",
    label: "Branch Wise Spares",
  },
] as const;

type SelectedBranchesState = Record<string, string>;
type ReportPreviewState = {
  open: boolean;
  title: string;
  url: string;
};

const OrderTrackingReportsPage = () => {
  const { showToast } = useToast();
  const [selectedBranches, setSelectedBranches] = useState<SelectedBranchesState>(() =>
    SAMPLE_REPORTS.reduce<SelectedBranchesState>((acc, report) => {
      acc[report.id] = "";
      return acc;
    }, {})
  );
  const [preview, setPreview] = useState<ReportPreviewState>({
    open: false,
    title: "",
    url: "",
  });
  const [getBranchWiseOrderBookingReport, bookingReportState] =
    useGetBranchWiseOrderBookingReportMutation();
  const [getBranchWiseOrderAwaitingClearanceReport, awaitingClearanceReportState] =
    useGetBranchWiseOrderAwaitingClearanceReportMutation();

  const loadingByReportId = useMemo(
    () => ({
      "branch-wise-order-booking": bookingReportState.isLoading,
      "branch-wise-order-awaiting-clearance": awaitingClearanceReportState.isLoading,
    }),
    [awaitingClearanceReportState.isLoading, bookingReportState.isLoading]
  );

  const handleBranchChange = useCallback(
    (reportId: string) => (event: SelectChangeEvent<string>) => {
      const { value } = event.target;
      setSelectedBranches((current) => ({
        ...current,
        [reportId]: value,
      }));
    },
    []
  );

  const closePreview = useCallback(() => {
    setPreview({
      open: false,
      title: "",
      url: "",
    });
  }, []);

  const openPreviewInNewTab = useCallback(() => {
    if (!preview.url) {
      return;
    }

    window.open(preview.url, "_blank", "noopener,noreferrer");
  }, [preview.url]);

  const handleExport = useCallback(
    async (reportId: string, reportLabel: string, branchName: string) => {
      const payload = {
        data: {
          branch_name: branchName,
        },
      };

      try {
        const response =
          reportId === "branch-wise-order-booking"
            ? await getBranchWiseOrderBookingReport(payload).unwrap()
            : await getBranchWiseOrderAwaitingClearanceReport(payload).unwrap();

        const previewUrl =
          typeof response?.data === "string" && response.data.trim()
            ? response.data.trim()
            : "";

        if (!previewUrl) {
          showToast(response?.Message || `${reportLabel} preview is not available.`, "warning");
          return;
        }

        setPreview({
          open: true,
          title: reportLabel,
          url: previewUrl,
        });
        showToast(response?.Message || `${reportLabel} preview is ready.`, "success");
      } catch (error) {
        console.error(`Failed to export ${reportLabel}`, error);
        showToast(`${reportLabel} preview could not be opened.`, "error");
      }
    },
    [
      getBranchWiseOrderAwaitingClearanceReport,
      getBranchWiseOrderBookingReport,
      showToast,
    ]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 16px 32px rgba(15, 23, 42, 0.05)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            {SAMPLE_REPORTS.map((report) => (
              <Box
                key={report.id}
                sx={{
                  display: "grid",
                  gap: 2,
                  alignItems: "center",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "minmax(260px, 1fr) minmax(240px, 320px) auto",
                  },
                  border: "1px solid rgba(226, 232, 240, 1)",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {report.label}
                </Typography>

                <FormControl size="small" fullWidth>
                  <InputLabel id={`${report.id}-branch-label`}>Branch</InputLabel>
                  <Select
                    labelId={`${report.id}-branch-label`}
                    value={selectedBranches[report.id] ?? ""}
                    label="Branch"
                    onChange={handleBranchChange(report.id)}
                  >
                    <MenuItem value="">All Branches</MenuItem>
                    {ORDER_TRACKING_BRANCH_OPTIONS.map((branch) => (
                      <MenuItem key={branch} value={branch}>
                        {branch}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<FileDownloadOutlinedIcon />}
                  onClick={() =>
                    handleExport(
                      report.id,
                      report.label,
                      selectedBranches[report.id] ?? ""
                    )
                  }
                  loading={loadingByReportId[report.id]}
                  sx={{
                    minWidth: 140,
                    whiteSpace: "nowrap",
                    height: 40,
                  }}
                >
                  Preview
                </Button>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={preview.open}
        onClose={closePreview}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            width: "calc(100vw - 24px)",
            maxWidth: "none",
            height: "92vh",
            m: 1.5,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            pr: 1,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {preview.title || "Report Preview"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              PDF report preview
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInNewIcon />}
              onClick={openPreviewInNewTab}
              disabled={!preview.url}
            >
              Open
            </Button>
            <IconButton onClick={closePreview} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: "#EEF2F6" }}>
          {preview.url ? (
            <Box
              component="iframe"
              title={preview.title || "Order Tracking Report Preview"}
              src={preview.url}
              sx={{
                width: "100%",
                height: { xs: "70vh", md: "78vh" },
                border: 0,
                bgcolor: "#fff",
              }}
            />
          ) : (
            <Box
              sx={{
                minHeight: 320,
                display: "grid",
                placeItems: "center",
                px: 3,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                Preview URL is not available.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrderTrackingReportsPage;
