import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  XCircle, 
  Sparkles,
  ArrowRight,
  Eye,
  Check
} from 'lucide-react';
import { api } from '../../lib/api';
import { Reservation, UserProfile } from '../../types';

interface AdminDashboardProps {
  user: UserProfile;
  onViewReservations: (statusFilter?: string) => void;
  onOpenDetail: (reservation: Reservation) => void;
  onConfirmBooking: (reservation: Reservation) => void;
  onErrorToast: (message: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onViewReservations,
  onOpenDetail,
  onConfirmBooking,
  onErrorToast
}) => {
  const [stats, setStats] = useState<{
    today_bookings_count: number;
    pending_count: number;
    confirmed_count: number;
    completed_count: number;
    cancelled_count: number;
    today_reservations: Reservation[];
  }>({
    today_bookings_count: 0,
    pending_count: 0,
    confirmed_count: 0,
    completed_count: 0,
    cancelled_count: 0,
    today_reservations: []
  });

  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memuat statistik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#141d2e] via-[#101726] to-[#0c121e] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
            Selamat Datang, {user.full_name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pantau status reservasi 5 meja Epic Mahjong Alam Sutera hari ini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 5 Statistics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Today's Bookings */}
        <div 
          onClick={() => onViewReservations()}
          className="bg-[#111724] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Booking Hari Ini</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-slate-100">
            {stats.today_bookings_count}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total sesi terjadwal hari ini</div>
        </div>

        {/* Pending */}
        <div 
          onClick={() => onViewReservations('PENDING')}
          className="bg-[#111724] border border-amber-500/30 hover:border-amber-400 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold mb-2">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-amber-400">
            {stats.pending_count}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">Menunggu bayar & konfirmasi</div>
        </div>

        {/* Confirmed */}
        <div 
          onClick={() => onViewReservations('CONFIRMED')}
          className="bg-[#111724] border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-2">
            <span>Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-emerald-400">
            {stats.confirmed_count}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Meja BOOKED resmi</div>
        </div>

        {/* Completed */}
        <div 
          onClick={() => onViewReservations('COMPLETED')}
          className="bg-[#111724] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Completed</span>
            <Check className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-slate-200">
            {stats.completed_count}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Selesai bermain</div>
        </div>

        {/* Cancelled */}
        <div 
          onClick={() => onViewReservations('CANCELLED')}
          className="bg-[#111724] border border-slate-800 hover:border-rose-500/30 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:scale-[1.02] col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-rose-400 text-xs font-semibold mb-2">
            <span>Cancelled</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-rose-400">
            {stats.cancelled_count}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dibatalkan / Meja Available</div>
        </div>

      </div>

      {/* TODAY'S RESERVATIONS SECTION */}
      <div className="bg-[#111724] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-100">
              Today's Reservations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar seluruh reservasi meja untuk hari ini
            </p>
          </div>

          <button
            onClick={() => onViewReservations()}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            <span>Semua Reservasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.today_reservations.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium">Belum ada reservasi untuk hari ini.</p>
            <p className="text-xs text-slate-500 mt-1">Reservasi baru dari customer akan muncul di sini secara otomatis.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80 bg-[#161f30]/40">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Jam</th>
                  <th className="py-3 px-4">Meja</th>
                  <th className="py-3 px-4">Orang</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.today_reservations.map(res => {
                  let badge = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                  if (res.status === 'CONFIRMED') badge = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                  if (res.status === 'COMPLETED') badge = 'bg-slate-700 text-slate-300 border-slate-600';
                  if (res.status === 'CANCELLED') badge = 'bg-rose-500/20 text-rose-400 border-rose-500/40';

                  return (
                    <tr key={res.id} className="hover:bg-[#151d2c] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 text-xs">
                        {res.booking_code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{res.customer_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{res.customer_phone}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {res.reservation_time} WIB
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {res.table_name || 'TABLE'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {res.guest_count} Pax
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${badge}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {res.status === 'PENDING' && (
                            <button
                              onClick={() => onConfirmBooking(res)}
                              className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow"
                              title="Konfirmasi Booking"
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => onOpenDetail(res)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
