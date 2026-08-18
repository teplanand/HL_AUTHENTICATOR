

// Mock Data for Dashboard Cards
export const dashboardStats = {
    all: 17,
    pending: 5,
    approved: 8,
    rejected: 2,
    toApprove: 4, // For Admin
    requested: 2,
};

// Mock Data for Requisitions Table
export interface Requisition {
    id: string; // Request Ref
    requestRef: string;
    supplierName: string;
    poNo: string;
    poAmount: number;
    advanceAmount: number;
    status: "Detailed" | "Pending" | "Approved" | "Rejected" | "Requested";
    date: string;
}

export const requisitionsData: Requisition[] = [
    {
        id: "1",
        requestRef: "2025-26-01-1 FY-ORG ID-001",
        supplierName: "ABC Supplies Ltd",
        poNo: "PO-2025-001",
        poAmount: 50000,
        advanceAmount: 10000,
        status: "Pending",
        date: "2025-04-01",
    },
    {
        id: "2",
        requestRef: "2025-26-01-1 FY-ORG ID-002",
        supplierName: "Global Tech Solutions",
        poNo: "PO-2025-002",
        poAmount: 120000,
        advanceAmount: 0,
        status: "Approved",
        date: "2025-04-02",
    },
    {
        id: "3",
        requestRef: "2025-26-01-1 FY-ORG ID-003",
        supplierName: "Office Depot",
        poNo: "PO-2025-003",
        poAmount: 5000,
        advanceAmount: 5000,
        status: "Rejected",
        date: "2025-04-03",
    },
    {
        id: "4",
        requestRef: "2025-26-01-1 FY-ORG ID-004",
        supplierName: "BuildIt Corp",
        poNo: "N/A",
        poAmount: 750000,
        advanceAmount: 200000,
        status: "Pending",
        date: "2025-04-05",
    },
    {
        id: "5",
        requestRef: "2025-26-01-1 FY-ORG ID-005",
        supplierName: "Logistics Pro",
        poNo: "PO-2025-005",
        poAmount: 25000,
        advanceAmount: 0,
        status: "Detailed", // Using 'Detailed' as a placeholder or specific state if needed
        date: "2025-04-06",
    },
    {
        id: "6",
        requestRef: "2025-26-01-1 FY-ORG ID-006",
        supplierName: "Tech Innovations",
        poNo: "PO-2025-006",
        poAmount: 45000,
        advanceAmount: 15000,
        status: "Requested",
        date: "2025-04-07",
    },
    {
        id: "7",
        requestRef: "2025-26-01-1 FY-ORG ID-007",
        supplierName: "Green Energy Co",
        poNo: "PO-2025-007",
        poAmount: 80000,
        advanceAmount: 20000,
        status: "Requested",
        date: "2025-04-08",
    },
];
