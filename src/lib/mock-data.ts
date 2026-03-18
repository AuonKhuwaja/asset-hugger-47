export type AssetStatus = "available" | "in-use" | "maintenance" | "damaged" | "retired";
export type AssetCategory = "Laptop" | "Printer" | "Monitor" | "Phone" | "Server" | "Tablet" | "Projector" | "Network Equipment";

export interface Asset {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  category: AssetCategory;
  status: AssetStatus;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  vendor: string;
  assignee: string | null;
  department: string | null;
  condition: string;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  type: "preventive" | "corrective";
  date: string;
  cost: number;
  description: string;
  technician: string;
  status: "scheduled" | "in-progress" | "completed";
}

export interface TransferRecord {
  id: string;
  assetId: string;
  assetName: string;
  fromEmployee: string;
  toEmployee: string;
  date: string;
  status: "pending" | "approved" | "completed" | "rejected";
  approvedBy: string | null;
}

export interface DepartmentCost {
  department: string;
  assetCount: number;
  totalValue: number;
  maintenanceCost: number;
  depreciationCost: number;
  totalCost: number;
}

export const assets: Asset[] = [
  { id: "AST-001", name: "MacBook Pro 16\"", model: "A2485", serialNumber: "C02FW3LYMD6T", category: "Laptop", status: "in-use", purchaseDate: "2024-03-15", purchaseCost: 2499, currentValue: 2187, vendor: "Apple Inc.", assignee: "Sarah Chen", department: "Engineering", condition: "Good", lastMaintenance: "2025-11-20", nextMaintenance: "2026-05-20" },
  { id: "AST-002", name: "Dell UltraSharp 27\"", model: "U2723QE", serialNumber: "DL4K27X892", category: "Monitor", status: "available", purchaseDate: "2024-06-10", purchaseCost: 619, currentValue: 527, vendor: "Dell Technologies", assignee: null, department: null, condition: "Excellent", lastMaintenance: null, nextMaintenance: null },
  { id: "AST-003", name: "HP LaserJet Pro", model: "M404dn", serialNumber: "HPL404DN3871", category: "Printer", status: "maintenance", purchaseDate: "2023-01-22", purchaseCost: 349, currentValue: 210, vendor: "HP Inc.", assignee: null, department: "Operations", condition: "Fair", lastMaintenance: "2026-03-01", nextMaintenance: "2026-06-01" },
  { id: "AST-004", name: "ThinkPad X1 Carbon", model: "Gen 11", serialNumber: "LNV1CARB4420", category: "Laptop", status: "in-use", purchaseDate: "2024-09-01", purchaseCost: 1849, currentValue: 1664, vendor: "Lenovo", assignee: "James Rivera", department: "Marketing", condition: "Good", lastMaintenance: null, nextMaintenance: "2026-09-01" },
  { id: "AST-005", name: "iPhone 15 Pro", model: "A3101", serialNumber: "APIP15P7823", category: "Phone", status: "in-use", purchaseDate: "2024-11-05", purchaseCost: 999, currentValue: 899, vendor: "Apple Inc.", assignee: "Maria Santos", department: "Sales", condition: "Excellent", lastMaintenance: null, nextMaintenance: null },
  { id: "AST-006", name: "Dell PowerEdge R750", model: "R750xs", serialNumber: "DLPE750X1192", category: "Server", status: "in-use", purchaseDate: "2023-07-18", purchaseCost: 8499, currentValue: 6374, vendor: "Dell Technologies", assignee: "IT Infrastructure", department: "IT", condition: "Good", lastMaintenance: "2026-01-15", nextMaintenance: "2026-07-15" },
  { id: "AST-007", name: "iPad Pro 12.9\"", model: "M2", serialNumber: "APIT129M2443", category: "Tablet", status: "damaged", purchaseDate: "2024-02-28", purchaseCost: 1099, currentValue: 440, vendor: "Apple Inc.", assignee: "Tom Wilson", department: "Design", condition: "Damaged", lastMaintenance: "2026-02-10", nextMaintenance: null },
  { id: "AST-008", name: "Epson EB-L200SW", model: "V11HA70020", serialNumber: "EPNL200S5567", category: "Projector", status: "available", purchaseDate: "2023-11-12", purchaseCost: 1299, currentValue: 974, vendor: "Epson", assignee: null, department: null, condition: "Good", lastMaintenance: "2025-11-12", nextMaintenance: "2026-05-12" },
  { id: "AST-009", name: "Cisco Catalyst 9300", model: "C9300-48T", serialNumber: "CSC930048T882", category: "Network Equipment", status: "in-use", purchaseDate: "2023-04-05", purchaseCost: 4200, currentValue: 2940, vendor: "Cisco Systems", assignee: "IT Infrastructure", department: "IT", condition: "Good", lastMaintenance: "2026-01-05", nextMaintenance: "2026-07-05" },
  { id: "AST-010", name: "Surface Pro 9", model: "QIL-00001", serialNumber: "MSSP9Q1L0098", category: "Tablet", status: "retired", purchaseDate: "2022-10-20", purchaseCost: 1599, currentValue: 320, vendor: "Microsoft", assignee: null, department: null, condition: "Poor", lastMaintenance: "2025-06-20", nextMaintenance: null },
];

