import React from 'react';
import { MapPin, Clock, MessageCircle, Phone, Sparkles, Navigation } from 'lucide-react';
import { BusinessSettings } from '../types';

interface VenueInfoProps {
  settings: BusinessSettings | null;
}

export const VenueInfo: React.FC<VenueInfoProps> = ({ settings }) => {
  const adminWhatsApp = String(settings?.admin_whatsapp || '085181959275');
  const location = settings?.location || 'Alam Sutera';
  const cleanPhone = adminWhatsApp.replace(/[^0-9]/g, '') || '6285181959275';
  const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent('Halo Admin EPIC MAHJONG, saya ingin info alamat lengkap dan reservasi meja.')}`;

  return (
    <section id="venue-section" className="py-16 md:py-24 bg-[#0d121c] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Venue & Contact
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
              Kunjungi Epic Mahjong di Alam Sutera
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Lokasi strategis di kawasan prestisius Alam Sutera, Tangerang. Akses mudah dari tol Jakarta - Merak dengan area parkir luas, keamanan 24 jam, dan privasi penuh untuk para penikmat Mahjong.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#111724] border border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Lokasi Venue</div>
                  <div className="text-sm font-bold text-slate-100 mt-0.5">
                    Kawasan Alam Sutera, Tangerang, Banten
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Hanya 5 menit dari Mall @ Alam Sutera & IKEA Alam Sutera.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#111724] border border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Jam Operasional</div>
                  <div className="text-sm font-bold text-slate-100 mt-0.5">
                    {settings?.operating_hours || '10:00 - 02:00 WIB'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Buka setiap hari termasuk hari libur nasional.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#111724] border border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">WhatsApp Super Admin Resmi</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">
                    {adminWhatsApp}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Hubungi kami untuk pertanyaan harga, konfirmasi pembayaran & reservasi khusus.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider shadow-lg shadow-emerald-500/20 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>Chat WhatsApp Admin</span>
              </a>

              <a
                href="https://maps.google.com/?q=Alam+Sutera"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-850 text-slate-300 text-xs font-semibold transition-all"
              >
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Buka di Google Maps</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#111724] shadow-2xl p-2">
              <img
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80"
                alt="Alam Sutera Venue Atmosphere"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover rounded-xl brightness-90"
              />
              <div className="p-4 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-200">EPIC MAHJONG Venue • Alam Sutera</span>
                <span className="text-amber-400">VIP Private Game Club</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
