import React from 'react';
import { Users, Sparkles, Check } from 'lucide-react';
import { MahjongTable } from '../types';

interface TableShowcaseProps {
  tables: MahjongTable[];
  onSelectForBooking: (tableId: string) => void;
}

export const TableShowcase: React.FC<TableShowcaseProps> = ({ tables, onSelectForBooking }) => {
  return (
    <section id="tables-section" className="py-16 md:py-24 bg-[#0b0f17] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Venue Eksklusif Alam Sutera
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
              Pilihan 5 Meja Epic Mahjong
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Setiap meja dilengkapi sistem pengocok otomatis modern elektrik, set ubin mahjong premium, 
              serta pendingin udara dan soundproofing untuk kenyamanan maksimal.
            </p>
          </div>

          <a
            href="#booking-section"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs self-start md:self-auto transition-all shadow-md shadow-amber-500/10"
          >
            <span>Booking Sekarang</span>
          </a>
        </div>

        {/* 5 Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table, idx) => {
            return (
              <div
                key={table.id}
                className="bg-[#111724] border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                      MEJA 0{idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Kapasitas: {table.capacity} Pax</span>
                    </span>
                  </div>

                  {/* Table Title */}
                  <h3 className="font-serif text-2xl font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-2">
                    {table.name}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed mb-5 min-h-[48px]">
                    {table.description || 'Meja Otomatis Elektrik dengan kursi lounge premium.'}
                  </p>

                  {/* Feature list */}
                  <div className="space-y-2 mb-6 pt-2 border-t border-slate-800/80">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fasilitas Meja:</div>
                    {(table.features || ['Automatic Tile Shuffler', 'AC & Air Purifier', 'Comfort Seating']).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Tersedia Untuk Reservasi
                  </span>
                  <a
                    href="#booking-section"
                    onClick={() => onSelectForBooking(table.id)}
                    className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-xs border border-amber-500/30 hover:border-amber-500 transition-all"
                  >
                    Pilih Jadwal
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
