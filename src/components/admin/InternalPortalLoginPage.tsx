import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Shield, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { UserProfile } from '../../types';

interface InternalPortalLoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onBackToHome: () => void;
}

export const InternalPortalLoginPage: React.FC<InternalPortalLoginPageProps> = ({
  onLoginSuccess,
  onBackToHome
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Brute-force protection state
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) return;

    setErrorMessage('');

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Username atau Email dan Password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(usernameOrEmail.trim(), password.trim());
      setAttemptCount(0);
      onLoginSuccess(res.user);
    } catch (err: any) {
      const newAttempts = attemptCount + 1;
      setAttemptCount(newAttempts);

      if (newAttempts >= 5) {
        setLockoutTime(30);
        const timer = setInterval(() => {
          setLockoutTime((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      setErrorMessage(err.message || 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="internal-portal-login" className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-950/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar with Discrete Back Link */}
      <header className="p-6 relative z-10 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer py-2 px-3 rounded-lg hover:bg-slate-900/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Reservasi</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Internal Access Only</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-[#0e1420] border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl">
          
          {/* Brand & Badge */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/5 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 font-serif font-black text-2xl shadow-xl shadow-amber-500/10">
              中
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold tracking-wide uppercase mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Epic Mahjong Internal</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-100 tracking-tight">
              Portal Super Admin & Owner
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Masukkan kredensial resmi untuk mengakses sistem manajemen
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Lockout Warning */}
          {lockoutTime > 0 && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                Terlalu banyak percobaan gagal. Silakan tunggu <span className="font-bold font-mono">{lockoutTime}</span> detik sebelum mencoba kembali.
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Masukkan username atau email"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  disabled={loading || lockoutTime > 0}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#151c2a] border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || lockoutTime > 0}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#151c2a] border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || lockoutTime > 0}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || lockoutTime > 0 || !usernameOrEmail || !password}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Masuk ke Portal Internal</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Sistem ini dilindungi enkripsi JWT dan Bcrypt. Setiap aktivitas login diverifikasi dan dicatat untuk keamanan data operasional.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 relative z-10 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} EPIC MAHJONG &bull; All Rights Reserved
      </footer>

    </div>
  );
};
