import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  let borderClass = 'border-amber-500/30 bg-[#121824] text-slate-100';
  let Icon = CheckCircle2;
  let iconColor = 'text-emerald-400';

  if (type === 'error') {
    borderClass = 'border-rose-500/40 bg-[#191014] text-rose-100';
    Icon = AlertCircle;
    iconColor = 'text-rose-400';
  } else if (type === 'info') {
    borderClass = 'border-amber-500/40 bg-[#1a160d] text-amber-100';
    Icon = AlertTriangle;
    iconColor = 'text-amber-400';
  } else {
    borderClass = 'border-emerald-500/40 bg-[#0d1a14] text-emerald-100';
    Icon = CheckCircle2;
    iconColor = 'text-emerald-400';
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-2">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${borderClass}`}>
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {message}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

