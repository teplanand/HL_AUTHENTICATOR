// // src/pages/Rooms/RoomTypes.tsx
// import React, { useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   CircularProgress,
//   Alert,
//   Chip,
// } from "@mui/material";
// import { Add as AddIcon } from "@mui/icons-material";
// import { useTheme } from "@mui/material/styles";
// import { css } from "@emotion/react";
// import {
//   useDeleteRoomTypeMutation,
//   useGetRoomTypesQuery,
// } from "../../redux/api/rooms";

// const RoomTypes: React.FC = () => {
//   const theme = useTheme();
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [openForm, setOpenForm] = useState(false);
//   const [editingRoomType, setEditingRoomType] = useState<any>(null);

//   const { data: roomTypes = [], error, isLoading } = useGetRoomTypesQuery();
//   const [deleteRoomType] = useDeleteRoomTypeMutation();

//   const handleAdd = () => {
//     setEditingRoomType(null);
//     setOpenForm(true);
//   };

//   const handleEdit = (roomType: any) => {
//     setEditingRoomType(roomType);
//     setOpenForm(true);
//   };

//   const handleDelete = async (row: any) => {
//     if (window.confirm("Are you sure you want to delete this room type?")) {
//       try {
//         await deleteRoomType(row.id).unwrap();
//       } catch (error) {
//         console.error("Failed to delete room type:", error);
//       }
//     }
//   };

//   const handleCloseForm = () => {
//     setOpenForm(false);
//     setEditingRoomType(null);
//   };

//   const handleSuccess = () => {
//     handleCloseForm();
//   };

//   const headerStyles = css`
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: ${theme.spacing(2)};
//     padding: ${theme.spacing(2)};
//     background-color: ${theme.palette.background.paper};
//     border-radius: ${theme.shape.borderRadius}px;
//   `;

//   if (isLoading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="400px"
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Alert severity="error" sx={{ mt: 2 }}>
//         Error loading room types. Please try again.
//       </Alert>
//     );
//   }

//   // Columns for GenericTable
//   const columns = [
//     { field: "name", headerName: "Name" },
//     { field: "description", headerName: "Description" },
//     {
//       field: "capacity",
//       headerName: "Capacity",
//       render: (row: any) => (
//         <Chip label={row.capacity} color="primary" variant="outlined" />
//       ),
//     },
//     {
//       field: "amenities",
//       headerName: "Amenities",
//       render: (row: any) =>
//         row.amenities ? Object.keys(row.amenities).join(", ") : "No amenities",
//     },
//   ];

//   return (
//     <Box>
//       <Box css={headerStyles}>
//         <Typography variant="h4" component="h1">
//           Room Types
//         </Typography>
//         <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
//           Add Room Type
//         </Button>
//       </Box>

//       <GenericTable
//         columns={columns}
//         rows={roomTypes}
//         loading={isLoading}
//         page={page}
//         rowsPerPage={rowsPerPage}
//         onPageChange={setPage}
//         onRowsPerPageChange={setRowsPerPage}
//         onEdit={handleEdit}
//         onDelete={handleDelete}
//       />

//       <RoomTypeForm
//         open={openForm}
//         onClose={handleCloseForm}
//         onSuccess={handleSuccess}
//         roomType={editingRoomType}
//       />
//     </Box>
//   );
// };

// export default RoomTypes;


export const GenericTable = () => {
  return (
    <div>GenericTable</div>
  )
}


