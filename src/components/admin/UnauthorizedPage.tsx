import React from 'react';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';

interface UnauthorizedPageProps {
  onGoToLogin: () => void;
  onGoToHome: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  onGoToLogin,
  onGoToHome
}) => {
  return (
    <div id="unauthorized-page" className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0e1420] border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-wider uppercase inline-block mb-3">
          403 Access Denied
        </span>

        <h1 className="font-serif text-2xl font-bold text-slate-100 tracking-tight">
          Akses Internal Ditolak
        </h1>

        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
          Halaman ini dilindungi dan khusus untuk Super Admin dan Owner resmi Epic Mahjong. Sesi login tidak ditemukan atau telah berakhir.
        </p>

        <div className="mt-8 space-y-3">
          <button
            onClick={onGoToLogin}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Masuk ke Portal Login</span>
          </button>

          <button
            onClick={onGoToHome}
            className="w-full py-3 px-4 rounded-xl border border-slate-800 hover:bg-slate-800/60 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Website Reservasi</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-600">
          ID Keamanan: SEC-AUTH-{Date.now().toString().slice(-6)}
        </div>
      </div>
    </div>
  );
};
