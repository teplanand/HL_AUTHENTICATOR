import { Button, Box } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ColumnToggle from "./ColumnToggle";
import DownloadDropdown from "./DownloadDropdown";

interface UtilityButtonsProps {
  enableColumnToggle: boolean;
  enableDataDownload: boolean;
  columns?: any[];
  visibleColumns?: any[];
  setVisibleColumns?: React.Dispatch<React.SetStateAction<any[]>>;
  onRefresh?: () => void;
  search: string | undefined;
  setSearch: (value: string | undefined) => void;
  openExportModal: (type: "excel" | "pdf") => void;
}

const UtilityButtons = ({
  enableColumnToggle,
  enableDataDownload,
  columns = [],
  visibleColumns = [],
  setVisibleColumns = () => {},
  onRefresh,
  search,
  setSearch,
  openExportModal,
}: UtilityButtonsProps) => {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {enableColumnToggle && (
        <ColumnToggle
          columns={columns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
      )}

      {enableDataDownload && (
        <DownloadDropdown openExportModal={openExportModal} />
      )}

      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={() => {
          if (search) {
            setSearch("");
          } else if (onRefresh) {
            onRefresh();
          }
        }}
        sx={{
          minWidth: "auto",
          whiteSpace: "nowrap",
        }}
      >
        Refresh
      </Button>
    </Box>
  );
};

export default UtilityButtons;
