export type AssetStatus = "available" | "in-use" | "maintenance" | "damaged" | "retired";
export type AssetCategory = "Laptop" | "Printer" | "Monitor" | "Phone" | "Server" | "Tablet" | "Projector" | "Network Equipment" | "Mobile" | "Other";
export type MaintenanceType = "preventive" | "corrective";
export type TransferType = "issue" | "transfer" | "return";

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
  condition: "New" | "Good" | "Fair" | "Poor" | "Damaged" | "Excellent";
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  qrCode: string;
  description?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  type: MaintenanceType;
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
  type: TransferType;
  status: "pending" | "approved" | "completed" | "rejected";
  approvedBy: string | null;
  conditionOnTransfer?: string;
}

export interface DepartmentCost {
  department: string;
  assetCount: number;
  totalValue: number;
  maintenanceCost: number;
  depreciationCost: number;
  repairCost: number;
  totalCost: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  asset: string;
  user: string;
  time: string;
  type: "assignment" | "maintenance" | "transfer" | "return" | "registration";
}

export const departments = ["Engineering", "Marketing", "Sales", "IT", "Design", "Operations", "HR", "Finance"];
export const employees = ["Sarah Chen", "James Rivera", "Maria Santos", "Tom Wilson", "Alex Kim", "Raj Patel", "Lisa Chen", "Mark Thompson", "Linda Park", "David Lee"];

export const assets: Asset[] = [
  { id: "AST-001", name: "MacBook Pro 16\"", model: "A2485", serialNumber: "C02FW3LYMD6T", category: "Laptop", status: "in-use", purchaseDate: "2024-03-15", purchaseCost: 2499, currentValue: 2187, vendor: "Apple Inc.", assignee: "Sarah Chen", department: "Engineering", condition: "Good", lastMaintenance: "2025-11-20", nextMaintenance: "2026-05-20", qrCode: "QR-AST-001" },
  { id: "AST-002", name: "Dell UltraSharp 27\"", model: "U2723QE", serialNumber: "DL4K27X892", category: "Monitor", status: "available", purchaseDate: "2024-06-10", purchaseCost: 619, currentValue: 527, vendor: "Dell Technologies", assignee: null, department: null, condition: "Excellent", lastMaintenance: null, nextMaintenance: null, qrCode: "QR-AST-002" },
  { id: "AST-003", name: "HP LaserJet Pro", model: "M404dn", serialNumber: "HPL404DN3871", category: "Printer", status: "maintenance", purchaseDate: "2023-01-22", purchaseCost: 349, currentValue: 210, vendor: "HP Inc.", assignee: null, department: "Operations", condition: "Fair", lastMaintenance: "2026-03-01", nextMaintenance: "2026-06-01", qrCode: "QR-AST-003" },
  { id: "AST-004", name: "ThinkPad X1 Carbon", model: "Gen 11", serialNumber: "LNV1CARB4420", category: "Laptop", status: "in-use", purchaseDate: "2024-09-01", purchaseCost: 1849, currentValue: 1664, vendor: "Lenovo", assignee: "James Rivera", department: "Marketing", condition: "Good", lastMaintenance: null, nextMaintenance: "2026-09-01", qrCode: "QR-AST-004" },
  { id: "AST-005", name: "iPhone 15 Pro", model: "A3101", serialNumber: "APIP15P7823", category: "Mobile", status: "in-use", purchaseDate: "2024-11-05", purchaseCost: 999, currentValue: 899, vendor: "Apple Inc.", assignee: "Maria Santos", department: "Sales", condition: "Excellent", lastMaintenance: null, nextMaintenance: null, qrCode: "QR-AST-005" },
  { id: "AST-006", name: "Dell PowerEdge R750", model: "R750xs", serialNumber: "DLPE750X1192", category: "Server", status: "in-use", purchaseDate: "2023-07-18", purchaseCost: 8499, currentValue: 6374, vendor: "Dell Technologies", assignee: "IT Infrastructure", department: "IT", condition: "Good", lastMaintenance: "2026-01-15", nextMaintenance: "2026-07-15", qrCode: "QR-AST-006" },
  { id: "AST-007", name: "iPad Pro 12.9\"", model: "M2", serialNumber: "APIT129M2443", category: "Tablet", status: "damaged", purchaseDate: "2024-02-28", purchaseCost: 1099, currentValue: 440, vendor: "Apple Inc.", assignee: "Tom Wilson", department: "Design", condition: "Damaged", lastMaintenance: "2026-02-10", nextMaintenance: null, qrCode: "QR-AST-007" },
  { id: "AST-008", name: "Epson EB-L200SW", model: "V11HA70020", serialNumber: "EPNL200S5567", category: "Projector", status: "available", purchaseDate: "2023-11-12", purchaseCost: 1299, currentValue: 974, vendor: "Epson", assignee: null, department: null, condition: "Good", lastMaintenance: "2025-11-12", nextMaintenance: "2026-05-12", qrCode: "QR-AST-008" },
  { id: "AST-009", name: "Cisco Catalyst 9300", model: "C9300-48T", serialNumber: "CSC930048T882", category: "Network Equipment", status: "in-use", purchaseDate: "2023-04-05", purchaseCost: 4200, currentValue: 2940, vendor: "Cisco Systems", assignee: "IT Infrastructure", department: "IT", condition: "Good", lastMaintenance: "2026-01-05", nextMaintenance: "2026-07-05", qrCode: "QR-AST-009" },
  { id: "AST-010", name: "Surface Pro 9", model: "QIL-00001", serialNumber: "MSSP9Q1L0098", category: "Tablet", status: "retired", purchaseDate: "2022-10-20", purchaseCost: 1599, currentValue: 320, vendor: "Microsoft", assignee: null, department: null, condition: "Poor", lastMaintenance: "2025-06-20", nextMaintenance: null, qrCode: "QR-AST-010" },
  { id: "AST-011", name: "Canon imageCLASS", model: "MF445dw", serialNumber: "CNiC445DW112", category: "Printer", status: "in-use", purchaseDate: "2024-01-10", purchaseCost: 429, currentValue: 343, vendor: "Canon", assignee: null, department: "HR", condition: "Good", lastMaintenance: "2025-07-10", nextMaintenance: "2026-01-10", qrCode: "QR-AST-011" },
  { id: "AST-012", name: "Samsung Galaxy S24", model: "SM-S921B", serialNumber: "SGS24U9981", category: "Mobile", status: "in-use", purchaseDate: "2024-04-20", purchaseCost: 799, currentValue: 639, vendor: "Samsung", assignee: "David Lee", department: "Finance", condition: "Good", lastMaintenance: null, nextMaintenance: null, qrCode: "QR-AST-012" },
];

