import React, { useState } from 'react';
import { ShieldCheck, Lock, User, X, KeyRound, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { UserProfile } from '../../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onErrorToast: (message: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onErrorToast
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('superadmin');
  const [password, setPassword] = useState('epicadmin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const performLogin = async (userValue: string, passValue: string) => {
    if (!userValue.trim() || !passValue) {
      onErrorToast('Username/Email dan Password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(userValue.trim(), passValue);
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      onErrorToast(err.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(usernameOrEmail, password);
  };

  // Instant 1-Click login helper
  const handleQuickLogin = async (role: 'admin' | 'owner') => {
    if (role === 'admin') {
      setUsernameOrEmail('superadmin');
      setPassword('epicadmin2026');
      await performLogin('superadmin', 'epicadmin2026');
    } else {
      setUsernameOrEmail('owner');
      setPassword('epicowner2026');
      await performLogin('owner', 'epicowner2026');
    }
  };

  return (
    <div id="admin-login-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111724] border border-amber-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Tutup login"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 text-center border-b border-slate-800 bg-gradient-to-b from-amber-500/10 to-transparent">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-100">
            Portal Staff Epic Mahjong
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Khusus Super Admin & Owner untuk mengelola reservasi dan meja
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Username atau Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                required
                placeholder="superadmin / owner"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full bg-[#161f30] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="epicadmin2026"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#161f30] border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Testing credentials helper with instant 1-click login */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
              <span className="flex items-center gap-1.5 text-amber-400">
                <KeyRound className="w-3.5 h-3.5" />
                Akses Langsung 1-Klik:
              </span>
              <span className="text-[10px] text-slate-500">Pilih untuk login</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-amber-300 font-bold text-xs">Super Admin</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  User: <span className="text-slate-200 font-semibold">superadmin</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Pass: <span className="text-slate-300">epicadmin2026</span>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('owner')}
                className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-left transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold text-xs">Owner Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  User: <span className="text-slate-200 font-semibold">owner</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Pass: <span className="text-slate-300">epicowner2026</span>
                </div>
              </button>
            </div>
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition-all mt-2"
          >
            {loading ? 'Memverifikasi...' : 'Masuk Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
};
