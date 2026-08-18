import React, {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridColumnVisibilityModel,
  GridFilterItem,
  GridFilterModel,
  GridLogicOperator,
  GridPaginationModel,
  GridSortModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  Box,
  Card,
  Typography,
  Grid,
  Pagination,
  Tooltip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  type SelectChangeEvent,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import HeightIcon from '@mui/icons-material/Height';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import DataGridToolbar from "./DataGridToolbar";
import Loader from "../Loader/loader";
import ActionButtonsEdit from "./ActionButtonsEdit";
import ActionButtonsDelete from "./ActionButtonsDelete";
import { formatDateOnly } from "../../utils/FormatDate";
// Assuming you might want a View button later, or reuse Edit for view if read-only
// import ActionButtonsView from "./ActionButtonsView";

// Define Permission Interface
export interface GridPermissions {
  create: boolean;
  edit: boolean;
  delete: boolean;
  view?: boolean;
  download: boolean;
}

export interface ReusableDataGridProps {
  // Data
  rows: any[];
  columns: GridColDef[];
  totalCount: number;
  loading: boolean;

  // Pagination & Sorting State (Controlled)
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  filterModel: GridFilterModel;
  setFilterModel: (model: GridFilterModel) => void;

  // Actions
  onAdd?: () => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  refetch?: () => void;
  onRowClick?: (row: any) => void;
  onCellClick?: (params: GridCellParams) => void;

  // Config
  title?: string;
  addButtonLabel?: string;
  uniqueIdField?: string;
  rowHeight?: number | "auto";
  columnHeaderHeight?: number;
  height?: number | string;
  searchableFields?: string[];
  columnSearchFilters?: Record<string, string>;
  pageSizeOptions?: number[];
  compact?: boolean;
  initialColumnVisibilityModel?: GridColumnVisibilityModel;
  csvExportOptions?: Record<string, unknown>;

  // Permissions
  permissions?: GridPermissions;

  // Custom Controls
  headerControls?: React.ReactNode;
  headerControlsPlacement?: "below" | "inline";
  searchControls?: React.ReactNode;

  // View Mode (Table / Grid)
  enableViewToggle?: boolean;
  defaultViewMode?: "table" | "grid";
  onViewModeChange?: (mode: "table" | "grid") => void;
  showFilterButton?: boolean;
  enableHeaderFilters?: boolean;
  disableColumnMenu?: boolean;

  // Card View Rendering
  renderRowCard?: (row: any) => React.ReactNode;
  cardViewGridProps?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  headerTextAlign?: "left" | "center";
  headerVerticalAlign?: "top" | "center";
  noRowsMessage?: string;
}

type ColumnWithFilterValueGetter = GridColDef & {
  filterValueGetter?: (row: any, field: string) => unknown;
};

type DataGridSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const DataGridSearchInput = React.memo(({ value, onChange }: DataGridSearchInputProps) => {
  const [draftValue, setDraftValue] = useState(value);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (draftValue !== value) {
        onChange(draftValue);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [draftValue, onChange, value]);

  return (
    <TextField
      value={draftValue}
      inputRef={inputRef}
      aria-label="Search"
      placeholder="Search..."
      size="small"
      sx={{
        width: { xs: "100%", sm: 260 },
        minWidth: { xs: 0, sm: 240 },
      }}
      onChange={(event) => {
        setDraftValue(event.target.value);
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                size="small"
                aria-label="Clear search"
                onClick={() => {
                  setDraftValue("");
                  onChange("");
                  window.requestAnimationFrame(() => {
                    inputRef.current?.focus();
                  });
                }}
                sx={{
                  marginRight: -0.75,
                  opacity: draftValue ? 1 : 0.35,
                }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
});

const formatFilterDisplayValue = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmedValue)) {
    return value;
  }

  return formatDateOnly(trimmedValue) || value;
};

type DataGridHeaderSummaryProps = {
  title: string;
  activeFilters: Array<{ field: string; value: string }>;
  onRemoveFilter: (field: string) => void;
  onClearFilters: () => void;
  headerControls?: React.ReactNode;
  headerControlsPlacement?: "below" | "inline";
};

const DataGridHeaderSummary = React.memo(({
  title,
  activeFilters,
  onRemoveFilter,
  onClearFilters,
  headerControls,
  headerControlsPlacement = "below",
}: DataGridHeaderSummaryProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      columnGap: 1,
      rowGap: 0.75,
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: 0,
        flexWrap: "wrap",
        flex: headerControlsPlacement === "inline" ? "1 1 auto" : "0 0 auto",
      }}
    >
      <Typography
        variant="h6"
        component="h1"
        fontWeight="700"
        sx={{ letterSpacing: "-0.02em", color: "text.primary", flexShrink: 0 }}
      >
        {title}
      </Typography>

      {headerControls && headerControlsPlacement === "inline" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          {headerControls}
        </Box>
      )}
    </Box>

    {activeFilters.length > 0 && (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          minWidth: 0,
          overflowX: "auto",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          pr: 0.5,
          "&::-webkit-scrollbar": {
            height: 4,
          },
        }}
      >
        {activeFilters.map((filter) => (
          <Chip
            key={`${filter.field}-${filter.value}`}
            label={`${filter.field}: ${filter.value}`}
            onDelete={() => onRemoveFilter(filter.field)}
            size="small"
          />
        ))}
        <Typography
          component="button"
          type="button"
          onClick={onClearFilters}
          sx={{
            flexShrink: 0,
            whiteSpace: "nowrap",
            border: "none",
            background: "transparent",
            color: "primary.main",
            cursor: "pointer",
            fontSize: "0.8125rem",
            fontWeight: 500,
          }}
        >
          Clear filters
        </Typography>
      </Box>
    )}

    {headerControls && headerControlsPlacement === "below" && (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minWidth: 0,
          flex: "1 1 100%",
        }}
      >
        {headerControls}
      </Box>
    )}
  </Box>
));

