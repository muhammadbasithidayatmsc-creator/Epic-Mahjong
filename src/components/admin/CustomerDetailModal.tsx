import React from 'react';
import { 
  X, 
  Phone, 
  Calendar, 
  Clock, 
  Users, 
  TableProperties, 
  FileText, 
  MessageCircle, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Clock4,
  XCircle,
  CreditCard
} from 'lucide-react';
import { CustomerRecord, formatIndoDate, formatRupiah } from '../../lib/exportUtils';
import { ReservationStatus } from '../../types';

interface CustomerDetailModalProps {
  customer: CustomerRecord | null;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose
}) => {
  if (!customer) return null;

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            CONFIRMED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Award className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock4 className="w-3.5 h-3.5" />
            PENDING
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            CANCELLED
          </span>
        );
      default:
        return null;
    }
  };

  const cleanPhoneForWa = customer.phone.replace(/[^0-9]/g, '');
  const waFormatted = cleanPhoneForWa.startsWith('0') 
    ? `62${cleanPhoneForWa.slice(1)}` 
    : cleanPhoneForWa.startsWith('62') 
      ? cleanPhoneForWa 
      : `62${cleanPhoneForWa}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        id="customer-detail-modal"
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#111c34] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg font-serif">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{customer.name}</span>
                {customer.totalReservations >= 3 && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    VIP Pelanggan
                  </span>
                )}
              </h3>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Phone className="w-3 h-3 text-slate-500" />
                <span className="font-mono text-slate-300">{customer.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${waFormatted}?text=Halo%20Kak%20${encodeURIComponent(customer.name)},%20salam%20dari%20Epic%20Mahjong%20Alam%20Sutera.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              title="Chat WhatsApp Customer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Stats Cards */}
        <div className="p-5 border-b border-slate-800/80 bg-[#0c1324] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Total Reservasi</div>
            <div className="text-xl font-bold text-slate-100">{customer.totalReservations}x</div>
            <div className="text-[10px] text-slate-500">Booking masuk</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Status Deal</div>
            <div className="text-xl font-bold text-emerald-400">
              {customer.confirmedCount + customer.completedCount}x
            </div>
            <div className="text-[10px] text-emerald-500/80">Confirmed / Done</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Terakhir Booking</div>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {formatIndoDate(customer.lastReservationDate)}
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono">
              {customer.lastReservationTime ? `${customer.lastReservationTime} WIB` : '-'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Total Belanja</div>
            <div className="text-sm font-bold text-amber-400 truncate">
              {formatRupiah(customer.totalSpent)}
            </div>
            <div className="text-[10px] text-slate-500">Estimasi transaksi</div>
          </div>
        </div>

        {/* Riwayat Reservasi List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>RIWAYAT RESERVASI CUSTOMER</span>
            </h4>
            <span className="text-xs text-slate-500">
              {customer.reservations.length} Transaksi Tercatat
            </span>
          </div>

          {customer.reservations.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              Belum ada riwayat reservasi untuk customer ini.
            </div>
          ) : (
            <div className="space-y-2.5">
              {customer.reservations.map((res) => {
                const nominal = res.nominal || (res.status === 'CONFIRMED' || res.status === 'COMPLETED' ? (res.table_id === 'tbl-05' ? 250000 : 150000) : 0);
                return (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {res.booking_code}
                        </span>
                        {getStatusBadge(res.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatIndoDate(res.reservation_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {res.reservation_time} WIB
                        </span>
                        <span className="flex items-center gap-1">
                          <TableProperties className="w-3.5 h-3.5 text-amber-400" />
                          {res.table_name || res.table_id}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {res.guest_count} Orang
                        </span>
                      </div>

                      {res.notes && (
                        <div className="text-[11px] text-slate-400 italic bg-slate-950/40 p-1.5 rounded border border-slate-800/60 flex items-start gap-1">
                          <FileText className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
                          <span>{res.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-[10px] text-slate-400">Nominal</div>
                      <div className="text-sm font-bold text-slate-200">
                        {formatRupiah(nominal)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1424] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Data otomatis terakumulasi dari sistem reservasi real-time.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
