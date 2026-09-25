export interface RepairItem {
  id: string;
  repairId: string;
  vehicleId: string;
  name: string;
  type: 'น้ำมัน' | 'อะไหล่' | 'ยาง' | 'Filter' | 'Brake' | 'อื่นๆ';
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  total: number;
  status: 'pending' | 'ordered' | 'received' | 'installed' | 'cancelled';
  reminderKm?: number;
  reminderDays?: number;
  notes?: string;
}

export interface PurchaseOrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  actualPrice?: number;
  receivedQty?: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vehicleId: string;
  maintenancePlanId?: string;
  repairId?: string;
  orderDate: string;
  supplier: string;
  items: PurchaseOrderItem[];
  status: 'draft' | 'requested' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
  totalAmount: number;
  currency: string;
  notes?: string;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  docType: 'ค่าทาง' | 'ประกันภัย' | 'ตรวจสภาพทางเทคนิค' | 'สมุดทะเบียนรถ' | 'สัญญาเช่า' | 'หนังสือผ่านแดน' | 'พรบ.' | 'อื่นๆ';
  docNumber: string;
  startDate: string;
  expiryDate: string;
  cost: number;
  currency: string;
  status: 'active' | 'expiring_soon' | 'expired';
  country?: 'ลาว' | 'ไทย' | 'เวียดนาม';
  notes?: string;
  attachments?: string[];
}

export interface Payment {
  id: string;
  repairId: string;
  amount: number;
  currency: string;
  paidDate: string;
  method: 'cash' | 'transfer' | 'card';
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  notes?: string;
}

export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'document' | 'maintenance' | 'repair' | 'order';
  title: string;
  message: string;
  vehicleId?: string;
  vehiclePlate?: string;
  date: string;
  read: boolean;
  actionLabel?: string;
  actionPage?: string;
}

