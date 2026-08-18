// components/common/ErrorAlert.tsx
import React from "react";
import { Alert, Button, Box } from "@mui/material";

interface ErrorAlertProps {
  error: any;
  onRetry?: () => void;
  message?: string;
  retryText?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  message = "Failed to load data. Please try again.",
  retryText = "Retry",
}) => {
  if (!error) return null;

  return (
    <Alert
      severity="error"
      sx={{
        mb: 0,
        borderRadius: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            {retryText}
          </Button>
        )
      }
    >
      {message}
    </Alert>
  );
};

export default ErrorAlert;
