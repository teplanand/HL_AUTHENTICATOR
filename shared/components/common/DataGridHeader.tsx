import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  GridToolbarContainer,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportPrint,
  ExportCsv,
  QuickFilter,
  QuickFilterControl,
  QuickFilterTrigger,
  QuickFilterClear,
  GridToolbarProps,
} from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { styled } from "@mui/material/styles";

// Module augmentation to allow custom props in slotProps.toolbar
declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    title?: string;
    onAdd?: () => void;
    addButtonLabel?: string;
    refetch?: () => void;
    showExport?: boolean;
    headerControls?: React.ReactNode;
  }
}

// Styled Components
type OwnerState = {
  expanded: boolean;
};

const StyledQuickFilter = styled(QuickFilter)({
  display: "grid",
  alignItems: "center",
});

const StyledToolbarButton = styled(ToolbarButton)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: "1 / 1",
    width: "min-content",
    height: "min-content",
    zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1,
    pointerEvents: ownerState.expanded ? "none" : "auto",
    transition: theme.transitions.create(["opacity"]),
  }),
);

const StyledTextField = styled(TextField)<{
  ownerState: OwnerState;
}>(({ theme, ownerState }) => ({
  gridArea: "1 / 1",
  overflowX: "clip",
  width: ownerState.expanded ? 260 : "var(--trigger-width)",
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(["width", "opacity"]),
  [theme.breakpoints.down("sm")]: {
    width: ownerState.expanded ? "100%" : "var(--trigger-width)",
  },
}));

export interface DataGridHeaderProps extends GridToolbarProps {
  title?: string;
  onAdd?: () => void;
  addButtonLabel?: string;

  refetch?: () => void;
  showExport?: boolean;
  headerControls?: React.ReactNode;
}