export const repairItems: RepairItem[] = [
  { id: 'RI001', repairId: 'REP001', vehicleId: 'VH001', name: 'น้ำมันเครื่อง 5W-30', type: 'น้ำมัน', quantity: 5, unit: 'ลิตร', unitPrice: 250, discount: 0, total: 1250, status: 'installed', reminderKm: 5000, reminderDays: 90 },
  { id: 'RI002', repairId: 'REP001', vehicleId: 'VH001', name: 'กรองน้ำมันเครื่อง', type: 'Filter', quantity: 1, unit: 'ชิ้น', unitPrice: 180, discount: 10, total: 170, status: 'installed', reminderKm: 5000 },
  { id: 'RI003', repairId: 'REP002', vehicleId: 'VH002', name: 'ผ้าเบรคหน้า', type: 'Brake', quantity: 1, unit: 'ชุด', unitPrice: 1800, discount: 0, total: 1800, status: 'installed', reminderKm: 30000 },
  { id: 'RI004', repairId: 'REP002', vehicleId: 'VH002', name: 'น้ำมันเบรค DOT4', type: 'น้ำมัน', quantity: 1, unit: 'ขวด', unitPrice: 350, discount: 0, total: 350, status: 'installed' },
  { id: 'RI005', repairId: 'REP003', vehicleId: 'VH003', name: 'ยางรถยนต์ 205/55R16', type: 'ยาง', quantity: 4, unit: 'เส้น', unitPrice: 3200, discount: 200, total: 12600, status: 'installed', reminderKm: 50000 },
  { id: 'RI006', repairId: 'REP003', vehicleId: 'VH003', name: 'จุ๊บลมยาง', type: 'อะไหล่', quantity: 4, unit: 'ชิ้น', unitPrice: 50, discount: 0, total: 200, status: 'installed' },
  { id: 'RI007', repairId: 'REP004', vehicleId: 'VH004', name: 'กรองอากาศ', type: 'Filter', quantity: 1, unit: 'ชิ้น', unitPrice: 450, discount: 0, total: 450, status: 'installed', reminderKm: 10000 },
  { id: 'RI008', repairId: 'REP004', vehicleId: 'VH004', name: 'น้ำมันเครื่อง 10W-40', type: 'น้ำมัน', quantity: 4, unit: 'ลิตร', unitPrice: 220, discount: 0, total: 880, status: 'installed', reminderKm: 5000 },
  { id: 'RI009', repairId: 'REP005', vehicleId: 'VH005', name: 'แบตเตอรี่ 75Ah', type: 'อะไหล่', quantity: 1, unit: 'ลูก', unitPrice: 3500, discount: 0, total: 3500, status: 'installed', reminderDays: 730 },
  { id: 'RI010', repairId: 'REP005', vehicleId: 'VH005', name: 'กรองแอร์', type: 'Filter', quantity: 1, unit: 'ชิ้น', unitPrice: 280, discount: 0, total: 280, status: 'installed', reminderKm: 15000 },
  { id: 'RI011', repairId: 'REP006', vehicleId: 'VH006', name: 'ผ้าเบรคหลัง', type: 'Brake', quantity: 1, unit: 'ชุด', unitPrice: 1500, discount: 100, total: 1400, status: 'installed' },
  { id: 'RI012', repairId: 'REP006', vehicleId: 'VH006', name: 'โช้คอัพหน้า', type: 'อะไหล่', quantity: 2, unit: 'ชิ้น', unitPrice: 4500, discount: 0, total: 9000, status: 'ordered' },
  { id: 'RI013', repairId: 'REP007', vehicleId: 'VH007', name: 'น้ำมันเกียร์', type: 'น้ำมัน', quantity: 2, unit: 'ลิตร', unitPrice: 400, discount: 0, total: 800, status: 'installed', reminderKm: 40000 },
  { id: 'RI014', repairId: 'REP007', vehicleId: 'VH007', name: 'กรองเชื้อเพลิง', type: 'Filter', quantity: 1, unit: 'ชิ้น', unitPrice: 320, discount: 0, total: 320, status: 'installed' },
  { id: 'RI015', repairId: 'REP008', vehicleId: 'VH008', name: 'ยางรถยนต์ 215/65R17', type: 'ยาง', quantity: 2, unit: 'เส้น', unitPrice: 3800, discount: 300, total: 7300, status: 'installed' },
  { id: 'RI016', repairId: 'REP008', vehicleId: 'VH008', name: 'บาลานซ์ล้อ', type: 'อื่นๆ', quantity: 4, unit: 'ล้อ', unitPrice: 150, discount: 0, total: 600, status: 'installed' },
  { id: 'RI017', repairId: 'REP009', vehicleId: 'VH009', name: 'คอมเพรสเซอร์แอร์', type: 'อะไหล่', quantity: 1, unit: 'ชิ้น', unitPrice: 12000, discount: 0, total: 12000, status: 'ordered' },
  { id: 'RI018', repairId: 'REP009', vehicleId: 'VH009', name: 'น้ำยาแอร์ R134a', type: 'น้ำมัน', quantity: 2, unit: 'กิโลกรัม', unitPrice: 850, discount: 0, total: 1700, status: 'pending' },
  { id: 'RI019', repairId: 'REP010', vehicleId: 'VH010', name: 'น้ำมันเครื่อง 5W-40 Fully Synthetic', type: 'น้ำมัน', quantity: 5, unit: 'ลิตร', unitPrice: 380, discount: 0, total: 1900, status: 'installed', reminderKm: 10000 },
  { id: 'RI020', repairId: 'REP010', vehicleId: 'VH010', name: 'กรองน้ำมันเครื่อง OEM', type: 'Filter', quantity: 1, unit: 'ชิ้น', unitPrice: 250, discount: 0, total: 250, status: 'installed' },
  { id: 'RI021', repairId: 'REP011', vehicleId: 'VH011', name: 'สายพานราวลิ้น', type: 'อะไหล่', quantity: 1, unit: 'ชิ้น', unitPrice: 2800, discount: 0, total: 2800, status: 'installed', reminderKm: 60000 },
  { id: 'RI022', repairId: 'REP011', vehicleId: 'VH011', name: 'ลูกปืนฟรีลี่', type: 'อะไหล่', quantity: 1, unit: 'ชิ้น', unitPrice: 950, discount: 0, total: 950, status: 'installed' },
  { id: 'RI023', repairId: 'REP012', vehicleId: 'VH012', name: 'ผ้าเบรคหน้า+หลัง', type: 'Brake', quantity: 2, unit: 'ชุด', unitPrice: 1600, discount: 0, total: 3200, status: 'installed' },
  { id: 'RI024', repairId: 'REP012', vehicleId: 'VH012', name: 'จานดิสก์เบรคหน้า', type: 'Brake', quantity: 2, unit: 'ชิ้น', unitPrice: 2200, discount: 0, total: 4400, status: 'installed' },
  { id: 'RI025', repairId: 'REP013', vehicleId: 'VH013', name: 'ยางรถยนต์ 225/55R18', type: 'ยาง', quantity: 4, unit: 'เส้น', unitPrice: 4500, discount: 500, total: 17500, status: 'installed' },
  { id: 'RI026', repairId: 'REP013', vehicleId: 'VH013', name: 'ถ่วงล้อ', type: 'อื่นๆ', quantity: 4, unit: 'ล้อ', unitPrice: 200, discount: 0, total: 800, status: 'installed' },
  { id: 'RI027', repairId: 'REP014', vehicleId: 'VH014', name: 'น้ำมันเพาเวอร์', type: 'น้ำมัน', quantity: 1, unit: 'ขวด', unitPrice: 450, discount: 0, total: 450, status: 'installed' },
  { id: 'RI028', repairId: 'REP014', vehicleId: 'VH014', name: 'ปั๊มน้ำ', type: 'อะไหล่', quantity: 1, unit: 'ชิ้น', unitPrice: 3200, discount: 0, total: 3200, status: 'ordered' },
  { id: 'RI029', repairId: 'REP015', vehicleId: 'VH015', name: 'หัวเทียน NGK Iridium', type: 'อะไหล่', quantity: 4, unit: 'ชิ้น', unitPrice: 650, discount: 0, total: 2600, status: 'installed', reminderKm: 40000 },
  { id: 'RI030', repairId: 'REP015', vehicleId: 'VH015', name: 'กรองอากาศ K&N', type: 'Filter', quantity: 1, unit: 'ชิ้น', unitPrice: 1800, discount: 0, total: 1800, status: 'installed' },
  { id: 'RI031', repairId: 'REP016', vehicleId: 'VH016', name: 'น้ำมันเครื่อง Diesel 15W-40', type: 'น้ำมัน', quantity: 7, unit: 'ลิตร', unitPrice: 200, discount: 0, total: 1400, status: 'installed' },
  { id: 'RI032', repairId: 'REP016', vehicleId: 'VH016', name: 'กรองโซล่า', type: 'Filter', quantity: 1, unit: 'ชิ้น', unitPrice: 280, discount: 0, total: 280, status: 'installed' },
  { id: 'RI033', repairId: 'REP017', vehicleId: 'VH017', name: 'ช่วงล่างหน้า ลูกหมาก', type: 'อะไหล่', quantity: 2, unit: 'ชิ้น', unitPrice: 1200, discount: 0, total: 2400, status: 'installed' },
  { id: 'RI034', repairId: 'REP017', vehicleId: 'VH017', name: 'บูชแขนปีกนกบน', type: 'อะไหล่', quantity: 4, unit: 'ชิ้น', unitPrice: 450, discount: 0, total: 1800, status: 'installed' },
  { id: 'RI035', repairId: 'REP018', vehicleId: 'VH018', name: 'คลัตช์ชุด', type: 'อะไหล่', quantity: 1, unit: 'ชุด', unitPrice: 8500, discount: 0, total: 8500, status: 'installed' },
  { id: 'RI036', repairId: 'REP018', vehicleId: 'VH018', name: 'น้ำมันคลัตช์', type: 'น้ำมัน', quantity: 1, unit: 'ขวด', unitPrice: 180, discount: 0, total: 180, status: 'installed' },
  { id: 'RI037', repairId: 'REP019', vehicleId: 'VH019', name: 'ยางรถยนต์ 195/65R15', type: 'ยาง', quantity: 4, unit: 'เส้น', unitPrice: 2800, discount: 200, total: 10800, status: 'installed' },
  { id: 'RI038', repairId: 'REP019', vehicleId: 'VH019', name: 'วาล์วลม', type: 'อะไหล่', quantity: 4, unit: 'ชิ้น', unitPrice: 45, discount: 0, total: 180, status: 'installed' },
  { id: 'RI039', repairId: 'REP020', vehicleId: 'VH020', name: 'ไฟหน้า LED', type: 'อะไหล่', quantity: 2, unit: 'ดวง', unitPrice: 2500, discount: 0, total: 5000, status: 'installed' },
  { id: 'RI040', repairId: 'REP020', vehicleId: 'VH020', name: 'หลอดไฟท้าย', type: 'อะไหล่', quantity: 2, unit: 'ดวง', unitPrice: 350, discount: 0, total: 700, status: 'installed' },
  { id: 'RI041', repairId: 'REP021', vehicleId: 'VH021', name: 'น้ำมันเครื่อง 0W-20', type: 'น้ำมัน', quantity: 4, unit: 'ลิตร', unitPrice: 420, discount: 0, total: 1680, status: 'installed', reminderKm: 10000 },
  { id: 'RI042', repairId: 'REP021', vehicleId: 'VH021', name: 'กรองน้ำมันเครื่อง', type: 'Filter', quantity: 1, unit: 'ชิ้น', unitPrice: 200, discount: 0, total: 200, status: 'installed' },
  { id: 'RI043', repairId: 'REP022', vehicleId: 'VH022', name: 'ผ้าเบรคหน้า Performance', type: 'Brake', quantity: 1, unit: 'ชุด', unitPrice: 3200, discount: 0, total: 3200, status: 'installed' },
  { id: 'RI044', repairId: 'REP022', vehicleId: 'VH022', name: 'น้ำมันเบรค Racing', type: 'น้ำมัน', quantity: 1, unit: 'ขวด', unitPrice: 650, discount: 0, total: 650, status: 'installed' },
  { id: 'RI045', repairId: 'REP023', vehicleId: 'VH023', name: 'โช้คอัพหลัง', type: 'อะไหล่', quantity: 2, unit: 'ชิ้น', unitPrice: 3800, discount: 0, total: 7600, status: 'received' },
  { id: 'RI046', repairId: 'REP023', vehicleId: 'VH023', name: 'สปริงหลัง', type: 'อะไหล่', quantity: 2, unit: 'ชิ้น', unitPrice: 2100, discount: 0, total: 4200, status: 'received' },
  { id: 'RI047', repairId: 'REP024', vehicleId: 'VH024', name: 'กรองอากาศ Diesel', type: 'Filter', quantity: 1, unit: 'ชิ้น', unitPrice: 680, discount: 0, total: 680, status: 'installed' },
  { id: 'RI048', repairId: 'REP024', vehicleId: 'VH024', name: 'น้ำมันเครื่อง Diesel 5W-30', type: 'น้ำมัน', quantity: 8, unit: 'ลิตร', unitPrice: 280, discount: 0, total: 2240, status: 'installed' },
  { id: 'RI049', repairId: 'REP025', vehicleId: 'VH025', name: 'ยางรถยนต์ 265/65R17', type: 'ยาง', quantity: 4, unit: 'เส้น', unitPrice: 5200, discount: 0, total: 20800, status: 'pending' },
  { id: 'RI050', repairId: 'REP025', vehicleId: 'VH025', name: 'กรองน้ำมันเชื้อเพลิง', type: 'Filter', quantity: 1, unit: 'ชิ้น', unitPrice: 420, discount: 0, total: 420, status: 'pending' },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO001', orderNumber: 'PO-2024-001', vehicleId: 'VH001', repairId: 'REP001',
    orderDate: '2024-10-01', supplier: 'บริษัท ออโต้พาร์ท จำกัด',
    items: [
      { id: 'POI001', name: 'น้ำมันเครื่อง 5W-30', quantity: 5, unit: 'ลิตร', estimatedPrice: 250, actualPrice: 250, receivedQty: 5 },
      { id: 'POI002', name: 'กรองน้ำมันเครื่อง', quantity: 1, unit: 'ชิ้น', estimatedPrice: 180, actualPrice: 170, receivedQty: 1 },
    ],
    status: 'received', totalAmount: 1420, currency: 'THB',
  },
  {
    id: 'PO002', orderNumber: 'PO-2024-002', vehicleId: 'VH002', repairId: 'REP002',
    orderDate: '2024-10-03', supplier: 'ร้าน เบรคไทย',
    items: [
      { id: 'POI003', name: 'ผ้าเบรคหน้า', quantity: 1, unit: 'ชุด', estimatedPrice: 1800, actualPrice: 1800, receivedQty: 1 },
    ],
    status: 'received', totalAmount: 1800, currency: 'THB',
  },
  {
    id: 'PO003', orderNumber: 'PO-2024-003', vehicleId: 'VH003', repairId: 'REP003',
    orderDate: '2024-10-05', supplier: 'บริษัท ยางไทย จำกัด',
    items: [
      { id: 'POI004', name: 'ยางรถยนต์ 205/55R16', quantity: 4, unit: 'เส้น', estimatedPrice: 3200, actualPrice: 3000, receivedQty: 4 },
    ],
    status: 'received', totalAmount: 12000, currency: 'THB',
  },
  {
    id: 'PO004', orderNumber: 'PO-2024-004', vehicleId: 'VH004',
    orderDate: '2024-10-08', supplier: 'บริษัท ออโต้พาร์ท จำกัด',
    items: [
      { id: 'POI005', name: 'กรองอากาศ', quantity: 1, unit: 'ชิ้น', estimatedPrice: 450, receivedQty: 0 },
      { id: 'POI006', name: 'น้ำมันเครื่อง 10W-40', quantity: 4, unit: 'ลิตร', estimatedPrice: 220, receivedQty: 0 },
    ],
    status: 'ordered', totalAmount: 1330, currency: 'THB',
  },
  {
    id: 'PO005', orderNumber: 'PO-2024-005', vehicleId: 'VH005', repairId: 'REP005',
    orderDate: '2024-10-10', supplier: 'ร้าน แบตเตอรี่ยนต์',
    items: [
      { id: 'POI007', name: 'แบตเตอรี่ 75Ah', quantity: 1, unit: 'ลูก', estimatedPrice: 3500, actualPrice: 3500, receivedQty: 1 },
    ],
    status: 'received', totalAmount: 3500, currency: 'THB',
  },
  {
    id: 'PO006', orderNumber: 'PO-2024-006', vehicleId: 'VH006', repairId: 'REP006',
    orderDate: '2024-10-12', supplier: 'บริษัท ช่วงล่างไทย จำกัด',
    items: [
      { id: 'POI008', name: 'โช้คอัพหน้า', quantity: 2, unit: 'ชิ้น', estimatedPrice: 4500, receivedQty: 0 },
    ],
    status: 'ordered', totalAmount: 9000, currency: 'THB', notes: 'รอสั่งจากญี่ปุ่น',
  },
  {
    id: 'PO007', orderNumber: 'PO-2024-007', vehicleId: 'VH007',
    orderDate: '2024-10-14', supplier: 'บริษัท ออโต้พาร์ท จำกัด',
    items: [
      { id: 'POI009', name: 'น้ำมันเกียร์', quantity: 2, unit: 'ลิตร', estimatedPrice: 400, actualPrice: 400, receivedQty: 2 },
      { id: 'POI010', name: 'กรองเชื้อเพลิง', quantity: 1, unit: 'ชิ้น', estimatedPrice: 320, actualPrice: 320, receivedQty: 1 },
    ],
    status: 'received', totalAmount: 1120, currency: 'THB',
  },
  {
    id: 'PO008', orderNumber: 'PO-2024-008', vehicleId: 'VH008',
    orderDate: '2024-10-15', supplier: 'บริษัท ยางไทย จำกัด',
    items: [
      { id: 'POI011', name: 'ยางรถยนต์ 215/65R17', quantity: 2, unit: 'เส้น', estimatedPrice: 3800, actualPrice: 3500, receivedQty: 2 },
    ],
    status: 'received', totalAmount: 7000, currency: 'THB',
  },
  {
    id: 'PO009', orderNumber: 'PO-2024-009', vehicleId: 'VH009', repairId: 'REP009',
    orderDate: '2024-10-17', supplier: 'บริษัท แอร์คูล จำกัด',
    items: [
      { id: 'POI012', name: 'คอมเพรสเซอร์แอร์', quantity: 1, unit: 'ชิ้น', estimatedPrice: 12000, receivedQty: 0 },
      { id: 'POI013', name: 'น้ำยาแอร์ R134a', quantity: 2, unit: 'กิโลกรัม', estimatedPrice: 850, receivedQty: 0 },
    ],
    status: 'requested', totalAmount: 13700, currency: 'THB',
  },
  {
    id: 'PO010', orderNumber: 'PO-2024-010', vehicleId: 'VH010',
    orderDate: '2024-10-18', supplier: 'บริษัท ออโต้พาร์ท จำกัด',
    items: [
      { id: 'POI014', name: 'น้ำมันเครื่อง Fully Synthetic', quantity: 5, unit: 'ลิตร', estimatedPrice: 380, actualPrice: 380, receivedQty: 5 },
    ],
    status: 'received', totalAmount: 1900, currency: 'THB',
  },
  {
    id: 'PO011', orderNumber: 'PO-2024-011', vehicleId: 'VH011', repairId: 'REP011',
    orderDate: '2024-10-19', supplier: 'บริษัท อะไหล่รถ จำกัด',
    items: [
      { id: 'POI015', name: 'สายพานราวลิ้น', quantity: 1, unit: 'ชิ้น', estimatedPrice: 2800, actualPrice: 2800, receivedQty: 1 },
      { id: 'POI016', name: 'ลูกปืนฟรีลี่', quantity: 1, unit: 'ชิ้น', estimatedPrice: 950, actualPrice: 950, receivedQty: 1 },
    ],
    status: 'received', totalAmount: 3750, currency: 'THB',
  },
  {
    id: 'PO012', orderNumber: 'PO-2024-012', vehicleId: 'VH012',
    orderDate: '2024-10-20', supplier: 'ร้าน เบรคไทย',
    items: [
      { id: 'POI017', name: 'ผ้าเบรคหน้า+หลัง', quantity: 2, unit: 'ชุด', estimatedPrice: 1600, actualPrice: 1600, receivedQty: 2 },
      { id: 'POI018', name: 'จานดิสก์เบรคหน้า', quantity: 2, unit: 'ชิ้น', estimatedPrice: 2200, actualPrice: 2200, receivedQty: 2 },
    ],
    status: 'received', totalAmount: 7600, currency: 'THB',
  },
  {
    id: 'PO013', orderNumber: 'PO-2024-013', vehicleId: 'VH013',
    orderDate: '2024-10-21', supplier: 'บริษัท ยางไทย จำกัด',
    items: [
      { id: 'POI019', name: 'ยางรถยนต์ 225/55R18', quantity: 4, unit: 'เส้น', estimatedPrice: 4500, receivedQty: 0 },
    ],
    status: 'draft', totalAmount: 18000, currency: 'THB',
  },
  {
    id: 'PO014', orderNumber: 'PO-2024-014', vehicleId: 'VH014', repairId: 'REP014',
    orderDate: '2024-10-22', supplier: 'บริษัท อะไหล่รถ จำกัด',
    items: [
      { id: 'POI020', name: 'ปั๊มน้ำ', quantity: 1, unit: 'ชิ้น', estimatedPrice: 3200, receivedQty: 0 },
    ],
    status: 'ordered', totalAmount: 3200, currency: 'THB',
  },
  {
    id: 'PO015', orderNumber: 'PO-2024-015', vehicleId: 'VH015',
    orderDate: '2024-10-22', supplier: 'บริษัท สปาร์คพลัส จำกัด',
    items: [
      { id: 'POI021', name: 'หัวเทียน NGK Iridium', quantity: 4, unit: 'ชิ้น', estimatedPrice: 650, actualPrice: 640, receivedQty: 4 },
      { id: 'POI022', name: 'กรองอากาศ K&N', quantity: 1, unit: 'ชิ้น', estimatedPrice: 1800, actualPrice: 1800, receivedQty: 1 },
    ],
    status: 'partially_received', totalAmount: 4360, currency: 'THB',
  },
];

