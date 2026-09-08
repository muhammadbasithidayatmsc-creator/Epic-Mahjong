import React, { useState } from 'react';
import { MapPin, MessageCircle, ShieldCheck, Menu, X, CalendarCheck } from 'lucide-react';
import { UserProfile, BusinessSettings } from '../types';

interface NavbarProps {
  settings?: BusinessSettings | null;
  currentUser?: UserProfile | null;
  adminUser?: UserProfile | null;
  adminWhatsApp?: string;
  onOpenAdminLogin: () => void;
  onGoToAdminDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentUser,
  adminUser,
  onOpenAdminLogin,
  onGoToAdminDashboard,
  adminWhatsApp
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeUser = currentUser || adminUser || null;
  const rawPhone = String(adminWhatsApp || settings?.admin_whatsapp || '085181959275');
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '6285181959275';
  const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent('Halo Admin EPIC MAHJONG, saya ingin bertanya seputar venue & reservasi meja.')}`;

  const handleDashboard = () => {
    if (onGoToAdminDashboard) {
      onGoToAdminDashboard();
    } else {
      onOpenAdminLogin();
    }
  };

  return (
    <nav id="main-navbar" className="sticky top-0 z-40 w-full bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shadow-lg group-hover:border-amber-400/60 transition-all duration-300">
                <span className="font-serif font-black text-amber-400 text-lg tracking-wider">中</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-widest text-lg font-extrabold text-slate-100 group-hover:text-amber-300 transition-colors">
                  EPIC MAHJONG
                </span>
                <span className="flex items-center gap-1 text-[11px] text-amber-400/90 font-medium tracking-wider uppercase">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  Alam Sutera
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#booking-section" className="hover:text-amber-400 transition-colors">
              Reservasi Meja
            </a>
            <a href="#tables-section" className="hover:text-amber-400 transition-colors">
              Pilihan Meja
            </a>
            <a href="#schedule-section" className="hover:text-amber-400 transition-colors">
              Jadwal Meja
            </a>
            <a href="#guide-section" className="hover:text-amber-400 transition-colors">
              Cara Booking
            </a>
            <a href="#venue-section" className="hover:text-amber-400 transition-colors">
              Lokasi & Kontak
            </a>
          </div>

          {/* Actions: WhatsApp & Admin Portal */}
          <div className="hidden md:flex items-center gap-3">
            <a
              id="nav-whatsapp-btn"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Admin</span>
            </a>

            {activeUser && (
              <button
                id="nav-admin-dashboard-btn"
                onClick={handleDashboard}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-all text-xs shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dashboard ({activeUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'})</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-b border-slate-800 bg-[#0b0f17] px-4 pt-3 pb-5 space-y-3">
          <a
            href="#booking-section"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            <span>Reservasi Meja</span>
          </a>
          <a
            href="#tables-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Pilihan Meja
          </a>
          <a
            href="#schedule-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Jadwal Meja
          </a>
          <a
            href="#guide-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Cara Booking
          </a>
          <a
            href="#venue-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Lokasi & Kontak
          </a>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Admin (085181959275)</span>
            </a>

            {activeUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDashboard();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk Dashboard ({activeUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
