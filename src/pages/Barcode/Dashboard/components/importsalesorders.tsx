import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import SyncAltOutlinedIcon from "@mui/icons-material/SyncAltOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { FormStack } from "../../../../../shared/components/ui/form/stack";
import FormSection from "../../../../../shared/components/ui/form/FormSection";
import { useToast } from "../../../../../shared/hooks/useToast";
import {
  BarcodeImportResponseData,
  getBarcodeDefaultContext,
  useImportSalesOrdersMutation,
} from "../../api/barcode";

function ImportSalesOrders({
  onImportCompleted,
}: {
  onImportCompleted?: () => Promise<unknown> | unknown;
}) {
  const { showToast } = useToast();
  const hasAutoImportedRef = useRef(false);
  const [data, setData] = useState<{
    status: boolean;
    message: string;
    records: number;
    data: BarcodeImportResponseData[] | null;
  } | null>(null);
  const [importSalesOrders, { isLoading }] = useImportSalesOrdersMutation();

  const handleImport = useCallback(async () => {
    try {
      const response = await importSalesOrders(getBarcodeDefaultContext()).unwrap();

      const nextData = {
        status: Boolean(response.status),
        message: response.message || "Import completed",
        records: response.records || 0,
        data: Array.isArray(response.data) ? response.data : null,
      };

      setData(nextData);
      if (nextData.status) {
        await onImportCompleted?.();
      }
      showToast(
        nextData.status ? "Imported successfully" : nextData.message,
        nextData.status ? "success" : "warning"
      );
    } catch (error: any) {
      const message =
        error?.data?.message || error?.error || "Unable to import sales orders";
      setData({
        status: false,
        message,
        records: 0,
        data: null,
      });
      showToast(message, "error");
    }
  }, [importSalesOrders, onImportCompleted, showToast]);

  useEffect(() => {
    if (hasAutoImportedRef.current) {
      return;
    }

    hasAutoImportedRef.current = true;
    void handleImport();
  }, [handleImport]);

  return (
    <Box>
      <FormStack>
        

        {data ? (
          <Alert
            severity={data.status ? "success" : "warning"}
            icon={<CheckCircleOutlineOutlinedIcon />}
          >
            {data.status
              ? "Imported successfully"
              : data.message || "Sales-order import response received"}
          </Alert>
        ) : null}

        {data?.data ? (
          <FormSection
            title="Latest Import Result"
            description="Latest import response from barcode API."
            accentColor="#059669"
          >
            <Stack spacing={1.25}>
              <Typography variant="body2">
                Imported Orders: <strong>{data.records || 0}</strong>
              </Typography>
              <TableContainer
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          bgcolor: "#F8FAFC",
                          color: "#475569",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        },
                      }}
                    >
                      <TableCell>Order No</TableCell>
                      <TableCell>Header ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Customer No</TableCell>
                      <TableCell>Booked Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.data.map((order) => (
                      <TableRow key={`${order.header_id}-${order.ordernumber}`} hover>
                        <TableCell>{String(order.ordernumber || "--")}</TableCell>
                        <TableCell>{String(order.header_id || "--")}</TableCell>
                        <TableCell>{order.customer_name || "--"}</TableCell>
                        <TableCell>{order.customer_number || "--"}</TableCell>
                        <TableCell>{order.order_booked_date || "--"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </FormSection>
        ) : null}
      </FormStack>
    </Box>
  );
}

export default memo(ImportSalesOrders);