export const maintenanceRecords: MaintenanceRecord[] = [
  { id: "MNT-001", assetId: "AST-003", assetName: "HP LaserJet Pro", type: "corrective", date: "2026-03-01", cost: 185, description: "Fuser unit replacement", technician: "Alex Kim", status: "in-progress" },
  { id: "MNT-002", assetId: "AST-006", assetName: "Dell PowerEdge R750", type: "preventive", date: "2026-07-15", cost: 450, description: "Scheduled firmware update & diagnostics", technician: "Raj Patel", status: "scheduled" },
  { id: "MNT-003", assetId: "AST-001", assetName: "MacBook Pro 16\"", type: "preventive", date: "2026-05-20", cost: 120, description: "Battery health check & thermal paste", technician: "Alex Kim", status: "scheduled" },
  { id: "MNT-004", assetId: "AST-007", assetName: "iPad Pro 12.9\"", type: "corrective", date: "2026-02-10", cost: 380, description: "Screen replacement – drop damage", technician: "Lisa Chen", status: "completed" },
  { id: "MNT-005", assetId: "AST-009", assetName: "Cisco Catalyst 9300", type: "preventive", date: "2026-07-05", cost: 200, description: "Firmware update & port testing", technician: "Raj Patel", status: "scheduled" },
  { id: "MNT-006", assetId: "AST-011", assetName: "Canon imageCLASS", type: "preventive", date: "2026-01-10", cost: 95, description: "Routine cleaning & toner check", technician: "Alex Kim", status: "completed" },
];

