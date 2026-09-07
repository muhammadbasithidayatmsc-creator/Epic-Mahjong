import React, { useState, useEffect } from 'react';
import { api } from './lib/api';
import { MahjongTable, BusinessSettings, UserProfile, Reservation } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BookingSection } from './components/BookingSection';
import { TableShowcase } from './components/TableShowcase';
import { ScheduleView } from './components/ScheduleView';
import { HowToBook } from './components/HowToBook';
import { VenueInfo } from './components/VenueInfo';
import { Footer } from './components/Footer';
import { BookingSuccessModal } from './components/BookingSuccessModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { Toast } from './components/Toast';

export default function App() {
  const [tables, setTables] = useState<MahjongTable[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  
  // Modals
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [successBookingData, setSuccessBookingData] = useState<{
    reservation: Reservation;
    whatsappUrl: string;
  } | null>(null);

  // Preselected table from showcase
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Load initial public data and user session
  const loadInitialData = async () => {
    try {
      const [fetchedTables, fetchedSettings] = await Promise.all([
        api.getTables(),
        api.getSettings()
      ]);
      setTables(fetchedTables);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }

    // Check if staff is already logged in
    try {
      const user = await api.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (err) {
      // Not logged in or expired token
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleBookingCreated = (reservation: Reservation, whatsappUrl: string) => {
    setSuccessBookingData({ reservation, whatsappUrl });
    showToast(`Booking ${reservation.booking_code} berhasil dibuat! Silakan hubungi WhatsApp Admin.`, 'success');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setViewMode('admin');
    showToast(`Selamat datang kembali, ${user.full_name}!`, 'success');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setViewMode('customer');
    showToast('Anda telah logout dari portal staff.', 'info');
  };

  const handleTablesUpdated = async () => {
    try {
      const updated = await api.getTables();
      setTables(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // If in admin mode and user is logged in, show the Admin Portal
  if (viewMode === 'admin' && currentUser) {
    return (
      <>
        <AdminPortal
          user={currentUser}
          tables={tables}
          settings={settings}
          onLogout={handleLogout}
          onExitPortal={() => setViewMode('customer')}
          onSuccessToast={(msg) => showToast(msg, 'success')}
          onErrorToast={(msg) => showToast(msg, 'error')}
          onTablesUpdated={handleTablesUpdated}
          onSettingsUpdated={(newSettings) => setSettings(newSettings)}
        />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Booking Success Modal */}
      {successBookingData && (
        <BookingSuccessModal
          reservation={successBookingData.reservation}
          whatsappUrl={successBookingData.whatsappUrl}
          onClose={() => setSuccessBookingData(null)}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onErrorToast={(msg) => showToast(msg, 'error')}
      />

      {/* Navigation Header */}
      <Navbar
        settings={settings}
        currentUser={currentUser}
        adminWhatsApp={settings?.admin_whatsapp || '085181959275'}
        onOpenAdminLogin={() => {
          if (currentUser) {
            setViewMode('admin');
          } else {
            setLoginModalOpen(true);
          }
        }}
        onGoToAdminDashboard={() => setViewMode('admin')}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Banner */}
        <Hero settings={settings} />

        {/* 5 Tables Showcase */}
        <TableShowcase
          tables={tables}
          onSelectForBooking={(tblId) => setSelectedTableId(tblId)}
        />

        {/* Booking Form with Realtime Status */}
        <BookingSection
          tables={tables}
          settings={settings}
          preselectedTableId={selectedTableId}
          onBookingSuccess={handleBookingCreated}
          onErrorToast={(msg) => showToast(msg, 'error')}
        />

        {/* Schedule Matrix View */}
        <ScheduleView />

        {/* How to Book Guide */}
        <HowToBook />

        {/* Venue Information & Location (Alam Sutera) */}
        <VenueInfo settings={settings} />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdminLogin={() => {
          if (currentUser) {
            setViewMode('admin');
          } else {
            setLoginModalOpen(true);
          }
        }}
      />

    </div>
  );
}
