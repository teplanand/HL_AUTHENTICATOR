import React from "react";
import { useLocation, Link as RouterLink } from "react-router";
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { navItems, NavItem } from "../../sidebarNavItems";

const Breadcrumbs = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Get module name from URL path (e.g., /advance-voucher/dashboard -> "Advance Voucher")
  const moduleSlug = currentPath.split('/')[1];
  const moduleName = moduleSlug
    ? moduleSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Dashboard';

  // Function to find the breadcrumb trail for the current path
  const findBreadcrumbTrail = (
    items: NavItem[],
    path: string,
  ): NavItem[] | null => {
    for (const item of items) {
      // Check if this item matches the current path exactly
      // We normalize paths to ensure consistency (remove trailing slashes, ensure leading slash)
      const itemPath = item.path
        ? item.path.startsWith("/")
          ? item.path
          : `/${item.path}`
        : "";

      // If matches exact path (and it's not just a parent container with empty path)
      if (itemPath === path && itemPath !== "" && itemPath !== "/") {
        return [item];
      }

      // If this item has subItems, search recursively
      if (item.subItems) {
        const subTrail = findBreadcrumbTrail(item.subItems as NavItem[], path);
        if (subTrail) {
          return [item, ...subTrail];
        }
      }
    }
    return null;
  };

  // If exact match not found (e.g., /edit/1), try to match the parent route
  // We'll iterate by removing segments from the end of the path until we find a match in the nav tree
  let trail: NavItem[] | null = null;
  let pathSegments = currentPath.split("/").filter((p) => p);

  // Try finding a match for the full path, then successively shorter paths
  // This helps when we are on a detail page like /users/1 but "Users" is at /users
  for (let i = pathSegments.length; i >= 0; i--) {
    const searchPath = "/" + pathSegments.slice(0, i).join("/");
    if (searchPath === "/") continue; // Skip root

    const found = findBreadcrumbTrail(navItems, searchPath);
    if (found) {
      trail = found;
      // If we found a match for a parent path (not the full current path),
      // we should properly add the remaining segments as "active" breadcrumbs text
      // e.g. /users/edit/1 -> found "Users" at /users -> add "Edit" and "1"

      const remaining = pathSegments.slice(i);
      // Manually add remaining segments to the trail for display
      remaining.forEach((segment) => {
        trail?.push({
          name:
            segment.charAt(0).toUpperCase() +
            segment.slice(1).replace(/-/g, " "),
          // No specific icon or path for these dynamic segments by default,
          // or create a dummy one
          icon: null,
          path: "",
          roles: [],
        });
      });
      break;
    }
  }

  // Fallback: If absolutely no match in the nav tree, generate purely from URL
  if (!trail) {
    trail = pathSegments.map((segment) => ({
      name:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      path: "", // We don't know the real route structure so better not to link
      icon: null,
      roles: [],
    }));
  }

  // If still empty (e.g. root path), optionally return null or Dashboard
  if (trail.length === 0 && currentPath !== "/") {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 1,
      }}
    >
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-separator": {
            marginInline: "8px",
          },
          "& .MuiLink-root": {
            display: "flex",
            alignItems: "center",
            fontSize: "0.75rem",
            color: "text.secondary",
            textDecoration: "none",
            "&:hover": {
              
              color: "primary.main", 
            },
          },
          "& .MuiTypography-root": {
            fontSize: "0.75rem",
            color: "text.primary",
            fontWeight: 500,
          },
        }}
      >
        {/* Always show Apps as first item */}
        <Link component={RouterLink} to="/apps" color="inherit">
          Apps
        </Link>

        {/* Then show Module Name (no link) */}
        <Typography color="text.primary">
          {moduleName}
        </Typography>

        {trail.map((item, index) => {
          const isLast = index === trail!.length - 1;

          // Reconstruct path for linking if it exists and is not the current page
          // Logic: if the item reference from navItems has a path, use it.
          // If it was a dynamic segment we added manually, it matches one of the path segments.
          // However, linking accurately for dynamic segments is tricky without context, so we might just show text.

          // For items from our nav tree, we trust their 'path' property if it exists.

          return isLast ? (
            <Typography key={index} color="text.primary">
              {item.name}
            </Typography>
          ) : item.path ? (
            <Link
              key={index}
              component={RouterLink}
              to={item.path}
              color="inherit"
            >
              {item.name}
            </Link>
          ) : (
            <Typography key={index} color="text.secondary">
              {item.name}
            </Typography>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