const DataGridHeader: React.FC<DataGridHeaderProps> = ({
  title,
  onAdd,
  addButtonLabel = "Add New",
  refetch,
  showExport = true,
  headerControls,
  ...other
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [exportMenuOpen, setExportMenuOpen] = React.useState(false);
  const exportMenuTriggerRef = React.useRef<HTMLButtonElement>(null);

  // Mobile "More" menu state
  const [mobileMenuAnchor, setMobileMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchor);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <GridToolbarContainer
      {...other}
      sx={{
        display: "flex",
        flexDirection: "row", // Always row
        alignItems: "center",
        justifyContent: "space-between",
        height: "auto",
        minHeight: 64, // Standard height
        px: { xs: 1, sm: 2 },
        py: { xs: 1, sm: 1 },
        width: "100%",
        borderBottom: "1px solid",
        borderColor: "divider",
        gap: 1,
      }}
    >
      <Box sx={{ flexShrink: 0, mr: "auto" }}>
        <Typography
          variant="h6"
          component="h1"
          fontWeight="700"
          sx={{ letterSpacing: "-0.02em", color: "text.primary" }}
        >
          {title || "List"}
        </Typography>
      </Box>

      {/* Right Side Controls */}
      {/* Right Side Controls */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 1 }}
      >
        {/* Custom Header Controls */}
        {headerControls && (
          <Box sx={{ mr: 1 }}>{headerControls}</Box>
        )}

        {/* Search - Always Visible, Expands */}
        <StyledQuickFilter>
          <QuickFilterTrigger
            render={(triggerProps, state) => (
              <Tooltip title="Search" enterDelay={0}>
                <StyledToolbarButton
                  {...triggerProps}
                  ownerState={{ expanded: state.expanded }}
                  color="default"
                  aria-disabled={state.expanded}
                >
                  <SearchIcon fontSize="small" />
                </StyledToolbarButton>
              </Tooltip>
            )}
          />
          <QuickFilterControl
            render={({ ref, ...controlProps }, state) => (
              <StyledTextField
                {...controlProps}
                ownerState={{ expanded: state.expanded }}
                inputRef={ref}
                aria-label="Search"
                placeholder="Search..."
                size="small"
                sx={
                  {
                    // If expanded on mobile, it might need to overlay.
                    // simpler: just occupy space.
                  }
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: state.value ? (
                      <InputAdornment position="end">
                        <QuickFilterClear
                          edge="end"
                          size="small"
                          aria-label="Clear search"
                          material={{ sx: { marginRight: -0.75 } }}
                        >
                          <CancelIcon fontSize="small" />
                        </QuickFilterClear>
                      </InputAdornment>
                    ) : null,
                    ...controlProps.slotProps?.input,
                  },
                  ...controlProps.slotProps,
                }}
              />
            )}
          />
        </StyledQuickFilter>

        {/* MOBILE VIEW: Add Button -> Menu */}
        {isMobile && (
          <>
            {onAdd && (
              <Tooltip title="Add New">
                <IconButton
                  onClick={onAdd}
                  size="small"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    width: 32,
                    height: 32,
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={handleMobileMenuOpen} size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={isMobileMenuOpen}
              onClose={handleMobileMenuClose}
              PaperProps={{
                sx: { width: 200 },
              }}
            >
              <MenuItem>
                <ColumnsPanelTrigger
                  render={
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <ViewColumnIcon fontSize="small" sx={{ mr: 2 }} /> Columns
                    </Box>
                  }
                />
              </MenuItem>
              <MenuItem>
                <FilterPanelTrigger
                  render={(props, state) => (
                    <Box
                      {...props}
                      sx={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <Badge
                        badgeContent={state.filterCount}
                        color="primary"
                        variant="dot"
                        sx={{ mr: 2 }}
                      >
                        <FilterListIcon fontSize="small" />
                      </Badge>
                      Filters
                    </Box>
                  )}
                />
              </MenuItem>

              {refetch && (
                <MenuItem
                  onClick={() => {
                    refetch();
                    handleMobileMenuClose();
                  }}
                >
                  <RefreshIcon fontSize="small" sx={{ mr: 2 }} /> Refresh
                </MenuItem>
              )}

              {showExport && (
                <MenuItem
                  onClick={(e) => {
                    handleMobileMenuClose();
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <FileDownloadIcon fontSize="small" sx={{ mr: 2 }} /> Export
                  </Box>
                </MenuItem>
              )}
            </Menu>
          </>
        )}

        {/* DESKTOP VIEW: Divider -> Actions Box -> Add Button */}
        {!isMobile && (
          <>
            <Divider
              orientation="vertical"
              flexItem
              variant="middle"
              sx={{ height: 24, alignSelf: "center", mx: 0.5 }}
            />
            <Box
              sx={{
                display: "flex",
                bgcolor: "action.hover",
                borderRadius: "4px",
                p: 0.5,
              }}
            >
              <Tooltip title="Columns">
                <ColumnsPanelTrigger
                  render={
                    <IconButton size="small">
                      <ViewColumnIcon fontSize="small" />
                    </IconButton>
                  }
                />
              </Tooltip>
              <Tooltip title="Filters">
                <FilterPanelTrigger
                  render={(props, state) => (
                    <IconButton
                      {...props}
                      size="small"
                      color={state.filterCount > 0 ? "primary" : "default"}
                    >
                      <Badge
                        badgeContent={state.filterCount}
                        color="primary"
                        variant="dot"
                      >
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  )}
                />
              </Tooltip>
              {/* Export */}
              {showExport && (
                <>
                  <Tooltip title="Export">
                    <IconButton
                      ref={exportMenuTriggerRef}
                      onClick={() => setExportMenuOpen(true)}
                      size="small"
                    >
                      <FileDownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={exportMenuTriggerRef.current}
                    open={exportMenuOpen}
                    onClose={() => setExportMenuOpen(false)}
                  >
                    <ExportPrint
                      render={<MenuItem />}
                      onClick={() => setExportMenuOpen(false)}
                    >
                      Print
                    </ExportPrint>
                    <ExportCsv
                      render={<MenuItem />}
                      options={{
                        fileName: title ? title.replace(/\s+/g, "_") : "data", //  module name
                      }}
                      onClick={() => setExportMenuOpen(false)}
                    >
                      Download CSV
                    </ExportCsv>
                  </Menu>
                </>
              )}
              {/* Refresh */}
              {refetch && (
                <Tooltip title="Refresh">
                  <IconButton onClick={refetch} size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* DESKTOP ADD BUTTON: At the end */}
            {onAdd && (
              <Tooltip title="Add New">
                <IconButton
                  onClick={onAdd}
                  size="small"
                  sx={{
                    ml: 1,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    width: 36,
                    height: 36,
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </Box>
    </GridToolbarContainer>
  );
};

export default DataGridHeader;
