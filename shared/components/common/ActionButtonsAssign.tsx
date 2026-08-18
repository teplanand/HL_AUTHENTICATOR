import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

interface ActionButtonsProps {
  onAssign: () => void;
  disabled?: boolean;
  size?: "small" | "medium";
  assignTooltip?: string;
}

const ActionButtonsAssign: React.FC<ActionButtonsProps> = ({
  onAssign,
  disabled = false,
  size = "small",
  assignTooltip = "Assign Rights",
}) => {
  return (
    <Tooltip title={assignTooltip}>
      <IconButton
        onClick={onAssign}
        color="info"
        size={size}
        disabled={disabled}
        className="assign-icon-button"
      >
        <AssignmentOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ActionButtonsAssign;
