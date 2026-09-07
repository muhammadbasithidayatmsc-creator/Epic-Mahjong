import React from 'react';
import { Calendar, MapPin, Sparkles, ChevronRight, Clock, ShieldCheck, MessageCircle } from 'lucide-react';
import { BusinessSettings } from '../types';

interface HeroProps {
  settings?: BusinessSettings | null;
  onBookingClick?: () => void;
  location?: string;
}

export const Hero: React.FC<HeroProps> = ({ settings, onBookingClick, location: propLocation }) => {
  const adminWhatsApp = settings?.admin_whatsapp || '085181959275';
  const location = propLocation || settings?.location || 'Alam Sutera';
  const cleanPhone = adminWhatsApp.replace(/[^0-9]/g, '') || '6285181959275';
  const waTargetPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
  const waUrl = `https://api.whatsapp.com/send?phone=${waTargetPhone}&text=${encodeURIComponent('Halo Admin EPIC MAHJONG, saya ingin info ketersediaan & reservasi meja.')}`;

  const handleBookingClick = () => {
    if (onBookingClick) {
      onBookingClick();
    } else {
      const el = document.getElementById('booking-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="hero-section" className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-slate-800/60">
      {/* Subtle background ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Luxury Table Game Club • {location}</span>
            </div>

            {/* Main Title */}
            <div className="space-y-3">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.15]">
                EPIC MAHJONG
              </h1>
              <p className="font-serif text-2xl sm:text-3xl text-amber-400 font-semibold tracking-wide">
                Reserve Your Table
              </p>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl font-light">
              Nikmati sensasi bermain Mahjong premium di Alam Sutera dengan 5 meja otomatis elektrik terbaru, 
              suasana private lounge yang mewah, dan kenyamanan eksklusif tanpa repot.
            </p>

            {/* Key Venue Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg pt-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Fasilitas</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">5 Meja Otomatis</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Lokasi</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  {location}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-400 font-medium">WhatsApp Admin</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">
                  {adminWhatsApp}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 w-full sm:w-auto">
              <button
                id="hero-cta-booking-btn"
                type="button"
                onClick={handleBookingClick}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-base tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200 cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-slate-950" />
                <span>BOOKING MEJA SEKARANG</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <a
                id="hero-whatsapp-btn"
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold transition-all text-sm"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-400 text-emerald-950" />
                <span>Chat Admin ({adminWhatsApp})</span>
              </a>
            </div>

            {/* Info guarantee */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tanpa registrasi akun • Hubungi Admin {adminWhatsApp}</span>
            </div>

          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Glow frame */}
              <div className="relative rounded-2xl overflow-hidden border border-amber-500/25 bg-slate-900/80 shadow-2xl shadow-black/80">
                <img
                  src="https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1000&q=80"
                  alt="Epic Mahjong Lounge Alam Sutera"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-700 brightness-90"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-slate-950/40 to-transparent" />

                {/* Floating Venue Tag */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[#0e131d]/90 backdrop-blur-md border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-serif tracking-widest text-amber-400 font-bold uppercase">EPIC MAHJONG VENUE</div>
                    <div className="text-sm font-semibold text-slate-200">5 Meja Otomatis Elektrik Tersedia</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Open Today
                  </span>
                </div>
              </div>

              {/* Decorative tile corner */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 p-3 rounded-xl bg-slate-900 border border-amber-500/30 shadow-xl items-center gap-3">
                <div className="w-10 h-12 rounded bg-amber-50 text-slate-900 font-serif font-black text-xl flex items-center justify-center border border-amber-300/40 shadow-inner">
                  發
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">VIP Atmosphere</div>
                  <div className="text-[11px] text-slate-400">Exclusive Alam Sutera</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
