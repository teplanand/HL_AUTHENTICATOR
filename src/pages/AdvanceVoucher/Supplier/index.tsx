import React, { useState } from "react";
import { Box } from "@mui/material";
import { GridColDef, GridPaginationModel, GridSortModel, GridFilterModel } from "@mui/x-data-grid";
import { Page } from "../../../../shared/components/common/Page";
import ReusableDataGrid from "../../../../shared/components/common/ReusableDataGrid";

const DUMMY_SUPPLIERS = [
    { id: 1, supplier_code: "SUP001", supplier_name: "Tech Solutions", supplier_address: "123 Tech Park, CA", supplier_type: "Service" },
    { id: 2, supplier_code: "SUP002", supplier_name: "Global Parts Inc", supplier_address: "45 Industrial Area, NY", supplier_type: "Manufacturing" },
    { id: 3, supplier_code: "SUP003", supplier_name: "Logic Systems", supplier_address: "789 Innovation Hub, UK", supplier_type: "IT" },
    { id: 4, supplier_code: "SUP004", supplier_name: "BuildIt Corp", supplier_address: "101 Construction Way, TX", supplier_type: "Construction" },
    { id: 5, supplier_code: "SUP005", supplier_name: "Green Energy", supplier_address: "202 Solar Blvd, FL", supplier_type: "Energy" },
];

const SupplierPage: React.FC = () => {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 15,
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
        quickFilterValues: [],
    });

    const columns: GridColDef[] = [
        { field: "supplier_code", headerName: "Supplier Code", flex: 1, minWidth: 150 },
        { field: "supplier_name", headerName: "Supplier Name", flex: 1, minWidth: 200 },
        { field: "supplier_address", headerName: "Supplier Address", flex: 1.5, minWidth: 250 },
        { field: "supplier_type", headerName: "Supplier Type", flex: 1, minWidth: 150 },
    ];

    return (
        <Page module="master">
            <Box className="p-0">
                <ReusableDataGrid
                    rows={DUMMY_SUPPLIERS}
                    columns={columns}
                    totalCount={DUMMY_SUPPLIERS.length}
                    loading={false}
                    paginationModel={paginationModel}
                    setPaginationModel={setPaginationModel}
                    sortModel={sortModel}
                    setSortModel={setSortModel}
                    filterModel={filterModel}
                    setFilterModel={setFilterModel}
                    title="Supplier List"
                    permissions={{
                        create: false, // No Add button
                        edit: false,
                        delete: false,
                        download: true,
                    }}
                />
            </Box>
        </Page>
    );
};

export default SupplierPage;
