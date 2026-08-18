import { memo, useRef } from "react";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import ApiActionButton from "../../../../../shared/components/common/ApiActionButton";
import { AddEditPlandate, AddEditPlandateRef } from "./addeditplandate";

type OpenEditPlanModalProps = {
  open: boolean;
  title: string;
  rowData?: Record<string, unknown> | null;
  field?: string;
  onClose: () => void;
};

function Index({
  open,
  title,
  rowData,
  field,
  onClose,
}: OpenEditPlanModalProps) {
  const formRef = useRef<AddEditPlandateRef>(null);

  return (
    <Drawer
      open={open}
      anchor="right"
      variant="temporary"
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      className="z-[99999] [&_.MuiDrawer-paper]:max-w-full [&_.MuiDrawer-paper]:w-full sm:[&_.MuiDrawer-paper]:w-[400px]"
    >
      <Box className="drawer-header no-print flex items-center justify-between p-2">
        <Typography variant="h6">{title}</Typography>
        <IconButton
          size="small"
          onClick={onClose}
          className="rounded p-[0.438rem] text-inherit bg-black/5"
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>

      <DialogContent dividers className="drawer-body drawer-body-print">
        <AddEditPlandate
          ref={formRef}
          rowData={rowData as Record<string, any> | undefined}
          field={field}
          onSuccess={onClose}
        />
      </DialogContent>

      <DialogActions className="drawer-footer no-print">
        <Box
          className="flex w-full items-center justify-between overflow-auto"
        >
          <Box className="flex gap-2">
            <ApiActionButton
              onApiCall={() => formRef.current?.submit?.() ?? Promise.resolve()}
              loadingText="Updating..."
            >
              Update
            </ApiActionButton>
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Drawer>
  );
}

export default memo(Index);
