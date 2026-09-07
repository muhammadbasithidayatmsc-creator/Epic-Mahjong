import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User, RefreshCw, KeyRound, AlertCircle, X } from 'lucide-react';
import { api } from '../../lib/api';
import { UserProfile } from '../../types';

interface AdminUsersProps {
  currentUser: UserProfile;
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  currentUser,
  onSuccessToast,
  onErrorToast
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // New user modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete target
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  const loadUsers = async () => {
    if (currentUser.role !== 'SUPER_ADMIN') return;
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memuat daftar user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newPassword) {
      onErrorToast('Harap lengkapi semua field wajib.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createOwnerUser({
        username: newUsername.trim().toLowerCase(),
        email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@epicmahjong.com`,
        full_name: newFullName.trim(),
        password: newPassword
      });

      onSuccessToast(`Akun Owner baru (${newUsername}) berhasil dibuat!`);
      setShowAddModal(false);
      setNewUsername('');
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      loadUsers();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal membuat akun owner.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteUser(deleteTarget.id);
      onSuccessToast(`Akun ${deleteTarget.username} berhasil dihapus.`);
      setDeleteTarget(null);
      loadUsers();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal menghapus user.');
    }
  };

  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center text-slate-400 bg-[#111724] border border-slate-800 rounded-2xl">
        <Shield className="w-10 h-10 mx-auto text-amber-500 mb-2 opacity-60" />
        <h3 className="text-base font-bold text-slate-200">Akses Terbatas</h3>
        <p className="text-xs text-slate-400 mt-1">Hanya Super Admin yang memiliki hak mengelola akun pengguna.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100">
            Kelola Akun Owner & Staff
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Super Admin dapat menambahkan akun Owner baru atau menghapus akses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Owner</span>
          </button>

          <button
            onClick={loadUsers}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111724] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#172030] text-[11px] uppercase tracking-wider text-slate-300 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Nama Lengkap</th>
                <th className="py-3.5 px-5 font-semibold">Username</th>
                <th className="py-3.5 px-5 font-semibold">Role</th>
                <th className="py-3.5 px-5 font-semibold">Dibuat Pada</th>
                <th className="py-3.5 px-5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-amber-400 mb-2" />
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Belum ada akun terdaftar.
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const isCurrentAccount = u.id === currentUser.id;
                  const isSuperAdminRole = u.role === 'SUPER_ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-[#151d2c] transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-100">
                        {u.full_name}
                        {isCurrentAccount && (
                          <span className="ml-2 text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                            (Anda)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-amber-300">
                        @{u.username}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border ${
                          isSuperAdminRole 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        }`}>
                          <Shield className="w-3 h-3" />
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-400">
                        {new Date(u.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {isSuperAdminRole || isCurrentAccount ? (
                          <span className="text-[11px] text-slate-500 italic">Protected</span>
                        ) : (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Hapus Akun Owner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE OWNER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-amber-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100">
            <div className="p-5 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">SUPER ADMIN EXCLUSIVE</span>
                <h3 className="text-lg font-bold text-slate-100">Tambah Akun Owner Baru</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOwner} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso (Owner)"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Username Login *</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: owner_budi"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="owner@epicmahjong.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                Akun ini akan mendapatkan role <strong className="text-indigo-400">OWNER</strong> dengan akses dashboard, statistik, dan pengelolaan reservasi, namun tidak dapat mengelola akun staff lain.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {submitting ? 'Menyimpan...' : 'Buat Akun Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-rose-500/40 rounded-2xl max-w-sm w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="text-rose-400 font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Hapus Akun Owner?</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <strong className="text-amber-400 font-mono">@{deleteTarget.username}</strong> ({deleteTarget.full_name})? Akun ini tidak akan bisa login lagi.
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

    </div>
  );
};
