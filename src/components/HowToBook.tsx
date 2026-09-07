import React from 'react';
import { Calendar, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';

export const HowToBook: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Pilih Tanggal & Jam',
      desc: 'Tentukan tanggal dan sesi waktu yang Anda inginkan. Sistem akan langsung menampilkan status 5 meja secara realtime.',
      icon: Calendar
    },
    {
      num: '02',
      title: 'Pilih Meja Tersedia',
      desc: 'Pilih salah satu dari 5 meja yang berstatus AVAILABLE (🟢). Meja yang sedang PENDING atau BOOKED tidak dapat dipilih.',
      icon: CheckCircle2
    },
    {
      num: '03',
      title: 'Lengkapi Data Diri',
      desc: 'Cukup isi Nama lengkap dan Nomor WhatsApp aktif tanpa perlu registrasi atau login akun.',
      icon: ShieldCheck
    },
    {
      num: '04',
      title: 'Konfirmasi via WhatsApp',
      desc: 'Klik tombol booking, dan WhatsApp Admin otomatis terbuka dengan format pesan reservasi rapi. Admin akan memberikan info pembayaran.',
      icon: MessageCircle
    }
  ];

  return (
    <section id="guide-section" className="py-16 md:py-24 bg-[#0d121c] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
            Cara Booking Mudah & Cepat
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            Hanya 4 langkah mudah tanpa instal aplikasi atau buat akun. Langsung terhubung dengan WhatsApp Admin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-[#111724] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-amber-500/80">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
