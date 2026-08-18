import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  Box,
  TextField,
  MenuItem,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  Checkbox,
  IconButton,
  Tooltip,
  InputAdornment,
  Autocomplete,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import { useToast } from "../../../../shared/hooks/useToast";

interface CreateRequisitionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface POItem {
  id: number;
  pr: string;
  poProduct: string;
  description: string;
  productPrice: number;
  productQty: number;
  currency: string;
  poAmount: number;
  updatedQty: number;
  updatedAmount: number;
  buyer: string;
  selected: boolean;
}


//test
const MOCK_SUPPLIERS = [
  {
    code: "SUP001",
    name: "Tech Solutions",
    address: "123 Tech Park, Silicon Valley, CA",
    type: "Service",
    defaultSite: "Mumbai HQ",
  },
  {
    code: "SUP002",
    name: "Global Parts Inc",
    address: "45 Industrial Area, New York, NY",
    type: "Manufacturing",
    defaultSite: "New York Plant",
  },
  {
    code: "SUP003",
    name: "Logic Systems",
    address: "789 Innovation Hub, London, UK",
    type: "IT",
    defaultSite: "London Office",
  },
];

const CreateRequisitionModal: React.FC<CreateRequisitionModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { showToast } = useToast();
  const theme = useTheme(); // Access strict MUI theme

  // --- State ---
  const [requestType, setRequestType] = useState<"PO" | "NON-PO">("PO");
  const [supplier, setSupplier] = useState("");
  const [supplierSite, setSupplierSite] = useState("");

  // PO Section State
  const [poNumberInput, setPoNumberInput] = useState("");
  const [isTableVisible, setIsTableVisible] = useState(false);

  const [poItems, setPoItems] = useState<POItem[]>([
    {
      id: 1,
      pr: "10",
      poProduct: "ITM-001",
      description: "Industrial Valve - High Pressure",
      productQty: 100,
      productPrice: 50,
      currency: "USD",
      poAmount: 5000,
      updatedQty: 0,
      updatedAmount: 0,
      buyer: "John Doe",
      selected: false,
    },
    {
      id: 2,
      pr: "15",
      poProduct: "ITM-002",
      description: "Safety Gasket - Viton",
      productQty: 200,
      productPrice: 5,
      currency: "USD",
      poAmount: 1000,
      updatedQty: 0,
      updatedAmount: 0,
      buyer: "Jane Smith",
      selected: false,
    },
    {
      id: 3,
      pr: "25",
      poProduct: "ITM-003",
      description: "Hydraulic Pump Controller",
      productQty: 50,
      productPrice: 250,
      currency: "USD",
      poAmount: 12500,
      updatedQty: 0,
      updatedAmount: 0,
      buyer: "John Doe",
      selected: false,
    },
  ]);

  // Non-PO State
  const [nonPoItem, setNonPoItem] = useState({
    description: "",
    totalAmount: 0,
    requestAmount: 0,
    remarks: "",
  });

  // Additional
  const [attachments, setAttachments] = useState<File[]>([]);

  // --- Computed Values ---

  const totalSelectedAmount = useMemo(() => {
    return poItems
      .filter((i) => i.selected)
      .reduce((acc, curr) => acc + curr.updatedAmount, 0);
  }, [poItems]);

  // --- Handlers ---

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setPoItems((prev) =>
      prev.map((item) => ({ ...item, selected: checked })),
    );
  };

  const handleToggleItem = (id: number) => {
    setPoItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const handleQtyChange = (id: number, val: string) => {
    const qty = Number(val);
    if (qty < 0) return;

    setPoItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const unitPrice = item.productPrice;
          return {
            ...item,
            updatedQty: qty,
            updatedAmount: qty * unitPrice,
          };
        }
        return item;
      }),
    );
  };

  const handleGetPODetails = () => {
    if (!poNumberInput) {
      showToast("Please enter a PO Number", "warning");
      return;
    }
    setIsTableVisible(true);
  };

  const handleRefreshSupplier = () => {
    showToast("Refreshing Supplier Data (Mock)...", "info");
  };

  const handleSubmit = () => {
    if (!supplier) {
      showToast("Please select a supplier.", "error");
      return;
    }
    if (requestType === "PO" && totalSelectedAmount <= 0) {
      showToast(
        "Please select at least one item and enter a quantity.",
        "error",
      );
      return;
    }
    onSubmit({
      requestType,
      supplier,
      poItems: poItems.filter((i) => i.selected),
      totalAmount: totalSelectedAmount,
    });
  };

  // Helper styles for consistency
  const paperStyle = {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  };
  const defaultBgStyle = {
    backgroundColor: theme.palette.background.default,
  };
  const borderStyle = {
    borderColor: theme.palette.divider,
  };

  // Check selection state
  const isAllSelected = poItems.length > 0 && poItems.every((item) => item.selected);
  const isIndeterminate = poItems.some((item) => item.selected) && !isAllSelected;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "4px",
          overflow: "hidden",
          ...paperStyle, // STRICT THEME COLOR
        },
      }}
    >
      {/* --- Dialog Title --- */}
      <Box
        component="div"
        className="flex justify-between items-center p-4 border-b"
        sx={{ ...paperStyle, ...borderStyle }}
      >
        <div>
          <Typography variant="h6" fontWeight={700}>
            Create Requisition
          </Typography>
        </div>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        {/* --- Top Fixed Header Section --- */}
        <Box
          component="div"
          className="p-4 border-b shadow-sm z-10"
          sx={{ ...paperStyle, ...borderStyle }}
        >
          <div className="grid grid-cols-12 gap-4">
            {/* Row 1 */}
            <div className="col-span-12 md:col-span-2">
              <TextField
                fullWidth
                label="PR Ref No"
                name="req_ref_code"
                value="202526/12/1"
                disabled
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <TextField
                fullWidth
                label="Date"
                value={new Date().toLocaleDateString()}
                disabled
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              />
            </div>

            {/* Supplier Section */}
            <div className="col-span-12 md:col-span-4 flex items-center gap-2">
              <Autocomplete
                options={MOCK_SUPPLIERS}
                getOptionLabel={(option) => `${option.name} (${option.code})`}
                value={MOCK_SUPPLIERS.find((s) => s.code === supplier) || null}
                onChange={(_, newValue) => {
                  setSupplier(newValue ? newValue.code : "");
                  setSupplierSite(newValue ? newValue.defaultSite : "");
                }}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Supplier Name / Code"
                    size="small"
                    placeholder="Search..."
                    fullWidth
                  />
                )}
              />
              <Tooltip title="Refresh Suppliers">
                <IconButton
                  onClick={handleRefreshSupplier}
                  size="small"
                  sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
                >
                  <RefreshIcon fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
            </div>

            <div className="col-span-12 md:col-span-4">
              <TextField
                fullWidth
                label="Supplier Address"
                value={
                  MOCK_SUPPLIERS.find((s) => s.code === supplier)?.address || ""
                }
                disabled
                size="small"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              />
            </div>

            {/* Row 2 */}
            <div className="col-span-12 md:col-span-3">
              <TextField
                fullWidth
                label="Supplier Type"
                value={
                  MOCK_SUPPLIERS.find((s) => s.code === supplier)?.type || ""
                }
                disabled
                size="small"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <TextField
                fullWidth
                label="Supplier Site"
                placeholder="Enter Site"
                value={supplierSite}
                onChange={(e) => setSupplierSite(e.target.value)}
                size="small"
              />
            </div>

            {/* Requisition Type & PO Number */}
            <Box
              component="div"
              className="col-span-12 md:col-span-6 flex items-center gap-4 pl-4"
              sx={{ borderLeft: `1px solid ${theme.palette.divider}` }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  color: theme.palette.text.secondary,
                }}
              >
                Type:
              </Box>
              <RadioGroup
                row
                value={requestType}
                onChange={(e) =>
                  setRequestType(e.target.value as "PO" | "NON-PO")
                }
              >
                <FormControlLabel
                  value="PO"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">PO Based</Typography>}
                />
                <FormControlLabel
                  value="NON-PO"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">Non-PO</Typography>}
                />
              </RadioGroup>

              {requestType === "PO" && (
                <div className="ml-auto flex items-center gap-2">
                  <TextField
                    label="PO Number"
                    size="small"
                    value={poNumberInput}
                    onChange={(e) => setPoNumberInput(e.target.value)}
                    placeholder="12345"
                    sx={{ width: 120 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleGetPODetails}
                    size="small"
                    disableElevation
                    sx={{ minWidth: 80 }}
                  >
                    Get
                  </Button>
                </div>
              )}
            </Box>
          </div>
        </Box>

        {/* --- Main Content Split --- */}
        <Box component="div" className="flex flex-1 overflow-hidden" sx={defaultBgStyle}>
          {/* Left: Table Section */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            {requestType === "PO" && isTableVisible ? (
              <Box
                component="div"
                className="flex-1 flex flex-col overflow-hidden rounded-lg shadow-sm"
                sx={{
                  ...paperStyle,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <TableContainer className="flex-1 overflow-y-auto">
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          padding="checkbox"
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          <Checkbox
                            size="small"
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Product
                        </TableCell>
                        <TableCell
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Description
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Price
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          PO Qty
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Amount
                        </TableCell>
                        <TableCell
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Pending
                        </TableCell>
                        <TableCell
                          align="center"
                          width={100}
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Req Qty
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Req Amt
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {poItems.map((row) => (
                        <TableRow
                          key={row.id}
                          hover
                          selected={row.selected}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              checked={row.selected}
                              onChange={() => handleToggleItem(row.id)}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                            }}
                          >
                            {row.poProduct}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.875rem" }}>
                            {row.description}
                          </TableCell>
                          <TableCell align="right">
                            {row.productPrice.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">{row.productQty}</TableCell>
                          <TableCell align="right">
                            {row.poAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>{row.pr}</TableCell>
                          <TableCell align="center" sx={{ p: 1 }}>
                            <div className="flex justify-center">
                              <TextField
                                type="number"
                                size="small"
                                value={row.updatedQty}
                                onChange={(e) =>
                                  handleQtyChange(row.id, e.target.value)
                                }
                                disabled={!row.selected}
                                sx={{
                                  width: 60,
                                  "& .MuiOutlinedInput-root": {
                                    px: 0,
                                    fontSize: "0.875rem",
                                    backgroundColor: row.selected
                                      ? theme.palette.background.paper
                                      : theme.palette.action.hover,
                                    color: theme.palette.text.primary,
                                  },
                                  "& .MuiOutlinedInput-input": {
                                    p: "4px",
                                    textAlign: "center",
                                  },
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 600,
                              color: row.selected
                                ? "primary.main"
                                : "text.disabled",
                            }}
                          >
                            {row.updatedAmount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : requestType === "NON-PO" ? (
              <Box
                component="div"
                className="flex-1 flex flex-col overflow-hidden rounded-lg shadow-sm"
                sx={{
                  ...paperStyle,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <TableContainer className="flex-1 overflow-y-auto">
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          width="30%"
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Description / Service
                        </TableCell>
                        <TableCell
                          align="right"
                          width="20%"
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Est. Amount
                        </TableCell>
                        <TableCell
                          align="right"
                          width="20%"
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Req. Amount
                        </TableCell>
                        <TableCell
                          width="30%"
                          sx={{ bgcolor: "grey.100", fontWeight: 700 }}
                        >
                          Remarks
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ p: 2 }}>
                          <Select
                            fullWidth
                            size="small"
                            value={nonPoItem.description}
                            onChange={(e) =>
                              setNonPoItem({
                                ...nonPoItem,
                                description: e.target.value,
                              })
                            }
                            displayEmpty
                          >
                            <MenuItem value="" disabled>
                              <em>Select Type</em>
                            </MenuItem>
                            <MenuItem value="Consulting Services">
                              Consulting Services
                            </MenuItem>
                            <MenuItem value="Logistics Support">
                              Logistics Support
                            </MenuItem>
                            <MenuItem value="Office Maintenance">
                              Office Maintenance
                            </MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell align="right" sx={{ p: 2 }}>
                          <Typography fontWeight={500} color="textSecondary">
                            {(nonPoItem.description
                              ? 10000
                              : 0
                            ).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ p: 2 }}>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="0.00"
                            value={nonPoItem.requestAmount}
                            onChange={(e) =>
                              setNonPoItem({
                                ...nonPoItem,
                                requestAmount: Number(e.target.value),
                              })
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: 2 }}>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Remarks..."
                            value={nonPoItem.remarks}
                            onChange={(e) =>
                              setNonPoItem({
                                ...nonPoItem,
                                remarks: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Box
                component="div"
                className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl"
                sx={{
                  borderColor: theme.palette.divider,
                  backgroundColor: theme.palette.action.hover,
                }}
              >
                <SearchIcon
                  sx={{
                    fontSize: 48,
                    opacity: 0.2,
                    mb: 1,
                    color: theme.palette.text.secondary,
                  }}
                />
                <Typography variant="body1" color="textSecondary">
                  Enter PO Number & Click 'Get' to view items
                </Typography>
              </Box>
            )}
          </div>

          {/* Right: Summary Sidebar */}
          <Box
            component="div"
            className="w-80 p-5 flex flex-col justify-between shadow-lg z-20"
            sx={{
              ...paperStyle,
              borderLeft: `1px solid ${theme.palette.divider}`,
            }}
          >
            <div>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Summary
              </Typography>

              <Box
                component="div"
                className="p-4 rounded-lg border mb-6 space-y-3"
                sx={{
                  backgroundColor: theme.palette.background.default,
                  borderColor: theme.palette.divider,
                }}
              >
                <div className="flex justify-between items-center text-sm">
                  <Box component="span" sx={{ color: theme.palette.text.secondary }}>
                    Selected Items
                  </Box>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {poItems.filter((i) => i.selected).length}
                  </Box>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <Box component="span" sx={{ color: theme.palette.text.secondary }}>
                    Net Amount
                  </Box>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {totalSelectedAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Box>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <Box component="span" sx={{ color: theme.palette.text.secondary }}>
                    Tax (18%)
                  </Box>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {(totalSelectedAmount * 0.18).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Box>
                </div>
              </Box>

              <Box
                component="div"
                className="p-4 rounded-lg border"
                sx={{
                  backgroundColor: "rgba(243, 116, 64, 0.1)",
                  borderColor: "rgba(243, 116, 64, 0.2)",
                }}
              >
                <div className="flex justify-between items-end">
                  <Box
                    component="span"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                    }}
                  >
                    Total Payable
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 800,
                      fontSize: "1.5rem",
                    }}
                  >
                    {(totalSelectedAmount * 1.18).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Box>
                </div>
              </Box>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <Button
                onClick={handleSubmit}
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  boxShadow: 4,
                }}
              >
                Submit Requisition
              </Button>
              <Button
                onClick={onClose}
                fullWidth
                variant="outlined"
                color="inherit"
                sx={{ borderColor: "divider", color: "text.secondary" }}
              >
                Cancel
              </Button>
            </div>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRequisitionModal;
