import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

interface ActionButtonsProps {
  onDelete: () => void;
  disabled?: boolean;
  size?: "small" | "medium";
  deleteTooltip?: string;
}

const ActionButtonsDelete: React.FC<ActionButtonsProps> = ({
  onDelete,
  disabled = false,
  size = "small",
  deleteTooltip = "Delete",
}) => {
  return (
    <Tooltip title={deleteTooltip}>
      <IconButton
        onClick={onDelete}
        color="error"
        size={size}
        disabled={disabled}
        sx={{
          color: "error.main",
          "&:hover": {
            color: "error.dark",
            backgroundColor: (theme) => theme.palette.action.hover,
          },
          "&.Mui-disabled": {
            color: "action.disabled",
          },
          transition: "all 0.2s",
          padding: "4px",
          "& .MuiSvgIcon-root": {
            fontSize: "18px",
          },
        }}
      >
        <DeleteOutlineOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ActionButtonsDelete;
