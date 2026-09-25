import { useState } from 'react';
import Sidebar from './components/Sidebar';
import AppHeader from './components/AppHeader';
import NotificationPanel from './components/NotificationPanel';
import { getUnreadNotificationCount } from './data/extendedData';
import DashboardPage from './pages/DashboardPage';
import VehicleListPage from './pages/VehicleListPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import RepairManagementPage from './pages/RepairManagementPage';
import MaintenanceManagementPage from './pages/MaintenanceManagementPage';
import PurchaseOrderPage from './pages/PurchaseOrderPage';
import DocumentManagementPage from './pages/DocumentManagementPage';
import OverviewPage from './pages/OverviewPage';
import VehicleStatusPage from './pages/VehicleStatusPage';
import RepairCostPage from './pages/RepairCostPage';
import DocCostPage from './pages/DocCostPage';
import MaintenancePlanPage from './pages/MaintenancePlanPage';
import PurchaseOrderReportPage from './pages/PurchaseOrderReportPage';


type Page =
  | 'dashboard' | 'vehicles' | 'vehicle-detail'
  | 'repair-management' | 'maintenance-management' | 'purchase-orders'
  | 'documents'
  | 'overview' | 'vehicle-status' | 'repair-cost' | 'doc-cost' | 'maintenance-plan'
  | 'purchase-order-report';

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  vehicles: 'ยานพาหนะ',
  'vehicle-detail': 'รายละเอียดยานพาหนะ',
  'repair-management': 'การจัดการซ่อมบำรุง',
  'maintenance-management': 'แผนการซ่อมบำรุง',
  'purchase-orders': 'สั่งซื้ออะไหล่',
  documents: 'เอกสาร',
  overview: 'ภาพรวมรายงาน',
  'vehicle-status': 'สถานะยานพาหนะ',
  'repair-cost': 'ค่าใช้จ่ายซ่อมบำรุง',
  'doc-cost': 'ค่าใช้จ่ายเอกสาร',
  'maintenance-plan': 'แผนการซ่อมบำรุง',
  'purchase-order-report': 'รายงานการสั่งซื้ออะไหล่',
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page as Page);
    if (id) setSelectedVehicleId(id);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'vehicles': return <VehicleListPage onViewDetail={(id) => { setSelectedVehicleId(id); setCurrentPage('vehicle-detail'); }} />;
      case 'vehicle-detail': return <VehicleDetailPage vehicleId={selectedVehicleId || ''} onBack={() => setCurrentPage('vehicles')} />;
      case 'repair-management': return <RepairManagementPage />;
      case 'maintenance-management': return <MaintenanceManagementPage />;
      case 'purchase-orders': return <PurchaseOrderPage />;
      case 'documents': return <DocumentManagementPage />;
      case 'overview': return <OverviewPage />;
      case 'vehicle-status': return <VehicleStatusPage />;
      case 'repair-cost': return <RepairCostPage />;
      case 'doc-cost': return <DocCostPage />;
      case 'maintenance-plan': return <MaintenancePlanPage />;
      case 'purchase-order-report': return <PurchaseOrderReportPage />;
default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar currentPage={currentPage} onNavigate={(p) => setCurrentPage(p)} />
      <AppHeader
        currentPageTitle={pageTitles[currentPage]}
        onNotificationClick={() => setNotificationPanelOpen(true)}
        notificationCount={getUnreadNotificationCount()}
        onNavigate={handleNavigate}
      />
      <NotificationPanel open={notificationPanelOpen} onClose={() => setNotificationPanelOpen(false)} />
      <main className="flex-1 ml-60 pt-16 min-h-screen">
        <div className="max-w-[1400px] mx-auto p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
