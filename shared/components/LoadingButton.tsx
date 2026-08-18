// components/common/LoadingButton.tsx
import React from "react";
import { Button, ButtonProps, CircularProgress } from "@mui/material";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  children,
  disabled,
  startIcon,
  ...props
}) => {
  return (
    <Button
      disabled={loading || disabled}
      startIcon={
        loading ? <CircularProgress size={16} color="inherit" /> : startIcon
      }
      {...props}
      sx={{
        borderRadius: "4px",
        textTransform: "none",
        fontWeight: 600,
        ...props.sx,
      }}
    >
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};

export default LoadingButton;
