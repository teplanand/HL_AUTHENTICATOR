// components/common/ExportModal.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
  useTheme,
} from "@mui/material";
import {
  Close,
  PictureAsPdf,
  TableChart,
  Description,
  Storage,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  exportType: "excel" | "pdf" | null;
  tableTitle: string;
  recordsData: any[];
  columns: any[];
  visibleColumns: any[];
  fetchAllData?: () => Promise<any[]>;
}

const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onClose,
  exportType,
  tableTitle,
  recordsData,
  columns,
  visibleColumns,
  fetchAllData,
}) => {
  const theme = useTheme();

  const getNestedValue = (obj: any, accessor: string) => {
    return accessor
      .split(".")
      .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };

  const prepareExportData = (data: any[], exportAll: boolean) => {
    const displayedColumns = columns.filter(
      (col) => visibleColumns.includes(col.id) && col.id !== "actions"
    );

    const headers = displayedColumns.map((col) => col.label);
    const accessors = displayedColumns.map((col) => col.id);

    const exportData = data.map((record) =>
      accessors.map((accessor) => {
        let value = getNestedValue(record, accessor);

        // Date formatting
        if (accessor.toLowerCase().includes("date") && value) {
          return new Date(value).toISOString().split("T")[0];
        }

        // Boolean formatting
        if (accessor === "status") {
          return value === "active" ? "Active" : "Inactive";
        }

        return value !== undefined ? value : "";
      })
    );

    return { headers, data: exportData };
  };

  const handleExport = async (exportAll: boolean) => {
    if (!exportType) return;

    // Get either current page data or all data
    let dataToExport = [];

    if (exportAll && fetchAllData) {
      try {
        dataToExport = await fetchAllData();
      } catch (error) {
        console.error("Error fetching all data:", error);
        dataToExport = recordsData;
      }
    } else {
      dataToExport = recordsData;
    }

    const { headers, data } = prepareExportData(dataToExport, exportAll);

    if (exportType === "excel") {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(
        workbook,
        `${tableTitle}_${exportAll ? "all" : "page"}.xlsx`
      );
    } else if (exportType === "pdf") {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185);
      doc.setFont("helvetica", "bold");
      doc.text("Company Name", 14, 15);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text("123 Business Street, City, Country", 14, 22);
      doc.text("Phone: +1 234 567 890 | Email: info@company.com", 14, 29);

      // Title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(`${tableTitle} Report`, 14, 40);

      // Report Info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Report Type: ${exportAll ? "All Data" : "Filtered Data"}`,
        14,
        47
      );
      doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 54);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 61);

      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 65, doc.internal.pageSize.width - 14, 65);

      // Table
      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 70,
        margin: { left: 14, right: 14 },
        styles: {
          cellPadding: 3,
          fontSize: 9,
          valign: "middle",
          halign: "left",
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawPage: function (data) {
          // Footer with page numbers
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(
              `Page ${i} of ${pageCount}`,
              doc.internal.pageSize.width - 30,
              doc.internal.pageSize.height - 10
            );
          }
        },
      });

      doc.save(
        `${tableTitle}_${exportAll ? "all" : "filtered"}_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
    }

    onClose();
  };

  const ExportOption = ({
    title,
    description,
    icon,
    onClick,
    disabled = false,
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <Paper
      onClick={disabled ? undefined : onClick}
      elevation={1}
      sx={{
        p: 3,
        borderRadius: '4px',
        border: `1px solid ${theme.palette.divider}`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s ease",
        "&:hover": disabled
          ? {}
          : {
            borderColor: "#fff",
            backgroundColor: theme.palette.action.hover,
            transform: "translateY(-2px)",
          },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '4px',
            backgroundColor: "#fff",
            color: disabled
              ? theme.palette.grey[500]
              : theme.palette.primary.main,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '4px',
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {exportType === "pdf" ? (
            <PictureAsPdf color="error" />
          ) : (
            <TableChart color="success" />
          )}
          <Typography variant="h6" fontWeight={600}>
            Export {exportType?.toUpperCase()}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Select the data range you want to export:
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <ExportOption
            title="Current View"
            description="Export only the currently filtered and sorted data"
            icon={<Description />}
            onClick={() => handleExport(false)}
          />

          <ExportOption
            title="All Data"
            description="Export all records from the database"
            icon={<Storage />}
            onClick={() => handleExport(true)}
            disabled={!fetchAllData}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}
      >
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;
