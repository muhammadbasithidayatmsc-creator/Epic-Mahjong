import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { api } from './lib/api';
import { MahjongTable, BusinessSettings, UserProfile, Reservation } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BookingSection } from './components/BookingSection';
import { TableShowcase } from './components/TableShowcase';
import { HowToBook } from './components/HowToBook';
import { VenueInfo } from './components/VenueInfo';
import { Footer } from './components/Footer';
import { BookingSuccessModal } from './components/BookingSuccessModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { InternalPortalLoginPage } from './components/admin/InternalPortalLoginPage';
import { UnauthorizedPage } from './components/admin/UnauthorizedPage';
import { Toast } from './components/Toast';

export default function App() {
  const [tables, setTables] = useState<MahjongTable[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  
  // URL path routing state helper
  const getCleanPath = () => {
    const p = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    if (hash.includes('login') || hash.includes('portal') || hash.includes('admin') || hash.includes('dashboard')) {
      return '/' + hash;
    }
    return p;
  };

  const [currentPath, setCurrentPath] = useState<string>(getCleanPath);

  // Modals & temporary state
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

  // Safe navigation helper that keeps history and syncs path state
  const navigate = useCallback((path: string, replace = false) => {
    try {
      if (replace) {
        window.history.replaceState(null, '', path);
      } else {
        window.history.pushState(null, '', path);
      }
    } catch {
      window.location.hash = path;
    }
    setCurrentPath(path.toLowerCase());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser navigation (back/forward buttons)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getCleanPath());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Load initial data and verify active session
  const loadInitialData = async () => {
    setAuthChecking(true);
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

    // Check if staff session is valid
    try {
      const user = await api.getCurrentUser();
      if (user && user.is_active !== false) {
        setCurrentUser(user);
      } else {
        api.logout();
        setCurrentUser(null);
      }
    } catch {
      api.logout();
      setCurrentUser(null);
    } finally {
      setAuthChecking(false);
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
    navigate('/portal/dashboard', true);
    showToast(`Selamat datang kembali, ${user.full_name}!`, 'success');
  };

  // Secure Logout: destroy token, clear state, and overwrite history state
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    // Replace current history entry with login page so pressing "Back" cannot access dashboard
    navigate('/portal/login', true);
    showToast('Anda telah logout dari portal internal.', 'info');
  };

  const handleTablesUpdated = async () => {
    try {
      const updated = await api.getTables();
      setTables(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Path categorization
  const isInternalLoginRoute = 
    currentPath === '/portal/login' || 
    currentPath === '/admin/login' ||
    currentPath === '/login' ||
    currentPath === '/portal' ||
    currentPath.endsWith('/login') ||
    currentPath.endsWith('/portal');
  
  const isProtectedAdminRoute = (
    currentPath.startsWith('/portal') || 
    currentPath.startsWith('/admin') || 
    currentPath === '/dashboard' ||
    currentPath === '/settings' ||
    currentPath.includes('dashboard')
  ) && !isInternalLoginRoute;

  // ROUTE 1: Dedicated Internal Portal Login (/portal/login or /admin/login)
  if (isInternalLoginRoute) {
    if (currentUser) {
      // If already logged in, redirect to admin dashboard
      navigate('/portal/dashboard', true);
    }
    return (
      <>
        <InternalPortalLoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => navigate('/')}
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

  // ROUTE 2: Protected Admin Route (/portal, /admin, /dashboard, etc.)
  if (isProtectedAdminRoute) {
    // If auth is still checking, show subtle dark loader
    if (authChecking) {
      return (
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-amber-400">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    // If authenticated, render AdminPortal with RBAC
    if (currentUser) {
      return (
        <>
          <AdminPortal
            user={currentUser}
            tables={tables}
            settings={settings}
            onLogout={handleLogout}
            onExitPortal={() => navigate('/')}
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

    // If NOT authenticated, render 403 Unauthorized page
    return (
      <>
        <UnauthorizedPage
          onGoToLogin={() => navigate('/portal/login')}
          onGoToHome={() => navigate('/')}
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

  // ROUTE 3: Customer Public Website (/)
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

      {/* Customer Navigation Header */}
      <Navbar
        settings={settings}
        currentUser={currentUser}
        adminWhatsApp={settings?.admin_whatsapp || '085181959275'}
        onOpenAdminLogin={() => navigate('/portal/login')}
        onGoToAdminDashboard={() => navigate('/portal/dashboard')}
      />

      {/* Main Content Sections - Customer-First Priority */}
      <main className="flex-1">
        {/* 1. TABLE AVAILABILITY & SCHEDULE (Jadwal Meja Hari Ini & Mendatang + Formulir Booking) */}
        <BookingSection
          tables={tables}
          settings={settings}
          preselectedTableId={selectedTableId}
          onBookingSuccess={handleBookingCreated}
          onErrorToast={(msg) => showToast(msg, 'error')}
        />

        {/* 2. 5 Tables Showcase with Room Features */}
        <TableShowcase
          tables={tables}
          onSelectForBooking={(tblId) => {
            setSelectedTableId(tblId);
            const el = document.getElementById('schedule-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. Luxury Experience & Venue Highlight */}
        <Hero settings={settings} />

        {/* 4. How to Book Guide */}
        <HowToBook />

        {/* 5. Venue Information & Location (Alam Sutera) */}
        <VenueInfo settings={settings} />
      </main>

      {/* Customer Footer */}
      <Footer
        settings={settings}
        onOpenAdminLogin={() => navigate('/portal/login')}
      />

      {/* Floating WhatsApp Quick Contact Button (Super Admin: 085181959275) */}
      <a
        id="floating-whatsapp-btn"
        href={`https://api.whatsapp.com/send?phone=6285181959275&text=${encodeURIComponent('Halo Admin EPIC MAHJONG, saya ingin reservasi meja.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-2xl shadow-emerald-500/40 border-2 border-emerald-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Chat WhatsApp Super Admin: 085181959275"
      >
        <MessageCircle className="w-5 h-5 fill-slate-950" />
        <span className="hidden sm:inline">WhatsApp Admin (085181959275)</span>
        <span className="sm:hidden font-mono">085181959275</span>
      </a>

    </div>
  );
}
