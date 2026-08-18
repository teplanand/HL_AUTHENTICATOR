// utils/theme.ts
import { createTheme } from "@mui/material/styles";
import { PaletteMode } from "@mui/material";
import "@mui/x-date-pickers/themeAugmentation";

// Define strict color palettes explicitly
const lightPalette = {
    primary: {
        main: "#F37440", // Primary Orange
        light: "#FF9C70",
        dark: "#B84A1C",
        contrastText: "#ffffff",
    },
    secondary: {
        main: "#FDE3D9", // Secondary Light / Background Accent
        light: "#FFF5F0",
        dark: "#CBB0A6",
        contrastText: "#363B63",
    },
    background: {
        default: "#F5F5F5",
        paper: "#FFFFFF",
    },
    text: {
        primary: "#363B63",
        secondary: "#6E7899",
        disabled: "#A0AEC0",
    },
    divider: "#E2E8F0",
};

const darkPalette = {
    primary: {
        main: "#F37440", // Keep primary orange
        light: "#FF9C70",
        dark: "#B84A1C",
        contrastText: "#ffffff",
    },
    secondary: {
        main: "#2D3748", // Darker secondary
        light: "#4A5568",
        dark: "#1A202C",
        contrastText: "#ffffff",
    },
    background: {
        default: "#0F172A", // Slate 900
        paper: "#1E293B",    // Slate 800
    },
    text: {
        primary: "#F8FAFC", // Slate 50
        secondary: "#CBD5E1", // Slate 300
        disabled: "#64748B",  // Slate 500
    },
    divider: "#334155", // Slate 700
};

