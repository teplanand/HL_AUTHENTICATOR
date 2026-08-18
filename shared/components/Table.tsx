import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Pagination,
  Box,
  Typography,
} from "@mui/material";

interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode; // custom cell render
}

interface CommonTableProps {
  columns: Column[];
  data: any[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  actions?: (row: any) => React.ReactNode;
}

const CommonTable: React.FC<CommonTableProps> = ({
  columns,
  data,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  actions,
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} sx={{ fontWeight: "bold" }}>
                {col.label}
              </TableCell>
            ))}
            {actions && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                <Typography>No records found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell align="center">{actions(row)}</TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {total > pageSize && (
        <Box display="flex" justifyContent="flex-end" p={2}>
          <Pagination
            count={Math.ceil(total / pageSize)}
            page={page}
            onChange={(_, val) => onPageChange(val)}
          />
        </Box>
      )}
    </TableContainer>
  );
};

export default CommonTable;
