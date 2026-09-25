export type VehicleStatus = 'active' | 'repairing' | 'inactive' | 'disposed';
export type VehicleType = 'executive' | 'management' | 'operations' | 'pool';

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  branch: string;
  department: string;
  type: VehicleType;
  status: VehicleStatus;
  value: number;
  startDate: string;
  color: string;
  engineCC: number;
}

export interface RepairRecord {
  id: string;
  docNumber: string;
  vehicleId: string;
  date: string;
  repairItems: string;
  category: string;
  parts: number;
  labor: number;
  other: number;
  total: number;
  garage: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface DocumentExpense {
  id: string;
  docNumber: string;
  vehicleId: string;
  date: string;
  docType: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface MaintenancePlan {
  id: string;
  vehicleId: string;
  taskName: string;
  plannedDate: string;
  dueDate: string;
  completedDate?: string;
  status: 'planned' | 'upcoming' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  assignee: string;
  estimatedCost: number;
  actualCost?: number;
}

export const branches = ['สำนักงานใหญ่', 'สาขาเชียงใหม่', 'สาขาขอนแก่น', 'สาขาภูเก็ต', 'สาขาหาดใหญ่'];
export const departments = ['ฝ่ายบริหาร', 'ฝ่ายปฏิบัติการ', 'ฝ่ายขาย', 'ฝ่ายเทคนิค', 'ฝ่ายสนับสนุน'];
export const brands = ['Toyota', 'Isuzu', 'Ford', 'Mitsubishi', 'Honda'];
export const garages = ['อู่กลาง', 'ศูนย์บริการ Toyota', 'ศูนย์บริการ Isuzu', 'อู่ชัยมงคล', 'อู่สมชาย'];
export const repairCategories = ['ค่าแรง', 'อะไหล่', 'น้ำมัน', 'ยาง', 'บริการภายนอก', 'อื่นๆ'];
export const docTypes = ['ต่อภาษี', 'ประกันภัย', 'ตรวจสภาพรถ', 'ใบขับขี่', 'พรบ.', 'อื่นๆ'];

const vehicleData: Omit<Vehicle, 'id'>[] = [
  { plateNumber: 'กก 1234 กรุงเทพ', brand: 'Toyota', model: 'Fortuner', year: 2022, branch: 'สำนักงานใหญ่', department: 'ฝ่ายบริหาร', type: 'executive', status: 'active', value: 1850000, startDate: '2022-03-15', color: 'ขาว', engineCC: 2800 },
  { plateNumber: 'ขข 5678 กรุงเทพ', brand: 'Toyota', model: 'Camry', year: 2021, branch: 'สำนักงานใหญ่', department: 'ฝ่ายบริหาร', type: 'management', status: 'active', value: 1650000, startDate: '2021-06-01', color: 'เงิน', engineCC: 2500 },
  { plateNumber: 'คค 9012 เชียงใหม่', brand: 'Isuzu', model: 'D-Max', year: 2020, branch: 'สาขาเชียงใหม่', department: 'ฝ่ายปฏิบัติการ', type: 'operations', status: 'repairing', value: 750000, startDate: '2020-01-10', color: 'แดง', engineCC: 3000 },
  { plateNumber: 'งง 3456 ขอนแก่น', brand: 'Ford', model: 'Ranger', year: 2021, branch: 'สาขาขอนแก่น', department: 'ฝ่ายปฏิบัติการ', type: 'operations', status: 'active', value: 850000, startDate: '2021-02-20', color: 'ดำ', engineCC: 2000 },
  { plateNumber: 'จจ 7890 ภูเก็ต', brand: 'Mitsubishi', model: 'Triton', year: 2019, branch: 'สาขาภูเก็ต', department: 'ฝ่ายขาย', type: 'pool', status: 'inactive', value: 650000, startDate: '2019-11-05', color: 'น้ำเงิน', engineCC: 2400 },
  { plateNumber: 'ฉฉ 1234 หาดใหญ่', brand: 'Honda', model: 'CR-V', year: 2022, branch: 'สาขาหาดใหญ่', department: 'ฝ่ายขาย', type: 'management', status: 'active', value: 1250000, startDate: '2022-07-15', color: 'ขาว', engineCC: 1500 },
  { plateNumber: 'ชช 5678 กรุงเทพ', brand: 'Toyota', model: 'Hilux Revo', year: 2020, branch: 'สำนักงานใหญ่', department: 'ฝ่ายเทคนิค', type: 'operations', status: 'active', value: 720000, startDate: '2020-05-01', color: 'เทา', engineCC: 2400 },
  { plateNumber: 'ซซ 9012 เชียงใหม่', brand: 'Isuzu', model: 'MU-X', year: 2021, branch: 'สาขาเชียงใหม่', department: 'ฝ่ายขาย', type: 'pool', status: 'active', value: 1100000, startDate: '2021-08-20', color: 'ทอง', engineCC: 3000 },
  { plateNumber: 'ญญ 3456 ขอนแก่น', brand: 'Ford', model: 'Everest', year: 2022, branch: 'สาขาขอนแก่น', department: 'ฝ่ายบริหาร', type: 'executive', status: 'active', value: 1750000, startDate: '2022-01-10', color: 'ขาว', engineCC: 2000 },
  { plateNumber: 'ฎฎ 7890 ภูเก็ต', brand: 'Toyota', model: 'Vios', year: 2019, branch: 'สาขาภูเก็ต', department: 'ฝ่ายสนับสนุน', type: 'pool', status: 'repairing', value: 450000, startDate: '2019-03-25', color: 'ขาว', engineCC: 1500 },
  { plateNumber: 'ฏฏ 1234 หาดใหญ่', brand: 'Mitsubishi', model: 'Outlander', year: 2021, branch: 'สาขาหาดใหญ่', department: 'ฝ่ายบริหาร', type: 'management', status: 'active', value: 1350000, startDate: '2021-09-01', color: 'เงิน', engineCC: 2000 },
  { plateNumber: 'ฐฐ 5678 กรุงเทพ', brand: 'Honda', model: 'City', year: 2020, branch: 'สำนักงานใหญ่', department: 'ฝ่ายสนับสนุน', type: 'pool', status: 'active', value: 550000, startDate: '2020-10-15', color: 'แดง', engineCC: 1000 },
  { plateNumber: 'ฑฑ 9012 เชียงใหม่', brand: 'Toyota', model: 'Corolla Cross', year: 2023, branch: 'สาขาเชียงใหม่', department: 'ฝ่ายขาย', type: 'management', status: 'active', value: 1050000, startDate: '2023-02-10', color: 'ดำ', engineCC: 1800 },
  { plateNumber: 'ฒฒ 3456 ขอนแก่น', brand: 'Isuzu', model: 'D-Max', year: 2018, branch: 'สาขาขอนแก่น', department: 'ฝ่ายปฏิบัติการ', type: 'operations', status: 'disposed', value: 480000, startDate: '2018-06-20', color: 'เทา', engineCC: 2500 },
  { plateNumber: 'ณณ 7890 ภูเก็ต', brand: 'Ford', model: 'Ranger', year: 2022, branch: 'สาขาภูเก็ต', department: 'ฝ่ายปฏิบัติการ', type: 'operations', status: 'active', value: 900000, startDate: '2022-04-05', color: 'น้ำเงิน', engineCC: 2000 },
  { plateNumber: 'ดด 1234 หาดใหญ่', brand: 'Toyota', model: 'Fortuner', year: 2020, branch: 'สาขาหาดใหญ่', department: 'ฝ่ายบริหาร', type: 'executive', status: 'active', value: 1600000, startDate: '2020-08-15', color: 'ขาว', engineCC: 2800 },
  { plateNumber: 'ตต 5678 กรุงเทพ', brand: 'Mitsubishi', model: 'Pajero Sport', year: 2021, branch: 'สำนักงานใหญ่', department: 'ฝ่ายบริหาร', type: 'executive' as const, status: 'active' as const, value: 1450000, startDate: '2021-11-01', color: 'ดำ', engineCC: 2400 },
  { plateNumber: 'ถถ 9012 เชียงใหม่', brand: 'Honda', model: 'HR-V', year: 2022, branch: 'สาขาเชียงใหม่', department: 'ฝ่ายขาย', type: 'management', status: 'active', value: 980000, startDate: '2022-06-20', color: 'แดง', engineCC: 1800 },
  { plateNumber: 'ทท 3456 ขอนแก่น', brand: 'Toyota', model: 'Hilux Revo', year: 2019, branch: 'สาขาขอนแก่น', department: 'ฝ่ายเทคนิค', type: 'operations', status: 'repairing', value: 680000, startDate: '2019-02-10', color: 'เงิน', engineCC: 2400 },
  { plateNumber: 'ธธ 7890 ภูเก็ต', brand: 'Isuzu', model: 'D-Max', year: 2023, branch: 'สาขาภูเก็ต', department: 'ฝ่ายปฏิบัติการ', type: 'operations', status: 'active', value: 820000, startDate: '2023-03-01', color: 'ขาว', engineCC: 3000 },
  { plateNumber: 'นน 1234 หาดใหญ่', brand: 'Ford', model: 'Everest', year: 2021, branch: 'สาขาหาดใหญ่', department: 'ฝ่ายบริหาร', type: 'executive', status: 'active', value: 1700000, startDate: '2021-05-15', color: 'ทอง', engineCC: 2000 },
  { plateNumber: 'บบ 5678 กรุงเทพ', brand: 'Toyota', model: 'Vios', year: 2021, branch: 'สำนักงานใหญ่', department: 'ฝ่ายสนับสนุน', type: 'pool', status: 'active', value: 490000, startDate: '2021-07-01', color: 'ขาว', engineCC: 1500 },
  { plateNumber: 'ปป 9012 เชียงใหม่', brand: 'Mitsubishi', model: 'Triton', year: 2020, branch: 'สาขาเชียงใหม่', department: 'ฝ่ายปฏิบัติการ', type: 'operations', status: 'active', value: 720000, startDate: '2020-09-25', color: 'เทา', engineCC: 2400 },
  { plateNumber: 'ผผ 3456 ขอนแก่น', brand: 'Honda', model: 'Accord', year: 2022, branch: 'สาขาขอนแก่น', department: 'ฝ่ายบริหาร', type: 'management', status: 'active', value: 1350000, startDate: '2022-10-01', color: 'เงิน', engineCC: 1500 },
  { plateNumber: 'ฝฝ 7890 ภูเก็ต', brand: 'Toyota', model: 'Camry', year: 2023, branch: 'สาขาภูเก็ต', department: 'ฝ่ายบริหาร', type: 'management', status: 'active', value: 1700000, startDate: '2023-01-15', color: 'ดำ', engineCC: 2500 },
  { plateNumber: 'พพ 1234 หาดใหญ่', brand: 'Isuzu', model: 'MU-X', year: 2020, branch: 'สาขาหาดใหญ่', department: 'ฝ่ายขาย', type: 'pool', status: 'active', value: 1050000, startDate: '2020-11-20', color: 'น้ำเงิน', engineCC: 3000 },
  { plateNumber: 'ฟฟ 5678 กรุงเทพ', brand: 'Ford', model: 'Ranger', year: 2020, branch: 'สำนักงานใหญ่', department: 'ฝ่ายเทคนิค', type: 'operations', status: 'inactive', value: 760000, startDate: '2020-04-10', color: 'เทา', engineCC: 2000 },
  { plateNumber: 'ภภ 9012 เชียงใหม่', brand: 'Toyota', model: 'Fortuner', year: 2021, branch: 'สาขาเชียงใหม่', department: 'ฝ่ายบริหาร', type: 'executive', status: 'active', value: 1750000, startDate: '2021-03-05', color: 'ทอง', engineCC: 2800 },
  { plateNumber: 'มม 3456 ขอนแก่น', brand: 'Mitsubishi', model: 'Eclipse Cross', year: 2022, branch: 'สาขาขอนแก่น', department: 'ฝ่ายขาย', type: 'management', status: 'active', value: 1150000, startDate: '2022-08-15', color: 'ขาว', engineCC: 1500 },
  { plateNumber: 'ยย 7890 ภูเก็ต', brand: 'Honda', model: 'City', year: 2021, branch: 'สาขาภูเก็ต', department: 'ฝ่ายสนับสนุน', type: 'pool', status: 'active', value: 570000, startDate: '2021-12-01', color: 'แดง', engineCC: 1000 },
  { plateNumber: 'รร 1234 หาดใหญ่', brand: 'Toyota', model: 'Hilux Revo', year: 2023, branch: 'สาขาหาดใหญ่', department: 'ฝ่ายปฏิบัติการ', type: 'operations', status: 'active', value: 750000, startDate: '2023-05-01', color: 'ดำ', engineCC: 2400 },
  { plateNumber: 'ลล 5678 กรุงเทพ', brand: 'Isuzu', model: 'D-Max', year: 2022, branch: 'สำนักงานใหญ่', department: 'ฝ่ายปฏิบัติการ', type: 'operations', status: 'active', value: 790000, startDate: '2022-09-10', color: 'เงิน', engineCC: 2500 },
  { plateNumber: 'วว 9012 เชียงใหม่', brand: 'Ford', model: 'Territory', year: 2023, branch: 'สาขาเชียงใหม่', department: 'ฝ่ายขาย', type: 'management', status: 'active', value: 1100000, startDate: '2023-04-20', color: 'ขาว', engineCC: 1500 },
  { plateNumber: 'ศศ 3456 ขอนแก่น', brand: 'Toyota', model: 'C-HR', year: 2022, branch: 'สาขาขอนแก่น', department: 'ฝ่ายสนับสนุน', type: 'pool', status: 'repairing', value: 1050000, startDate: '2022-11-05', color: 'น้ำเงิน', engineCC: 1800 },
  { plateNumber: 'สส 7890 ภูเก็ต', brand: 'Mitsubishi', model: 'Outlander', year: 2020, branch: 'สาขาภูเก็ต', department: 'ฝ่ายบริหาร', type: 'management', status: 'active', value: 1250000, startDate: '2020-07-15', color: 'เทา', engineCC: 2000 },
];

export const vehicles: Vehicle[] = vehicleData.map((v, i) => ({
  ...v,
  id: `VH${String(i + 1).padStart(3, '0')}`,
}));

const repairData: Omit<RepairRecord, 'id'>[] = [
  { docNumber: 'RP2024001', vehicleId: 'VH001', date: '2024-01-15', repairItems: 'เปลี่ยนน้ำมันเครื่อง+กรอง', category: 'น้ำมัน', parts: 1800, labor: 500, other: 0, total: 2300, garage: 'อู่กลาง', status: 'completed' },
  { docNumber: 'RP2024002', vehicleId: 'VH003', date: '2024-01-20', repairItems: 'ซ่อมระบบเบรก', category: 'อะไหล่', parts: 8500, labor: 2000, other: 500, total: 11000, garage: 'ศูนย์บริการ Isuzu', status: 'completed' },
  { docNumber: 'RP2024003', vehicleId: 'VH007', date: '2024-02-05', repairItems: 'เปลี่ยนยาง 4 เส้น', category: 'ยาง', parts: 12000, labor: 800, other: 0, total: 12800, garage: 'อู่กลาง', status: 'completed' },
  { docNumber: 'RP2024004', vehicleId: 'VH010', date: '2024-02-10', repairItems: 'ซ่อมระบบไฟฟ้า', category: 'ค่าแรง', parts: 3000, labor: 5000, other: 1000, total: 9000, garage: 'อู่ชัยมงคล', status: 'completed' },
  { docNumber: 'RP2024005', vehicleId: 'VH002', date: '2024-02-18', repairItems: 'ตรวจเช็คระยะ 10,000 กม', category: 'น้ำมัน', parts: 2500, labor: 700, other: 0, total: 3200, garage: 'ศูนย์บริการ Toyota', status: 'completed' },
  { docNumber: 'RP2024006', vehicleId: 'VH015', date: '2024-03-02', repairItems: 'เปลี่ยนแบตเตอรี่', category: 'อะไหล่', parts: 3500, labor: 300, other: 0, total: 3800, garage: 'อู่สมชาย', status: 'completed' },
  { docNumber: 'RP2024007', vehicleId: 'VH019', date: '2024-03-15', repairItems: 'ซ่อมเครื่องยนต์', category: 'อะไหล่', parts: 25000, labor: 8000, other: 2000, total: 35000, garage: 'ศูนย์บริการ Toyota', status: 'in_progress' },
  { docNumber: 'RP2024008', vehicleId: 'VH005', date: '2024-03-20', repairItems: 'เปลี่ยนกรองอากาศ', category: 'น้ำมัน', parts: 800, labor: 200, other: 0, total: 1000, garage: 'อู่กลาง', status: 'completed' },
  { docNumber: 'RP2024009', vehicleId: 'VH012', date: '2024-04-01', repairItems: 'ซ่อมระบบช่วงล่าง', category: 'ค่าแรง', parts: 15000, labor: 6000, other: 1500, total: 22500, garage: 'ศูนย์บริการ Honda', status: 'completed' },
  { docNumber: 'RP2024010', vehicleId: 'VH008', date: '2024-04-10', repairItems: 'เปลี่ยนน้ำมันเกียร์', category: 'น้ำมัน', parts: 2200, labor: 600, other: 0, total: 2800, garage: 'ศูนย์บริการ Isuzu', status: 'completed' },
  { docNumber: 'RP2024011', vehicleId: 'VH022', date: '2024-04-22', repairItems: 'ซ่อมระบบแอร์', category: 'บริการภายนอก', parts: 5000, labor: 3000, other: 500, total: 8500, garage: 'อู่ชัยมงคล', status: 'completed' },
  { docNumber: 'RP2024012', vehicleId: 'VH001', date: '2024-05-05', repairItems: 'เปลี่ยนผ้าเบรก', category: 'อะไหล่', parts: 4500, labor: 1200, other: 0, total: 5700, garage: 'ศูนย์บริการ Toyota', status: 'completed' },
  { docNumber: 'RP2024013', vehicleId: 'VH028', date: '2024-05-15', repairItems: 'เปลี่ยนยาง 2 เส้น', category: 'ยาง', parts: 6000, labor: 400, other: 0, total: 6400, garage: 'อู่กลาง', status: 'completed' },
  { docNumber: 'RP2024014', vehicleId: 'VH033', date: '2024-05-28', repairItems: 'ซ่อมกระจก', category: 'อะไหล่', parts: 8000, labor: 2500, other: 0, total: 10500, garage: 'อู่สมชาย', status: 'completed' },
  { docNumber: 'RP2024015', vehicleId: 'VH016', date: '2024-06-08', repairItems: 'ตรวจเช็คระยะ 20,000 กม', category: 'น้ำมัน', parts: 3200, labor: 900, other: 200, total: 4300, garage: 'ศูนย์บริการ Toyota', status: 'completed' },
  { docNumber: 'RP2024016', vehicleId: 'VH004', date: '2024-06-18', repairItems: 'ซ่อมระบบเชื้อเพลิง', category: 'ค่าแรง', parts: 7500, labor: 4000, other: 800, total: 12300, garage: 'ศูนย์บริการ Ford', status: 'completed' },
  { docNumber: 'RP2024017', vehicleId: 'VH020', date: '2024-07-02', repairItems: 'เปลี่ยนน้ำมันเครื่อง', category: 'น้ำมัน', parts: 1600, labor: 400, other: 0, total: 2000, garage: 'อู่กลาง', status: 'completed' },
  { docNumber: 'RP2024018', vehicleId: 'VH011', date: '2024-07-15', repairItems: 'ซ่อมระบบบังคับเลี้ยว', category: 'อะไหล่', parts: 12000, labor: 5000, other: 1000, total: 18000, garage: 'ศูนย์บริการ Mitsubishi', status: 'completed' },
  { docNumber: 'RP2024019', vehicleId: 'VH026', date: '2024-07-25', repairItems: 'เปลี่ยนกรองน้ำมัน', category: 'น้ำมัน', parts: 500, labor: 200, other: 0, total: 700, garage: 'อู่สมชาย', status: 'completed' },
  { docNumber: 'RP2024020', vehicleId: 'VH031', date: '2024-08-05', repairItems: 'ซ่อมระบบแอร์', category: 'บริการภายนอก', parts: 4500, labor: 2500, other: 300, total: 7300, garage: 'อู่ชัยมงคล', status: 'completed' },
  { docNumber: 'RP2024021', vehicleId: 'VH006', date: '2024-08-20', repairItems: 'เปลี่ยนยาง 4 เส้น', category: 'ยาง', parts: 14000, labor: 800, other: 0, total: 14800, garage: 'อู่กลาง', status: 'completed' },
  { docNumber: 'RP2024022', vehicleId: 'VH018', date: '2024-09-01', repairItems: 'ซ่อมประตู', category: 'อะไหล่', parts: 6500, labor: 3000, other: 500, total: 10000, garage: 'อู่สมชาย', status: 'completed' },
  { docNumber: 'RP2024023', vehicleId: 'VH024', date: '2024-09-12', repairItems: 'ตรวจเช็คระยะ 30,000 กม', category: 'น้ำมัน', parts: 3800, labor: 1000, other: 200, total: 5000, garage: 'ศูนย์บริการ Honda', status: 'completed' },
  { docNumber: 'RP2024024', vehicleId: 'VH034', date: '2024-09-20', repairItems: 'ซ่อมระบบไฟ', category: 'ค่าแรง', parts: 2000, labor: 2500, other: 500, total: 5000, garage: 'อู่ชัยมงคล', status: 'in_progress' },
  { docNumber: 'RP2024025', vehicleId: 'VH009', date: '2024-10-05', repairItems: 'เปลี่ยนแบตเตอรี่', category: 'อะไหล่', parts: 4000, labor: 300, other: 0, total: 4300, garage: 'ศูนย์บริการ Ford', status: 'completed' },
];

export const repairRecords: RepairRecord[] = repairData.map((r, i) => ({
  ...r,
  id: `REP${String(i + 1).padStart(3, '0')}`,
}));

const docExpenseData: Omit<DocumentExpense, 'id'>[] = [
  { docNumber: 'DE2024001', vehicleId: 'VH001', date: '2024-01-10', docType: 'ต่อภาษี', amount: 6500, status: 'paid' },
  { docNumber: 'DE2024002', vehicleId: 'VH002', date: '2024-01-15', docType: 'ประกันภัย', amount: 15000, status: 'paid' },
  { docNumber: 'DE2024003', vehicleId: 'VH003', date: '2024-01-20', docType: 'ตรวจสภาพรถ', amount: 450, status: 'paid' },
  { docNumber: 'DE2024004', vehicleId: 'VH004', date: '2024-02-01', docType: 'พรบ.', amount: 970, status: 'paid' },
  { docNumber: 'DE2024005', vehicleId: 'VH005', date: '2024-02-10', docType: 'ต่อภาษี', amount: 3200, status: 'paid' },
  { docNumber: 'DE2024006', vehicleId: 'VH006', date: '2024-02-20', docType: 'ประกันภัย', amount: 12500, status: 'paid' },
  { docNumber: 'DE2024007', vehicleId: 'VH007', date: '2024-03-05', docType: 'ตรวจสภาพรถ', amount: 450, status: 'paid' },
  { docNumber: 'DE2024008', vehicleId: 'VH008', date: '2024-03-15', docType: 'พรบ.', amount: 970, status: 'paid' },
  { docNumber: 'DE2024009', vehicleId: 'VH009', date: '2024-04-01', docType: 'ต่อภาษี', amount: 5800, status: 'paid' },
  { docNumber: 'DE2024010', vehicleId: 'VH010', date: '2024-04-10', docType: 'ประกันภัย', amount: 9500, status: 'pending' },
  { docNumber: 'DE2024011', vehicleId: 'VH011', date: '2024-04-20', docType: 'ต่อภาษี', amount: 7200, status: 'paid' },
  { docNumber: 'DE2024012', vehicleId: 'VH012', date: '2024-05-01', docType: 'ประกันภัย', amount: 11000, status: 'paid' },
  { docNumber: 'DE2024013', vehicleId: 'VH013', date: '2024-05-15', docType: 'ตรวจสภาพรถ', amount: 450, status: 'paid' },
  { docNumber: 'DE2024014', vehicleId: 'VH014', date: '2024-06-01', docType: 'พรบ.', amount: 970, status: 'overdue' },
  { docNumber: 'DE2024015', vehicleId: 'VH015', date: '2024-06-10', docType: 'ต่อภาษี', amount: 4500, status: 'paid' },
  { docNumber: 'DE2024016', vehicleId: 'VH016', date: '2024-07-01', docType: 'ประกันภัย', amount: 13000, status: 'paid' },
  { docNumber: 'DE2024017', vehicleId: 'VH017', date: '2024-07-15', docType: 'ตรวจสภาพรถ', amount: 450, status: 'paid' },
  { docNumber: 'DE2024018', vehicleId: 'VH018', date: '2024-08-01', docType: 'พรบ.', amount: 970, status: 'paid' },
  { docNumber: 'DE2024019', vehicleId: 'VH019', date: '2024-08-15', docType: 'ต่อภาษี', amount: 3800, status: 'pending' },
  { docNumber: 'DE2024020', vehicleId: 'VH020', date: '2024-09-01', docType: 'ประกันภัย', amount: 8500, status: 'paid' },
];

export const documentExpenses: DocumentExpense[] = docExpenseData.map((d, i) => ({
  ...d,
  id: `DOC${String(i + 1).padStart(3, '0')}`,
}));

const planData: Omit<MaintenancePlan, 'id'>[] = [
  { vehicleId: 'VH001', taskName: 'เปลี่ยนน้ำมันเครื่อง', plannedDate: '2024-10-15', dueDate: '2024-10-20', status: 'upcoming', assignee: 'ช่างสมชาย', estimatedCost: 2500 },
  { vehicleId: 'VH002', taskName: 'ตรวจเช็คระยะ 20,000 กม', plannedDate: '2024-10-25', dueDate: '2024-11-01', status: 'planned', assignee: 'ช่างสมศักดิ์', estimatedCost: 4000 },
  { vehicleId: 'VH004', taskName: 'เปลี่ยนยาง', plannedDate: '2024-09-01', dueDate: '2024-09-10', completedDate: '2024-09-08', status: 'completed', assignee: 'ช่างวิชัย', estimatedCost: 12000, actualCost: 12800 },
  { vehicleId: 'VH007', taskName: 'ซ่อมระบบแอร์', plannedDate: '2024-08-15', dueDate: '2024-08-20', status: 'overdue', assignee: 'ช่างสมชาย', estimatedCost: 8000 },
  { vehicleId: 'VH009', taskName: 'เปลี่ยนผ้าเบรก', plannedDate: '2024-11-05', dueDate: '2024-11-10', status: 'planned', assignee: 'ช่างสมศักดิ์', estimatedCost: 5500 },
  { vehicleId: 'VH012', taskName: 'ตรวจเช็คระยะ 10,000 กม', plannedDate: '2024-10-10', dueDate: '2024-10-15', status: 'upcoming', assignee: 'ช่างวิชัย', estimatedCost: 3200 },
  { vehicleId: 'VH015', taskName: 'เปลี่ยนแบตเตอรี่', plannedDate: '2024-09-20', dueDate: '2024-09-25', completedDate: '2024-09-22', status: 'completed', assignee: 'ช่างสมชาย', estimatedCost: 3500, actualCost: 3800 },
  { vehicleId: 'VH019', taskName: 'ซ่อมเครื่องยนต์', plannedDate: '2024-10-01', dueDate: '2024-10-15', status: 'in_progress', assignee: 'ช่างสมศักดิ์', estimatedCost: 35000 },
  { vehicleId: 'VH022', taskName: 'เปลี่ยนน้ำมันเกียร์', plannedDate: '2024-11-15', dueDate: '2024-11-20', status: 'planned', assignee: 'ช่างวิชัย', estimatedCost: 3000 },
  { vehicleId: 'VH025', taskName: 'ตรวจสภาพทั่วไป', plannedDate: '2024-12-01', dueDate: '2024-12-05', status: 'planned', assignee: 'ช่างสมชาย', estimatedCost: 2000 },
  { vehicleId: 'VH028', taskName: 'เปลี่ยนกรองอากาศ', plannedDate: '2024-10-20', dueDate: '2024-10-25', status: 'upcoming', assignee: 'ช่างสมศักดิ์', estimatedCost: 800 },
  { vehicleId: 'VH031', taskName: 'ซ่อมระบบไฟฟ้า', plannedDate: '2024-07-10', dueDate: '2024-07-15', status: 'cancelled', assignee: 'ช่างวิชัย', estimatedCost: 5000 },
];

export const maintenancePlans: MaintenancePlan[] = planData.map((p, i) => ({
  ...p,
  id: `MP${String(i + 1).padStart(3, '0')}`,
}));

export const monthlyRepairCosts = [
  { month: 'ม.ค.', cost: 45000 },
  { month: 'ก.พ.', cost: 62000 },
  { month: 'มี.ค.', cost: 55000 },
  { month: 'เม.ย.', cost: 78000 },
  { month: 'พ.ค.', cost: 52000 },
  { month: 'มิ.ย.', cost: 68000 },
  { month: 'ก.ค.', cost: 48000 },
  { month: 'ส.ค.', cost: 71000 },
  { month: 'ก.ย.', cost: 59000 },
  { month: 'ต.ค.', cost: 83000 },
];

export const monthlyDocCosts = [
  { month: 'ม.ค.', cost: 22500 },
  { month: 'ก.พ.', cost: 14870 },
  { month: 'มี.ค.', cost: 11220 },
  { month: 'เม.ย.', cost: 18200 },
  { month: 'พ.ค.', cost: 11950 },
  { month: 'มิ.ย.', cost: 13970 },
  { month: 'ก.ค.', cost: 13870 },
  { month: 'ส.ค.', cost: 9970 },
  { month: 'ก.ย.', cost: 9270 },
  { month: 'ต.ค.', cost: 5200 },
];
