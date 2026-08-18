import {
    Stack,
    SxProps,
    Theme,
    Typography,
} from "@mui/material";
import Box from "@mui/system/Box";


import { memo } from "react";

export const FormStack = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <Stack spacing={3} className="p-2 "  >
            {children}
        </Stack>
    );
})

export const FormStackHeader = memo(({ title }: { title: string }) => {
    return (
        <Typography sx={{ mb: 1 }} color="primary">
            {title}
        </Typography>
    );
})

export const PageHeader = memo(({ title }: { title: string }) => {
    return (
        <Typography variant="h6" sx={{ mb: 1 }} className="px-2 pt-2"  >
            {title}
        </Typography>
    );
})

export const FormStackGrid = memo(({ children, sx, columns = 3, gap = 2 }: { children: React.ReactNode, sx?: SxProps<Theme>, columns?: number, gap?: number }) => {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: `repeat(${columns}, 1fr)` },
                gap: gap,
                maxWidth: (theme) => theme.breakpoints.values.md, // md width (~900px)
                width: "100%",
                ...sx
            }}
        >{children}</Box>
    );
})