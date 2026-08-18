import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Storage as StorageIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: 'excel' | 'pdf' | null;
  handleExport?: (exportAll: boolean) => Promise<void>;
  fetchAllData: () => Promise<any[]>;
  tableTitle: string;
  recordsData: any[];
  columns: any[];
  visibleColumns: any[];
}

const ExportModal = ({
  isOpen,
  onClose,
  exportType,
  fetchAllData,
  tableTitle,
  recordsData,
  columns,
  visibleColumns,
}: ExportModalProps) => {
  const exportModalRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getNestedValue = (obj: any, accessor: string) => {
    return accessor.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };

  const prepareExportData = (data: any[], exportAll: boolean) => {
    let displayedColumns = [];
    displayedColumns = columns.filter((col) => visibleColumns.includes(col.accessor) && col.accessor !== 'action');

    const headers = displayedColumns.map((col) => col.title);

    const exportData = data.map((record) =>
      displayedColumns.map((col) => {
        let value = getNestedValue(record, col.accessor);

        if (col.accessor.toLowerCase().includes('date') && value) {
          return new Date(value).toISOString().split('T')[0];
        }

        if (col.accessor === 'inActive') {
          return value === 1 ? 'True' : 'False';
        }

        return value !== undefined ? value : '';
      })
    );

    return { headers, data: exportData };
  };

  const handleExport = async (exportAll: boolean) => {
    if (!exportType) return;

    let dataToExport = [];

    if (exportAll) {
      dataToExport = await fetchAllData();
    } else {
      dataToExport = recordsData;
    }

    const { headers, data } = prepareExportData(dataToExport, exportAll);

    if (exportType === 'excel') {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, `${tableTitle}_${exportAll ? 'all' : 'page'}.xlsx`);
    } else if (exportType === 'pdf') {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185);
      doc.setFont('helvetica', 'bold');
      doc.text('Company Name', 14, 15);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('123 Business Street, City, Country', 14, 22);
      doc.text('Phone: +1 234 567 890 | Email: info@company.com', 14, 29);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`${tableTitle} Report`, 14, 40);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Type: ${exportAll ? 'All Data' : 'Filtered Data'}`, 14, 47);
      doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 54);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 61);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 65, doc.internal.pageSize.width - 14, 65);

      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 70,
        margin: { left: 14, right: 14 },
        styles: {
          cellPadding: 3,
          fontSize: 9,
          valign: 'middle',
          halign: 'left',
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'left',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawPage: function (data) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);

          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
          }

          if (data.pageNumber === 1) {
            doc.setFontSize(40);
            doc.setTextColor(230, 230, 230);
            doc.setFont('helvetica', 'normal');
          }
        },
      });

      doc.save(`${tableTitle}_${exportAll ? 'all' : 'filtered'}_${new Date().toISOString().slice(0, 10)}.pdf`);
    }

    onClose();
  };

  const ExportOptionCard = ({
    title,
    description,
    icon,
    onClick,
    disabled = false
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <Card
      onClick={disabled ? undefined : onClick}
      sx={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease-in-out',
        opacity: disabled ? 0.5 : 1,
        '&:hover': disabled ? {} : {
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light + '08',
          transform: 'translateY(-2px)',
        },
        mb: 2,
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: "#fff",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography
                variant="h6"
                component="h4"
                color={disabled ? 'text.disabled' : 'text.primary'}
                sx={{ fontWeight: 600 }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                color={disabled ? 'text.disabled' : 'text.secondary'}
                sx={{ mt: 0.5 }}
              >
                {description}
              </Typography>
            </Box>
          </Box>
          <ArrowForwardIcon
            sx={{
              color: disabled ? theme.palette.grey[400] : theme.palette.grey[500],
              fontSize: 20,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        ref: exportModalRef,
        sx: {
          borderRadius: '4px',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Export {exportType?.toUpperCase()}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Select the data range you want to export:
        </Typography>

        <Box>
          <ExportOptionCard
            title="Current View"
            description="Export only the currently filtered and sorted data"
            icon={<DescriptionIcon sx={{ fontSize: 24 }} />}
            onClick={() => handleExport(false)}
          />

          <ExportOptionCard
            title="All Data"
            description="Export all records from the database"
            icon={<StorageIcon sx={{ fontSize: 24 }} />}
            onClick={() => handleExport(true)}
            disabled={!fetchAllData}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;