import React, { useState } from 'react';
import {
    Box,
    Collapse,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    Chip,
    Tooltip,
    Pagination,
    Stack,
    Card
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HeightIcon from "@mui/icons-material/Height";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
// Import dummy DataGridHeader just for visual consistency if needed, 
// though we might just build a similar header manually or pass simple props.
// Since DataGridHeader relies on GridToolbarProps, it's tied to DataGrid context.
// We will recreate a simple header that looks like DataGridHeader.

interface Requisition {
    id: string;
    requestRef: string;
    supplierName: string;
    poNo: string;
    poAmount: number;
    advanceAmount: number;
    status: string;
    date: string;
}

interface RequisitionCollapsibleTableProps {
    rows: Requisition[];
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    page: number;
    count: number;
    rowsPerPage: number;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

// Inner nested table data helper (Mock)
const getCheckDetails = (id: string) => [
    { name: `Industrial Valve - ${id}`, poQty: 100, reqQty: 50, pendingQty: 50, price: 1200, total: 60000 },
    { name: 'Safety Gasket', poQty: 200, reqQty: 100, pendingQty: 100, price: 500, total: 50000 },
];

function Row(props: { row: Requisition; onAccept: (id: string) => void; onReject: (id: string) => void }) {
    const { row, onAccept, onReject } = props;
    const [open, setOpen] = useState(false);

    // Status Chip Helper
    const getStatusChip = (status: string) => {
        let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
        let bgcolor = "#eee";
        let textcolor = "#333";

        switch (status) {
            case "Approved":
                color = "success";
                bgcolor = "#DEF7EC";
                textcolor = "#03543F";
                break;
            case "Rejected":
                color = "error";
                bgcolor = "#FDE8E8";
                textcolor = "#9B1C1C";
                break;
            case "Pending":
                color = "warning";
                bgcolor = "#FEF3C7";
                textcolor = "#92400E";
                break;
            default:
                bgcolor = "#E1EFFE";
                textcolor = "#1E429F";
        }

        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    backgroundColor: bgcolor,
                    color: textcolor,
                    fontWeight: 600,
                    height: 24,
                    fontSize: '0.75rem'
                }}
            />
        );
    };

    return (
        <React.Fragment>
            <TableRow
                sx={{
                    '& > *': { borderBottom: '1px solid #f1f5f9' },
                    bgcolor: open ? '#f8fafc' : 'inherit',
                    '&:hover': { bgcolor: '#f8fafc' },
                    transition: 'background-color 0.15s ease-in-out',
                    cursor: 'pointer'
                }}
                onClick={() => setOpen(!open)}
            >
                <TableCell className="w-[50px] py-0 pr-0 pl-4">
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(!open);
                        }}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontSize: '0.875rem', color: '#1e293b', py: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} fontSize="inherit">{row.requestRef}</Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', color: '#1e293b', py: 1.5 }}>{row.supplierName}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem', color: '#1e293b', py: 1.5 }}>{row.poNo}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.875rem', color: '#1e293b', py: 1.5 }}>₹{row.poAmount.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.875rem', color: '#1e293b', py: 1.5 }}>₹{row.advanceAmount.toLocaleString()}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem', color: '#1e293b', py: 1.5 }}>{getStatusChip(row.status)}</TableCell>
                <TableCell align="center" onClick={(e) => e.stopPropagation()} sx={{ py: 1.5 }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                            <IconButton
                                aria-label="expand row"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(!open);
                                }}
                            >
                                <VisibilityIcon color="info" fontSize='small' />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Accept">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onAccept(row.id); }}>
                                <CheckCircleIcon fontSize="small" color="success" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onReject(row.id); }}>
                                <CancelIcon fontSize="small" color="error" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="py-0" colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)' }}>
                            <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 700, color: '#475569', mb: 2 }}>
                                Product Details ({row.poNo})
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                    <TableRow sx={{ '& th': { fontWeight: 600, color: '#475569', fontSize: '0.8rem' } }}>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell align="right">PO Qty</TableCell>
                                        <TableCell align="right">Request Qty</TableCell>
                                        <TableCell align="right">Pending Qty</TableCell>
                                        <TableCell align="right">PO Price</TableCell>
                                        <TableCell align="right">Total Price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getCheckDetails(row.id).map((detailRow, index) => (
                                        <TableRow key={index} sx={{ '& td': { fontSize: '0.8rem', color: '#334155' } }}>
                                            <TableCell component="th" scope="row">
                                                {detailRow.name}
                                            </TableCell>
                                            <TableCell align="right">{detailRow.poQty}</TableCell>
                                            <TableCell align="right">{detailRow.reqQty}</TableCell>
                                            <TableCell align="right">{detailRow.pendingQty}</TableCell>
                                            <TableCell align="right">₹{detailRow.price.toLocaleString()}</TableCell>
                                            <TableCell align="right">₹{detailRow.total.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

const RequisitionCollapsibleTable: React.FC<RequisitionCollapsibleTableProps> = ({
    rows,
    onAccept,
    onReject,
    page,
    count,
    rowsPerPage,
    onPageChange
}) => {
    // Pagination calculation
    const pageCount = Math.ceil(count / rowsPerPage);

    return (
        <Card
            sx={{
                borderRadius: "4px",
                border: "none",
                boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.06)",
                // height: "calc(100vh - 250px)", // Adjust height as needed
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                bgcolor: '#fff',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'divider'
            }}
        >
            {/* Header / Toolbar Area - Mimicking DataGridHeader */}
            <Box sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: 64
            }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}>
                    Requisitions List
                </Typography>
                {/* Add any toolbar actions here if needed */}
            </Box>

            <TableContainer sx={{ flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: '8px', height: '8px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: '4px' } }}>
                <Table stickyHeader aria-label="collapsible table">
                    <TableHead>
                        <TableRow sx={{
                            '& th': {
                                bgcolor: '#f8fafc',
                                borderBottom: '2px solid #e2e8f0',
                                color: '#475569',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                py: '12px'
                            }
                        }}>
                            <TableCell className="w-[50px]" />
                            <TableCell>Request Ref</TableCell>
                            <TableCell>Supplier Name</TableCell>
                            <TableCell>PO No</TableCell>
                            <TableCell align="right">PO Amount</TableCell>
                            <TableCell align="right">Advance Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <Row key={row.id} row={row} onAccept={onAccept} onReject={onReject} />
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                    <Typography color="textSecondary">No records found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Footer / Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Pagination
                    count={pageCount}
                    page={page}
                    onChange={onPageChange}
                    color="primary"
                    shape="rounded"
                    size='small'
                />
            </Box>
        </Card>
    );
};

export default RequisitionCollapsibleTable;
