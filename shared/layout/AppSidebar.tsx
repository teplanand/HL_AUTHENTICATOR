import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Box } from "@mui/material";

// Assume these icons are imported from an icon library
import { useSidebar } from "../context/SidebarContext";

import { getDecodedToken } from "../utils/auth";
import { NavItem, navItems } from "../sidebarNavItems";
import logo from "../assets/logo1.png";
import smallIcon from "../assets/small-icon.png";
import { Search } from "@mui/icons-material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } =
    useSidebar();
  const location = useLocation();

  const decodedToken = getDecodedToken();
  const userRole = decodedToken?.role || "guest";

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>([]);

  // Open submenu state - now supports nested structure
  const [openSubmenus, setOpenSubmenus] = useState<{
    [key: string]: boolean;
  }>({});

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );
  const handleLinkClick = () => {
    if (isMobileOpen) setIsMobileOpen(false);
  };

  // Filter nav items based on user role and search query
  useEffect(() => {
    const filtered = navItems.filter((item) => {
      // First filter by role
      // if (!item.roles.includes(userRole)) return false;

      // Then filter by search query if exists
      if (searchQuery.trim() === "") return true;

      const query = searchQuery.toLowerCase();

      // Check main menu item name
      if (item.name.toLowerCase().includes(query)) return true;

      // Check subItems names (including nested)
      const hasMatchingItem = (subItems: any[]): boolean => {
        return subItems.some((subItem) => {
          if (subItem.name.toLowerCase().includes(query)) return true;
          if (subItem.subItems && hasMatchingItem(subItem.subItems))
            return true;
          return false;
        });
      };

      if (item.subItems && hasMatchingItem(item.subItems)) return true;

      return false;
    });

    setFilteredNavItems(filtered);
  }, [searchQuery, userRole]);

  // Auto open submenu when current route matches or search query is active
  useEffect(() => {
    const newOpenSubmenus: { [key: string]: boolean } = {};

    const traverseAndOpen = (items: any[], parentKey: string = "") => {
      items.forEach((item, index) => {
        // Key generation must match renderMenuItems/renderSubItems
        const currentKey = parentKey
          ? `${parentKey}-sub-${index}`
          : `main-${index}`;

        if (item.subItems && item.subItems.length > 0) {
          let shouldOpen = false;

          if (searchQuery.trim() !== "") {
            // Always expand groups when searching to show matches
            shouldOpen = true;
          } else {
            // When not searching, only expand if contains active route
            const hasActiveDescendant = (subItems: any[]): boolean => {
              return subItems.some((sub) => {
                if (sub.path && isActive(sub.path)) return true;
                if (sub.subItems) return hasActiveDescendant(sub.subItems);
                return false;
              });
            };
            if (hasActiveDescendant(item.subItems)) {
              shouldOpen = true;
            }
          }

          if (shouldOpen) {
            newOpenSubmenus[currentKey] = true;
            traverseAndOpen(item.subItems, currentKey);
          }
        }
      });
    };

    // Always traverse the items that are actually being rendered
    traverseAndOpen(filteredNavItems);

    setOpenSubmenus(newOpenSubmenus);
  }, [location, isActive, searchQuery, filteredNavItems]);

  // Update submenu heights when submenus are opened
  useEffect(() => {
    Object.keys(openSubmenus).forEach((key) => {
      if (openSubmenus[key] && subMenuRefs.current[key]) {
        setTimeout(() => {
          setSubMenuHeight((prevHeights) => ({
            ...prevHeights,
            [key]: subMenuRefs.current[key]?.scrollHeight || 0,
          }));
        }, 10);
      }
    });
  }, [openSubmenus]);

  const handleSubmenuToggle = (key: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span
              key={index}
              className="bg-yellow-200 text-gray-900 px-1 rounded"
            >
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  // Recursive function to render nested submenus
  const renderSubItems = (
    subItems: any[],
    parentKey: string,
    level: number = 1,
    isParentOpen: boolean = true,
  ) => {
    return (
      <ul className={`space-y-1 ${level > 1 ? "ml-4" : "ml-2"}`}>
        {subItems.map((subItem, subIndex) => {
          const subItemKey = `${parentKey}-sub-${subIndex}`;
          const hasNestedSubItems =
            subItem.subItems && subItem.subItems.length > 0;
          const isSubmenuOpen = openSubmenus[subItemKey] || false;

          // Check if this subitem should be shown based on search
          if (
            searchQuery &&
            !subItem.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            // Check nested items if search doesn't match parent
            if (
              !hasNestedSubItems ||
              !subItem.subItems.some((nested: any) =>
                nested.name.toLowerCase().includes(searchQuery.toLowerCase()),
              )
            ) {
              return null;
            }
          }

          return (
            <li key={`${subItem.name}-${subIndex}`}>
              {hasNestedSubItems ? (
                // Nested submenu item (like "Category")
                <>
                  <div
                    onClick={() => handleSubmenuToggle(subItemKey)}
                    className={`flex items-center w-full px-3 py-2 text-xs transition-all duration-200 rounded-md cursor-pointer ${isSubmenuOpen ||
                      (searchQuery &&
                        subItem.subItems.some((n: any) =>
                          n.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                        ))
                      ? "bg-[#FDE3D9] text-[#363B63]"
                      : "text-[rgb(55,65,81)] hover:bg-[#FDE3D9] hover:text-[#363B63]"
                      }`}
                  >
                    <span className="flex-1">
                      {searchQuery
                        ? highlightText(subItem.name, searchQuery)
                        : subItem.name}
                    </span>
                    <KeyboardArrowDownIcon
                      className={`ml-2 w-4 h-4 transition-transform duration-200 ${isSubmenuOpen
                        ? "rotate-180 text-[#3782f2]"
                        : "text-current"
                        }`}
                    />
                  </div>

                  {/* Nested submenu */}
                  {isParentOpen && (
                    <Box
                      component="div"
                      ref={(el) => {
                        const node = el as HTMLDivElement | null;
                        subMenuRefs.current[subItemKey] = node;
                        if (node && isSubmenuOpen) {
                          setTimeout(() => {
                            setSubMenuHeight((prevHeights) => ({
                              ...prevHeights,
                              [subItemKey]: node.scrollHeight || 0,
                              [parentKey]:
                                (subMenuHeight[parentKey] || 0) +
                                (node.scrollHeight || 0), // Update parent height? No, parent height is dynamic
                            }));
                          }, 10);
                        }
                      }}
                      className="overflow-hidden transition-all duration-300"
                      sx={{
                        maxHeight: isSubmenuOpen
                          ? `${subMenuHeight[subItemKey] || 0}px`
                          : "0px",
                        opacity: isSubmenuOpen ? 1 : 0,
                        visibility: isSubmenuOpen ? "visible" : "hidden",
                      }}
                    >
                      {renderSubItems(
                        subItem.subItems,
                        subItemKey,
                        level + 1,
                        isSubmenuOpen,
                      )}
                    </Box>
                  )}
                </>
              ) : (
                // Regular link item
                subItem.path && (
                  <Link
                    onClick={handleLinkClick}
                    to={subItem.path}
                    className={`flex items-center w-full px-3 py-2 text-xs transition-all duration-200 rounded-md ${isActive(subItem.path)
                      ? "bg-[#FDE3D9] text-[#363B63] border-l-[2px] border-r-[3px] border-[#F37440]"
                      : "text-[rgb(55,65,81)] hover:bg-[#FDE3D9] hover:text-[#363B63] hover:border-l-[2px] hover:border-r-[3px] hover:border-[#F37440]"
                      }`}
                  >
                    <span className="flex-1">
                      {searchQuery
                        ? highlightText(subItem.name, searchQuery)
                        : subItem.name}
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      {subItem.new && (
                        <span className="px-2 py-1 text-xs rounded bg-[#E2E8F0] text-[#F37440]">
                          new
                        </span>
                      )}
                      {subItem.pro && (
                        <span className="px-2 py-1 text-xs rounded bg-[#E2E8F0] text-[#F37440]">
                          pro
                        </span>
                      )}
                    </span>
                  </Link>
                )
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    return (
      <ul className="flex flex-col gap-1">
        {items.map((nav, index) => {
          const itemKey = `${menuType}-${index}`;
          const isSubmenuOpen = openSubmenus[itemKey] || false;

          // Check if this menu should be shown
          const hasMatchingItem = (subItems: any[]): boolean => {
            return subItems.some((subItem) => {
              if (
                subItem.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
                return true;
              if (subItem.subItems && hasMatchingItem(subItem.subItems))
                return true;
              return false;
            });
          };

          const shouldShowMenu = searchQuery
            ? nav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (nav.subItems && hasMatchingItem(nav.subItems))
            : true;

          if (!shouldShowMenu) return null;

          return (
            <li key={nav.name}>
              {nav.subItems ? (
                // Main menu item with subitems
                <div
                  onClick={() => handleSubmenuToggle(itemKey)}
                  className={`relative flex items-center w-full transition-all duration-200 group ${isSubmenuOpen
                    ? "bg-[#FDE3D9] text-[#363B63]"
                    : "text-[rgb(55,65,81)] hover:bg-[#FDE3D9] hover:text-[#363B63]"
                    } cursor-pointer ${!isExpanded && !isHovered
                      ? "lg:justify-center px-2 py-2 rounded-md"
                      : "lg:justify-start px-4 py-2"
                    }`}
                >
                  {/* Left short border */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-full transition-all duration-300 ${isSubmenuOpen
                      ? "bg-[#F37440]"
                      : "group-hover:bg-[#F37440] bg-transparent"
                      } ${!isExpanded && !isHovered ? "hidden" : ""}`}
                  ></span>

                  {/* Right full border */}
                  <span
                    className={`absolute right-0 top-0 w-[3px] h-full transition-all duration-300 ${isSubmenuOpen
                      ? "bg-[#F37440]"
                      : "group-hover:bg-[#F37440] bg-transparent"
                      } ${!isExpanded && !isHovered ? "hidden" : ""}`}
                  ></span>

                  {/* Icon */}
                  <span
                    className={`flex items-center justify-center ${isSubmenuOpen ? "text-gray-500" : "text-gray-500"
                      }`}
                  >
                    {nav.icon}
                  </span>

                  {/* Name */}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="ml-2 text-xs font-medium">
                      {searchQuery
                        ? highlightText(nav.name, searchQuery)
                        : nav.name}
                    </span>
                  )}

                  {/* Chevron */}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <KeyboardArrowDownIcon
                      className={`ml-auto w-4 h-4 transition-transform duration-200 ${isSubmenuOpen
                        ? "rotate-180 text-[#363B63]"
                        : "text-[rgb(55,65,81)] group-hover:text-[#363B63]"
                        }`}
                    />
                  )}
                </div>
              ) : (
                // Simple link (no submenu)
                nav.path && (
                  <Link
                    onClick={handleLinkClick}
                    to={nav.path}
                    className={`relative flex items-center w-full transition-all duration-200 group ${isActive(nav.path)
                      ? "bg-[#FDE3D9] text-[#363B63]"
                      : "text-[rgb(55,65,81)] hover:bg-[#FDE3D9] hover:text-[#363B63]"
                      } ${!isExpanded && !isHovered
                        ? "lg:justify-center px-2 py-1 rounded-md"
                        : "lg:justify-start px-4 py-2"
                      }`}
                  >
                    {/* Left short border */}
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] transition-all duration-300 ${isActive(nav.path)
                        ? "bg-[#F37440]"
                        : "group-hover:bg-[#F37440] bg-transparent"
                        } ${!isExpanded && !isHovered ? "hidden" : ""}`}
                    ></span>

                    {/* Right full border */}
                    <span
                      className={`absolute right-0 top-0 w-[3px] h-full transition-all duration-300 ${isActive(nav.path)
                        ? "bg-[#F37440]"
                        : "group-hover:bg-[#F37440] bg-transparent"
                        } ${!isExpanded && !isHovered ? "hidden" : ""}`}
                    ></span>

                    {/* Icon */}
                    <span className="flex items-center justify-center w-5 h-5">
                      {nav.icon}
                    </span>

                    {/* Text */}
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="ml-2 text-xs font-medium">
                        {searchQuery
                          ? highlightText(nav.name, searchQuery)
                          : nav.name}
                      </span>
                    )}
                  </Link>
                )
              )}

              {/* Submenu section */}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <Box
                  component="div"
                  ref={(el) => {
                    const node = el as HTMLDivElement | null;
                    subMenuRefs.current[itemKey] = node;
                    if (node && isSubmenuOpen) {
                      setTimeout(() => {
                        setSubMenuHeight((prevHeights) => ({
                          ...prevHeights,
                          [itemKey]: node.scrollHeight || 0,
                        }));
                      }, 10);
                    }
                  }}
                  className="overflow-hidden transition-all duration-300"
                  sx={{
                    maxHeight: isSubmenuOpen
                      ? `${subMenuHeight[itemKey] || 0}px`
                      : "0px",
                    opacity: isSubmenuOpen ? 1 : 0,
                    visibility: isSubmenuOpen ? "visible" : "hidden",
                    transition: "all 300ms ease-in-out",
                  }}
                >
                  {renderSubItems(nav.subItems, itemKey, 1, isSubmenuOpen)}
                </Box>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-[#1A202C] text-[#482d38] h-screen transition-all duration-300 ease-in-out z-50 border-r border-[#E2E8F0] 
        ${isExpanded || isMobileOpen
          ? "w-[200px]"
          : isHovered
            ? "w-[200px]"
            : "w-[80px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo section with padding */}
      <div
        className={`${!isExpanded && !isHovered ? "px-2 py-3" : "px-4 py-4"}`}
      >
        <div
          className={`flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
        >
          <Link to="/" className="flex justify-center items-center">
            {isExpanded || isHovered || isMobileOpen ? (
              // Expanded/Hovered state - Larger logo
              <div className="flex items-center justify-center">
                <img
                  src={logo}
                  alt="Logo"
                  className="dark:invert dark:brightness-90"
                />
              </div>
            ) : (
              // Collapsed state - Small logo
              <div className="flex justify-center items-center">
                <img
                  src={smallIcon}
                  alt="Logo"
                  className="dark:invert dark:brightness-90"
                />
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Search Input - Only show when sidebar is expanded */}
      {(isExpanded || isHovered || isMobileOpen) && (
        <div className="px-3 pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Menu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F37440] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation section */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className={!isExpanded && !isHovered ? "px-1" : "px-2"}>
          <div className="flex flex-col gap-1">
            <div>
              <h2
                className={`text-xs uppercase flex leading-[20px] text-[#718096] ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen}
              </h2>
              {filteredNavItems.length > 0 ? (
                renderMenuItems(filteredNavItems, "main")
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                  No menus found
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