const ReusableDataGrid: React.FC<ReusableDataGridProps> = ({
  rows,
  columns,
  loading,
  paginationModel,
  setPaginationModel,
  sortModel,
  setSortModel,
  filterModel,
  setFilterModel,
  onAdd,
  onEdit,
  onDelete,
  onView,
  refetch,
  onRowClick,
  onCellClick,
  title = "List",
  addButtonLabel = "Add New",
  uniqueIdField = "id",
  rowHeight = 40,
  columnHeaderHeight = 62,
  height = "calc(100vh - 240px)",
  searchableFields,
  columnSearchFilters,
  pageSizeOptions = [5, 10, 20, 50],
  compact = true,
  initialColumnVisibilityModel,
  csvExportOptions,
  permissions = {
    create: true,
    edit: true,
    delete: true,
    view: true,

    download: true,
  },
  headerControls,
  headerControlsPlacement = "below",
  searchControls,
  enableViewToggle,
  defaultViewMode = "table",
  onViewModeChange,
  renderRowCard,
  cardViewGridProps,
  headerTextAlign = "center",
  headerVerticalAlign = "center",
  noRowsMessage = "No records found",
  showFilterButton = true,
  enableHeaderFilters = false,
  disableColumnMenu = false,
}) => {
  const [viewMode, setViewMode] = useState<"table" | "grid">(defaultViewMode);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(() =>
      columns.reduce<GridColumnVisibilityModel>((acc, column) => {
        const hidden = (column as GridColDef & { hide?: boolean }).hide;
        if (hidden !== undefined) {
          acc[column.field] = !hidden;
        }
        return acc;
      }, { ...(initialColumnVisibilityModel ?? {}) }),
    );
  const showViewToggle = enableViewToggle !== undefined ? enableViewToggle : Boolean(renderRowCard);

  useEffect(() => {
    setColumnVisibilityModel((current) => {
      let hasChanges = false;
      const nextModel = { ...current };

      columns.forEach((column) => {
        const hidden = (column as GridColDef & { hide?: boolean }).hide;
        if (hidden !== undefined && nextModel[column.field] === undefined) {
          nextModel[column.field] = !hidden;
          hasChanges = true;
        }
      });

      return hasChanges ? nextModel : current;
    });
  }, [columns]);

  const handleViewModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newMode: "table" | "grid" | null) => {
      if (!newMode) return;
      setViewMode(newMode);
      onViewModeChange?.(newMode);
    },
    [onViewModeChange],
  );

  const effectiveHeaderControls = useMemo(() => {
    if (!showViewToggle && !headerControls) return undefined;

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {showViewToggle && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={handleViewModeChange}
            aria-label="view mode"
          >
            <ToggleButton value="table" aria-label="table view">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModuleIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        )}
        {headerControls}
      </Box>
    );
  }, [showViewToggle, viewMode, headerControls, handleViewModeChange]);

  const columnLookup = useMemo(
    () =>
      columns.reduce<Record<string, GridColDef>>((acc, column) => {
        acc[column.field] = column;
        return acc;
      }, {}),
    [columns],
  );

  const isDateColumn = useCallback(
    (field: string) => {
      const columnType = columnLookup[field]?.type;
      return columnType === "date" || columnType === "dateTime";
    },
    [columnLookup],
  );

  const getDateOnlyComparableValue = useCallback((value: unknown) => {
    if (!value) {
      return null;
    }

    const parsedDate =
      value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return Date.UTC(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
    );
  }, []);

  const getCellValue = useCallback(
    (row: any, field: string) => {
      const column = columnLookup[field] as ColumnWithFilterValueGetter | undefined;

      if (column?.filterValueGetter) {
        try {
          return column.filterValueGetter(row, field);
        } catch {
          return row?.[field];
        }
      }

      if (column?.valueGetter) {
        try {
          return (column.valueGetter as any)(row?.[field], row, column, null);
        } catch {
          return row?.[field];
        }
      }

      return row?.[field];
    },
    [columnLookup],
  );

  const getComparablePrimitive = useCallback(
    (value: unknown, field: string) => {
      if (value === null || value === undefined || value === "") {
        return null;
      }

      if (isDateColumn(field)) {
        return getDateOnlyComparableValue(value);
      }

      if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value.getTime();
      }

      if (typeof value === "number") {
        return value;
      }

      if (typeof value === "boolean") {
        return value ? 1 : 0;
      }

      const normalizedString = String(value).trim();
      const numericValue = Number(normalizedString);

      if (!Number.isNaN(numericValue) && normalizedString !== "") {
        return numericValue;
      }

      const timestamp = Date.parse(normalizedString);
      if (!Number.isNaN(timestamp)) {
        return timestamp;
      }

      return normalizedString.toLowerCase();
    },
    [getDateOnlyComparableValue, isDateColumn],
  );

  const getComparableValue = useCallback(
    (row: any, field: string) => {
      const rawValue = getCellValue(row, field);
      return getComparablePrimitive(rawValue, field);
    },
    [getCellValue, getComparablePrimitive],
  );

  const matchesFilterItem = useCallback(
    (row: any, item: GridFilterItem) => {
      const field = item.field;
      const operator = String(item.operator ?? "contains");
      const rawValue = getCellValue(row, field);
      const normalizedValue = rawValue === null || rawValue === undefined ? "" : String(rawValue);
      const normalizedFilterValue = item.value === null || item.value === undefined ? "" : String(item.value);
      const valueLower = normalizedValue.toLowerCase();
      const filterLower = normalizedFilterValue.toLowerCase();
      const comparableRowValue = getComparableValue(row, field);
      const comparableFilterValue = getComparablePrimitive(item.value, field);

      switch (operator) {
        case "contains":
          return valueLower.includes(filterLower);
        case "doesNotContain":
          return !valueLower.includes(filterLower);
        case "equals":
        case "is":
          if (comparableRowValue !== null && comparableFilterValue !== null) {
            return comparableRowValue === comparableFilterValue;
          }
          return valueLower === filterLower;
        case "doesNotEqual":
        case "not":
          if (comparableRowValue !== null && comparableFilterValue !== null) {
            return comparableRowValue !== comparableFilterValue;
          }
          return valueLower !== filterLower;
        case "startsWith":
          return valueLower.startsWith(filterLower);
        case "endsWith":
          return valueLower.endsWith(filterLower);
        case "isEmpty":
          return normalizedValue.trim() === "";
        case "isNotEmpty":
          return normalizedValue.trim() !== "";
        case "isAnyOf": {
          const filterValues = Array.isArray(item.value)
            ? item.value.map((value) => String(value).toLowerCase())
            : normalizedFilterValue
                .split(",")
                .map((value) => value.trim().toLowerCase())
                .filter(Boolean);

          return filterValues.includes(valueLower);
        }
        case ">":
          return comparableRowValue !== null &&
            comparableFilterValue !== null &&
            comparableRowValue > comparableFilterValue;
        case ">=":
          return comparableRowValue !== null &&
            comparableFilterValue !== null &&
            comparableRowValue >= comparableFilterValue;
        case "<":
          return comparableRowValue !== null &&
            comparableFilterValue !== null &&
            comparableRowValue < comparableFilterValue;
        case "<=":
          return comparableRowValue !== null &&
            comparableFilterValue !== null &&
            comparableRowValue <= comparableFilterValue;
        case "after":
          return comparableRowValue !== null &&
            comparableFilterValue !== null &&
            comparableRowValue > comparableFilterValue;
        case "onOrAfter":
          return comparableRowValue !== null &&
            comparableFilterValue !== null &&
            comparableRowValue >= comparableFilterValue;
        case "before":
          return comparableRowValue !== null &&
            comparableFilterValue !== null &&
            comparableRowValue < comparableFilterValue;
        case "onOrBefore":
          return comparableRowValue !== null &&
            comparableFilterValue !== null &&
            comparableRowValue <= comparableFilterValue;
        default:
          return valueLower.includes(filterLower);
      }
    },
    [getCellValue, getComparablePrimitive, getComparableValue],
  );

  const renderCardRow = useCallback(
    (row: any) => {
      try {
        if (renderRowCard) return renderRowCard(row);

        const displayColumns = columns
          .filter((col) => {
            const hidden = (col as GridColDef & { hide?: boolean }).hide;
            return col.field && col.field !== "actions" && !hidden;
          })
          .slice(0, 4);

        const getValue = (col: GridColDef) => {
          try {
            const rawValue = row[col.field];
            if (col.valueFormatter && typeof col.valueFormatter === "function") {
              return (col.valueFormatter as any)(rawValue, row, col, null);
            }
            return rawValue ?? "-";
          } catch {
            return "-";
          }
        };

        return (
          <Card
            sx={{
              borderRadius: "8px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
              {displayColumns[0] && (
                <Typography variant="subtitle1" fontWeight={700} gutterBottom noWrap>
                  {getValue(displayColumns[0])}
                </Typography>
              )}
              {displayColumns[1] && (
                <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                  {getValue(displayColumns[1])}
                </Typography>
              )}
              <Box sx={{ mt: 1, display: "grid", gap: 0.5 }}>
                {displayColumns.slice(2).map((col) => (
                  <Box key={col.field} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" color="text.secondary">
                      {col.headerName || col.field}
                    </Typography>
                    <Typography variant="caption" fontWeight={500} sx={{ ml: 1 }}>
                      {getValue(col)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>

            <Box sx={{ display: "flex", gap: 1, p: 1, justifyContent: "flex-end" }}>
              {onView && permissions.view && (
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => onView(row)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onEdit && permissions.edit && (
                <ActionButtonsEdit
                  onEdit={() => onEdit(row)}
                  editTooltip="Edit"
                  size="small"
                />
              )}
              {onDelete && permissions.delete && (
                <ActionButtonsDelete
                  onDelete={() => onDelete(row)}
                  deleteTooltip="Delete"
                  size="small"
                />
              )}
            </Box>
          </Card>
        );
      } catch (error) {
        console.error("Error rendering card row:", error);
        return (
          <Card sx={{ borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography color="error">Error rendering card</Typography>
            </CardContent>
          </Card>
        );
      }
    },
    [columns, onView, onEdit, onDelete, permissions, renderRowCard],
  );

  // Active filters for chips display
  const activeFilters = useMemo(() => {
    const filters: Array<{ field: string; value: string }> = [];

    // Column filters
    filterModel.items.forEach((item) => {
      if (
        item.value !== undefined &&
        item.value !== null &&
        item.value !== ""
      ) {
        let displayValue = String(item.value);
        if (typeof item.value === "boolean") {
          displayValue = item.value ? "Active" : "Inactive";
        } else {
          displayValue = String(formatFilterDisplayValue(item.value));
        }
        filters.push({
          field: item.field,
          value: displayValue,
        });
      }
    });

    return filters;
  }, [filterModel]);

  const handleSearchChange = useCallback(
    (value: string) => {
      startTransition(() => {
        setSearchQuery(value);
      });

      if (paginationModel.page !== 0) {
        setPaginationModel({ ...paginationModel, page: 0 });
      }
    },
    [paginationModel, setPaginationModel],
  );

  const removeFilter = useCallback(
    (filterType: string) => {
      setFilterModel({
        ...filterModel,
        items: filterModel.items.filter((item) => item.field !== filterType),
      });
    },
    [filterModel, setFilterModel],
  );

  const clearAllFilters = useCallback(() => {
    setFilterModel({ ...filterModel, items: [] });
  }, [filterModel, setFilterModel]);

  const searchedRows = useMemo(() => {
    const searchTerms = deferredSearchQuery
      .split(/\s+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (searchTerms.length === 0) {
      return rows;
    }

    const fieldsToSearch =
      searchableFields && searchableFields.length > 0
        ? searchableFields
        : columns
            .filter((column) => column.field !== "actions")
            .map((column) => column.field);

    return rows.filter((row) =>
      searchTerms.every((term) =>
        fieldsToSearch.some((field) =>
          String(row?.[field] ?? "")
            .toLowerCase()
            .includes(term)
        )
      )
    );
  }, [columns, deferredSearchQuery, rows, searchableFields]);

  const filteredRows = useMemo(() => {
    const activeColumnFilters = filterModel.items.filter((item) => {
      const operator = String(item.operator ?? "contains");
      const needsValue = !["isEmpty", "isNotEmpty"].includes(operator);

      if (!item.field) {
        return false;
      }

      if (!needsValue) {
        return true;
      }

      return item.value !== undefined && item.value !== null && String(item.value).trim() !== "";
    });

    const gridFilteredRows =
      activeColumnFilters.length === 0
        ? searchedRows
        : searchedRows.filter((row) => {
            const results = activeColumnFilters.map((item) => matchesFilterItem(row, item));
            const useOrLogic = filterModel.logicOperator === GridLogicOperator.Or;
            return useOrLogic ? results.some(Boolean) : results.every(Boolean);
          });

    const activeHeaderSearchEntries = Object.entries(columnSearchFilters ?? {}).filter(
      ([, value]) => value.trim() !== ""
    );

    if (activeHeaderSearchEntries.length === 0) {
      return gridFilteredRows;
    }

    return gridFilteredRows.filter((row) =>
      activeHeaderSearchEntries.every(([field, value]) =>
        String(getCellValue(row, field) ?? "")
          .toLowerCase()
          .includes(value.trim().toLowerCase())
      )
    );
  }, [
    columnSearchFilters,
    filterModel.items,
    filterModel.logicOperator,
    getCellValue,
    matchesFilterItem,
    searchedRows,
  ]);

  const sortedRows = useMemo(() => {
    if (sortModel.length === 0) {
      return filteredRows;
    }

    const sorted = [...filteredRows];

    sorted.sort((leftRow, rightRow) => {
      for (const sortItem of sortModel) {
        if (!sortItem.sort) {
          continue;
        }

        const leftValue = getComparableValue(leftRow, sortItem.field);
        const rightValue = getComparableValue(rightRow, sortItem.field);

        if (leftValue === rightValue) {
          continue;
        }

        if (leftValue === null) {
          return sortItem.sort === "asc" ? -1 : 1;
        }

        if (rightValue === null) {
          return sortItem.sort === "asc" ? 1 : -1;
        }

        const comparison =
          leftValue > rightValue ? 1 : leftValue < rightValue ? -1 : 0;

        if (comparison !== 0) {
          return sortItem.sort === "asc" ? comparison : -comparison;
        }
      }

      return 0;
    });

    return sorted;
  }, [filteredRows, getComparableValue, sortModel]);

  const effectiveTotalCount = sortedRows.length;

  const pagedRows = useMemo(() => {
    const startIndex = paginationModel.page * paginationModel.pageSize;
    const endIndex = startIndex + paginationModel.pageSize;

    return sortedRows.slice(startIndex, endIndex);
  }, [paginationModel.page, paginationModel.pageSize, sortedRows]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(effectiveTotalCount / paginationModel.pageSize) - 1);

    if (paginationModel.page > maxPage) {
      setPaginationModel({ ...paginationModel, page: maxPage });
    }
  }, [effectiveTotalCount, paginationModel, setPaginationModel]);

  const handlePageSizeChange = useCallback(
    (event: SelectChangeEvent<number>) => {
      setPaginationModel({
        page: 0,
        pageSize: Number(event.target.value),
      });
    },
    [setPaginationModel],
  );

  const totalPages = Math.max(1, Math.ceil(effectiveTotalCount / paginationModel.pageSize));
  const effectivePageSizeOptions = useMemo(
    () =>
      Array.from(new Set([...pageSizeOptions, paginationModel.pageSize])).sort(
        (first, second) => first - second,
      ),
    [pageSizeOptions, paginationModel.pageSize],
  );

  const normalizedColumns = useMemo(
    () =>
      columns.map((column) => {
        if (column.field === "actions") {
          return column;
        }

        if (
          column.width !== undefined ||
          column.flex !== undefined
        ) {
          return {
            minWidth: column.minWidth ?? 90,
            ...column,
          };
        }

        return {
          minWidth: column.minWidth ?? 90,
          flex: 1,
          ...column,
        };
      }),
    [columns],
  );

  // Augment columns with Actions if needed
  const finalColumns = useMemo(() => {
    const cols = [...normalizedColumns];

    // Check if we need an actions column
    const hasEdit = !!onEdit && permissions.edit;
    const hasDelete = !!onDelete && permissions.delete;

    const hasView = !!onView && permissions.view;

    if (hasEdit || hasDelete || hasView) {
      cols.push({
        field: "actions",
        headerName: "Actions",
        flex: 1,
        minWidth: 120,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams) => (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              height: "100%",
              alignItems: "center",
              justifyContent: "center",

              width: "100%",
            }}
          >
            {hasView && (
              <Tooltip title="View">
                <IconButton size="small" onClick={() => onView && onView(params.row)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {hasEdit && (
              <ActionButtonsEdit
                onEdit={() => onEdit && onEdit(params.row)}
                editTooltip="Edit"
              />
            )}
            {hasDelete && (
              <ActionButtonsDelete
                onDelete={() => onDelete && onDelete(params.row)}
                deleteTooltip="Delete"
              />
            )}
          </Box>
        ),
      });
    }
    return cols;
  }, [normalizedColumns, onEdit, onDelete, onView, permissions]);

  const toolbarSlotProps = useMemo(
    () => ({
      title,
      refetch,
      onAdd: permissions.create ? onAdd : undefined,
      addButtonLabel,
      showExport: permissions.download,
      csvExportOptions,
      activeFilters,
      onRemoveFilter: removeFilter,
      onClearFilters: clearAllFilters,
      hideTitleSection: true,
      showFilterButton,
    }),
    [
      title,
      refetch,
      permissions.create,
      permissions.download,
      onAdd,
      addButtonLabel,
      activeFilters,
      clearAllFilters,
      removeFilter,
      showFilterButton,
      csvExportOptions,
    ],
  );

  const sharedGridHeaderBackground = (theme: any) =>
    theme.palette.mode === "dark" ? "#0F172A" : "#F8FAFC";
  const sharedGridHeaderBorder = (theme: any) =>
    theme.palette.mode === "dark" ? "#334155" : "#CBD5E1";

  const sharedGridSx = {
    border: "1px solid",
    padding: 0,
    borderColor: "divider",
    borderRadius: "4px",
    backgroundColor: "background.paper",
    boxShadow: (theme: any) =>
      theme.palette.mode === "dark"
        ? "0 4px 6px -1px rgba(0,0,0,0.5)"
        : "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
    overflow: "hidden",
    "& .MuiDataGrid-main": {
      overflow: "hidden",
      border: "none",
    },
    "& .MuiDataGrid-virtualScroller": {
      overflowY: "auto",
      border: "none",
    },
    "& .MuiDataGrid-scrollbar": {
      border: "none",
    },
    "& .MuiDataGrid-scrollbar--horizontal": {
      borderTop: "none",
    },
    "& .MuiDataGrid-scrollbar--vertical": {
      borderLeft: "none",
    },
    "& .MuiDataGrid-scrollbarFiller": {
      border: "none",
      backgroundColor: "transparent",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: (theme: any) => sharedGridHeaderBackground(theme),
      borderBottom: "1px solid",
      borderColor: (theme: any) => sharedGridHeaderBorder(theme),
    },
    "& .MuiDataGrid-columnHeader": {
      padding: compact ? "6px 6px" : "10px 12px",
      minHeight: compact ? 42 : 48,
      backgroundColor: (theme: any) => sharedGridHeaderBackground(theme),
      borderBottom: (theme: any) => `1px solid ${sharedGridHeaderBorder(theme)}`,
      "&:focus, &:focus-within": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-columnHeaderTitleContainer": {
      whiteSpace: "normal",
      lineHeight: 1.15,
      justifyContent: headerTextAlign === "left" ? "flex-start" : "center",
      alignItems: headerVerticalAlign === "top" ? "flex-start" : "center",
      textAlign: headerTextAlign,
      overflow: "visible",
      height: "100%",
      pt: headerVerticalAlign === "top" ? 1 : 0,
      pb: headerVerticalAlign === "top" ? 0.25 : 0,
    },
    "& .MuiDataGrid-columnHeaderTitleContainerContent": {
      width: "100%",
      overflow: "visible",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 700,
      fontSize: compact ? "0.8rem" : "0.875rem",
      color: "text.secondary",
      lineHeight: 1.15,
      whiteSpace: "normal",
      textAlign: headerTextAlign,
      overflow: "visible",
      textOverflow: "clip",
    },
    "& .MuiDataGrid-columnHeader--filter": {
      backgroundColor: (theme: any) => sharedGridHeaderBackground(theme),
      borderBottom: (theme: any) => `1px solid ${sharedGridHeaderBorder(theme)}`,
      minHeight: compact ? 44 : 50,
      py: 0.5,
    },
    "& .MuiDataGrid-columnHeaderFilterInput": {
      width: "100%",
      px: compact ? 0.5 : 0.75,
    },
    "& .MuiDataGrid-columnHeaderFilterInput .MuiInputBase-root": {
      fontSize: compact ? "0.75rem" : "0.8125rem",
      minHeight: compact ? 32 : 36,
      borderRadius: "6px",
      backgroundColor: "background.paper",
    },
    "& .MuiDataGrid-columnHeaderFilterInput .MuiInputBase-input": {
      px: 1,
      py: compact ? 0.75 : 0.875,
    },
    "& .MuiDataGrid-columnHeaderFilterOperatorLabel": {
      fontSize: compact ? "0.7rem" : "0.75rem",
      color: "text.secondary",
      px: 0.5,
    },
    "& .MuiDataGrid-iconButtonContainer": {
      visibility: "visible",
      width: "auto",
    },
    "& .MuiDataGrid-sortIcon": {
      opacity: 0.3,
    },
    "& .MuiDataGrid-columnHeader--sorted .MuiDataGrid-sortIcon": {
      opacity: 1,
    },
    "& .MuiDataGrid-row": {
      transition: "all 0.15s ease-in-out",
      borderBottom: "0.5px solid",
      borderColor: "divider",
      "&:hover": {
        backgroundColor: "action.hover",
      },
    },
    "& .MuiDataGrid-cell": {
      padding: compact ? "6px 10px" : "12px 16px",
      fontSize: compact ? "0.8rem" : "0.875rem",
      color: "text.primary",
      borderBottom: "none",
      display: "flex",
      alignItems: "center",
      "&:focus, &:focus-within": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-filterForm": {
      display: "flex",
      gap: "12px",
      alignItems: "flex-end",
      padding: "10px 12px",
      flexWrap: "nowrap",
    },
    "& .MuiDataGrid-filterFormOperatorInput": {
      display: "none !important",
    },
    "& .MuiDataGrid-filterFormColumnInput": {
      flex: "0 0 auto",
      width: compact ? 140 : 160,
    },
    "& .MuiDataGrid-filterFormValueInput": {
      flex: "0 0 auto",
      width: compact ? 140 : 160,
    },
    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
      backgroundColor: "action.hover",
    },
    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
      backgroundColor: "action.selected",
      borderRadius: "4px",
    },
  };

  const renderSharedToolbar = () => (
    <Box sx={{ position: "relative", flexShrink: 0, height: compact ? 56 : 64, overflow: "hidden" }}>
      <DataGrid
        autoHeight
        rows={rows}
        columns={finalColumns}
        rowCount={rows.length}
        loading={false}
        getRowId={(row) => row[uniqueIdField]}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        disableColumnMenu={disableColumnMenu}
        disableRowSelectionOnClick
        hideFooter
        showToolbar
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        {...(enableHeaderFilters
          ? ({
              headerFilters: true,
              headerFilterHeight: compact ? 44 : 50,
            } as any)
          : {})}
        slots={{
          toolbar: DataGridToolbar,
          loadingOverlay: Loader,
          columnUnsortedIcon: HeightIcon as any,
          columnSortedAscendingIcon: ArrowUpwardIcon as any,
          columnSortedDescendingIcon: ArrowDownwardIcon as any,
        }}
        slotProps={{
          toolbar: toolbarSlotProps,
          filterPanel: {
            filterFormProps: {
              operatorInputProps: { sx: { display: "none" } },
              columnInputProps: { sx: { width: compact ? 140 : 160 } },
              valueInputProps: { sx: { width: compact ? 140 : 160 } },
            },
          },
        }}
        sx={{
          ...sharedGridSx,
          position: "absolute",
          inset: 0,
          border: "none",
          backgroundColor: "transparent",
          boxShadow: "none",
          borderBottom: "none",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          minHeight: "0 !important",
          height: "auto !important",
          "--DataGrid-overlayHeight": "0px",
          "& .MuiDataGrid-main": {
            display: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            display: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            display: "none",
          },
          "& .MuiDataGrid-scrollbar": {
            display: "none",
          },
        }}
      />
    </Box>
  );

  return (
    <Card
      sx={{
        borderRadius: "4px",
        border: "none",
        boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.06)",
        height,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {loading && <Loader />}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          px: compact ? 1 : 1.5,
          py: 1,
        }}
      >
        <Box
          sx={{
            order: 1,
            flex: "1 1 280px",
            minWidth: 0,
          }}
        >
          <DataGridHeaderSummary
            title={title}
            activeFilters={activeFilters}
            onRemoveFilter={removeFilter}
            onClearFilters={clearAllFilters}
            headerControls={effectiveHeaderControls}
            headerControlsPlacement={headerControlsPlacement}
          />
        </Box>
        <Box
          sx={{
            order: { xs: 2, md: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "space-between", md: "flex-end" },
            gap: 1,
            flex: { xs: "1 1 100%", md: "0 0 auto" },
            minWidth: 0,
          }}
        >
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 auto" }, minWidth: { xs: 0, md: 240 } }}>
            <DataGridSearchInput value={searchQuery} onChange={handleSearchChange} />
          </Box>
          {searchControls && (
            <Box
              sx={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                minWidth: 0,
                "& > .MuiStack-root": {
                  marginBottom: "0 !important",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "stretch", md: "center" },
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  columnGap: 1.5,
                  rowGap: 1,
                },
                "& .MuiFormControl-root, & .MuiTextField-root": {
                  margin: 0,
                },
              }}
            >
              {searchControls}
            </Box>
          )}
          <Box sx={{ flex: "0 0 auto", width: { xs: "auto", md: 236 } }}>
            {renderSharedToolbar()}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",

          px: 1,
        }}
      >
        <DataGrid
          rows={pagedRows}
          columns={finalColumns}
          rowCount={effectiveTotalCount}
          loading={loading}
          getRowId={(row) => row[uniqueIdField]}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          {...(enableHeaderFilters
            ? ({
                headerFilters: true,
                headerFilterHeight: compact ? 44 : 50,
              } as any)
            : {})}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          sortingOrder={["asc", "desc"]}
          filterMode="server"
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          disableColumnMenu={disableColumnMenu}
          disableRowSelectionOnClick
          hideFooter
          density={compact ? "compact" : "standard"}
          getRowHeight={() => rowHeight}
          columnHeaderHeight={columnHeaderHeight}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          slots={{
            loadingOverlay: Loader,
            columnUnsortedIcon: HeightIcon as any,
            columnSortedAscendingIcon: ArrowUpwardIcon as any,
            columnSortedDescendingIcon: ArrowDownwardIcon as any,
          }}
          onRowClick={(params) => onRowClick?.(params.row)}
          onCellClick={(params) => onCellClick?.(params)}
          slotProps={{
            filterPanel: {
              filterFormProps: {
                operatorInputProps: { sx: { display: "none" } },
                columnInputProps: { sx: { width: compact ? 140 : 160 } },
                valueInputProps: { sx: { width: compact ? 140 : 160 } },
              },
            },
          }}
          localeText={{
            noRowsLabel: noRowsMessage,
          }}
          sx={{
            ...sharedGridSx,
            flex: 1,
            minHeight: 0,
            height: "100%",
            border: "none",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            "& .MuiDataGrid-columnHeaders": {
              position: "sticky",
              top: 0,
              zIndex: 3,
              backgroundColor: (theme: any) => sharedGridHeaderBackground(theme),
              borderBottom: (theme: any) => `1px solid ${sharedGridHeaderBorder(theme)}`,
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: (theme: any) => sharedGridHeaderBackground(theme),
              alignItems: headerVerticalAlign === "top" ? "flex-start" : "center",
            },
            "& .MuiDataGrid-virtualScroller": {
              overflowY: "auto !important",
              overflowX: "hidden",
              border: "none",
            },
            "& .MuiDataGrid-scrollbar": {
              border: "none",
            },
            "& .MuiDataGrid-scrollbar--horizontal": {
              borderTop: "none",
            },
            "& .MuiDataGrid-scrollbar--vertical": {
              borderLeft: "none",
            },
            "& .MuiDataGrid-scrollbarFiller": {
              border: "none",
              backgroundColor: "transparent",
            },
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: (theme) =>
              `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            opacity: viewMode === "grid" ? 1 : 0,
            visibility: viewMode === "grid" ? "visible" : "hidden",
            pointerEvents: viewMode === "grid" ? "auto" : "none",
            transform: viewMode === "grid" ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 220ms ease, transform 220ms ease, visibility 220ms ease",
          }}
        >
          <Box sx={{ flex: 1, overflow: "auto", p: 1.25 }}>
            {pagedRows.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                {noRowsMessage}
              </Typography>
            ) : (
              <Grid container spacing={1.25}>
                {pagedRows.map((row) => {
                  try {
                    if (renderRowCard) {
                      return (
                        <React.Fragment key={row[uniqueIdField] || Math.random()}>
                          {renderRowCard(row)}
                        </React.Fragment>
                      );
                    }

                    return (
                      <Grid
                        key={row[uniqueIdField] || Math.random()}
                        size={{
                          xs: cardViewGridProps?.xs ?? 12,
                          sm: cardViewGridProps?.sm ?? 6,
                          md: cardViewGridProps?.md ?? 4,
                          lg: cardViewGridProps?.lg ?? 3,
                        }}
                      >
                        {renderCardRow(row)}
                      </Grid>
                    );
                  } catch (error) {
                    console.error("Error rendering row:", row, error);
                    return null;
                  }
                })}
              </Grid>
            )}
          </Box>
        </Box>


      </Box>
      <Box
        sx={{
          px: compact ? 1.5 : 2,
          py: compact ? 1 : 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {effectiveTotalCount === 0
            ? "0 records"
            : `${paginationModel.page * paginationModel.pageSize + 1}-${Math.min(
                effectiveTotalCount,
                (paginationModel.page + 1) * paginationModel.pageSize,
              )} of ${effectiveTotalCount}`}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel id={`${title}-rows-per-page-label`}>Rows</InputLabel>
            <Select<number>
              labelId={`${title}-rows-per-page-label`}
              value={paginationModel.pageSize}
              label="Rows"
              onChange={handlePageSizeChange}
            >
              {effectivePageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Pagination
            count={totalPages}
            page={paginationModel.page + 1}
            onChange={(_, page) =>
              setPaginationModel({ ...paginationModel, page: page - 1 })
            }
            color="primary"
            showFirstButton
            showLastButton
            size="small"
          />
        </Box>
      </Box>
    </Card>
  );
};

export default ReusableDataGrid;
















