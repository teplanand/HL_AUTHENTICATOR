import React from "react";
import { Link } from "react-router";
import GridShape from "../components/common/GridShape";
import { Box, Typography, Button } from "@mui/material";

export default function AccessDenied() {
  return (
    <Box className="relative z-[1] flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 p-6 text-gray-900 dark:bg-gray-dark dark:text-white">
      <GridShape />
      <Box className="mx-auto w-full max-w-[400px] text-center sm:max-w-[500px]">
        {/* <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(239, 68, 68, 0.2)"
                  : "rgba(254, 226, 226, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 40, color: "error.main" }} />
          </Box>
        </Box> */}

        {/* <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        fontWeight: 800,
                        mb: 2,
                        fontSize: { xs: "1.875rem", sm: "2.25rem" },
                        color: "text.primary",
                    }}
                >
                    Access Denied
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        mb: 4,
                        width: "100%",
                        fontSize: { xs: "1rem", sm: "1.125rem" },
                        color: "text.secondary",
                        lineHeight: 1.6,
                    }}
                >
                    You do not have permission to view this page. Please contact your
                    administrator if you believe this is an error.
                </Typography> */}

        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          className="rounded-[4px] px-8 py-3 text-base font-semibold normal-case transition-all duration-200 hover:-translate-y-px"
        >
          Go Back Home
        </Button>
      </Box>

      {/* <Typography
        variant="caption"
        color="text.disabled"
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        &copy; {new Date().getFullYear()} - Elecon
      </Typography> */}
    </Box>
  );
}
