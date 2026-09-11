import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  TableProperties, 
  Clock, 
  Users, 
  Settings, 
  LogOut, 
  ArrowUpRight, 
  Shield, 
  Menu, 
  X,
  Sparkles,
  KeyRound,
  BarChart3,
  UserCheck,
  Timer
} from 'lucide-react';
import { UserProfile, MahjongTable, BusinessSettings } from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { AdminReservations } from './AdminReservations';
import { AdminSchedule } from './AdminSchedule';
import { AdminTables } from './AdminTables';
import { AdminUsers } from './AdminUsers';
import { AdminSettings } from './AdminSettings';
import { AdminAccountSettings } from './AdminAccountSettings';
import { AdminReports } from './AdminReports';
import { AdminCustomers } from './AdminCustomers';
import { AdminSessions } from './AdminSessions';

interface AdminPortalProps {
  user: UserProfile;
  tables: MahjongTable[];
  settings: BusinessSettings | null;
  onLogout: () => void;
  onExitPortal: () => void;
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
  onTablesUpdated?: () => void;
  onSettingsUpdated?: (settings: BusinessSettings) => void;
}

type AdminTab = 'dashboard' | 'reservations' | 'schedule' | 'sessions' | 'reports' | 'customers' | 'tables' | 'users' | 'settings' | 'account';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  user,
  tables,
  settings,
  onLogout,
  onExitPortal,
  onSuccessToast,
  onErrorToast,
  onTablesUpdated,
  onSettingsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [resStatusFilter, setResStatusFilter] = useState<string>('ALL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const canManageSessions = user.role === 'SUPER_ADMIN' || user.role === 'OWNER';

  const navigateToReservations = (status?: string) => {
    if (status) setResStatusFilter(status);
    else setResStatusFilter('ALL');
    setActiveTab('reservations');
  };

  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reservations' as AdminTab, label: 'Reservasi', icon: CalendarDays },
    { id: 'schedule' as AdminTab, label: 'Jadwal Meja', icon: Clock },
    ...(canManageSessions ? [
      { id: 'sessions' as AdminTab, label: '⏱️ Kelola Sesi Jam', icon: Timer }
    ] : []),
    { id: 'reports' as AdminTab, label: '📊 REPORT', icon: BarChart3 },
    { id: 'customers' as AdminTab, label: '👥 DATABASE CUSTOMER', icon: Users },
    ...(isSuperAdmin ? [
      { id: 'tables' as AdminTab, label: 'Kelola Meja', icon: TableProperties },
      { id: 'users' as AdminTab, label: 'Kelola Akun Staff', icon: Shield },
      { id: 'settings' as AdminTab, label: 'Pengaturan Bisnis', icon: Settings }
    ] : []),
    { id: 'account' as AdminTab, label: 'Pengaturan Akun', icon: KeyRound }
  ];

  return (
    <div id="admin-portal-root" className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0d121c]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-serif font-black text-amber-400 text-sm">
              中
            </div>
            <div>
              <div className="font-serif font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                <span>{settings?.business_name || 'EPIC MAHJONG'}</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Staff Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {settings?.location || 'Alam Sutera'}
              </div>
            </div>
          </div>
        </div>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Shield className={`w-3.5 h-3.5 ${isSuperAdmin ? 'text-amber-400' : 'text-indigo-400'}`} />
            <span className="font-semibold text-slate-200">{user.full_name}</span>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
              isSuperAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              {user.role}
            </span>
          </div>

          <button
            onClick={onExitPortal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            <span>Lihat Website</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
            title="Keluar dari akun staff"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col justify-between p-4 bg-[#0d131f] border-r border-slate-800/80">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Navigasi Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800/80 text-xs space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Venue Status</div>
            <div className="text-slate-200 font-semibold">{tables.length} Meja Terdaftar</div>
            <div className="text-emerald-400 font-mono text-[11px]">WA: {settings?.admin_whatsapp || '085181959275'}</div>
          </div>
        </aside>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#111724] border border-slate-700 rounded-2xl p-6 space-y-4 max-w-sm w-full mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-slate-200">Menu Staff</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-amber-500 text-slate-950 font-bold' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-xs text-rose-400 font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              user={user}
              onViewReservations={navigateToReservations}
              onOpenDetail={(res) => {
                setActiveTab('reservations');
              }}
              onConfirmBooking={(res) => {
                setActiveTab('reservations');
              }}
              onErrorToast={onErrorToast}
            />
          )}

          {activeTab === 'reservations' && (
            <AdminReservations
              user={user}
              initialStatusFilter={resStatusFilter}
              tables={tables}
              onSuccessToast={onSuccessToast}
              onErrorToast={onErrorToast}
            />
          )}

          {activeTab === 'schedule' && (
            <AdminSchedule onErrorToast={onErrorToast} />
          )}

          {activeTab === 'sessions' && canManageSessions && (
            <AdminSessions
              user={user}
              onSuccessToast={onSuccessToast}
              onErrorToast={onErrorToast}
            />
          )}

          {activeTab === 'reports' && (
            <AdminReports
              user={user}
              tables={tables}
              settings={settings}
              onErrorToast={onErrorToast}
              onSuccessToast={onSuccessToast}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers
              user={user}
              settings={settings}
              onErrorToast={onErrorToast}
            />
          )}

          {activeTab === 'tables' && isSuperAdmin && (
            <AdminTables
              user={user}
              onSuccessToast={onSuccessToast}
              onErrorToast={onErrorToast}
              onTablesUpdated={onTablesUpdated}
            />
          )}

          {activeTab === 'users' && isSuperAdmin && (
            <AdminUsers
              currentUser={user}
              onSuccessToast={onSuccessToast}
              onErrorToast={onErrorToast}
            />
          )}

          {activeTab === 'settings' && isSuperAdmin && (
            <AdminSettings
              user={user}
              onSuccessToast={onSuccessToast}
              onErrorToast={onErrorToast}
              onSettingsUpdated={onSettingsUpdated}
            />
          )}

          {activeTab === 'account' && (
            <AdminAccountSettings
              user={user}
              onSuccessToast={onSuccessToast}
              onErrorToast={onErrorToast}
            />
          )}
        </main>

      </div>

    </div>
  );
};
