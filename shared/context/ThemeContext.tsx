// context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { toggleTheme } from "../redux/themeConfigSlice";
import { getAppTheme } from "../utils/theme";

interface ThemeContextType {
    themeMode: "light" | "dark" | "system";
    toggleTheme: (mode?: "light" | "dark" | "system") => void;
    isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const dispatch = useDispatch();
    const themeConfig = useSelector((state: RootState) => state.themeConfig);

    // Derive the active mode for MUI
    const isDarkMode = useMemo(() => {
        let _isDark = false;
        if (themeConfig.theme === "system") {
            if (
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
            ) {
                _isDark = true;
            }
        } else {
            if (themeConfig.theme === "dark") _isDark = true;
        }
        return _isDark;
    }, [themeConfig.theme]);

    // Use the derived activeMode to get the MUI theme
    const theme = useMemo(() => getAppTheme(isDarkMode ? "dark" : "light"), [isDarkMode]);

    // Sync with html class
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    const handleToggleTheme = (mode?: any) => {
        if (
            typeof mode === "string" &&
            (mode === "light" || mode === "dark" || mode === "system")
        ) {
            dispatch(toggleTheme(mode));
        } else {
            const nextTheme = themeConfig.theme === "light" ? "dark" : "light";
            dispatch(toggleTheme(nextTheme));
        }
    };

    return (
        <ThemeContext.Provider
            value={{
                themeMode: themeConfig.theme as "light" | "dark" | "system",
                toggleTheme: handleToggleTheme,
                isDarkMode,
            }}
        >
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
