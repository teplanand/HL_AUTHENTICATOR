import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Add, Close, Search } from "@mui/icons-material";

interface TableHeaderProps {
  title?: string; // Optional title
  subtitle?: string; // Optional subtitle
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  title = "Books",
  subtitle = "Manage your book records",
  searchTerm,
  onSearchChange,
  onAddClick,
}) => {
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<Add />} onClick={onAddClick}>
          New Book
        </Button>
      </Box>

      <Card>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            size="small"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => onSearchChange("")} size="small">
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { backgroundColor: "background.default", width: "320px" },
            }}
          />
        </Box>
      </Card>
    </>
  );
};

export default TableHeader;
