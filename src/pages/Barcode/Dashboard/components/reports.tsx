import { memo, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Description as PdfIcon,
  TableChart as ExcelIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { FormStack, PageHeader } from "../../../../../shared/components/ui/form/stack";
import FormSection from "../../../../../shared/components/ui/form/FormSection";

const reportData: Record<string, string[]> = {
  "Order Booking": [
    "Branch Wise Order Booking",
    "Customer Wise Order Booking",
    "Consolidated",
    "Generate SerialNo Details",
    "SONO wise Generate SerialNo",
    "Date Wise Order Booking",
    "Branch Wise Order Awaiting Clearance",
    "Days Wise Total Order Pending",
    "Days Wise Total Order Pending - Export",
    "Days Wise Total Order Pending - Spare Export",
    "Customer Wise Order Awaiting Clearance",
    "Total Dispatch Awaiting Clearance",
    "SO Data Export to Excel",
    "Date Wise MI Status",
  ],
  "Shortages and Process": [
    "Customer Wise Shortages",
    "Order Under Packing",
    "Order Under Painting",
    "Final Inspection Report",
    "Manufacturing Plan Quantity",
    "Name Plate Printing Details",
  ],
  "Dispatch and Status": [
    "Work Order",
    "Vat 402 Detail Report",
    "Order Status History",
    "Date Wise Packing",
    "Data Wise Dispatched",
    "Delivery Id Wise Dispatched",
    "Transporter WayBill Details",
    "Free Replacement Against Customer Dispatched",
    "EMTICI Commission Against Dispatch",
    "Dispatch Plan Quantity",
  ],
  order_management: [
    "Total Order Under Hold",
    "Branch Customer Wise Pending Order",
    "Branch Pending Order",
    "Total Order Pending",
    "Cancelled Order",
    "Branch Wise Order Booking",
    "Customer Wise Order Booking",
    "Consolidated",
    "Generate SerialNo Details",
    "SONO wise Generate SerialNo",
    "Date Wise Order Booking",
    "Branch Wise Order Awaiting Clearance",
    "Days Wise Total Order Pending",
    "Days Wise Total Order Pending - Export",
    "Days Wise Total Order Pending - Spare Export",
    "Customer Wise Order Awaiting Clearance",
    "Total Dispatch Awaiting Clearance",
    "SO Data Export to Excel",
    "Date Wise MI Status",
  ],
  planning: [
    "Order Under Planning",
    "Order Under Loading",
    "Order Under Assembly",
    "Component Wise Shortages",
    "Client Delivery Wise Shortages",
    "Customer Wise Shortages",
    "Order Under Packing",
    "Order Under Painting",
    "Final Inspection Report",
    "Manufacturing Plan Quantity",
    "Name Plate Printing Details",
  ],
  shipping: [
    "Packing Label",
    "DateWise Packing Label",
    "Dispatched Intimation",
    "Qty Dispatched By Today",
    "Order Under Awaiting Clearance",
    "Work Order",
    "Vat 402 Detail Report",
    "Order Status History",
    "Date Wise Packing",
    "Data Wise Dispatched",
    "Delivery Id Wise Dispatched",
    "Transporter WayBill Details",
    "Free Replacement Against Customer Dispatched",
    "EMTICI Commission Against Dispatch",
    "Dispatch Plan Quantity",
  ],
  Overdue: [
    "Overdue Since 3 Days",
    "Overdue From 4 To 6 Days",
    "Overdue From 7 To 15 Days",
    "Overdue From 16 To 30 Days",
    "Overdue Beyond 30 Days",
  ],
  Inventory: [
    "Material Issue Slip",
    "On-Hand Quantity",
    "Part List Slip",
    "Component Part List Slip",
    "Invoice Report",
    "PackingList Cum Delivery Challan",
    "Bill Of Material",
    "FNS Stock Verification",
  ],
  Production: [
    "Daily Production Slip",
    "Component Tracking",
    "Gear Motor Produced",
    "Order Under Material Issue",
    "WIP Completion Error",
    "WIP Order Completion",
  ],
  "Getting Due": [
    "Getting Due Within Next 3 Days",
    "Getting Due Within Next 4 To 6 Days",
    "Getting Due Within Next 7 To 15 Days",
    "Getting Due Within Next 16 To 30 Days",
    "Getting Due Within Next 31 To 45 Days",
    "Getting Due Within Next 45 To 60 Days",
    "Getting Due Beyond Next 60 Days",
  ],
  "PBL Common": [
    "Order Booking Details",
    "Over/Less Issue Qty in Work Order",
    "WONO Over Completion",
  ],
  "Consumer Complaints": ["SerialNo Wise Order History"],
};

const ACCENT_COLORS = [
  "#f37440",
  "#1D4ED8",
  "#059669",
  "#D97706",
  "#7C3AED",
  "#0891B2",
  "#DC2626",
  "#4338CA",
  "#0D9488",
  "#CA8A04",
  "#9333EA",
  "#0284C7",
];

function Index() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleDownload = (reportName: string, format: "xls" | "pdf") => {
    console.log(`Downloading ${reportName} in ${format} format...`);
  };

  const filteredReportData = Object.entries(reportData).reduce(
    (acc, [category, reports]) => {
      const filteredReports = reports.filter((report) =>
        report.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredReports.length > 0) {
        acc[category] = filteredReports;
      }
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <Box>
      <Box className="flex justify-between items-center"  >
        <PageHeader title="Reports Directory" />

        <TextField
          size="small"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: { xs: "100%", sm: "300px" },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Stack spacing={1}>
        {Object.entries(filteredReportData).map(
          ([category, reports], index) => (
            <FormSection
              key={category}
              title={category}
              description={`${reports.length} report${reports.length !== 1 ? "s" : ""}`}
              accentColor={ACCENT_COLORS[index % ACCENT_COLORS.length]}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr",
                    lg: "1fr 1fr 1fr 1fr 1fr",
                  },
                  gap: 1,
                }}
              >
                {reports.map((report) => (
                  <Box
                    key={report}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        mb: 1,
                        minHeight: "2.4em",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {report}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        startIcon={
                          <ExcelIcon sx={{ fontSize: "1rem !important" }} />
                        }
                        onClick={() => handleDownload(report, "xls")}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.7rem",
                          bgcolor: "#1d6f42",
                          "&:hover": { bgcolor: "#155231" },
                          minWidth: 70,
                        }}
                      >
                        .xls
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        startIcon={
                          <PdfIcon sx={{ fontSize: "1rem !important" }} />
                        }
                        onClick={() => handleDownload(report, "pdf")}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.7rem",
                          bgcolor: "#d32f2f",
                          "&:hover": { bgcolor: "#b71c1c" },
                          minWidth: 70,
                        }}
                      >
                        .pdf
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </FormSection>
          )
        )}

        {Object.keys(filteredReportData).length === 0 && (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No reports found matching "{searchTerm}"
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export const Reports = memo(Index);