export const maintenanceRecords: MaintenanceRecord[] = [
  { id: "MNT-001", assetId: "AST-003", assetName: "HP LaserJet Pro", type: "corrective", date: "2026-03-01", cost: 185, description: "Fuser unit replacement", technician: "Alex Kim", status: "in-progress" },
  { id: "MNT-002", assetId: "AST-006", assetName: "Dell PowerEdge R750", type: "preventive", date: "2026-07-15", cost: 450, description: "Scheduled firmware update & diagnostics", technician: "Raj Patel", status: "scheduled" },
  { id: "MNT-003", assetId: "AST-001", assetName: "MacBook Pro 16\"", type: "preventive", date: "2026-05-20", cost: 120, description: "Battery health check & thermal paste", technician: "Alex Kim", status: "scheduled" },
  { id: "MNT-004", assetId: "AST-007", assetName: "iPad Pro 12.9\"", type: "corrective", date: "2026-02-10", cost: 380, description: "Screen replacement – drop damage", technician: "Lisa Chen", status: "completed" },
  { id: "MNT-005", assetId: "AST-009", assetName: "Cisco Catalyst 9300", type: "preventive", date: "2026-07-05", cost: 200, description: "Firmware update & port testing", technician: "Raj Patel", status: "scheduled" },
];

export const transferRecords: TransferRecord[] = [
  { id: "TRF-001", assetId: "AST-001", assetName: "MacBook Pro 16\"", fromEmployee: "Warehouse", toEmployee: "Sarah Chen", date: "2024-03-20", status: "completed", approvedBy: "Mark Thompson" },
  { id: "TRF-002", assetId: "AST-004", assetName: "ThinkPad X1 Carbon", fromEmployee: "Warehouse", toEmployee: "James Rivera", date: "2024-09-05", status: "completed", approvedBy: "Mark Thompson" },
  { id: "TRF-003", assetId: "AST-005", assetName: "iPhone 15 Pro", fromEmployee: "IT Pool", toEmployee: "Maria Santos", date: "2024-11-10", status: "completed", approvedBy: "Linda Park" },
  { id: "TRF-004", assetId: "AST-002", assetName: "Dell UltraSharp 27\"", fromEmployee: "Design Dept", toEmployee: "Warehouse", date: "2026-03-10", status: "pending", approvedBy: null },
  { id: "TRF-005", assetId: "AST-007", assetName: "iPad Pro 12.9\"", fromEmployee: "Tom Wilson", toEmployee: "Repair Center", date: "2026-02-08", status: "completed", approvedBy: "Mark Thompson" },
];

export const departmentCosts: DepartmentCost[] = [
  { department: "Engineering", assetCount: 24, totalValue: 58200, maintenanceCost: 3200, depreciationCost: 8730, totalCost: 11930 },
  { department: "Marketing", assetCount: 12, totalValue: 22100, maintenanceCost: 1100, depreciationCost: 3315, totalCost: 4415 },
  { department: "Sales", assetCount: 18, totalValue: 31400, maintenanceCost: 1800, depreciationCost: 4710, totalCost: 6510 },
  { department: "IT", assetCount: 35, totalValue: 124000, maintenanceCost: 8500, depreciationCost: 18600, totalCost: 27100 },
  { department: "Design", assetCount: 8, totalValue: 19800, maintenanceCost: 950, depreciationCost: 2970, totalCost: 3920 },
  { department: "Operations", assetCount: 15, totalValue: 18200, maintenanceCost: 2400, depreciationCost: 2730, totalCost: 5130 },
];

export const monthlyData = [
  { month: "Oct", maintenance: 4200, depreciation: 6800, repairs: 1200 },
  { month: "Nov", maintenance: 3800, depreciation: 6800, repairs: 2100 },
  { month: "Dec", maintenance: 5100, depreciation: 6800, repairs: 800 },
  { month: "Jan", maintenance: 3200, depreciation: 6800, repairs: 1500 },
  { month: "Feb", maintenance: 4600, depreciation: 6800, repairs: 3200 },
  { month: "Mar", maintenance: 3950, depreciation: 6800, repairs: 1800 },
];
