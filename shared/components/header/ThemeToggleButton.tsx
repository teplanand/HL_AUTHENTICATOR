import React from "react";
import { Tooltip } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

const ThemeToggleButton: React.FC = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <motion.div
                onClick={() => toggleTheme()}
                whileTap={{ scale: 0.95 }}
                className={`
                    w-16 h-8 rounded-[20px] cursor-pointer flex items-center relative
                    transition-colors duration-300 ease-in-out select-none
                    [webkit-tap-highlight-color:transparent]
                    ${isDarkMode ? "bg-white/10 hover:bg-white/15" : "bg-black/5 hover:bg-black/10"}
                    shadow-[inset_0_0_4px_rgba(0,0,0,0.2)]
                `}
            >
                {/* Background Icons */}
                <div
                    className={`absolute left-2 flex z-0 pointer-events-none transition-opacity duration-300 ${isDarkMode ? "opacity-50" : "opacity-0"}`}
                >
                    <WbSunnyRoundedIcon sx={{ fontSize: 16, color: "#fbc02d" }} />
                </div>
                <div
                    className={`absolute right-2 flex z-0 pointer-events-none transition-opacity duration-300 ${isDarkMode ? "opacity-0" : "opacity-50"}`}
                >
                    <DarkModeRoundedIcon sx={{ fontSize: 16, color: "#90caf9" }} />
                </div>

                {/* Sliding Knob */}
                <motion.div
                    initial={false}
                    animate={{ x: isDarkMode ? 32 : 4 }}
                    transition={{
                        type: "spring",
                        stiffness: 700,
                        damping: 30
                    }}
                    className={`
                        w-6 h-6 rounded-full flex items-center justify-center absolute z-10 pointer-events-none left-0
                        shadow-[0_2px_4px_rgba(0,0,0,0.2)]
                        ${isDarkMode ? "bg-[#1e1e1e]" : "bg-white"}
                    `}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={isDarkMode ? "dark" : "light"}
                            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center"
                        >
                            {isDarkMode ? (
                                <DarkModeRoundedIcon sx={{ fontSize: 16, color: "#90caf9" }} />
                            ) : (
                                <WbSunnyRoundedIcon sx={{ fontSize: 16, color: "#fbc02d" }} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </Tooltip>
    );
};

export default ThemeToggleButton;