export const vehicleDocuments: VehicleDocument[] = [
  // VH001
  { id: 'DOC001', vehicleId: 'VH001', docType: 'ประกันภัย', docNumber: 'INS-2024-001', startDate: '2024-01-01', expiryDate: '2024-08-01', cost: 15000, currency: 'THB', status: 'expired', country: 'ไทย' },
  { id: 'DOC002', vehicleId: 'VH001', docType: 'พรบ.', docNumber: 'COMP-2024-001', startDate: '2024-01-01', expiryDate: '2025-01-01', cost: 900, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC003', vehicleId: 'VH001', docType: 'ตรวจสภาพทางเทคนิค', docNumber: 'TECH-2024-001', startDate: '2024-05-01', expiryDate: '2024-11-15', cost: 500, currency: 'THB', status: 'expiring_soon', country: 'ไทย' },
  { id: 'DOC004', vehicleId: 'VH001', docType: 'สมุดทะเบียนรถ', docNumber: 'REG-VH001', startDate: '2020-01-01', expiryDate: '2025-12-31', cost: 0, currency: 'THB', status: 'active', country: 'ไทย' },
  // VH002
  { id: 'DOC005', vehicleId: 'VH002', docType: 'ประกันภัย', docNumber: 'INS-2024-002', startDate: '2024-03-01', expiryDate: '2024-12-01', cost: 18000, currency: 'THB', status: 'expiring_soon', country: 'ไทย' },
  { id: 'DOC006', vehicleId: 'VH002', docType: 'พรบ.', docNumber: 'COMP-2024-002', startDate: '2024-03-01', expiryDate: '2025-03-01', cost: 900, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC007', vehicleId: 'VH002', docType: 'ค่าทาง', docNumber: 'TOLL-LAO-002', startDate: '2024-06-01', expiryDate: '2025-06-01', cost: 2500, currency: 'LAK', status: 'active', country: 'ลาว' },
  { id: 'DOC008', vehicleId: 'VH002', docType: 'หนังสือผ่านแดน', docNumber: 'CROSS-2024-002', startDate: '2024-01-01', expiryDate: '2024-08-01', cost: 3000, currency: 'THB', status: 'expired', country: 'ลาว' },
  // VH003
  { id: 'DOC009', vehicleId: 'VH003', docType: 'ประกันภัย', docNumber: 'INS-2024-003', startDate: '2024-02-01', expiryDate: '2025-02-01', cost: 22000, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC010', vehicleId: 'VH003', docType: 'พรบ.', docNumber: 'COMP-2024-003', startDate: '2024-02-01', expiryDate: '2025-02-01', cost: 900, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC011', vehicleId: 'VH003', docType: 'ตรวจสภาพทางเทคนิค', docNumber: 'TECH-2024-003', startDate: '2024-04-01', expiryDate: '2024-11-30', cost: 500, currency: 'THB', status: 'expiring_soon', country: 'ไทย' },
  // VH004
  { id: 'DOC012', vehicleId: 'VH004', docType: 'ประกันภัย', docNumber: 'INS-2024-004', startDate: '2023-09-01', expiryDate: '2024-09-01', cost: 12000, currency: 'THB', status: 'expired', country: 'ไทย' },
  { id: 'DOC013', vehicleId: 'VH004', docType: 'พรบ.', docNumber: 'COMP-2024-004', startDate: '2024-09-01', expiryDate: '2025-09-01', cost: 900, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC014', vehicleId: 'VH004', docType: 'หนังสือผ่านแดน', docNumber: 'CROSS-2024-004', startDate: '2024-07-01', expiryDate: '2025-07-01', cost: 3000, currency: 'THB', status: 'active', country: 'เวียดนาม' },
  // VH005
  { id: 'DOC015', vehicleId: 'VH005', docType: 'ประกันภัย', docNumber: 'INS-2024-005', startDate: '2024-01-15', expiryDate: '2025-01-15', cost: 20000, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC016', vehicleId: 'VH005', docType: 'พรบ.', docNumber: 'COMP-2024-005', startDate: '2024-01-15', expiryDate: '2025-01-15', cost: 900, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC017', vehicleId: 'VH005', docType: 'ค่าทาง', docNumber: 'TOLL-LAO-005', startDate: '2024-05-01', expiryDate: '2024-12-01', cost: 2000, currency: 'LAK', status: 'expiring_soon', country: 'ลาว' },
  // VH006
  { id: 'DOC018', vehicleId: 'VH006', docType: 'ประกันภัย', docNumber: 'INS-2024-006', startDate: '2024-04-01', expiryDate: '2025-04-01', cost: 16000, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC019', vehicleId: 'VH006', docType: 'ตรวจสภาพทางเทคนิค', docNumber: 'TECH-2024-006', startDate: '2024-04-01', expiryDate: '2025-04-01', cost: 500, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC020', vehicleId: 'VH006', docType: 'สัญญาเช่า', docNumber: 'LEASE-2024-006', startDate: '2024-01-01', expiryDate: '2025-12-31', cost: 35000, currency: 'THB', status: 'active', notes: 'สัญญาเช่า 2 ปี' },
  // VH007
  { id: 'DOC021', vehicleId: 'VH007', docType: 'ประกันภัย', docNumber: 'INS-2024-007', startDate: '2024-06-01', expiryDate: '2025-06-01', cost: 19000, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC022', vehicleId: 'VH007', docType: 'พรบ.', docNumber: 'COMP-2024-007', startDate: '2023-07-01', expiryDate: '2024-08-01', cost: 900, currency: 'THB', status: 'expired', country: 'ไทย' },
  // VH008
  { id: 'DOC023', vehicleId: 'VH008', docType: 'ประกันภัย', docNumber: 'INS-2024-008', startDate: '2024-03-15', expiryDate: '2025-03-15', cost: 25000, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC024', vehicleId: 'VH008', docType: 'สมุดทะเบียนรถ', docNumber: 'REG-VH008', startDate: '2019-03-15', expiryDate: '2025-12-31', cost: 0, currency: 'THB', status: 'active', country: 'ไทย' },
  // VH009
  { id: 'DOC025', vehicleId: 'VH009', docType: 'ประกันภัย', docNumber: 'INS-2024-009', startDate: '2024-08-01', expiryDate: '2025-08-01', cost: 14000, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC026', vehicleId: 'VH009', docType: 'ค่าทาง', docNumber: 'TOLL-VN-009', startDate: '2024-07-01', expiryDate: '2024-11-01', cost: 1500, currency: 'VND', status: 'expiring_soon', country: 'เวียดนาม' },
  { id: 'DOC027', vehicleId: 'VH009', docType: 'หนังสือผ่านแดน', docNumber: 'CROSS-2024-009', startDate: '2024-07-01', expiryDate: '2025-07-01', cost: 3500, currency: 'THB', status: 'active', country: 'เวียดนาม' },
  // VH010
  { id: 'DOC028', vehicleId: 'VH010', docType: 'ประกันภัย', docNumber: 'INS-2024-010', startDate: '2024-05-01', expiryDate: '2025-05-01', cost: 21000, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC029', vehicleId: 'VH010', docType: 'พรบ.', docNumber: 'COMP-2024-010', startDate: '2024-05-01', expiryDate: '2025-05-01', cost: 900, currency: 'THB', status: 'active', country: 'ไทย' },
  { id: 'DOC030', vehicleId: 'VH010', docType: 'ตรวจสภาพทางเทคนิค', docNumber: 'TECH-2024-010', startDate: '2024-05-01', expiryDate: '2024-12-15', cost: 500, currency: 'THB', status: 'expiring_soon', country: 'ไทย' },
  { id: 'DOC031', vehicleId: 'VH010', docType: 'ค่าทาง', docNumber: 'TOLL-LAO-010', startDate: '2024-04-01', expiryDate: '2025-04-01', cost: 2000, currency: 'LAK', status: 'active', country: 'ลาว' },
];

export const payments: Payment[] = [
  { id: 'PAY001', repairId: 'REP001', amount: 1420, currency: 'THB', paidDate: '2024-10-02', method: 'transfer', status: 'paid' },
  { id: 'PAY002', repairId: 'REP002', amount: 2150, currency: 'THB', paidDate: '2024-09-15', method: 'transfer', status: 'paid' },
  { id: 'PAY003', repairId: 'REP003', amount: 12800, currency: 'THB', paidDate: '2024-09-20', method: 'transfer', status: 'paid' },
  { id: 'PAY004', repairId: 'REP004', amount: 1330, currency: 'THB', paidDate: '2024-09-25', method: 'cash', status: 'paid' },
  { id: 'PAY005', repairId: 'REP005', amount: 3780, currency: 'THB', paidDate: '2024-10-05', method: 'transfer', status: 'paid' },
  { id: 'PAY006', repairId: 'REP006', amount: 5000, currency: 'THB', paidDate: '2024-10-10', method: 'transfer', status: 'partial', notes: 'ชำระบางส่วน รอชิ้นส่วนที่เหลือ' },
  { id: 'PAY007', repairId: 'REP007', amount: 1120, currency: 'THB', paidDate: '2024-09-28', method: 'cash', status: 'paid' },
  { id: 'PAY008', repairId: 'REP008', amount: 7600, currency: 'THB', paidDate: '2024-10-08', method: 'transfer', status: 'paid' },
  { id: 'PAY009', repairId: 'REP009', amount: 0, currency: 'THB', paidDate: '', method: 'transfer', status: 'unpaid', notes: 'รอรับของก่อนชำระ' },
  { id: 'PAY010', repairId: 'REP010', amount: 2150, currency: 'THB', paidDate: '2024-10-12', method: 'card', status: 'paid' },
  { id: 'PAY011', repairId: 'REP011', amount: 3750, currency: 'THB', paidDate: '2024-10-15', method: 'transfer', status: 'paid' },
  { id: 'PAY012', repairId: 'REP012', amount: 7600, currency: 'THB', paidDate: '2024-10-16', method: 'transfer', status: 'paid' },
  { id: 'PAY013', repairId: 'REP013', amount: 18300, currency: 'THB', paidDate: '2024-10-18', method: 'transfer', status: 'paid' },
  { id: 'PAY014', repairId: 'REP014', amount: 3650, currency: 'THB', paidDate: '', method: 'transfer', status: 'unpaid', notes: 'รอสั่งซื้อชิ้นส่วน' },
  { id: 'PAY015', repairId: 'REP015', amount: 4400, currency: 'THB', paidDate: '2024-10-20', method: 'transfer', status: 'paid' },
  { id: 'PAY016', repairId: 'REP016', amount: 1680, currency: 'THB', paidDate: '2024-09-10', method: 'cash', status: 'paid' },
  { id: 'PAY017', repairId: 'REP017', amount: 4200, currency: 'THB', paidDate: '2024-09-18', method: 'transfer', status: 'paid' },
  { id: 'PAY018', repairId: 'REP018', amount: 8680, currency: 'THB', paidDate: '2024-08-25', method: 'transfer', status: 'paid' },
  { id: 'PAY019', repairId: 'REP019', amount: 10980, currency: 'THB', paidDate: '2024-09-05', method: 'transfer', status: 'paid' },
  { id: 'PAY020', repairId: 'REP020', amount: 5700, currency: 'THB', paidDate: '2024-10-01', method: 'transfer', status: 'paid' },
];

export const notifications: Notification[] = [
  { id: 'N001', type: 'critical', category: 'document', title: 'ประกันภัยหมดอายุ', message: 'ประกันภัย VH001 หมดอายุตั้งแต่ 1 ส.ค. 2567 กรุณาต่ออายุด่วน', vehicleId: 'VH001', vehiclePlate: 'กข-1234', date: '2024-10-20', read: false, actionLabel: 'ดูเอกสาร', actionPage: 'documents' },
  { id: 'N002', type: 'critical', category: 'document', title: 'หนังสือผ่านแดนหมดอายุ', message: 'หนังสือผ่านแดน VH002 (ลาว) หมดอายุแล้ว ไม่สามารถข้ามแดนได้', vehicleId: 'VH002', vehiclePlate: 'กข-2345', date: '2024-10-19', read: false, actionLabel: 'ต่ออายุ', actionPage: 'documents' },
  { id: 'N003', type: 'critical', category: 'document', title: 'ประกันภัยหมดอายุ', message: 'ประกันภัย VH004 หมดอายุตั้งแต่ 1 ก.ย. 2567', vehicleId: 'VH004', vehiclePlate: 'กข-4567', date: '2024-10-18', read: false, actionLabel: 'ดูเอกสาร', actionPage: 'documents' },
  { id: 'N004', type: 'critical', category: 'document', title: 'พรบ. หมดอายุ', message: 'พรบ. VH007 หมดอายุแล้ว ผิดกฎหมายหากใช้รถ', vehicleId: 'VH007', vehiclePlate: 'กข-7890', date: '2024-10-17', read: true, actionLabel: 'ต่อพรบ.', actionPage: 'documents' },
  { id: 'N005', type: 'critical', category: 'repair', title: 'รถเสียต้องการซ่อมด่วน', message: 'VH009 คอมเพรสเซอร์แอร์เสีย รอชิ้นส่วนที่สั่ง', vehicleId: 'VH009', vehiclePlate: 'กข-9012', date: '2024-10-22', read: false, actionLabel: 'ดูการซ่อม', actionPage: 'repair-management' },
  { id: 'N006', type: 'warning', category: 'document', title: 'ประกันภัยใกล้หมดอายุ', message: 'ประกันภัย VH002 จะหมดอายุใน 39 วัน (1 ธ.ค. 2567)', vehicleId: 'VH002', vehiclePlate: 'กข-2345', date: '2024-10-22', read: false, actionLabel: 'ต่ออายุ', actionPage: 'documents' },
  { id: 'N007', type: 'warning', category: 'document', title: 'ตรวจสภาพทางเทคนิคใกล้หมดอายุ', message: 'ตรวจสภาพ VH001 จะหมดอายุใน 23 วัน (15 พ.ย. 2567)', vehicleId: 'VH001', vehiclePlate: 'กข-1234', date: '2024-10-22', read: false, actionLabel: 'นัดตรวจ', actionPage: 'documents' },
  { id: 'N008', type: 'warning', category: 'document', title: 'ค่าทาง (ลาว) ใกล้หมดอายุ', message: 'ค่าทาง VH005 (ลาว) จะหมดอายุใน 40 วัน', vehicleId: 'VH005', vehiclePlate: 'กข-5678', date: '2024-10-21', read: false, actionLabel: 'ดูเอกสาร', actionPage: 'documents' },
  { id: 'N009', type: 'warning', category: 'document', title: 'ตรวจสภาพใกล้หมดอายุ', message: 'ตรวจสภาพ VH003 จะหมดอายุใน 38 วัน (30 พ.ย. 2567)', vehicleId: 'VH003', vehiclePlate: 'กข-3456', date: '2024-10-21', read: true, actionLabel: 'นัดตรวจ', actionPage: 'documents' },
  { id: 'N010', type: 'warning', category: 'maintenance', title: 'ถึงกำหนดบำรุงรักษา', message: 'VH006 ถึงกำหนดเปลี่ยนน้ำมันเครื่อง (ระยะ 85,000 กม.)', vehicleId: 'VH006', vehiclePlate: 'กข-6789', date: '2024-10-20', read: false, actionLabel: 'จัดตาราง', actionPage: 'maintenance' },
  { id: 'N011', type: 'warning', category: 'order', title: 'ใบสั่งซื้อรออนุมัติ', message: 'ใบสั่งซื้อ PO-2024-009 มูลค่า 13,700 บาท รออนุมัติจากผู้จัดการ', date: '2024-10-20', read: false, actionLabel: 'ดูใบสั่งซื้อ', actionPage: 'purchase-orders' },
  { id: 'N012', type: 'warning', category: 'repair', title: 'การซ่อมเกินงบประมาณ', message: 'REP006 โช้คอัพหน้า VH006 มูลค่า 9,000 บาท เกินงบที่ตั้งไว้', vehicleId: 'VH006', vehiclePlate: 'กข-6789', date: '2024-10-19', read: true, actionLabel: 'ดูรายละเอียด', actionPage: 'repair-management' },
  { id: 'N013', type: 'warning', category: 'document', title: 'ค่าทาง (เวียดนาม) ใกล้หมดอายุ', message: 'ค่าทาง VH009 (เวียดนาม) จะหมดอายุใน 9 วัน', vehicleId: 'VH009', vehiclePlate: 'กข-9012', date: '2024-10-22', read: false, actionLabel: 'ต่ออายุ', actionPage: 'documents' },
  { id: 'N014', type: 'info', category: 'repair', title: 'การซ่อมเสร็จสิ้น', message: 'REP015 เปลี่ยนหัวเทียน VH015 เสร็จเรียบร้อยแล้ว', vehicleId: 'VH015', vehiclePlate: 'กข-1590', date: '2024-10-22', read: false, actionLabel: 'ดูรายละเอียด', actionPage: 'repair-management' },
  { id: 'N015', type: 'info', category: 'order', title: 'ได้รับชิ้นส่วนแล้ว', message: 'PO-2024-011 สายพานราวลิ้น VH011 ได้รับครบแล้ว', vehicleId: 'VH011', vehiclePlate: 'กข-1112', date: '2024-10-21', read: true, actionLabel: 'ยืนยันรับ', actionPage: 'purchase-orders' },
  { id: 'N016', type: 'info', category: 'maintenance', title: 'แผนบำรุงรักษาใหม่', message: 'สร้างแผนบำรุงรักษาประจำปี 2568 สำหรับรถ 35 คันเรียบร้อย', date: '2024-10-20', read: true, actionLabel: 'ดูแผน', actionPage: 'maintenance' },
  { id: 'N017', type: 'info', category: 'repair', title: 'อนุมัติงานซ่อม', message: 'REP023 โช้คอัพหลัง VH023 ได้รับอนุมัติแล้ว', vehicleId: 'VH023', vehiclePlate: 'กข-2356', date: '2024-10-19', read: true },
  { id: 'N018', type: 'info', category: 'order', title: 'ส่งใบสั่งซื้อแล้ว', message: 'PO-2024-013 ยางรถยนต์ VH013 ส่งใบสั่งซื้อให้ผู้จำหน่ายแล้ว', vehicleId: 'VH013', vehiclePlate: 'กข-1312', date: '2024-10-18', read: true },
  { id: 'N019', type: 'info', category: 'repair', title: 'เริ่มงานซ่อม', message: 'REP014 ปั๊มน้ำ VH014 เริ่มงานซ่อมแล้ว คาดว่าเสร็จใน 3 วัน', vehicleId: 'VH014', vehiclePlate: 'กข-1456', date: '2024-10-22', read: false, actionLabel: 'ติดตาม', actionPage: 'repair-management' },
  { id: 'N020', type: 'critical', category: 'document', title: 'ตรวจสภาพทางเทคนิคหมดอายุ', message: 'ค่าทาง VH009 จะหมดอายุใน 9 วัน ต้องต่ออายุทันที', vehicleId: 'VH009', vehiclePlate: 'กข-9012', date: '2024-10-23', read: false, actionLabel: 'ต่ออายุด่วน', actionPage: 'documents' },
];

export function getVehicleRepairItems(vehicleId: string): RepairItem[] {
  return repairItems.filter(item => item.vehicleId === vehicleId);
}

export function getVehicleDocuments(vehicleId: string): VehicleDocument[] {
  return vehicleDocuments.filter(doc => doc.vehicleId === vehicleId);
}

export function getVehiclePurchaseOrders(vehicleId: string): PurchaseOrder[] {
  return purchaseOrders.filter(po => po.vehicleId === vehicleId);
}

export function getVehiclePayments(vehicleId: string): Payment[] {
  const vehicleRepairIds = repairItems
    .filter(item => item.vehicleId === vehicleId)
    .map(item => item.repairId);
  const uniqueRepairIds = [...new Set(vehicleRepairIds)];
  return payments.filter(p => uniqueRepairIds.includes(p.repairId));
}

export function getUnreadNotificationCount(): number {
  return notifications.filter(n => !n.read).length;
}
