import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

interface ActionButtonsProps {
  onEdit: () => void;
  disabled?: boolean;
  size?: "small" | "medium";
  editTooltip?: string;
}

const ActionButtonsEdit: React.FC<ActionButtonsProps> = ({
  onEdit,
  disabled = false,
  size = "small",
  editTooltip = "Edit",
}) => {
  return (
    <Tooltip title={editTooltip}>
      <IconButton
        onClick={onEdit}
        color="primary"
        size={size}
        disabled={disabled}
        sx={{
          color: "primary.main",
          "&:hover": {
            color: "primary.dark",
            backgroundColor: (theme) => theme.palette.action.hover,
          },
          transition: "all 0.2s",
          padding: "4px",
          "& .MuiSvgIcon-root": {
            fontSize: "18px",
          },
        }}
      >
        <EditOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ActionButtonsEdit;
