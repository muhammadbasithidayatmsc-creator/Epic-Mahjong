import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Check, X, Users, AlertCircle, RefreshCw, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../../lib/api';
import { MahjongTable, UserProfile } from '../../types';

interface AdminTablesProps {
  user: UserProfile;
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
  onTablesUpdated?: () => void;
}

export const AdminTables: React.FC<AdminTablesProps> = ({
  user,
  onSuccessToast,
  onErrorToast,
  onTablesUpdated
}) => {
  const [tables, setTables] = useState<MahjongTable[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit table modal state
  const [editingTable, setEditingTable] = useState<MahjongTable | null>(null);
  const [formName, setFormName] = useState('');
  const [formCapacity, setFormCapacity] = useState(4);
  const [formDesc, setFormDesc] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Create new table state
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminTables();
      setTables(data);
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memuat meja.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const openEdit = (table: MahjongTable) => {
    if (!isSuperAdmin) {
      onErrorToast('Hanya Super Admin yang berhak mengedit data meja.');
      return;
    }
    setEditingTable(table);
    setFormName(table.name);
    setFormCapacity(table.capacity);
    setFormDesc(table.description || '');
    setFormActive(table.is_active);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    setSubmitting(true);
    try {
      await api.updateTable(editingTable.id, {
        name: formName.trim(),
        capacity: Number(formCapacity),
        description: formDesc.trim(),
        is_active: formActive
      });
      onSuccessToast(`Data ${formName} berhasil diperbarui!`);
      setEditingTable(null);
      loadTables();
      if (onTablesUpdated) onTablesUpdated();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal mengedit meja.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createTable({
        name: formName.trim(),
        capacity: Number(formCapacity),
        description: formDesc.trim(),
        is_active: formActive
      });
      onSuccessToast(`Meja baru ${formName} berhasil ditambahkan!`);
      setShowCreateModal(false);
      setFormName('');
      setFormDesc('');
      loadTables();
      if (onTablesUpdated) onTablesUpdated();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal menambahkan meja.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (table: MahjongTable) => {
    if (!isSuperAdmin) {
      onErrorToast('Hanya Super Admin yang berhak mengubah status aktif meja.');
      return;
    }
    try {
      await api.updateTable(table.id, { is_active: !table.is_active });
      onSuccessToast(`Status ${table.name} berhasil diubah.`);
      loadTables();
      if (onTablesUpdated) onTablesUpdated();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memperbarui status meja.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100">
            Kelola Meja Mahjong
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Super Admin dapat mengedit nama, kapasitas, fasilitas, dan mengaktifkan/menonaktifkan meja
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => {
                setFormName(`TABLE 0${tables.length + 1}`);
                setFormCapacity(4);
                setFormDesc('Meja Otomatis Elektrik Mahjong');
                setFormActive(true);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Meja Baru</span>
            </button>
          )}

          <button
            onClick={loadTables}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300"
            title="Refresh Meja"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table, idx) => (
          <div
            key={table.id}
            className={`bg-[#111724] border rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between ${
              table.is_active ? 'border-slate-800 hover:border-slate-700' : 'border-rose-900/40 bg-[#12131a] opacity-75'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                  MEJA #{idx + 1}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  table.is_active 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${table.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span>{table.is_active ? 'AKTIF' : 'NONAKTIF'}</span>
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-slate-100 mb-2">
                {table.name}
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Kapasitas: <strong>{table.capacity} Orang</strong></span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed min-h-[40px] mb-4">
                {table.description || 'Tidak ada keterangan tambahan.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              {isSuperAdmin ? (
                <>
                  <button
                    onClick={() => handleToggleActive(table)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    {table.is_active ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                        <span>Nonaktifkan</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-rose-400" />
                        <span>Aktifkan</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openEdit(table)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-xs border border-amber-500/30 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Meja</span>
                  </button>
                </>
              ) : (
                <span className="text-[11px] text-slate-500">Akses Edit khusus Super Admin</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-amber-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100">
            <div className="p-5 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-100">Edit Data Meja</h3>
              <button onClick={() => setEditingTable(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Nama Meja</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Kapasitas (Orang)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Fasilitas / Deskripsi Meja</label>
                <textarea
                  rows={3}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="edit-is-active" className="text-slate-200 font-semibold cursor-pointer">
                  Meja Aktif (Tersedia untuk dibooking customer)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-amber-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100">
            <div className="p-5 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-100">Tambah Meja Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Nama Meja</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TABLE 06"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Kapasitas (Orang)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Deskripsi & Fasilitas</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Informasi tipe meja, tipe mesin otomatis, dsb."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="create-is-active"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="create-is-active" className="text-slate-200 font-semibold cursor-pointer">
                  Langsung Aktifkan Meja
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {submitting ? 'Menyimpan...' : 'Tambah Meja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
