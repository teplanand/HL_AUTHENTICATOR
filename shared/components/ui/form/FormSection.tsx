import { memo } from "react";
import { Box, Paper, Typography, SxProps, Theme } from "@mui/material";

export type FormSectionProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon,
  accentColor = "#f37440",
  headerActions,
  children,
  sx,
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: "divider",

        position: "relative",
        ...sx,
      }}
    >
      {/* Accent left border */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 4,
          backgroundColor: accentColor,
          borderRadius: "4px 0 0 4px",
        }}
      />

      <Box sx={{ px: 3, py: 2.5, pl: 4 }}>
        {/* Section Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {icon && (
              <Box
                sx={{
                  color: accentColor,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>
              {description && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", mt: 0.25, display: "block" }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </Box>
          {headerActions}
        </Box>

        {/* Section Content */}
        {children}
      </Box>
    </Paper>
  );
};

export default memo(FormSection);
