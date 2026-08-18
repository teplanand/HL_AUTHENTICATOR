import React, { useState } from "react";
import { Box } from "@mui/material";
import { GridColDef, GridPaginationModel, GridSortModel, GridFilterModel } from "@mui/x-data-grid";
import { Page } from "../../../../shared/components/common/Page";
import ReusableDataGrid from "../../../../shared/components/common/ReusableDataGrid";

const DUMMY_PO_ITEMS = [
    { id: 1, item_code: "ITM-001", item_desc: "Industrial Valve - High Pressure", item_qty: 100, trn_currency: "USD", item_amount: 5000 },
    { id: 2, item_code: "ITM-002", item_desc: "Safety Gasket - Viton", item_qty: 200, trn_currency: "USD", item_amount: 1000 },
    { id: 3, item_code: "ITM-003", item_desc: "Hydraulic Pump Controller", item_qty: 50, trn_currency: "EUR", item_amount: 12500 },
    { id: 4, item_code: "ITM-004", item_desc: "Steel Pipes - 10m", item_qty: 20, trn_currency: "INR", item_amount: 45000 },
    { id: 5, item_code: "ITM-005", item_desc: "Control Panel Interface", item_qty: 10, trn_currency: "USD", item_amount: 3500 },
];

const POPage: React.FC = () => {
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
        { field: "item_code", headerName: "Item Code", flex: 1, minWidth: 120 },
        { field: "item_desc", headerName: "Item Description", flex: 1.5, minWidth: 250 },
        { field: "item_qty", headerName: "Quantity", flex: 0.5, minWidth: 100, type: 'number', align: 'right', headerAlign: 'right' },
        { field: "trn_currency", headerName: "Currency", flex: 0.5, minWidth: 100, align: 'center', headerAlign: 'center' },
        {
            field: "item_amount",
            headerName: "Amount",
            flex: 1,
            minWidth: 150,
            type: 'number',
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (value) =>
                (value as number).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        },
    ];

    return (
        <Page module="master">
            <Box className="p-0">
                <ReusableDataGrid
                    rows={DUMMY_PO_ITEMS}
                    columns={columns}
                    totalCount={DUMMY_PO_ITEMS.length}
                    loading={false}
                    paginationModel={paginationModel}
                    setPaginationModel={setPaginationModel}
                    sortModel={sortModel}
                    setSortModel={setSortModel}
                    filterModel={filterModel}
                    setFilterModel={setFilterModel}
                    title="Purchase Order Items"
                    permissions={{
                        create: false,
                        edit: false,
                        delete: false,
                        download: true
                    }}
                />
            </Box>
        </Page>
    );
};

export default POPage;
