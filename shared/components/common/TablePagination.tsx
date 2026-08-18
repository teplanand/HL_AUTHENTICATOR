// components/common/TablePagination.tsx
import React from "react";
import { TablePagination as MuiTablePagination } from "@mui/material";

interface TablePaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowsPerPageOptions?: number[];
}

const TablePagination: React.FC<TablePaginationProps> = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [15, 25, 50, 100],
}) => {
  if (count === 0) return null;

  return (
    <MuiTablePagination
      rowsPerPageOptions={rowsPerPageOptions}
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        "& .MuiTablePagination-toolbar": {
          px: 2,
          py: 1,
        },
        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
          {
            fontSize: 14,
          },
      }}
    />
  );
};

export default TablePagination;