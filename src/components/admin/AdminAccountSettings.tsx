import React, { useState } from 'react';
import { KeyRound, Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Lock, UserCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { UserProfile } from '../../types';

interface AdminAccountSettingsProps {
  user: UserProfile;
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
}

export const AdminAccountSettings: React.FC<AdminAccountSettingsProps> = ({
  user,
  onSuccessToast,
  onErrorToast
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isMinLength = newPassword.length >= 8;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!oldPassword.trim()) {
      const msg = 'Password lama wajib diisi.';
      setErrorMessage(msg);
      onErrorToast(msg);
      return;
    }

    if (!isMinLength) {
      const msg = 'Password baru minimal 8 karakter.';
      setErrorMessage(msg);
      onErrorToast(msg);
      return;
    }

    if (!isMatching) {
      const msg = 'Password baru dan konfirmasi password tidak sama.';
      setErrorMessage(msg);
      onErrorToast(msg);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.changePassword(oldPassword, newPassword, confirmPassword);
      const successText = res.message || 'Password berhasil diperbarui.';
      setSuccessMessage(successText);
      onSuccessToast(successText);

      // Clear sensitive form inputs
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorText = err.message || 'Gagal mengganti password. Periksa kembali password lama Anda.';
      setErrorMessage(errorText);
      onErrorToast(errorText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <KeyRound className="w-6 h-6 text-amber-400" />
          <span>Pengaturan Akun</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Kelola profil dan keamanan akun login Anda di sistem internal Epic Mahjong.
        </p>
      </div>

      {/* Account Info Summary Card */}
      <div className="bg-[#111724] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xl shadow-lg shadow-amber-500/10">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-100">{user.full_name}</h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                  user.role === 'SUPER_ADMIN'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                }`}>
                  <Shield className="w-3 h-3" />
                  <span>{user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">@{user.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400">
            <UserCheck className="w-4 h-4" />
            <span>Akun Aktif & Terverifikasi</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="bg-[#151d2c] border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Email Akun</span>
            <span className="text-slate-200 font-medium block mt-1 truncate">{user.email}</span>
          </div>
          <div className="bg-[#151d2c] border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Tingkat Hak Akses</span>
            <span className="text-amber-300 font-semibold block mt-1">
              {user.role === 'SUPER_ADMIN' ? 'Akses Penuh (Full Control)' : 'Pemilik Bisnis (Owner Access)'}
            </span>
          </div>
          <div className="bg-[#151d2c] border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Metode Enkripsi</span>
            <span className="text-slate-200 font-medium block mt-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bcrypt Salt 10-Rounds</span>
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Form Card */}
      <div className="bg-[#111724] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Ganti Password Akun</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pastikan Anda menggunakan kombinasi password yang kuat dan aman minimal 8 karakter.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password Lama */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password Lama <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                required
                className="w-full px-4 py-2.5 pr-11 rounded-xl bg-[#172030] border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title={showOldPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Baru */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password Baru <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru (minimal 8 karakter)"
                required
                className="w-full px-4 py-2.5 pr-11 rounded-xl bg-[#172030] border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title={showNewPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Konfirmasi Password Baru <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru"
                required
                className="w-full px-4 py-2.5 pr-11 rounded-xl bg-[#172030] border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title={showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="p-3.5 rounded-xl bg-[#151d2c] border border-slate-800 space-y-2 text-xs">
            <div className={`flex items-center gap-2 ${isMinLength ? 'text-emerald-400' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Password baru minimal 8 karakter</span>
            </div>
            <div className={`flex items-center gap-2 ${isMatching ? 'text-emerald-400' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Password baru dan konfirmasi harus sama persis</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !isMinLength || !isMatching || !oldPassword}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Simpan Perubahan Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
