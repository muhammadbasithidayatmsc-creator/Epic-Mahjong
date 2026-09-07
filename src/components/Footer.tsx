import React from 'react';
import { MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BusinessSettings } from '../types';

interface FooterProps {
  settings: BusinessSettings | null;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdminLogin }) => {
  const currentYear = new Date().getFullYear();
  const adminWhatsApp = settings?.admin_whatsapp || '085181959275';
  const businessName = settings?.business_name || 'EPIC MAHJONG';
  const location = settings?.location || 'Alam Sutera';

  return (
    <footer id="main-footer" className="bg-[#080c14] border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-serif font-black text-amber-400 text-sm">
                中
              </div>
              <span className="font-serif tracking-widest text-lg font-bold text-slate-100">
                {businessName}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Venue Mahjong eksklusif pertama dengan 5 meja otomatis elektrik generasi terbaru di kawasan Alam Sutera. Pengalaman bermain santai, private, dan berkelas.
            </p>
            <div className="flex items-center gap-2 text-amber-400/90 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              <span>{location} • Tangerang</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <div className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Navigasi</div>
            <ul className="space-y-1.5">
              <li>
                <a href="#booking-section" className="hover:text-amber-400 transition-colors">Reservasi Meja</a>
              </li>
              <li>
                <a href="#tables-section" className="hover:text-amber-400 transition-colors">5 Pilihan Meja</a>
              </li>
              <li>
                <a href="#schedule-section" className="hover:text-amber-400 transition-colors">Jadwal Meja</a>
              </li>
              <li>
                <a href="#guide-section" className="hover:text-amber-400 transition-colors">Panduan Booking</a>
              </li>
              <li>
                <a href="#venue-section" className="hover:text-amber-400 transition-colors">Lokasi & Kontak</a>
              </li>
            </ul>
          </div>

          {/* Contact & Admin Portal */}
          <div className="space-y-2">
            <div className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Kontak Resmi</div>
            <p className="text-xs text-slate-400">
              WhatsApp Super Admin:
              <br />
              <strong className="text-emerald-400 font-mono">{adminWhatsApp}</strong>
            </p>
            <div className="pt-3">
              <button
                id="footer-admin-login-link"
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all text-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal Login Admin / Owner</span>
              </button>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {currentYear} {businessName}. All rights reserved. Lokasi: {location}.
          </div>
          <div className="text-slate-500">
            Design & Architecture for Epic Mahjong Table Game Club
          </div>
        </div>
      </div>
    </footer>
  );
};
