// src/components/common/DialogWrapper.tsx
import React from "react";
import { Dialog, DialogTitle, IconButton, Slide } from "@mui/material";
import { Close } from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface DialogWrapperProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

const DialogWrapper: React.FC<DialogWrapperProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = "md",
}) => {
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      maxWidth={maxWidth}
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{ sx: { borderRadius: '4px', overflow: "hidden" } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          fontWeight: 600,
          py: 1,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 20,
        }}
      >
        {title}
        <IconButton edge="end" onClick={onClose} sx={{ color: "white", ml: 2 }}>
          <Close />
        </IconButton>
      </DialogTitle>

      {children}

      {/* Footer */}
    </Dialog>
  );
};

export default DialogWrapper;
