// components/common/TableComponents.tsx
import React, { useMemo, useState } from "react";
import {
  TableHead as MuiTableHead,
  TableRow,
  TableCell,
  alpha,
  CircularProgress,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  TableSortLabel,
  Tooltip,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  Divider,
  Chip,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Add,
  Clear,
  PictureAsPdf,
  Search,
  TableChart,
  FilterList,
} from "@mui/icons-material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RotateLeftOutlinedIcon from "@mui/icons-material/RotateLeftOutlined";
import ViewWeekOutlinedIcon from "@mui/icons-material/ViewWeekOutlined";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { CheckCircleIcon, CheckLineIcon } from "../icons";

import CheckIcon from "@mui/icons-material/Check";
import { styled } from "@mui/system";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  padding: theme.spacing(2),
  color: theme.palette.primary.dark,
  fontSize: "0.9rem",
}));

interface HeadCell {
  id: string;
  label: string;
  align?: "left" | "right" | "center";
  width?: string;
  sortable?: boolean;
  filter?: {
    options: { label: string; value: any }[];
    value: any;
    onChange: (value: any) => void;
  };
}

interface TableHeadProps {
  columns: HeadCell[];
  orderBy: string;
  order: "asc" | "desc";
  onSort: (property: string) => void;
}

const TableHead: React.FC<TableHeadProps> = ({
  columns,
  orderBy,
  order,
  onSort,
}) => {
  const createSortHandler = (property: string) => () => {
    onSort(property);
  };

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(
    null
  );

  const handleFilterClick = (
    event: React.MouseEvent<HTMLElement>,
    columnId: string
  ) => {
    event.stopPropagation();
    setFilterAnchorEl(event.currentTarget);
    setActiveFilterColumn(columnId);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setActiveFilterColumn(null);
  };

  const handleFilterSelect = (column: HeadCell, value: any) => {
    if (column.filter) {
      column.filter.onChange(value);
    }
    handleFilterClose();
  };

  // Helper function to check if filter is active (NOT "All")
  const isFilterActive = (filterValue: any): boolean => {
    // Only highlight if value is true or false (Active/DeActive)
    // "All" = null should NOT highlight
    return filterValue === true || filterValue === false;
  };

  // Get current filter label for tooltip
  const getFilterLabel = (filterValue: any, options: any[]): string => {
    if (filterValue === true) return "Active";
    if (filterValue === false) return "DeActive";
    return "All";
  };

  return (
    <MuiTableHead>
      <StyledTableRow>
        {columns.map((col) => (
          <StyledTableCell
            key={col.id}
            align={col.align || "left"}
            sx={{
              width: col.width,
              color: "#101010 !important",
              fontWeight: "bold",
              fontSize: "14px !important",
              background: "#d2e0efff !important",
              borderBottom: "1px solid #e2e8f0 !important",
              cursor: col.sortable ? "pointer" : "default",
            }}
            onClick={col.sortable ? createSortHandler(col.id) : undefined}
          >
            {/* Outer box: alignment ke liye */}
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  col.align === "right"
                    ? "flex-end"
                    : col.align === "center"
                      ? "center"
                      : "flex-start",
              }}
            >
              {/* Inner box: label + sort + filter */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  "&:hover": col.sortable
                    ? {
                      color: "#1976d2",
                    }
                    : {},
                }}
              >
                <span>{col.label}</span>

                {col.sortable && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", ml: 0.2 }}
                  >
                    <KeyboardArrowUpIcon
                      sx={{
                        fontSize: 12,
                        color:
                          orderBy === col.id && order === "asc"
                            ? "#101010"
                            : "#cccccc",
                      }}
                    />
                    <KeyboardArrowDownIcon
                      sx={{
                        fontSize: 12,
                        color:
                          orderBy === col.id && order === "desc"
                            ? "#101010"
                            : "#cccccc",
                      }}
                    />
                  </Box>
                )}

                {col.filter && (
                  <Tooltip
                    title={`Filter: ${getFilterLabel(
                      col.filter.value,
                      col.filter.options
                    )}`}
                    arrow
                    placement="top"
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        ml: 0.2,
                        position: "relative",
                        cursor: "pointer",
                      }}
                      onClick={(e) => handleFilterClick(e, col.id)}
                    >
                      <FilterList
                        sx={{
                          fontSize: 16,
                          color: isFilterActive(col.filter.value)
                            ? "primary.main" // Blue for Active/DeActive
                            : "action.active", // Grey for All (null)
                          transition: "color 0.2s ease",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      />

                      {/* Dot indicator only for Active/DeActive */}
                      {isFilterActive(col.filter.value) && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: -2,
                            right: -2,
                            width: 6,
                            height: 6,
                            backgroundColor:
                              col.filter.value === true
                                ? "success.main" // Green dot for Active
                                : "error.main", // Red dot for DeActive
                            borderRadius: "50%",
                            border: "1px solid white",
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </StyledTableCell>
        ))}
      </StyledTableRow>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            minWidth: 120,
            borderRadius: '4px',
            boxShadow: 3,
            mt: 1,
          },
        }}
      >
        {columns
          .find((col) => col.id === activeFilterColumn)
          ?.filter?.options.map((option) => {
            const currentColumn = columns.find(
              (col) => col.id === activeFilterColumn
            );
            const currentValue = currentColumn?.filter?.value;
            const isSelected = currentValue === option.value;

            return (
              <MenuItem
                key={option.label}
                onClick={() => handleFilterSelect(currentColumn!, option.value)}
                selected={isSelected}
                sx={{
                  bgcolor: isSelected ? "primary.50" : "transparent",
                  color: isSelected ? "primary.main" : "text.primary",
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: "0.875rem",
                  py: 1,
                  "&:hover": {
                    bgcolor: "primary.100",
                  },
                  "&.Mui-selected": {
                    bgcolor: "primary.50",
                    "&:hover": {
                      bgcolor: "primary.100",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <CheckIcon
                      sx={{
                        fontSize: 16,
                        color: "primary.main",
                        ml: 1,
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
            );
          })}
      </Menu>
    </MuiTableHead>
  );
};

interface TableLoadingProps {
  colSpan: number;
}

// export const TableLoading: React.FC<TableLoadingProps> = ({ colSpan }) => (
//   <TableRow>
//     <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
//       <CircularProgress />
//       <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
//         Loading data...
//       </Typography>
//     </TableCell>
//   </TableRow>
// );

function GradientCircularProgress() {
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3782f2" />
            <stop offset="100%" stopColor="#2F9616" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        size={20}
        sx={{ "svg circle": { stroke: "url(#my_gradient)" } }}
      />
    </React.Fragment>
  );
}

export const TableLoading: React.FC<TableLoadingProps> = ({ colSpan }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
      <GradientCircularProgress />
    </TableCell>
  </TableRow>
);

interface TableEmptyProps {
  colSpan: number;
  search?: string;
  onAdd?: () => void;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
  colSpan,
  search,
  onAdd,
}) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
      <Box sx={{ color: "text.secondary", mb: 2 }}>
        <SearchOutlinedIcon sx={{ fontSize: 48, opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" gutterBottom>
        {search ? "No results found" : "No data available"}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {search
          ? "Try adjusting your search query or filters"
          : "Get started by adding your first data"}
      </Typography>
    </TableCell>
  </TableRow>
);

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}
interface FilterConfig {
  id: string;
  value: any;
}

interface TableHeaderProps {
  title: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  onAddClick?: () => void;
  onRefreshClick?: () => void;
  onExportClick?: (type: "excel" | "pdf") => void;
  columns?: ColumnConfig[];
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
  addLabel?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode; // Add actions prop for custom actions
  activeFilters?: FilterConfig[];
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  search = "",
  onSearchChange,
  onAddClick,
  onRefreshClick,
  onExportClick,
  columns = [],
  onColumnVisibilityChange,
  addLabel = "Add New",
  children,
  actions,
  activeFilters = [], // Naya prop
}) => {
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [expanded, setExpanded] = useState(false);

  const handleClearSearch = () => {
    if (onSearchChange) onSearchChange("");
  };

  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportClick = (type: "excel" | "pdf") => {
    if (onExportClick) {
      onExportClick(type);
    }
    handleExportMenuClose();
  };

  const handleColumnToggle =
    (columnId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange(columnId, event.target.checked);
      }
    };

  const handleDeselectAll = () => {
    if (onColumnVisibilityChange) {
      columns.forEach((col) => {
        onColumnVisibilityChange(col.id, false);
      });
    }
  };

  const handleSelectAll = () => {
    if (onColumnVisibilityChange) {
      columns.forEach((col) => {
        onColumnVisibilityChange(col.id, true);
      });
    }
  };

  const visibleColumnsCount = columns.filter((col) => col.visible).length;
  const totalColumns = columns.length;

  // If custom actions are provided, use them
  if (actions) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '4px',
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            mb: children ? 2 : 0,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              alignItems: "center",
            }}
          >
            {/* Search Field */}
            {onSearchChange && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  transition: "width 0.3s ease",
                  width: expanded ? { xs: "100%", sm: 300 } : 40,
                }}
              >
                <TextField
                  placeholder={expanded ? "Search..." : ""}
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",

                      height: 40,
                      paddingRight: 0,
                      transition: "all 0.3s ease",
                      pl: "3.8px",
                      "&:hover": {
                        backgroundColor: (theme) =>
                          expanded
                            ? "background.paper"
                            : theme.palette.action.hover, // ✅ hover tint only when collapsed
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ccc !important", // ✅ lock neutral border color
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#ccc !important", // ✅ no primary border on focus
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Tooltip title="Search">
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (expanded && !search) setExpanded(false);
                              else setExpanded(true);
                            }}
                            edge="start"
                            sx={{
                              "&:hover": { backgroundColor: "transparent" },
                            }}
                          >
                            <Search
                              sx={{
                                transition: "color 0.3s ease",
                                color: expanded
                                  ? "action.active"
                                  : "action.active",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                    endAdornment:
                      expanded && search ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleClearSearch}
                            edge="end"
                          >
                            <Clear fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                  }}
                  onBlur={() => {
                    if (!search) setExpanded(false);
                  }}
                  onFocus={() => setExpanded(true)}
                />
              </Box>
            )}

            {/* Custom Actions */}
            {actions}
          </Box>
        </Box>

        {children}
      </Paper>
    );
  }
  const hasActiveFilters = useMemo(() => {
    return activeFilters.some((filter) => {
      // "All" ko check karein (value null ya undefined nahi hona chahiye)
      if (filter.value === null || filter.value === undefined) {
        return false;
      }
      // String value check
      if (typeof filter.value === "string") {
        return filter.value.trim() !== "";
      }
      // Boolean value check
      if (typeof filter.value === "boolean") {
        return true;
      }
      // Number value check
      if (typeof filter.value === "number") {
        return true;
      }
      // Array value check
      if (Array.isArray(filter.value)) {
        return filter.value.length > 0;
      }
      return true;
    });
  }, [activeFilters]);
  const FilterIndicator = ({
    hasActiveFilter,
  }: {
    hasActiveFilter: boolean;
  }) => {
    return (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 8,
          height: 8,
          backgroundColor: hasActiveFilter ? "primary.main" : "transparent",
          borderRadius: "50%",
          border: hasActiveFilter ? "none" : "1px solid #ccc",
        }}
      />
    );
  };
  // Original implementation with icons only
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        mb: "12px",
        borderRadius: "4px",
        border: "1px solid",
        borderColor: "divider",
      }}
      className="bg-gray-900"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: children ? 2 : 0,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Search Field */}

          {/* Action Buttons - Icons Only */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {onSearchChange && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  transition: "width 0.25s ease",
                  width: expanded ? { xs: "100%", sm: 280 } : 40,
                }}
              >
                <TextField
                  value={search}
                  placeholder={expanded ? "Search..." : ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      height: 40,
                      borderRadius: "4px",
                      px: 0, // 🔥 remove default horizontal padding
                      transition: "all 0.25s ease",

                      "&:hover": {
                        backgroundColor: expanded
                          ? "transparent"
                          : "action.hover",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "0 8px 0 0", // 🔥 text padding ONLY (right side)
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#d0d5dd",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#d0d5dd",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          ml: "4px",
                          mr: "4px", // 🔥 controlled spacing after icon
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (expanded && !search) setExpanded(false);
                            else setExpanded(true);
                          }}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "4px",
                            p: 0,
                          }}
                        >
                          <Search fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment:
                      expanded && search ? (
                        <InputAdornment position="end" sx={{ mr: "4px" }}>
                          <IconButton
                            size="small"
                            onClick={handleClearSearch}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "4px",
                              p: 0,
                            }}
                          >
                            <Clear
                              sx={{
                                fontSize: 16,
                                color: "action.active",
                              }}
                            />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                  }}
                  onFocus={() => setExpanded(true)}
                  onBlur={() => {
                    if (!search) setExpanded(false);
                  }}
                />
              </Box>
            )}

            {/* Export Dropdown Button - Icon Only */}
            {onExportClick && (
              <>
                <Tooltip title="Export Data">
                  <IconButton
                    onClick={handleExportMenuOpen}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "4px",
                    }}
                  >
                    <DownloadOutlinedIcon />
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={exportMenuAnchor}
                  open={Boolean(exportMenuAnchor)}
                  onClose={handleExportMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 160,
                      borderRadius: "4px",
                    },
                  }}
                >
                  <MenuItem onClick={() => handleExportClick("excel")}>
                    <ListItemIcon>
                      <TableChart fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText>Export Excel</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleExportClick("pdf")}>
                    <ListItemIcon>
                      <PictureAsPdf fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Export PDF</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Refresh Button - Icon Only */}
            {onRefreshClick && (
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={onRefreshClick}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "4px",
                  }}
                >
                  <RotateLeftOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Column Visibility Dropdown - Icon Only */}
            {columns.length > 0 && onColumnVisibilityChange && (
              <>
                <Tooltip title="Manage Columns">
                  <IconButton
                    onClick={handleColumnMenuOpen}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "4px",
                    }}
                  >
                    <ViewWeekOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <FilterIndicator hasActiveFilter={hasActiveFilters} />

                <Menu
                  anchorEl={columnMenuAnchor}
                  open={Boolean(columnMenuAnchor)}
                  onClose={handleColumnMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 280,
                      maxHeight: 400,
                      borderRadius: "4px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  {/* Header Section */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="text.primary"
                    >
                      Visible Columns
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {visibleColumnsCount} of {totalColumns} selected
                      </Typography>
                      <Button
                        size="small"
                        onClick={
                          visibleColumnsCount === 0
                            ? handleSelectAll
                            : handleDeselectAll
                        }
                        sx={{ minWidth: "auto", fontSize: "0.75rem" }}
                      >
                        {visibleColumnsCount === 0
                          ? "Select All"
                          : "Deselect All"}
                      </Button>
                    </Box>
                  </Box>

                  {/* Columns List */}
                  <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                    {columns.map((column) => (
                      <MenuItem
                        key={column.id}
                        dense
                        onClick={(e) => e.stopPropagation()}
                        sx={{ py: 1 }}
                      >
                        <Checkbox
                          checked={column.visible}
                          onChange={handleColumnToggle(column.id)}
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <Typography variant="body2">
                                {column.label}
                              </Typography>
                              {column.visible && (
                                <Chip
                                  label="Visible"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: "0.65rem" }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </MenuItem>
                    ))}
                  </Box>

                  {/* Footer Section */}
                  <Divider />
                  <Box sx={{ px: 2, py: 1, bgcolor: "grey.50" }}>
                    <Typography variant="caption" color="text.secondary">
                      Changes apply immediately
                    </Typography>
                  </Box>
                </Menu>
              </>
            )}

            {/* Add Button - Icon Only */}
            {onAddClick && (
              <Tooltip title={addLabel}>
                <IconButton
                  onClick={onAddClick}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "4px",
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      {children}
    </Paper>
  );
};

export default TableHead;
