import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface MuiDataGridTableProps {
    columns: GridColDef[];
    rows: any[];
    pageSize?: number;
    checkboxSelection?: boolean;
    borderRadius?: number;
}

const MuiDataGridTable: React.FC<MuiDataGridTableProps> = ({
    columns,
    rows,
    pageSize = 5,
    checkboxSelection = false,
    borderRadius = '4px',
}) => {

    return (
        <Box
            sx={{
                height: 400,
                width: "100%",
                borderRadius: borderRadius,
                overflow: "hidden",
                "& .MuiDataGrid-root": {
                    borderRadius: borderRadius,
                },
            }}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                initialState={{
                    pagination: { paginationModel: { pageSize } },
                }}
                checkboxSelection={checkboxSelection}
                disableRowSelectionOnClick
                autoHeight
            />
        </Box >
    );
};

export default MuiDataGridTable;
