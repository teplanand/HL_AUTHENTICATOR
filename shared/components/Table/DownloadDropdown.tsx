import { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

interface DownloadDropdownProps {
  openExportModal: (type: "excel" | "pdf") => void;
}

const DownloadDropdown = ({ openExportModal }: DownloadDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportClick = (type: "excel" | "pdf") => {
    openExportModal(type);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        endIcon={
          <KeyboardArrowDownIcon
            sx={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        }
        onClick={handleClick}
        sx={{
          minWidth: "auto",
          whiteSpace: "nowrap",
          textTransform: "none",
          fontWeight: "normal",
          borderColor: "divider",
          color: "text.primary",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        Download
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 200,
            borderRadius: '4px',
            boxShadow: theme.shadows[8],
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => handleExportClick("excel")}
          sx={{
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.success.light, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ExcelIcon sx={{ color: "success.main", fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText primary="Export to Excel" />
        </MenuItem>

        <MenuItem
          onClick={() => handleExportClick("pdf")}
          sx={{
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.error.light, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PdfIcon sx={{ color: "error.main", fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText primary="Export to PDF" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default DownloadDropdown;
