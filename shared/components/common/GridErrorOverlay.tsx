import React from "react";
import { alpha, styled, lighten } from "@mui/material/styles";

const StyledDiv = styled("div")(({ theme: t }) => ({
    position: "absolute",
    zIndex: 10,
    fontSize: "0.875em",
    top: 0,
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    border: `1px solid ${lighten(alpha(t.palette.divider, 1), 0.88)}`,
    backgroundColor: t.palette.background.default,
}));

interface GridErrorOverlayProps {
    error: string | null;
}

const GridErrorOverlay: React.FC<GridErrorOverlayProps> = ({ error }) => {
    if (!error) return null;
    return <StyledDiv>{error}</StyledDiv>;
};

export default GridErrorOverlay;
