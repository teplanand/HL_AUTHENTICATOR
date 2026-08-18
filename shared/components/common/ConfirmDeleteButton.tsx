import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Button, type ButtonProps } from "@mui/material";

import { useConfirmation } from "../../hooks/useConfirmation";
import { useToast } from "../../hooks/useToast";

type ConfirmDeleteButtonProps = Omit<ButtonProps, "onClick"> & {
  entityLabel: string;
  successMessage?: string;
  confirmTitle?: string;
  confirmMessage?: string;
  onDelete: () => Promise<void> | void;
};

export default function ConfirmDeleteButton({
  entityLabel,
  successMessage,
  confirmTitle,
  confirmMessage,
  onDelete,
  children = "Delete",
  ...buttonProps
}: ConfirmDeleteButtonProps) {
  const { openConfirmation, closeConfirmation } = useConfirmation();
  const { showToast } = useToast();

  const handleClick = () => {
    openConfirmation({
      title: confirmTitle || `Delete ${entityLabel}`,
      message: confirmMessage || `Are you sure you want to delete this ${entityLabel.toLowerCase()}?`,
      action: async () => {
        try {
          await onDelete();
          if (successMessage) {
            showToast(successMessage, "success");
          }
        } finally {
          closeConfirmation();
        }
      },
    });
  };

  return (
    <Button
      variant="text"
      color="error"
      startIcon={<DeleteOutlineIcon />}
      onClick={handleClick}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
        ...buttonProps.sx,
      }}
      {...buttonProps}
    >
      
    </Button>
  );
}
