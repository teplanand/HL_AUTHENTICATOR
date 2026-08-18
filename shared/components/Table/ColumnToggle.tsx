import { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  ViewColumn as ViewColumnIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

interface ColumnToggleProps {
  columns: any[];
  visibleColumns: any[];
  setVisibleColumns: React.Dispatch<React.SetStateAction<any[]>>;
}

const ColumnToggle = ({
  columns,
  visibleColumns,
  setVisibleColumns,
}: ColumnToggleProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleColumn = (accessor: string) => {
    setVisibleColumns((prev: any[]) => {
      if (prev.includes(accessor)) {
        return prev.filter((col: any) => col !== accessor);
      }
      const newVisible = [...prev];
      const originalIndex = columns.findIndex((c) => c.accessor === accessor);
      let insertIndex = 0;
      for (let i = 0; i < columns.length; i++) {
        if (i === originalIndex) break;
        if (newVisible.includes(columns[i].accessor)) insertIndex++;
      }

      newVisible.splice(insertIndex, 0, accessor);
      return newVisible;
    });
  };

  const toggleAllColumns = () => {
    if (visibleColumns.length === columns.length) {
      setVisibleColumns([]);
    } else {
      setVisibleColumns(columns.map((c) => c.accessor));
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ViewColumnIcon />}
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
        Columns ({visibleColumns.length}/{columns.length})
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            mt: 1,
            borderRadius: '4px',
            boxShadow: theme.shadows[8],
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight="600">
              Visible Columns
            </Typography>
            <IconButton
              size="small"
              onClick={toggleAllColumns}
              sx={{
                color: "primary.main",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.light, 0.125),
                },
              }}
            >
              {visibleColumns.length === columns.length ? (
                <DeselectIcon />
              ) : (
                <SelectAllIcon />
              )}
            </IconButton>
          </Box>
        </Box>

        <Divider />

        {/* Column List */}
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          {columns.map((column) => (
            <MenuItem
              key={column.accessor}
              onClick={() => toggleColumn(column.accessor)}
              dense
              sx={{
                py: 1,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Checkbox
                checked={visibleColumns.includes(column.accessor)}
                onChange={() => { }}
                size="small"
                sx={{
                  color: "primary.main",
                  "&.Mui-checked": {
                    color: "primary.main",
                  },
                }}
              />
              <ListItemText
                primary={column.title}
                primaryTypographyProps={{
                  variant: "body2",
                  noWrap: true,
                }}
              />
              {column.icon && (
                <ListItemIcon
                  sx={{ minWidth: "auto", ml: 1, color: "text.secondary" }}
                >
                  {column.icon}
                </ListItemIcon>
              )}
            </MenuItem>
          ))}
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 1.5, backgroundColor: "grey.50" }}>
          <Typography variant="caption" color="text.secondary">
            {visibleColumns.length} of {columns.length} selected
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default ColumnToggle;