export const getAppTheme = (mode: PaletteMode) => {
    const isDark = mode === "dark";
    const palette = isDark ? darkPalette : lightPalette;

    return createTheme({
        palette: {
            mode,
            ...palette,
            success: {
                main: "#38A169",
                light: "#68D391",
                dark: "#2F855A",
                contrastText: "#ffffff",
            },
            warning: {
                main: "#ED8936",
                light: "#F6AD55",
                dark: "#DD6B20",
                contrastText: "#ffffff",
            },
            error: {
                main: "#E53E3E",
                light: "#FC8181",
                dark: "#C53030",
                contrastText: "#ffffff",
            },
            info: {
                main: "#3182CE",
                light: "#63B3ED",
                dark: "#2B6CB0",
                contrastText: "#ffffff",
            },
            grey: {
                50: isDark ? "#1e293b" : "#F7FAFC",
                100: isDark ? "#334155" : "#EDF2F7",
                200: isDark ? "#475569" : "#E2E8F0",
                300: isDark ? "#64748b" : "#CBD5E0",
                400: isDark ? "#94a3b8" : "#A0AEC0",
                500: isDark ? "#cbd5e1" : "#718096",
                600: isDark ? "#e2e8f0" : "#4A5568",
                700: isDark ? "#f1f5f9" : "#2D3748",
                800: isDark ? "#f8fafc" : "#1A202C",
                900: isDark ? "#ffffff" : "#171923",
            },
        },
        typography: {
            fontFamily: '"Nunito", sans-serif',
            h1: {
                fontWeight: 800,
                fontSize: "2.5rem",
                lineHeight: 1.2,
                color: palette.text.primary,
            },
            h2: {
                fontWeight: 700,
                fontSize: "2rem",
                lineHeight: 1.3,
                color: palette.text.primary,
            },
            h3: {
                fontWeight: 700,
                fontSize: "1.75rem",
                lineHeight: 1.3,
                color: palette.text.primary,
            },
            h4: {
                fontWeight: 700,
                fontSize: "1.5rem",
                lineHeight: 1.4,
                color: palette.text.primary,
            },
            h5: {
                fontWeight: 600,
                fontSize: "1.25rem",
                lineHeight: 1.4,
                color: palette.text.primary,
            },
            h6: {
                fontWeight: 600,
                fontSize: "1.125rem",
                lineHeight: 1.5,
                color: palette.text.primary,
            },
            subtitle1: {
                fontWeight: 500,
                fontSize: "1rem",
                lineHeight: 1.5,
                color: palette.text.secondary,
            },
            subtitle2: {
                fontWeight: 500,
                fontSize: "0.875rem",
                lineHeight: 1.5,
                color: palette.text.secondary,
            },
            body1: {
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: palette.text.secondary,
            },
            body2: {
                fontSize: "0.75rem",
                lineHeight: 1.6,
                color: isDark ? "#94a3b8" : "#718096", // Adjust specifically for body2
            },
            button: {
                fontWeight: 600,
                fontSize: "0.8125rem",
                textTransform: "none",
            },
            caption: {
                fontSize: "0.75rem",
                color: isDark ? "#94a3b8" : "#718096",
            },
            overline: {
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                color: isDark ? "#94a3b8" : "#718096",
            },
        },
        shape: {
            borderRadius: 4,
        },
        shadows: isDark ? [
            "none",
            "0px 2px 4px rgba(0, 0, 0, 0.4)",
            "0px 4px 8px rgba(0, 0, 0, 0.5)",
            "0px 6px 12px rgba(0, 0, 0, 0.6)",
            "0px 8px 16px rgba(0, 0, 0, 0.6)",
            "0px 12px 24px rgba(0, 0, 0, 0.7)",
            "0px 16px 32px rgba(0, 0, 0, 0.7)",
            "0px 20px 40px rgba(0, 0, 0, 0.8)",
            "0px 24px 48px rgba(0, 0, 0, 0.8)",
            "0px 32px 64px rgba(0, 0, 0, 0.9)",
            "0px 40px 80px rgba(0, 0, 0, 0.9)",
            "0px 48px 96px rgba(0, 0, 0, 0.9)",
            "0px 56px 112px rgba(0, 0, 0, 0.9)",
            "0px 64px 128px rgba(0, 0, 0, 0.9)",
            "0px 72px 144px rgba(0, 0, 0, 0.9)",
            "0px 80px 160px rgba(0, 0, 0, 0.9)",
            "0px 88px 176px rgba(0, 0, 0, 0.9)",
            "0px 96px 192px rgba(0, 0, 0, 0.9)",
            "0px 104px 208px rgba(0, 0, 0, 0.9)",
            "0px 112px 224px rgba(0, 0, 0, 0.9)",
            "0px 120px 240px rgba(0, 0, 0, 0.9)",
            "0px 128px 256px rgba(0, 0, 0, 0.9)",
            "0px 136px 272px rgba(0, 0, 0, 0.9)",
            "0px 144px 288px rgba(0, 0, 0, 0.9)",
            "0px 152px 304px rgba(0, 0, 0, 1)",
        ] : [
            "none",
            "0px 2px 4px rgba(0, 0, 0, 0.05)",
            "0px 4px 8px rgba(0, 0, 0, 0.08)",
            "0px 6px 12px rgba(0, 0, 0, 0.1)",
            "0px 8px 16px rgba(0, 0, 0, 0.12)",
            "0px 12px 24px rgba(0, 0, 0, 0.15)",
            "0px 16px 32px rgba(0, 0, 0, 0.18)",
            "0px 20px 40px rgba(0, 0, 0, 0.2)",
            "0px 24px 48px rgba(0, 0, 0, 0.22)",
            "0px 32px 64px rgba(0, 0, 0, 0.25)",
            "0px 40px 80px rgba(0, 0, 0, 0.3)",
            "0px 48px 96px rgba(0, 0, 0, 0.35)",
            "0px 56px 112px rgba(0, 0, 0, 0.4)",
            "0px 64px 128px rgba(0, 0, 0, 0.45)",
            "0px 72px 144px rgba(0, 0, 0, 0.5)",
            "0px 80px 160px rgba(0, 0, 0, 0.55)",
            "0px 88px 176px rgba(0, 0, 0, 0.6)",
            "0px 96px 192px rgba(0, 0, 0, 0.65)",
            "0px 104px 208px rgba(0, 0, 0, 0.7)",
            "0px 112px 224px rgba(0, 0, 0, 0.75)",
            "0px 120px 240px rgba(0, 0, 0, 0.8)",
            "0px 128px 256px rgba(0, 0, 0, 0.85)",
            "0px 136px 272px rgba(0, 0, 0, 0.9)",
            "0px 144px 288px rgba(0, 0, 0, 0.95)",
            "0px 152px 304px rgba(0, 0, 0, 1)",
        ],
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        scrollbarColor: isDark ? "#475569 #1E293B" : "#CBD5E0 #EDF2F7",
                        "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                            width: 8,
                            height: 8,
                        },
                        "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                            borderRadius: 4,
                            backgroundColor: isDark ? "#475569" : "#CBD5E0",
                            minHeight: 24,
                        },
                        "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover":
                        {
                            backgroundColor: isDark ? "#64748B" : "#A0AEC0",
                        },
                        "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                            backgroundColor: "transparent",
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 4,
                        fontSize: "0.8125rem",
                        "&:hover": {
                            boxShadow: isDark ? "0px 4px 8px rgba(0, 0, 0, 0.3)" : "0px 4px 8px rgba(0, 0, 0, 0.1)",
                        },
                    },
                    contained: {
                        boxShadow: isDark ? "0px 2px 4px rgba(0, 0, 0, 0.2)" : "0px 2px 4px rgba(0, 0, 0, 0.05)",
                    },
                },
            },

            MuiFormHelperText: {
                styleOverrides: {
                    root: {
                        fontSize: "0.6rem",
                        margin: "2px",
                    },

                },
            },

            MuiFormControl: {
                styleOverrides: {
                    root: {

                    },

                },
            },

            MuiPaper: {
                styleOverrides: {
                    root: {
                        boxShadow: isDark ? "0px 4px 12px rgba(0, 0, 0, 0.3)" : "0px 4px 12px rgba(0, 0, 0, 0.08)",
                        backgroundImage: "none",
                        borderRadius: 4,
                    },
                    elevation1: {
                        boxShadow: isDark ? "0px 2px 4px rgba(0, 0, 0, 0.2)" : "0px 2px 4px rgba(0, 0, 0, 0.05)",
                    },
                    elevation2: {
                        boxShadow: isDark ? "0px 4px 8px rgba(0, 0, 0, 0.3)" : "0px 4px 8px rgba(0, 0, 0, 0.08)",
                    },
                    elevation3: {
                        boxShadow: isDark ? "0px 6px 12px rgba(0, 0, 0, 0.4)" : "0px 6px 12px rgba(0, 0, 0, 0.1)",
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 4,
                        boxShadow: isDark ? "0px 4px 12px rgba(0, 0, 0, 0.3)" : "0px 4px 12px rgba(0, 0, 0, 0.08)",
                        "&:hover": {
                            boxShadow: isDark ? "0px 8px 24px rgba(0, 0, 0, 0.4)" : "0px 8px 24px rgba(0, 0, 0, 0.12)",
                        },
                    },
                },
            },
            MuiTable: {
                styleOverrides: {
                    root: {
                        borderCollapse: "separate",
                        borderSpacing: 0,
                    },
                },
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        "& .MuiTableCell-root": {
                            backgroundColor: isDark ? "#334155" : "#F7FAFC",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: palette.text.primary,
                            borderBottom: `2px solid ${palette.divider}`,
                        },
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderBottom: `1px solid ${palette.divider}`,
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                    },
                    head: {
                        fontWeight: 600,
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        "&:last-child .MuiTableCell-root": {
                            borderBottom: "none",
                        },
                        "&:hover": {
                            backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F7FAFC",
                        },
                    },
                },
            },
            MuiTextField: {
                defaultProps: {
                    size: "small",
                },
                styleOverrides: {
                    root: {
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 4,
                            minHeight: 36,
                        },
                        "& .MuiOutlinedInput-input": {
                            padding: "4px 6px",
                            fontSize: "0.875rem",
                        },
                    },
                },
            },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        minHeight: 40,
                        fontSize: "0.875rem",
                    },
                    input: {
                        padding: "8px 10px",
                        height: "auto",
                    },
                },
            },
            MuiSvgIcon: {
                styleOverrides: {
                    root: {
                        fontSize: "18px",
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        padding: 0,
                    },
                    sizeSmall: {
                        width: 36,
                        height: 36,
                        padding: 0,
                    },
                },
            },
            MuiPickersInputBase: {
                styleOverrides: {
                    root: {
                        borderRadius: 4,
                    },
                },
            },
            MuiPickersOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 4,
                    },
                    notchedOutline: {
                        borderRadius: 4,
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 4,
                        minHeight: 36,
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#5A73DB",
                        },
                    },
                    notchedOutline: {
                        borderRadius: 4,
                        borderColor: isDark ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)",
                    },
                    input: {
                        padding: "8px 10px",
                        fontSize: "0.875rem",
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        fontSize: "0.875rem",
                        color: palette.text.secondary,
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 4,

                    },
                },
            },

            MuiDialogTitle: {
                styleOverrides: {
                    root: {
                        padding: "12px",
                        fontSize: "1.5rem",
                        fontWeight: 600,
                    },
                },
            },
            MuiDialogContent: {
                styleOverrides: {
                    root: {
                        padding: "12px",
                    },
                },
            },
            MuiDialogActions: {
                styleOverrides: {
                    root: {
                        padding: "12px",
                        gap: 8,
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        borderRadius: 4,
                    },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        borderRadius: 4,
                        fontSize: "0.875rem",
                    },
                },
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: palette.background.paper,
                        color: palette.text.primary,
                        boxShadow: isDark ? "0px 2px 4px rgba(0, 0, 0, 0.3)" : "0px 2px 4px rgba(0, 0, 0, 0.05)",
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        minHeight: 32,
                        "&.MuiListItemButton-root[data-depth='1']": {
                            fontSize: "0.8125rem",
                            minHeight: 28,
                            paddingLeft: 24,
                        },
                        "&.MuiListItemButton-root[data-depth='2']": {
                            fontSize: "0.75rem",
                            minHeight: 28,
                            paddingLeft: 36,
                        },
                        "&:hover": {
                        },
                        "&.MuiListItemButton-root[data-depth='1']:hover": {
                        },
                        "&.MuiListItemButton-root[data-depth='2']:hover": {
                        },
                    },
                },
            },
            MuiListItemText: {
                styleOverrides: {
                    root: {
                        marginTop: 0,
                        marginBottom: 0,
                    },
                    primary: {
                        fontSize: "0.875rem",
                        ".MuiListItemButton-root[data-depth='1'] &": {
                            fontSize: "0.8125rem",
                        },
                        ".MuiListItemButton-root[data-depth='2'] &": {
                            fontSize: "0.75rem",
                        },
                    },
                },
            },
        },
    });
};
