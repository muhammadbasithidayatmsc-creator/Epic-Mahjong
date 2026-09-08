import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Shield, 
  RefreshCw, 
  KeyRound, 
  Edit3, 
  Power, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  Lock,
  UserCheck,
  UserX
} from 'lucide-react';
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

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [resetPassTarget, setResetPassTarget] = useState<UserProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [statusTarget, setStatusTarget] = useState<UserProfile | null>(null);

  // Add form
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Edit form
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFullName, setEditFullName] = useState('');

  // Reset password form
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    if (currentUser.role !== 'SUPER_ADMIN') return;
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 1. Create Owner
  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newPassword) {
      onErrorToast('Harap lengkapi semua field wajib.');
      return;
    }
    if (newPassword.length < 8) {
      onErrorToast('Password baru minimal 8 karakter.');
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

  // 2. Edit Owner Profile
  const openEditModal = (user: UserProfile) => {
    setEditTarget(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditFullName(user.full_name);
  };

  const handleUpdateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    if (!editUsername.trim() || !editFullName.trim()) {
      onErrorToast('Username dan Nama Lengkap wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      await api.updateOwnerUser(editTarget.id, {
        username: editUsername.trim().toLowerCase(),
        email: editEmail.trim() || `${editUsername.trim().toLowerCase()}@epicmahjong.com`,
        full_name: editFullName.trim()
      });

      onSuccessToast(`Data akun ${editUsername} berhasil diperbarui.`);
      setEditTarget(null);
      loadUsers();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memperbarui data akun.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Reset Owner Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassTarget) return;

    if (resetNewPassword.length < 8) {
      onErrorToast('Password baru minimal 8 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      await api.resetOwnerPassword(resetPassTarget.id, resetNewPassword);
      onSuccessToast(`Password untuk ${resetPassTarget.username} berhasil direset.`);
      setResetPassTarget(null);
      setResetNewPassword('');
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal mereset password.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Toggle Owner Status (Active / Inactive)
  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    const newStatus = !(statusTarget.is_active ?? true);

    setSubmitting(true);
    try {
      await api.toggleOwnerStatus(statusTarget.id, newStatus);
      onSuccessToast(`Akun ${statusTarget.username} berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
      setStatusTarget(null);
      loadUsers();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal mengubah status akun.');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Delete User
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await api.deleteUser(deleteTarget.id);
      onSuccessToast(`Akun ${deleteTarget.username} berhasil dihapus.`);
      setDeleteTarget(null);
      loadUsers();
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal menghapus akun.');
    } finally {
      setSubmitting(false);
    }
  };

  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center text-slate-400 bg-[#111724] border border-slate-800 rounded-2xl">
        <Shield className="w-10 h-10 mx-auto text-amber-500 mb-2 opacity-60" />
        <h3 className="text-base font-bold text-slate-200">Akses Dibatasi</h3>
        <p className="text-xs text-slate-400 mt-1">
          Hanya Super Admin yang memiliki hak akses untuk mengelola akun internal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-slate-100">
              MANAJEMEN USER
            </h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Super Admin dapat melihat, membuat, mengubah username, mereset password, dan menonaktifkan akun Owner.
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
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh Daftar Pengguna"
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
                <th className="py-3.5 px-5 font-semibold">Nama Lengkap & Email</th>
                <th className="py-3.5 px-5 font-semibold">Username</th>
                <th className="py-3.5 px-5 font-semibold">Role</th>
                <th className="py-3.5 px-5 font-semibold">Status</th>
                <th className="py-3.5 px-5 font-semibold text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-amber-400 mb-2" />
                    Memuat data akun pengguna...
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
                  const isActive = u.is_active !== false;

                  return (
                    <tr key={u.id} className="hover:bg-[#151d2c] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          <span>{u.full_name}</span>
                          {isCurrentAccount && (
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                              (Anda)
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">{u.email}</span>
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
                          <span>{u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <AlertCircle className="w-3 h-3" />
                            <span>Nonaktif</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {isSuperAdminRole || isCurrentAccount ? (
                          <span className="text-[11px] text-slate-500 italic">Protected</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Ubah Username & Data */}
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Ubah Username / Profil Owner"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => {
                                setResetPassTarget(u);
                                setResetNewPassword('');
                              }}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                              title="Reset Password Owner"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Nonaktifkan / Aktifkan */}
                            <button
                              onClick={() => setStatusTarget(u)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isActive 
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400' 
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                              }`}
                              title={isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Hapus */}
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Hapus Akun Owner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* 1. MODAL TAMBAH AKUN OWNER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-amber-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100">
            <div className="p-5 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">MANAJEMEN USER</span>
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
                <label className="font-semibold text-slate-300 uppercase">Username *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                  <input
                    type="text"
                    required
                    placeholder="budi_owner"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 pl-8 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
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
                <label className="font-semibold text-slate-300 uppercase">Password Awal * (Min 8 Karakter)</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 pr-10 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword.length > 0 && newPassword.length < 8 && (
                  <p className="text-[11px] text-rose-400 mt-1">Password minimal 8 karakter.</p>
                )}
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || newPassword.length < 8}
                  className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold transition-all"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Akun Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL UBAH USERNAME & PROFIL OWNER */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100">
            <div className="p-5 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">MANAJEMEN USER</span>
                <h3 className="text-lg font-bold text-slate-100">Ubah Data Owner</h3>
              </div>
              <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOwner} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Username *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 pl-8 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold transition-all"
                >
                  {submitting ? 'Menyimpan...' : 'Perbarui Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL RESET PASSWORD OWNER */}
      {resetPassTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-amber-500/40 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100">
            <div className="p-5 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">RESET PASSWORD</span>
                <h3 className="text-lg font-bold text-slate-100">Reset Password @{resetPassTarget.username}</h3>
              </div>
              <button onClick={() => setResetPassTarget(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4 text-xs">
              <p className="text-slate-300">
                Super Admin dapat menyetel ulang password untuk Owner ini. Password baru akan langsung dienkripsi dengan Bcrypt.
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 uppercase">Password Baru * (Min 8 Karakter)</label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password baru"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full bg-[#161f30] border border-slate-700 rounded-lg p-2.5 pr-10 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetNewPassword.length > 0 && resetNewPassword.length < 8 && (
                  <p className="text-[11px] text-rose-400 mt-1">Password baru minimal 8 karakter.</p>
                )}
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setResetPassTarget(null)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || resetNewPassword.length < 8}
                  className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold transition-all"
                >
                  {submitting ? 'Mereset...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL TOGGLE STATUS (NONAKTIFKAN / AKTIFKAN) */}
      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-100 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              statusTarget.is_active !== false ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              <Power className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {statusTarget.is_active !== false ? 'Nonaktifkan Akun Owner?' : 'Aktifkan Akun Owner?'}
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              {statusTarget.is_active !== false
                ? `Akun @${statusTarget.username} tidak akan dapat login ke portal sampai diaktifkan kembali.`
                : `Akun @${statusTarget.username} akan dapat kembali login ke portal.`}
            </p>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setStatusTarget(null)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={submitting}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusTarget.is_active !== false
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {submitting ? 'Memproses...' : statusTarget.is_active !== false ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL HAPUS OWNER */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-rose-500/40 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Hapus Akun Owner?</h3>
            <p className="text-xs text-slate-400 mt-2">
              Apakah Anda yakin ingin menghapus akun <span className="text-amber-400 font-mono">@{deleteTarget.username}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={submitting}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors"
              >
                {submitting ? 'Menghapus...' : 'Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
