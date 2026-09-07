import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  Plus, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  MessageCircle, 
  AlertCircle,
  X,
  Check,
  Trash2
} from 'lucide-react';
import { api } from '../../lib/api';
import { Reservation, MahjongTable, UserProfile, ReservationStatus } from '../../types';

interface AdminReservationsProps {
  user: UserProfile;
  initialStatusFilter?: string;
  tables: MahjongTable[];
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
}

export const AdminReservations: React.FC<AdminReservationsProps> = ({
  user,
  initialStatusFilter = 'ALL',
  tables,
  onSuccessToast,
  onErrorToast
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);

  // Detail Modal State
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // Confirmation Modal State (for confirming a PENDING booking)
  const [confirmTarget, setConfirmTarget] = useState<Reservation | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Status Change Modal State (for COMPLETED / CANCELLED)
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ res: Reservation; newStatus: ReservationStatus } | null>(null);

  // Manual Reservation Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('14:00');
  const [manualTableId, setManualTableId] = useState(tables[0]?.id || '');
  const [manualGuestCount, setManualGuestCount] = useState(4);
  const [manualNotes, setManualNotes] = useState('');
  const [manualStatus, setManualStatus] = useState<ReservationStatus>('CONFIRMED');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await api.getReservations({
        search: search || undefined,
        date: dateFilter || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      setReservations(data);
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memuat reservasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [dateFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadReservations();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle Confirm Booking (PENDING -> CONFIRMED)
  const handleExecuteConfirm = async () => {
    if (!confirmTarget) return;
    setConfirming(true);
    try {
      await api.updateReservationStatus(confirmTarget.id, 'CONFIRMED');
      onSuccessToast(`Booking ${confirmTarget.booking_code} berhasil dikonfirmasi! Meja sekarang resmi BOOKED.`);
      setConfirmTarget(null);
      if (selectedRes && selectedRes.id === confirmTarget.id) {
        setSelectedRes({ ...selectedRes, status: 'CONFIRMED' });
      }
      loadReservations();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal mengonfirmasi booking.');
    } finally {
      setConfirming(false);
    }
  };

  // Handle Status Update (COMPLETED / CANCELLED)
  const handleExecuteStatusChange = async () => {
    if (!statusChangeTarget) return;
    try {
      await api.updateReservationStatus(statusChangeTarget.res.id, statusChangeTarget.newStatus);
      onSuccessToast(`Status booking ${statusChangeTarget.res.booking_code} diubah menjadi ${statusChangeTarget.newStatus}.`);
      if (selectedRes && selectedRes.id === statusChangeTarget.res.id) {
        setSelectedRes({ ...selectedRes, status: statusChangeTarget.newStatus });
      }
      setStatusChangeTarget(null);
      loadReservations();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memperbarui status.');
    }
  };

  // Handle Delete (Super Admin only)
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteReservation(deleteTarget.id);
      onSuccessToast(`Reservasi ${deleteTarget.booking_code} berhasil dihapus.`);
      setDeleteTarget(null);
      if (selectedRes && selectedRes.id === deleteTarget.id) {
        setSelectedRes(null);
      }
      loadReservations();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal menghapus reservasi.');
    }
  };

  // Handle Manual Reservation
  const handleCreateManualReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim() || !manualDate || !manualTime || !manualTableId) {
      onErrorToast('Harap lengkapi semua field wajib.');
      return;
    }

    setManualSubmitting(true);
    try {
      const res = await api.createManualReservation({
        customer_name: manualName.trim(),
        customer_phone: manualPhone.trim(),
        reservation_date: manualDate,
        reservation_time: manualTime,
        table_id: manualTableId,
        guest_count: manualGuestCount,
        notes: manualNotes.trim(),
        status: manualStatus
      });

      onSuccessToast(`Reservasi manual ${res.reservation.booking_code} berhasil dibuat!`);
      setShowManualModal(false);
      // Reset form
      setManualName('');
      setManualPhone('');
      setManualNotes('');
      loadReservations();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal membuat reservasi manual.');
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100">
            Daftar Seluruh Reservasi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola status booking, konfirmasi pembayaran, dan buat reservasi manual
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Reservasi Manual</span>
          </button>

          <button
            onClick={loadReservations}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-xl bg-[#111724] border border-slate-800">
        
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari Booking ID, Nama, No. WA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161f30] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Date Filter */}
        <div className="sm:col-span-4 relative">
          <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-[#161f30] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#161f30] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">PENDING (Menunggu)</option>
            <option value="CONFIRMED">CONFIRMED (Terkonfirmasi)</option>
            <option value="COMPLETED">COMPLETED (Selesai)</option>
            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
          </select>
        </div>

      </div>

      {/* Main Reservations Table */}
      <div className="bg-[#111724] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-300 border-b border-slate-800 bg-[#172030]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Booking ID</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">WhatsApp</th>
                <th className="py-3.5 px-4 font-semibold">Tanggal & Jam</th>
                <th className="py-3.5 px-4 font-semibold">Meja</th>
                <th className="py-3.5 px-4 font-semibold">Pax</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-amber-400 mb-2" />
                    Memuat data reservasi...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Tidak ada data reservasi yang cocok dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                reservations.map(res => {
                  let badge = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                  if (res.status === 'CONFIRMED') badge = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                  if (res.status === 'COMPLETED') badge = 'bg-slate-700 text-slate-300 border-slate-600';
                  if (res.status === 'CANCELLED') badge = 'bg-rose-500/20 text-rose-400 border-rose-500/40';

                  const cleanPhone = String(res.customer_phone || '').replace(/[^0-9]/g, '');
                  const waChatUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Halo Kak ${res.customer_name}, kami dari Admin EPIC MAHJONG terkait Booking ID ${res.booking_code}...`)}`;

                  return (
                    <tr key={res.id} className="hover:bg-[#151d2c] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 text-xs">
                        {res.booking_code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{res.customer_name}</div>
                        {res.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            Catatan: {res.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={waChatUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono"
                          title="Chat Customer di WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{res.customer_phone}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-200 font-medium">{res.reservation_date}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{res.reservation_time} WIB</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400 text-xs">
                        {res.table_name || 'TABLE'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">
                        {res.guest_count} Orang
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${badge}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Confirm button if PENDING */}
                          {res.status === 'PENDING' && (
                            <button
                              onClick={() => setConfirmTarget(res)}
                              className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                              title="Konfirmasi Booking"
                            >
                              Confirm
                            </button>
                          )}

                          {/* View detail button */}
                          <button
                            onClick={() => setSelectedRes(res)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete for Super Admin */}
                          {user.role === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => setDeleteTarget(res)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Hapus Reservasi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM BOOKING CONFIRMATION MODAL */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl font-bold text-slate-100">
                Konfirmasi booking ini?
              </h3>
              <p className="text-xs text-slate-400">
                Booking ID: <strong className="text-amber-400 font-mono">{confirmTarget.booking_code}</strong>
                <br />
                Customer: <strong>{confirmTarget.customer_name}</strong> ({confirmTarget.table_name || 'TABLE'} • {confirmTarget.reservation_date} {confirmTarget.reservation_time} WIB)
              </p>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
              Setelah dikonfirmasi, status booking berubah menjadi <strong className="text-emerald-400 font-bold">CONFIRMED</strong>. Meja ini akan berstatus <strong className="text-rose-400 font-bold">BOOKED</strong> pada jam tersebut dan terkunci secara otomatis dari booking customer lain.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={confirming}
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirming}
                onClick={handleExecuteConfirm}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {confirming ? 'Memproses...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL BOOKING MODAL */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100">
            
            <div className="p-5 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">DETAIL RESERVASI</span>
                <h3 className="text-lg font-bold text-slate-100 font-mono">{selectedRes.booking_code}</h3>
              </div>
              <button
                onClick={() => setSelectedRes(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#0b0f17] border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-400 uppercase font-semibold">Nama Customer</div>
                  <div className="text-sm font-bold text-slate-100 mt-0.5">{selectedRes.customer_name}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase font-semibold">WhatsApp</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{selectedRes.customer_phone}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase font-semibold">Tanggal & Jam</div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">{selectedRes.reservation_date} • {selectedRes.reservation_time} WIB</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase font-semibold">Meja & Kapasitas</div>
                  <div className="text-sm font-bold text-amber-300 mt-0.5">{selectedRes.table_name || 'TABLE'} ({selectedRes.guest_count} Orang)</div>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800">
                  <div className="text-slate-400 uppercase font-semibold">Catatan Khusus</div>
                  <div className="text-xs text-slate-200 mt-0.5">{selectedRes.notes || 'Tidak ada catatan tambahan'}</div>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 uppercase font-semibold">Status Saat Ini:</span>
                  <span className="text-amber-400 font-bold text-sm uppercase">{selectedRes.status}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ubah Status Reservasi:</div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedRes.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => setConfirmTarget(selectedRes)}
                      className="col-span-3 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>[CONFIRM BOOKING]</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setStatusChangeTarget({ res: selectedRes, newStatus: 'CONFIRMED' })}
                    className="py-2 px-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold"
                  >
                    Set CONFIRMED
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStatusChangeTarget({ res: selectedRes, newStatus: 'COMPLETED' })}
                    className="py-2 px-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Set COMPLETED
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusChangeTarget({ res: selectedRes, newStatus: 'CANCELLED' })}
                    className="py-2 px-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold"
                  >
                    Set CANCELLED
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#172030] border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRes(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STATUS CHANGE CONFIRMATION MODAL */}
      {statusChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">
              Ubah Status Booking?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anda akan mengubah status <strong className="text-amber-400">{statusChangeTarget.res.booking_code}</strong> menjadi <strong className="text-emerald-400">{statusChangeTarget.newStatus}</strong>.
              {statusChangeTarget.newStatus === 'CANCELLED' && ' Meja akan kembali AVAILABLE untuk jadwal tersebut.'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusChangeTarget(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteStatusChange}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Ubah Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-rose-500/40 rounded-2xl max-w-sm w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="text-rose-400 font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Hapus Reservasi?</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus data booking <strong className="text-amber-400 font-mono">{deleteTarget.booking_code}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL RESERVATION MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-amber-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100">
            
            <div className="p-5 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">STAFF ENTRY</span>
                <h3 className="text-lg font-bold text-slate-100">Tambah Reservasi Manual</h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualReservation} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 uppercase">Nama Customer *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama customer"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 uppercase">WhatsApp Customer *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081298765432"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 uppercase">Tanggal Bermain *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 uppercase">Jam Sesi *</label>
                  <select
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'].map(t => (
                      <option key={t} value={t}>{t} WIB</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 uppercase">Pilih Meja *</label>
                  <select
                    value={manualTableId}
                    onChange={(e) => setManualTableId(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Max {t.capacity} pax)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 uppercase">Jumlah Orang</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={manualGuestCount}
                    onChange={(e) => setManualGuestCount(Number(e.target.value))}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Status Awal</label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as ReservationStatus)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="CONFIRMED">CONFIRMED (Langsung Kunci Meja)</option>
                  <option value="PENDING">PENDING (Menunggu Pembayaran)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Catatan Khusus</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Booking walk-in atau direct WhatsApp..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                Sistem backend akan memeriksa validasi anti-double booking. Jika jadwal meja sudah terisi, penyimpanan akan ditolak.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={manualSubmitting}
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {manualSubmitting ? 'Menyimpan...' : 'Simpan Reservasi'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
