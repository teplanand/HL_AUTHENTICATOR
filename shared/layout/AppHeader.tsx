import { useEffect, useRef, useState } from "react";

import { useSidebar } from "../context/SidebarContext";
import UserDropdown from "../components/header/UserDropdown";
import NotificationDropdown from "../components/header/NotificationDropdown";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import { getDecodedToken } from "../utils/auth";
import {
  Box,
  Checkbox,
  Typography,
  Popover,
  Badge,
  IconButton,
} from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const AppHeader: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const token = getDecodedToken();
  const branchesData = token ? token.branches : [];

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "branches-popover" : undefined;

  const toggleBranchSelection = (branchId: number) => {
    setSelectedBranches((prev) => {
      const updated = prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId];

      localStorage.setItem("selectedBranches", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("selectedBranches");
    if (saved) {
      try {
        setSelectedBranches(JSON.parse(saved));
      } catch (error) {
        console.error("Error parsing saved branches", error);
      }
    }
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className="sticky top-0 flex w-full bg-white border-gray-200 z-[1] dark:border-gray-800 dark:bg-gray-900 lg:border-b"
    >
      <div className="flex items-center justify-between w-full px-3 lg:px-4 h-15">
        {/* LEFT : Sidebar Toggle */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center w-8 h-8 text-gray-500 border rounded dark:border-gray-800 dark:text-gray-400 lg:h-9 lg:w-9"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.22 7.28a.75.75 0 0 1 1.06-1.06L12 10.94l4.72-4.72a.75.75 0 0 1 1.06 1.06L13.06 12l4.72 4.72a.75.75 0 1 1-1.06 1.06L12 13.06l-4.72 4.72a.75.75 0 1 1-1.06-1.06L10.94 12 6.22 7.28Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <MenuOpenOutlinedIcon />
            )}
          </button>
        </div>

        {/* RIGHT : Location + UserDropdown (ALWAYS VISIBLE) */}
        <div className="flex items-center gap-2 lg:gap-4">
          <NotificationDropdown />
          {/* User Dropdown */}
          {/* <UserDropdown /> */}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
