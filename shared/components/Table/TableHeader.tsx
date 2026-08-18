import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  useTheme,
  useMediaQuery,
  Grid
} from "@mui/material";

import ActionButtons from "./ActionButtons";
import ExportModal from "./ExportModal";
import SearchInput from "./SearchInput";
import UtilityButtons from "./UtilityButtons";

interface TableHeaderProps {
  search: string | undefined;
  setSearch: (value: string | undefined) => void;
  TableTital: string;
  buttons?: Array<{ onClick: () => void; name: string; icon?: React.ReactNode }>;
  onRefresh?: () => void;
  enableColumnToggle?: boolean;
  enableDataDownload?: boolean;
  columns?: any[];
  visibleColumns?: any[];
  setVisibleColumns?: React.Dispatch<React.SetStateAction<any[]>>;
  fetchAllData: () => Promise<any[]>;
  tableTitle?: string;
  recordsData?: any[];
}

const TableHeader = ({
  search,
  setSearch,
  TableTital,
  buttons,
  onRefresh,
  enableColumnToggle = false,
  enableDataDownload = false,
  columns = [],
  visibleColumns = [],
  setVisibleColumns = () => { },
  fetchAllData,
  tableTitle = "Table Data",
  recordsData = [],
}: TableHeaderProps) => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf" | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const openExportModal = (type: "excel" | "pdf") => {
    setExportType(type);
    setExportModalOpen(true);
  };

  return (
    <Card sx={{ p: 3, mb: 4, borderRadius: '4px', bgcolor: "background.paper", boxShadow: 1 }}>
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => {
          setExportModalOpen(false);
          setExportType(null);
        }}
        exportType={exportType}
        fetchAllData={fetchAllData}
        tableTitle={tableTitle}
        recordsData={recordsData}
        columns={columns}
        visibleColumns={visibleColumns}
      />

      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        <Grid size={{ xs: 12, sm: "auto" }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", color: "text.primary", whiteSpace: "nowrap" }}
          >
            {TableTital}
          </Typography>
        </Grid>

        {/* Controls */}
        <Grid size={{ xs: 12, sm: "grow" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              justifyContent: "flex-end",
              alignItems: isMobile ? "stretch" : "center",
              flexWrap: "wrap",
            }}
          >
            <SearchInput search={search} setSearch={setSearch} />
            <ActionButtons buttons={buttons} />
            <UtilityButtons
              enableColumnToggle={enableColumnToggle}
              enableDataDownload={enableDataDownload}
              columns={columns}
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
              onRefresh={onRefresh}
              search={search}
              setSearch={setSearch}
              openExportModal={openExportModal}
            />
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};

export default TableHeader;