export const transferRecords: TransferRecord[] = [
  { id: "TRF-001", assetId: "AST-001", assetName: "MacBook Pro 16\"", fromEmployee: "Warehouse", toEmployee: "Sarah Chen", date: "2024-03-20", type: "issue", status: "completed", approvedBy: "Mark Thompson" },
  { id: "TRF-002", assetId: "AST-004", assetName: "ThinkPad X1 Carbon", fromEmployee: "Warehouse", toEmployee: "James Rivera", date: "2024-09-05", type: "issue", status: "completed", approvedBy: "Mark Thompson" },
  { id: "TRF-003", assetId: "AST-005", assetName: "iPhone 15 Pro", fromEmployee: "IT Pool", toEmployee: "Maria Santos", date: "2024-11-10", type: "issue", status: "completed", approvedBy: "Linda Park" },
  { id: "TRF-004", assetId: "AST-002", assetName: "Dell UltraSharp 27\"", fromEmployee: "Design Dept", toEmployee: "Warehouse", date: "2026-03-10", type: "return", status: "pending", approvedBy: null },
  { id: "TRF-005", assetId: "AST-007", assetName: "iPad Pro 12.9\"", fromEmployee: "Tom Wilson", toEmployee: "Repair Center", date: "2026-02-08", type: "transfer", status: "completed", approvedBy: "Mark Thompson" },
  { id: "TRF-006", assetId: "AST-012", assetName: "Samsung Galaxy S24", fromEmployee: "Warehouse", toEmployee: "David Lee", date: "2024-04-25", type: "issue", status: "completed", approvedBy: "Linda Park" },
];

export const departmentCosts: DepartmentCost[] = [
  { department: "Engineering", assetCount: 24, totalValue: 58200, maintenanceCost: 3200, depreciationCost: 8730, repairCost: 1200, totalCost: 13130 },
  { department: "Marketing", assetCount: 12, totalValue: 22100, maintenanceCost: 1100, depreciationCost: 3315, repairCost: 450, totalCost: 4865 },
  { department: "Sales", assetCount: 18, totalValue: 31400, maintenanceCost: 1800, depreciationCost: 4710, repairCost: 800, totalCost: 7310 },
  { department: "IT", assetCount: 35, totalValue: 124000, maintenanceCost: 8500, depreciationCost: 18600, repairCost: 3200, totalCost: 30300 },
  { department: "Design", assetCount: 8, totalValue: 19800, maintenanceCost: 950, depreciationCost: 2970, repairCost: 600, totalCost: 4520 },
  { department: "Operations", assetCount: 15, totalValue: 18200, maintenanceCost: 2400, depreciationCost: 2730, repairCost: 950, totalCost: 6080 },
  { department: "HR", assetCount: 6, totalValue: 8400, maintenanceCost: 400, depreciationCost: 1260, repairCost: 200, totalCost: 1860 },
  { department: "Finance", assetCount: 10, totalValue: 15600, maintenanceCost: 700, depreciationCost: 2340, repairCost: 350, totalCost: 3390 },
];

export const monthlyData = [
  { month: "Oct", maintenance: 4200, depreciation: 6800, repairs: 1200 },
  { month: "Nov", maintenance: 3800, depreciation: 6800, repairs: 2100 },
  { month: "Dec", maintenance: 5100, depreciation: 6800, repairs: 800 },
  { month: "Jan", maintenance: 3200, depreciation: 6800, repairs: 1500 },
  { month: "Feb", maintenance: 4600, depreciation: 6800, repairs: 3200 },
  { month: "Mar", maintenance: 3950, depreciation: 6800, repairs: 1800 },
];

