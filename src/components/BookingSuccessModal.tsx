import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, ArrowUpRight, Copy, X, Check, Globe, PhoneCall, Sparkles } from 'lucide-react';
import { Reservation } from '../types';
import { formatIndoDate, formatSlotTime } from '../lib/api';

interface BookingSuccessModalProps {
  reservation: Reservation;
  whatsappUrl: string;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  reservation,
  whatsappUrl,
  onClose
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const adminPhoneDisplay = '085181959275';
  const adminPhoneClean = '6285181959275';

  const formattedDate = formatIndoDate(reservation.reservation_date);
  const sessionName = reservation.session_name || 'Sesi Bermain';
  const startTime = reservation.start_time || reservation.reservation_time;
  const endTime = reservation.end_time || '';
  const jamText = endTime ? `${startTime} – ${endTime}` : formatSlotTime(reservation.reservation_time);
  const catatanText = (reservation.notes && reservation.notes.trim()) ? reservation.notes.trim() : '-';

  let fullMessage = 
`EPIC MAHJONG — BOOKING REQUEST

Booking ID: ${reservation.booking_code}
Nama: ${reservation.customer_name}
No. WhatsApp: ${reservation.customer_phone}
Tanggal: ${formattedDate}
Table: ${reservation.table_name || 'TABLE 01'}
Jam Bermain: ${jamText}
Jumlah Pemain: ${reservation.guest_count} Orang
Catatan: ${catatanText}

Mohon informasi untuk proses konfirmasi dan pembayaran.

Terima kasih.`;

  // Pre-generate guaranteed active links
  const directApiUrl = `https://api.whatsapp.com/send?phone=${adminPhoneClean}&text=${encodeURIComponent(fullMessage)}`;
  const waMeUrl = `https://wa.me/${adminPhoneClean}?text=${encodeURIComponent(fullMessage)}`;
  const webWaUrl = `https://web.whatsapp.com/send?phone=${adminPhoneClean}&text=${encodeURIComponent(fullMessage)}`;

  const targetUrl = whatsappUrl || directApiUrl;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(reservation.booking_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(fullMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(adminPhoneDisplay);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleDirectLaunch = () => {
    try {
      const win = window.open(targetUrl, '_blank');
      if (!win) {
        window.location.href = targetUrl;
      }
    } catch (_) {
      window.location.href = targetUrl;
    }
  };

  return (
    <div id="booking-success-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#111724] border border-emerald-500/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Banner */}
        <div className="p-6 text-center border-b border-slate-800 bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-lg shadow-emerald-500/20 animate-pulse">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Tersimpan di Sistem Real-Time
          </span>

          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
            RESERVASI BERHASIL
          </h3>

          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto">
            Reservasi Anda telah berhasil tercatat. Lanjutkan ke WhatsApp Admin untuk informasi pembayaran dan konfirmasi.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-sm max-h-[75vh] overflow-y-auto">
          
          {/* Prominent Confirmation Banner */}
          <div className="p-4 rounded-xl bg-[#0b0f17] border border-emerald-500/30">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
              Anda telah melakukan reservasi:
            </div>
            <div className="font-serif text-xl font-bold text-slate-100">
              {reservation.table_name || 'TABLE 01'}
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap font-medium">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{jamText} WIB</span>
              <span>•</span>
              <span>{reservation.guest_count} Orang</span>
            </div>
            <div className="mt-2.5 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Status: MENUNGGU KONFIRMASI (PENDING)</span>
            </div>
          </div>

          {/* Booking Code Card */}
          <div className="p-3.5 rounded-xl bg-[#141c2c] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Booking ID</div>
              <div className="font-mono text-base sm:text-lg font-bold text-amber-400 mt-0.5">
                {reservation.booking_code}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>

          {/* Full Details summary */}
          <div className="bg-[#141c2c]/80 rounded-xl p-4 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Booking ID:</span>
              <span className="text-amber-400 font-mono font-bold">{reservation.booking_code}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Nama:</span>
              <span className="text-slate-200 font-semibold">{reservation.customer_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Nomor WhatsApp:</span>
              <span className="text-slate-200 font-mono">{reservation.customer_phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Tanggal:</span>
              <span className="text-slate-200 font-semibold">{formattedDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">TABLE:</span>
              <span className="text-emerald-400 font-bold">{reservation.table_name || 'TABLE 01'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Sesi:</span>
              <span className="text-amber-300 font-semibold">{sessionName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Jam Mulai:</span>
              <span className="text-slate-200 font-mono">{startTime} WIB</span>
            </div>
            {endTime && (
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Jam Selesai:</span>
                <span className="text-slate-200 font-mono">{endTime} WIB</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Jam:</span>
              <span className="text-amber-400 font-bold font-mono">{jamText} WIB</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Jumlah Orang:</span>
              <span className="text-slate-200 font-medium">{reservation.guest_count} Orang</span>
            </div>
            {reservation.notes && (
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Catatan:</span>
                <span className="text-slate-200 italic">{reservation.notes}</span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Status:</span>
              <span className="text-amber-400 font-bold">{reservation.status || 'PENDING'}</span>
            </div>
          </div>

          {/* Admin WhatsApp Info Card */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-emerald-400/80 font-medium">WhatsApp Super Admin Resmi</div>
                <div className="text-sm font-bold text-emerald-300 font-mono tracking-wider">
                  {adminPhoneDisplay}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyPhone}
              className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
            >
              {copiedPhone ? 'Tersalin!' : 'Salin Nomor'}
            </button>
          </div>

          {/* PRIMARY ACTION: WhatsApp Button */}
          <div className="pt-2 space-y-2.5">
            <a
              id="success-modal-whatsapp-btn"
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDirectLaunch}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-slate-950" />
              <span>LANJUTKAN KE WHATSAPP</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            {/* Fallback buttons for Desktop & copy */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={webWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium text-center flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Buka WhatsApp Web</span>
              </a>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium text-center flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copiedMessage ? 'Pesan Tersalin!' : 'Salin Teks Pesan'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors mt-2 cursor-pointer"
            >
              Tutup Jendela Ini
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
