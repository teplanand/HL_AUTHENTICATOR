import { useState } from "react";
import { Button, ButtonProps, CircularProgress } from "@mui/material";

interface ApiActionButtonProps extends Omit<ButtonProps, "onClick"> {
  onApiCall: () => Promise<unknown> | unknown;
  loadingText?: string;
}

const ApiActionButton = ({
  onApiCall,
  loadingText = "Please wait...",
  children,
  disabled,
  ...props
}: ApiActionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onApiCall();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      {...props}
        variant="contained"
         
      onClick={handleClick}
      disabled={isLoading || disabled}
      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : props.startIcon}
      sx={{ borderRadius: 2, textTransform: "none", ...props.sx }}
    >
      {isLoading ? loadingText : children}
    </Button>
  );
};

export default ApiActionButton;