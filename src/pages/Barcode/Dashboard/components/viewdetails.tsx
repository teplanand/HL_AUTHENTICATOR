import { memo, useEffect, useMemo, useState } from "react";
import { Alert, Box, Tab, Tabs } from "@mui/material";

import OrderForm from "./basicinfo";
import { LineItems } from "./lineitems";
import OtherinfoForm from "./otherinfo";
import { BankDetails } from "./bankdetails";
import {
  BarcodeSalesOrderDetailsViewModel,
  mapSalesOrderDetails,
} from "../barcodeAdapters";
import {
  getBarcodeDefaultContext,
  useLazyGetSalesOrderDetailsQuery,
} from "../../api/barcode";

type ViewDetailsProps = {
  defaultValues?: BarcodeSalesOrderDetailsViewModel | null;
  orderNumber?: string;
  setDisplayTitle?: (title: string) => void;
  setDataChanged?: (changed: boolean) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
};

function Index({
  defaultValues = null,
  orderNumber,
  setDisplayTitle,
  setHideFooter,
  setWidth,
}: ViewDetailsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [resolvedOrderDetails, setResolvedOrderDetails] =
    useState<BarcodeSalesOrderDetailsViewModel | null>(defaultValues);
  const [triggerOrderDetails, { isLoading, isFetching, isError }] =
    useLazyGetSalesOrderDetailsQuery();

  useEffect(() => {
    setDisplayTitle?.("Order Details");
    setHideFooter?.(true);
    setWidth?.(1100);
  }, [setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setResolvedOrderDetails(defaultValues);
  }, [defaultValues]);

  useEffect(() => {
    let isMounted = true;

    if (!orderNumber) {
      return () => {
        isMounted = false;
      };
    }

    const loadDetails = async () => {
      try {
        const response = await triggerOrderDetails({
          ...getBarcodeDefaultContext(),
          order_number: orderNumber,
        }).unwrap();

        const mappedDetails = mapSalesOrderDetails(response?.data);
        if (isMounted && mappedDetails) {
          setResolvedOrderDetails(mappedDetails);
          return;
        }
      } catch {
        if (isMounted) {
          setResolvedOrderDetails((current) => current || null);
        }
      }
    };

    void loadDetails();

    return () => {
      isMounted = false;
    };
  }, [orderNumber, triggerOrderDetails]);

  const mappedOrderDetails = useMemo(() => {
    if (resolvedOrderDetails) {
      return resolvedOrderDetails;
    }

    return defaultValues;
  }, [defaultValues, resolvedOrderDetails]);

  const handleRefreshOrder = async () => {
    if (!orderNumber) {
      return;
    }

    const response = await triggerOrderDetails({
      ...getBarcodeDefaultContext(),
      order_number: orderNumber,
    }).unwrap();

    const mappedDetails = mapSalesOrderDetails(response?.data);
    if (mappedDetails) {
      setResolvedOrderDetails(mappedDetails);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tab label="Basic Info" />
        <Tab label="Other Info" />
        <Tab label="Bank Details" />
        <Tab label="Line Items" />
      </Tabs>

      <Box>
        {isLoading || isFetching ? (
          <Alert severity="info">Loading sales-order details...</Alert>
        ) : null}
        {isError ? (
          <Alert severity="warning">API details could not be loaded.</Alert>
        ) : null}
        {!mappedOrderDetails ? (
          <Alert severity="warning">No sales-order data available to display.</Alert>
        ) : null}
        {mappedOrderDetails ? (
          <>
            {activeTab === 0 && <OrderForm orderDetails={mappedOrderDetails} />}
            {activeTab === 1 && <OtherinfoForm orderDetails={mappedOrderDetails} />}
            {activeTab === 2 && <BankDetails orderDetails={mappedOrderDetails} />}
            {activeTab === 3 && (
              <LineItems
                orderDetails={mappedOrderDetails}
                onOrderUpdated={handleRefreshOrder}
              />
            )}
          </>
        ) : null}
      </Box>
    </Box>
  );
}

export const ViewDetails = memo(Index);
