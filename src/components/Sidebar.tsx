import { useState } from 'react';
import {
  LayoutDashboard, Car, Wrench, FileText, CalendarClock,
  BarChart3, Settings, ChevronDown, ChevronRight,
  TrendingUp, Receipt, ClipboardList, Package,
  Layers, Bookmark, Menu, X
} from 'lucide-react';

type Page =
  | 'dashboard' | 'vehicles' | 'vehicle-detail'
  | 'repair-management' | 'maintenance-management' | 'purchase-orders'
  | 'documents'
  | 'overview' | 'vehicle-status' | 'repair-cost' | 'doc-cost' | 'maintenance-plan' | 'custom-report' | 'saved-reports';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const repairSubMenu = [
  { id: 'repair-management' as Page, label: 'รายการซ่อม', icon: Wrench },
  { id: 'maintenance-management' as Page, label: 'แผนการซ่อม', icon: CalendarClock },
  { id: 'purchase-orders' as Page, label: 'สั่งซื้ออะไหล่', icon: Package },
];

const reportSubMenu = [
  { id: 'overview' as Page, label: 'ภาพรวมรายงาน', icon: TrendingUp },
  { id: 'vehicle-status' as Page, label: 'สถานะยานพาหนะ', icon: Car },
  { id: 'repair-cost' as Page, label: 'ค่าใช้จ่ายซ่อมบำรุง', icon: Wrench },
  { id: 'doc-cost' as Page, label: 'ค่าใช้จ่ายเอกสาร', icon: Receipt },
  { id: 'maintenance-plan' as Page, label: 'แผนการซ่อมบำรุง', icon: ClipboardList },
  { id: 'custom-report' as Page, label: 'รายงานรวม', icon: Layers },
  { id: 'saved-reports' as Page, label: 'Saved Reports', icon: Bookmark },
];

const repairPages = new Set<Page>(['repair-management', 'maintenance-management', 'purchase-orders']);
const reportPages = new Set<Page>(['overview', 'vehicle-status', 'repair-cost', 'doc-cost', 'maintenance-plan', 'custom-report', 'saved-reports']);

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [reportOpen, setReportOpen] = useState(true);
  const [repairOpen, setRepairOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const isVehiclesActive = currentPage === 'vehicles' || currentPage === 'vehicle-detail';
  const isRepairGroupActive = repairPages.has(currentPage);
  const isReportGroupActive = reportPages.has(currentPage);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-20 lg:hidden ${collapsed ? 'hidden' : 'block'}`}
        onClick={() => setCollapsed(true)}
      />

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 bg-white border-r border-slate-200 shadow-sm
          ${collapsed ? 'w-16' : 'w-60'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 min-h-[60px]">
          <div className="w-8 h-8 rounded-lg bg-[#1565C0] flex items-center justify-center flex-shrink-0">
            <Car size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">VMS Portal</p>
              <p className="text-[10px] text-slate-500">ระบบจัดการยานพาหนะ</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded hover:bg-slate-100 text-slate-500 flex-shrink-0"
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {/* Dashboard */}
          <button
            onClick={() => onNavigate('dashboard')}
            title={collapsed ? 'Dashboard' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${currentPage === 'dashboard' ? 'bg-[#1565C0] text-white font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            <LayoutDashboard size={16} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">Dashboard</span>}
          </button>

          {/* ยานพาหนะ */}
          <button
            onClick={() => onNavigate('vehicles')}
            title={collapsed ? 'ยานพาหนะ' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${isVehiclesActive ? 'bg-[#1565C0] text-white font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            <Car size={16} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">ยานพาหนะ</span>}
          </button>

          {/* การซ่อมบำรุง expandable */}
          <div>
            <button
              onClick={() => setRepairOpen(!repairOpen)}
              title={collapsed ? 'การซ่อมบำรุง' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isRepairGroupActive ? 'bg-[#E3F2FD] text-[#1565C0] font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              <Wrench size={16} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">การซ่อมบำรุง</span>
                  {repairOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </>
              )}
            </button>
            {repairOpen && !collapsed && (
              <div className="mt-1 ml-2 pl-4 border-l-2 border-[#BBDEFB] space-y-0.5">
                {repairSubMenu.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors
                      ${currentPage === id ? 'bg-[#1565C0] text-white font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
                  >
                    <Icon size={14} className="flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            )}
            {repairOpen && collapsed && (
              <div className="mt-1 space-y-0.5">
                {repairSubMenu.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    title={label}
                    className={`w-full flex items-center justify-center px-3 py-2 rounded-lg transition-colors
                      ${currentPage === id ? 'bg-[#1565C0] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* เอกสาร */}
          <button
            onClick={() => onNavigate('documents')}
            title={collapsed ? 'เอกสาร' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${currentPage === 'documents' ? 'bg-[#1565C0] text-white font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            <FileText size={16} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">เอกสาร</span>}
          </button>

          {/* Reports expandable */}
          <div className="mt-2">
            <button
              onClick={() => setReportOpen(!reportOpen)}
              title={collapsed ? 'Reports' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isReportGroupActive ? 'bg-[#E3F2FD] text-[#1565C0] font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              <BarChart3 size={16} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">Reports</span>
                  {reportOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </>
              )}
            </button>
            {reportOpen && !collapsed && (
              <div className="mt-1 ml-2 pl-4 border-l-2 border-[#BBDEFB] space-y-0.5">
                {reportSubMenu.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors
                      ${currentPage === id ? 'bg-[#1565C0] text-white font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
                  >
                    <Icon size={14} className="flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            )}
            {reportOpen && collapsed && (
              <div className="mt-1 space-y-0.5">
                {reportSubMenu.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    title={label}
                    className={`w-full flex items-center justify-center px-3 py-2 rounded-lg transition-colors
                      ${currentPage === id ? 'bg-[#1565C0] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="p-2 border-t border-slate-100">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm"
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={16} className="flex-shrink-0" />
            {!collapsed && <span>ตั้งค่า</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
