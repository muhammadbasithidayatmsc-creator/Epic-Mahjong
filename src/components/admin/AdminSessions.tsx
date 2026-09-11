import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  X, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../lib/api';
import { PlaySession, SessionStatus, UserProfile } from '../../types';

interface AdminSessionsProps {
  user: UserProfile;
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
}

function calculateDuration(start: string, end: string): string {
  if (!start || !end) return '-';
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return '-';
  
  let sTotal = sH * 60 + sM;
  let eTotal = eH * 60 + eM;
  if (eTotal <= sTotal) {
    eTotal += 24 * 60; // passes midnight
  }
  const diffMinutes = eTotal - sTotal;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  if (mins === 0) return `${hours} Jam`;
  return `${hours} Jam ${mins} Mnt`;
}

export const AdminSessions: React.FC<AdminSessionsProps> = ({
  user,
  onSuccessToast,
  onErrorToast
}) => {
  const [sessions, setSessions] = useState<PlaySession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingSession, setEditingSession] = useState<PlaySession | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formStart, setFormStart] = useState<string>('10:00');
  const [formEnd, setFormEnd] = useState<string>('12:00');
  const [formStatus, setFormStatus] = useState<SessionStatus>('ACTIVE');
  const [saving, setSaving] = useState<boolean>(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<PlaySession | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const isSuperAdminOrOwner = user.role === 'SUPER_ADMIN' || user.role === 'OWNER';

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getSessions(false);
      // Sort sessions by start_time
      const sorted = [...data].sort((a, b) => a.start_time.localeCompare(b.start_time));
      setSessions(sorted);
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memuat daftar sesi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const openCreateModal = () => {
    setEditingSession(null);
    setFormName(`Sesi ${sessions.length + 1}`);
    setFormStart('10:00');
    setFormEnd('12:00');
    setFormStatus('ACTIVE');
    setModalOpen(true);
  };

  const openEditModal = (session: PlaySession) => {
    setEditingSession(session);
    setFormName(session.session_name);
    setFormStart(session.start_time);
    setFormEnd(session.end_time);
    setFormStatus(session.status);
    setModalOpen(true);
  };

  const handleToggleStatus = async (session: PlaySession) => {
    const newStatus: SessionStatus = session.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.toggleSessionStatus(session.session_id, newStatus);
      onSuccessToast(`Status ${session.session_name} diubah menjadi ${newStatus}.`);
      loadSessions();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal mengubah status sesi.');
    }
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onErrorToast('Nama sesi wajib diisi.');
      return;
    }
    if (!formStart || !formEnd) {
      onErrorToast('Jam mulai dan jam selesai wajib diisi.');
      return;
    }
    if (formStart === formEnd) {
      onErrorToast('Jam mulai dan jam selesai tidak boleh sama.');
      return;
    }

    setSaving(true);
    try {
      if (editingSession) {
        await api.updateSession(editingSession.session_id, {
          session_name: formName.trim(),
          start_time: formStart,
          end_time: formEnd,
          status: formStatus
        });
        onSuccessToast('Sesi jam bermain berhasil diperbarui.');
      } else {
        await api.createSession({
          session_name: formName.trim(),
          start_time: formStart,
          end_time: formEnd,
          status: formStatus
        });
        onSuccessToast('Sesi jam bermain baru berhasil ditambahkan.');
      }
      setModalOpen(false);
      loadSessions();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal menyimpan sesi.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.deleteSession(deleteTarget.session_id);
      if (res.deactivated) {
        onSuccessToast(res.message || 'Sesi dinonaktifkan karena terdapat riwayat reservasi.');
      } else {
        onSuccessToast(res.message || 'Sesi berhasil dihapus.');
      }
      setDeleteTarget(null);
      loadSessions();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal menghapus sesi.');
    } finally {
      setDeleting(false);
    }
  };

  // Check for time overlap in modal form preview
  const overlapWarning = useMemo(() => {
    if (!formStart || !formEnd) return null;
    const [sH, sM] = formStart.split(':').map(Number);
    const [eH, eM] = formEnd.split(':').map(Number);
    if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return null;

    let s1 = sH * 60 + sM;
    let e1 = eH * 60 + eM;
    if (e1 <= s1) e1 += 24 * 60;

    for (const s of sessions) {
      if (editingSession && s.session_id === editingSession.session_id) continue;
      if (s.status !== 'ACTIVE') continue;
      const [oSH, oSM] = s.start_time.split(':').map(Number);
      const [oEH, oEM] = s.end_time.split(':').map(Number);
      if (isNaN(oSH) || isNaN(oSM) || isNaN(oEH) || isNaN(oEM)) continue;
      let s2 = oSH * 60 + oSM;
      let e2 = oEH * 60 + oEM;
      if (e2 <= s2) e2 += 24 * 60;

      // Check overlap
      const overlap = Math.max(s1, s2) < Math.min(e1, e2);
      if (overlap) {
        return `Perhatian: Jam sesi ini beririsan dengan sesi aktif "${s.session_name}" (${s.start_time}–${s.end_time}). Pastikan jadwal tidak saling tumpang tindih.`;
      }
    }
    return null;
  }, [formStart, formEnd, sessions, editingSession]);

  const activeCount = sessions.filter(s => s.status === 'ACTIVE').length;
  const inactiveCount = sessions.filter(s => s.status === 'INACTIVE').length;

  return (
    <div id="admin-sessions-section" className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-slate-100">
              Kelola Sesi Jam Bermain
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Dinamis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Atur slot jam bermain yang berlaku di venue Epic Mahjong. Sesi berstatus <strong className="text-emerald-400">ACTIVE</strong> akan otomatis muncul pada tabel jadwal ketersediaan dan form booking customer (tanpa menampilkan harga).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSessions}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Segarkan daftar sesi"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isSuperAdminOrOwner && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Sesi Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Badges */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#111724] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Sesi</div>
          <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">{sessions.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111724] border border-emerald-500/20">
          <div className="text-[11px] text-emerald-400 font-semibold uppercase">Sesi Aktif</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">{activeCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111724] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Sesi Nonaktif</div>
          <div className="text-2xl font-extrabold font-mono text-slate-400 mt-1">{inactiveCount}</div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-[#111724] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#172030] text-xs uppercase tracking-wider text-slate-300 border-b border-slate-800">
              <tr>
                <th className="py-4 px-5 font-bold text-center w-14">#</th>
                <th className="py-4 px-5 font-bold">Nama Sesi</th>
                <th className="py-4 px-5 font-bold">Jam Mulai – Selesai</th>
                <th className="py-4 px-5 font-bold">Durasi</th>
                <th className="py-4 px-5 font-bold text-center">Status</th>
                <th className="py-4 px-5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-amber-400 mb-2" />
                    Memuat daftar sesi...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Belum ada sesi bermain. Klik <strong>Tambah Sesi Baru</strong> untuk membuat sesi.
                  </td>
                </tr>
              ) : (
                sessions.map((ses, idx) => {
                  const isActive = ses.status === 'ACTIVE';
                  const duration = calculateDuration(ses.start_time, ses.end_time);

                  return (
                    <tr 
                      key={ses.session_id} 
                      className={`hover:bg-[#141b2b] transition-colors ${!isActive ? 'opacity-65' : ''}`}
                    >
                      <td className="py-3.5 px-5 text-center font-mono text-xs text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{ses.session_name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          ID: {ses.session_id}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-mono font-bold text-amber-400">
                        {ses.start_time} – {ses.end_time} WIB
                      </td>

                      <td className="py-3.5 px-5 text-xs text-slate-300">
                        {duration}
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            INACTIVE
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(ses)}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
                            }`}
                            title={isActive ? 'Nonaktifkan sesi ini' : 'Aktifkan sesi ini'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(ses)}
                            className="p-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                            title="Edit sesi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(ses)}
                            className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                            title="Hapus sesi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-[#0e131d] border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <span>
            * Sesi jam bermain secara otomatis digunakan pada Tabel Matriks ketersediaan dan proses reservasi.
          </span>
          <span className="text-amber-400 font-medium">
            Tidak ada harga yang ditampilkan kepada customer publik.
          </span>
        </div>
      </div>

      {/* Modal Tambah / Edit Sesi */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111724] border border-amber-500/40 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100">
            
            <div className="px-6 py-4 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-100">
                  {editingSession ? 'Edit Sesi Jam Bermain' : 'Tambah Sesi Baru'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tentukan nama sesi, jam mulai, jam selesai, dan status aktif.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="p-6 space-y-4">
              
              {/* Nama Sesi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Nama Sesi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sesi 1 (Pagi) / Sesi Malam Utama"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Jam Mulai & Jam Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Jam Mulai <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Jam Selesai <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Durasi Calculated */}
              <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Durasi Sesi Permainan:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {calculateDuration(formStart, formEnd)}
                </span>
              </div>

              {/* Overlap Warning if applicable */}
              {overlapWarning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>{overlapWarning}</span>
                </div>
              )}

              {/* Status Sesi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Status Sesi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormStatus('ACTIVE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      formStatus === 'ACTIVE'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-[#161f30] border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ✓ ACTIVE (Aktif)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('INACTIVE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      formStatus === 'INACTIVE'
                        ? 'bg-slate-800 border-slate-600 text-slate-200 ring-1 ring-slate-500'
                        : 'bg-[#161f30] border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ✕ INACTIVE (Nonaktif)
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingSession ? 'Simpan Perubahan' : 'Tambah Sesi'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111724] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Hapus Sesi Bermain?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Konfirmasi penghapusan sesi jam bermain.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0b0f17] border border-slate-800 text-xs space-y-1">
              <div>Nama: <strong className="text-slate-100">{deleteTarget.session_name}</strong></div>
              <div>Jam: <strong className="text-amber-400">{deleteTarget.start_time} – {deleteTarget.end_time} WIB</strong></div>
              <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
                Catatan: Jika sesi ini pernah memiliki riwayat reservasi pada database, sistem secara otomatis akan menonaktifkannya (<strong className="text-amber-300">INACTIVE</strong>) untuk menjaga integritas laporan historis.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 cursor-pointer disabled:opacity-50"
              >
                {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus Sesi</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
