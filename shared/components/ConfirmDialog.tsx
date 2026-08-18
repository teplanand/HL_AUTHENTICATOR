// components/common/ConfirmDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  IconButton,
  useTheme,
  Typography,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: "error" | "warning" | "info" | "success";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  severity = "warning",
}) => {
  const theme = useTheme();

  const getColor = () => {
    switch (severity) {
      case "error":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      case "success":
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getIcon = () => {
    switch (severity) {
      case "error":
        return <ErrorIcon sx={{ color: getColor(), fontSize: 24 }} />;
      case "warning":
        return <WarningIcon sx={{ color: getColor(), fontSize: 24 }} />;
      case "success":
        return <SuccessIcon sx={{ color: getColor(), fontSize: 24 }} />;
      default:
        return <InfoIcon sx={{ color: getColor(), fontSize: 24 }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "4px" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 0.5,
          pt: 1.5,
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {getIcon()}
          <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
            {title}
          </Typography>
        </Box>
        <IconButton onClick={onCancel} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, px: 2, pb: 1 }}>
        <DialogContentText sx={{ color: "text.primary", lineHeight: 1.5, fontSize: "0.9rem" }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, gap: 1 }}>
        <Button
          onClick={onCancel}
          color="inherit"
          variant="outlined"
          size="small"
          sx={{ borderRadius: "4px", textTransform: "none" }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={severity}
          variant="contained"
          size="small"
          autoFocus
          sx={{ borderRadius: "4px", fontWeight: 500, textTransform: "none" }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
