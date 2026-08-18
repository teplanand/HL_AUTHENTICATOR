import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Breadcrumbs,
    Link,
    SelectChangeEvent,
} from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useToast } from "../../../../shared/hooks/useToast";

const CreateRequisition = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        requestType: "supplier",
        supplierName: "",
        poNo: "",
        poAmount: "",
        advanceAmount: "",
        reason: "",
        paymentMode: "neft",
        organization: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        showToast("Requisition Created Successfully (Mock)", "success");
        navigate("/supplier-payment"); // Redirect back to dashboard
    };

    return (
        <Box className="mx-auto max-w-[1200px] p-6">
            {/* Breadcrumbs */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                className="mb-6"
            >
                <Link
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate("/supplier-payment")}
                    className="flex cursor-pointer items-center"
                >
                    Dashboard
                </Link>
                <Typography color="text.primary">Create Requisition</Typography>
            </Breadcrumbs>

            <Box className="mb-8 flex items-center gap-4">
                <IconButtonBack onClick={() => navigate(-1)} />
                <Typography variant="h4" className="font-outfit font-bold">
                    Create New Requisition
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Card className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <CardContent className="p-8">
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Request Type</InputLabel>
                                    <Select
                                        name="requestType"
                                        value={formData.requestType}
                                        label="Request Type"
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value="supplier">Supplier Payment</MenuItem>
                                        <MenuItem value="internal">Internal Payment</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Organization</InputLabel>
                                    <Select
                                        name="organization"
                                        value={formData.organization}
                                        label="Organization"
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value="org1">Organization 1</MenuItem>
                                        <MenuItem value="org2">Organization 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Supplier Name"
                                    name="supplierName"
                                    value={formData.supplierName}
                                    onChange={handleChange}
                                    required={formData.requestType === "supplier"}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="PO Number"
                                    name="poNo"
                                    value={formData.poNo}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="PO Amount"
                                    name="poAmount"
                                    type="number"
                                    value={formData.poAmount}
                                    onChange={handleChange}
                                    InputProps={{ startAdornment: "₹" }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Advance Amount Required"
                                    name="advanceAmount"
                                    type="number"
                                    value={formData.advanceAmount}
                                    onChange={handleChange}
                                    required
                                    InputProps={{ startAdornment: "₹" }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Payment Mode</InputLabel>
                                    <Select
                                        name="paymentMode"
                                        value={formData.paymentMode}
                                        label="Payment Mode"
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value="neft">NEFT / RTGS</MenuItem>
                                        <MenuItem value="cheque">Cheque</MenuItem>
                                        <MenuItem value="cash">Cash</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Reason / Remarks"
                                    name="reason"
                                    multiline
                                    rows={4}
                                    value={formData.reason}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>

                        <Box className="mt-8 flex justify-end gap-4">
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<SaveIcon />}
                                className="bg-brand-500 px-8 text-white hover:bg-[#B84A1C]"
                            >
                                Submit Request
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </form>
        </Box>
    );
};

const IconButtonBack = ({ onClick }: { onClick: () => void }) => (
    <Box
        onClick={onClick}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:bg-gray-200"
    >
        <ArrowBackIcon className="text-[#4b5563]" />
    </Box>
);

export default CreateRequisition;
