import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
} from '@mui/material';
import { useMemo } from 'react';

interface TableProps {
  recordsData: any[];
  columns: any[];
  pageSize: number;
  page: number;
  setPage: (page: number) => void;
  PAGE_SIZES: number[];
  setPageSize: (size: number) => void;
  sortStatus: { columnAccessor: string; direction: 'asc' | 'desc' };
  setSortStatus: (status: { columnAccessor: string; direction: 'asc' | 'desc' }) => void;
  totalRecords?: number;
  enableColumnReorder?: boolean;
  enableColumnResizing?: boolean;
  ref?: any;
  striped?: boolean;
}

const CustomTable = ({
  recordsData,
  columns,
  pageSize,
  page,
  setPage,
  PAGE_SIZES,
  setPageSize,
  sortStatus,
  setSortStatus,
  totalRecords,
  striped = true,
}: TableProps) => {
  const handleSort = (columnAccessor: string) => {
    const isAsc = sortStatus.columnAccessor === columnAccessor && sortStatus.direction === 'asc';
    setSortStatus({
      columnAccessor,
      direction: isAsc ? 'desc' : 'asc',
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedData = useMemo(() => {
    if (!sortStatus.columnAccessor) return recordsData;

    return [...recordsData].sort((a, b) => {
      const aValue = a[sortStatus.columnAccessor];
      const bValue = b[sortStatus.columnAccessor];
      
      if (aValue < bValue) {
        return sortStatus.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortStatus.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [recordsData, sortStatus]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table
            sx={{
              minWidth: 650,
              '& .MuiTableRow-root:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            size="medium"
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.accessor}
                    sortDirection={sortStatus.columnAccessor === column.accessor ? sortStatus.direction : false}
                    sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}
                  >
                    <TableSortLabel
                      active={sortStatus.columnAccessor === column.accessor}
                      direction={sortStatus.columnAccessor === column.accessor ? sortStatus.direction : 'asc'}
                      onClick={() => handleSort(column.accessor)}
                    >
                      {column.title}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                    No results match your search query
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: striped && index % 2 === 0 ? 'grey.50' : 'transparent',
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.accessor}>
                        {column.render ? column.render(row) : row[column.accessor]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={PAGE_SIZES}
          component="div"
          count={totalRecords || recordsData.length}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            `Showing ${from} to ${to} of ${count !== -1 ? count : `more than ${to}`} entries`
          }
        />
      </Paper>
    </Box>
  );
};

export default CustomTable;