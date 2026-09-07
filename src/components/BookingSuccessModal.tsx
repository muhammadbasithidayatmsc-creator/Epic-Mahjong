import React from 'react';
import { CheckCircle2, MessageCircle, ArrowUpRight, Copy, X } from 'lucide-react';
import { Reservation } from '../types';

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
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(reservation.booking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="booking-success-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#111724] border border-emerald-500/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Banner */}
        <div className="p-6 sm:p-8 text-center border-b border-slate-800 bg-gradient-to-b from-emerald-500/10 to-transparent">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-slate-100">
            Booking Berhasil Dibuat!
          </h3>

          <p className="text-emerald-300 text-sm mt-2 font-medium">
            Booking berhasil dibuat. Silakan lanjutkan ke WhatsApp Admin untuk proses berikutnya.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-sm">
          
          {/* Booking Code Card */}
          <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Kode Reservasi Anda</div>
              <div className="font-mono text-lg font-bold text-amber-400 mt-0.5">
                {reservation.booking_code}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>

          {/* Details summary */}
          <div className="bg-[#141c2c]/80 rounded-xl p-4 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Nama:</span>
              <span className="text-slate-200 font-semibold">{reservation.customer_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Jadwal:</span>
              <span className="text-slate-200 font-semibold">{reservation.reservation_date} • {reservation.reservation_time} WIB</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Meja:</span>
              <span className="text-emerald-400 font-semibold">{reservation.table_name || 'TABLE'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Status Saat Ini:</span>
              <span className="text-amber-400 font-bold">PENDING (Menunggu Konfirmasi)</span>
            </div>
          </div>

          {/* Next steps explanation */}
          <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="font-semibold text-amber-300">Langkah Berikutnya:</div>
            <p className="text-slate-400 leading-relaxed">
              Hubungi Super Admin via WhatsApp untuk info harga & pembayaran. Setelah disepakati, 
              Admin akan mengubah status meja menjadi <strong className="text-emerald-400">CONFIRMED</strong>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <a
              id="success-modal-whatsapp-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Buka WhatsApp Super Admin (085181959275)</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Selesai / Tutup Jendela
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