export const recentActivity: ActivityItem[] = [
  { id: "ACT-001", action: "Asset Registered", asset: "Samsung Galaxy S24", user: "Admin", time: "2 hours ago", type: "registration" },
  { id: "ACT-002", action: "Assigned to Employee", asset: "MacBook Pro 16\"", user: "Mark Thompson", time: "4 hours ago", type: "assignment" },
  { id: "ACT-003", action: "Maintenance Scheduled", asset: "Dell PowerEdge R750", user: "Raj Patel", time: "Yesterday", type: "maintenance" },
  { id: "ACT-004", action: "Transferred", asset: "iPad Pro 12.9\"", user: "Tom Wilson", time: "2 days ago", type: "transfer" },
  { id: "ACT-005", action: "Returned", asset: "Dell UltraSharp 27\"", user: "Design Dept", time: "3 days ago", type: "return" },
  { id: "ACT-006", action: "Repair Completed", asset: "HP LaserJet Pro", user: "Alex Kim", time: "4 days ago", type: "maintenance" },
];

// ── Categories ──
export interface Category {
  id: string;
  name: string;
  description: string;
  assetCount: number;
  createdAt: string;
}

export const categories: Category[] = [
  { id: "CAT-001", name: "Laptop", description: "Portable computing devices", assetCount: 3, createdAt: "2024-01-10" },
  { id: "CAT-002", name: "Printer", description: "Printing and scanning devices", assetCount: 2, createdAt: "2024-01-10" },
  { id: "CAT-003", name: "Monitor", description: "Display screens and monitors", assetCount: 1, createdAt: "2024-01-10" },
  { id: "CAT-004", name: "Phone", description: "Mobile phones and handsets", assetCount: 0, createdAt: "2024-02-15" },
  { id: "CAT-005", name: "Server", description: "Server and rack equipment", assetCount: 1, createdAt: "2024-02-15" },
  { id: "CAT-006", name: "Tablet", description: "Tablet devices", assetCount: 2, createdAt: "2024-03-01" },
  { id: "CAT-007", name: "Projector", description: "Projection equipment", assetCount: 1, createdAt: "2024-03-01" },
  { id: "CAT-008", name: "Network Equipment", description: "Routers, switches, and network gear", assetCount: 1, createdAt: "2024-03-15" },
  { id: "CAT-009", name: "Mobile", description: "Mobile devices and accessories", assetCount: 2, createdAt: "2024-04-01" },
  { id: "CAT-010", name: "Other", description: "Miscellaneous equipment", assetCount: 0, createdAt: "2024-04-01" },
];

// ── Companies ──
export interface Company {
  id: string;
  name: string;
  industry: string;
  assetCount: number;
  employeeCount: number;
  location: string;
}

export const companies: Company[] = [
  { id: "CMP-001", name: "TechVault Corp", industry: "Technology", assetCount: 85, employeeCount: 120, location: "Islamabad" },
  { id: "CMP-002", name: "Global Logistics", industry: "Logistics", assetCount: 210, employeeCount: 300, location: "Karachi" },
  { id: "CMP-003", name: "Creative Solutions", industry: "Design", assetCount: 42, employeeCount: 55, location: "Lahore" },
  { id: "CMP-004", name: "FinanceHub Ltd", industry: "Finance", assetCount: 65, employeeCount: 80, location: "Rawalpindi" },
];

// ── Roles ──
export type UserRole = "super_admin" | "admin" | "viewer";

export interface AppUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone: string;
  department: string;
  assignedCompanies: string[]; // company IDs
  avatar?: string;
}

export const appUsers: AppUser[] = [
  { email: "superadmin@trackvault.com", password: "super123", name: "Super Admin", role: "super_admin", phone: "+92 300 1234567", department: "Management", assignedCompanies: ["CMP-001", "CMP-002", "CMP-003", "CMP-004"] },
  { email: "admin@trackvault.com", password: "admin123", name: "Ahmed Khan", role: "admin", phone: "+92 312 9876543", department: "IT", assignedCompanies: ["CMP-001", "CMP-002"] },
  { email: "viewer@trackvault.com", password: "viewer123", name: "Sara Ali", role: "viewer", phone: "+92 321 5556666", department: "Operations", assignedCompanies: ["CMP-001"] },
];

export const depreciationData = assets.map(a => ({
  id: a.id,
  name: a.name,
  purchaseCost: a.purchaseCost,
  currentValue: a.currentValue,
  depreciation: a.purchaseCost - a.currentValue,
  depreciationRate: Math.round(((a.purchaseCost - a.currentValue) / a.purchaseCost) * 100),
}));