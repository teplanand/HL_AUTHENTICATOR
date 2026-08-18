import React from "react";
import { keyframes } from "@emotion/react";
import { Box, Typography } from "@mui/material";
import logo from "../../assets/logo1.png";

const pulseRipple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const breathe = keyframes`
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }

  50% {
    transform: scale(1.1);
    filter: brightness(1.1);
  }
`;

const spin = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const fadeText = keyframes`
  0%, 100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
`;

const Loader: React.FC = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: (theme) => theme.palette.mode === 'dark' ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        transition: "opacity 0.3s ease",
      }}
    >
      <Box sx={{ position: "relative", width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Pulse Effect Background */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: (theme) =>
              `radial-gradient(circle, ${theme.palette.primary.main}20 0%, transparent 70%)`,
            animation: `${pulseRipple} 2s linear infinite`,
          }}
        />

        {/* Logo with breathing animation */}
        <Box
          component="img"
          src={logo}
          alt="Loading"
          sx={{
            width: 50,
            height: "auto",
            zIndex: 10,
            animation: `${breathe} 2s ease-in-out infinite`,
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
          }}
        />

        {/* Rotating Arc Ring (SVG) */}
        <Box
          component="svg"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            animation: `${spin} 1.5s linear infinite`,
          }}
        >
          <defs>
            <linearGradient id="gradientArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F37440" stopOpacity="1" />
              <stop offset="100%" stopColor="#F37440" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradientArc)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="200" // Approx 70% of circumference
            strokeDashoffset="0"
            className="[transform-origin:center]"
          />
        </Box>
      </Box>

      {/* Modern Text */}
      <Typography
        variant="button"
        sx={{
          mt: 3,
          fontWeight: 700,
          color: "primary.main",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontSize: "0.85rem",
          animation: `${fadeText} 2s ease-in-out infinite`,
        }}
      >
        Loading
      </Typography>
    </Box>
  );
};

export default Loader;
