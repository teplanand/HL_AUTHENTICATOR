import React from "react";
import { Box, Modal, Typography, IconButton } from "@mui/material";
import { CloseIcon } from "../icons";

interface CustomModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: number | string;
}

const CustomModal: React.FC<CustomModalProps> = ({
    open,
    onClose,
    title,
    children,
    width = 400,
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width,
                    bgcolor: "background.paper",
                    border: "2px solid #1976d2",
                    boxShadow: 24,
                    borderRadius: '4px',
                    p: 3,

                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 4,
                        borderBottom: "2px solid rgba(27, 27, 28, 0.4)"
                    }}
                >
                    {title && (
                        <Typography variant="h6" fontWeight="bold" >
                            {title}
                        </Typography>
                    )}
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                {children}
            </Box>
        </Modal>
    );
};

export default CustomModal;
