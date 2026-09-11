import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, RefreshCw, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { ScheduleSlot } from '../types';

const DEFAULT_INITIAL_SLOTS: ScheduleSlot[] = [
  '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'
].map(time => ({
  time,
  tables: [
    { table_id: 'tbl-01', table_name: 'TABLE 01', status: 'AVAILABLE' },
    { table_id: 'tbl-02', table_name: 'TABLE 02', status: 'AVAILABLE' },
    { table_id: 'tbl-03', table_name: 'TABLE 03', status: 'AVAILABLE' },
    { table_id: 'tbl-04', table_name: 'TABLE 04', status: 'AVAILABLE' },
    { table_id: 'tbl-05', table_name: 'TABLE 05', status: 'AVAILABLE' }
  ]
}));

export const ScheduleView: React.FC = () => {
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [date, setDate] = useState<string>(todayStr);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(DEFAULT_INITIAL_SLOTS);
  const [loading, setLoading] = useState<boolean>(false);

  const loadSchedule = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const data = await api.getSchedule(date);
      if (data && data.length > 0) {
        setSchedule(data);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [date]);

  // Extract unique table names
  const tableNames = useMemo(() => {
    if (schedule.length === 0) return ['TABLE 01', 'TABLE 02', 'TABLE 03', 'TABLE 04', 'TABLE 05'];
    const firstSlot = schedule[0];
    return firstSlot.tables.map(t => t.table_name);
  }, [schedule]);

  return (
    <section id="schedule-section" className="py-16 md:py-24 bg-[#0b0f17] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
              Jadwal Meja Hari Ini & Mendatang
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Pantau jadwal ketersediaan 5 meja Epic Mahjong secara transparan untuk merencanakan sesi permainan Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 bg-[#121824] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200">
              <Calendar className="w-4 h-4 text-amber-400" />
              <input
                type="date"
                value={date}
                min={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-slate-100 text-xs sm:text-sm focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={loadSchedule}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh jadwal"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-xs font-semibold mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] flex items-center justify-center">●</span>
            <span className="text-slate-300">AVAILABLE (Tersedia)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] flex items-center justify-center">●</span>
            <span className="text-slate-300">PENDING (Menunggu Konfirmasi)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] flex items-center justify-center">●</span>
            <span className="text-slate-300">BOOKED (Terkonfirmasi)</span>
          </div>
        </div>

        {/* Schedule Matrix Table */}
        <div className="bg-[#111724] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#172030] text-xs uppercase tracking-wider text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5 font-semibold text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sesi Jam Bermain</span>
                  </th>
                  {tableNames.map(name => (
                    <th key={name} className="py-4 px-5 font-bold text-center">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={tableNames.length + 1} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 mx-auto animate-spin text-amber-400 mb-2" />
                      Memuat jadwal meja...
                    </td>
                  </tr>
                ) : schedule.length === 0 ? (
                  <tr>
                    <td colSpan={tableNames.length + 1} className="py-8 text-center text-slate-500">
                      Tidak ada jadwal sesi pada tanggal ini.
                    </td>
                  </tr>
                ) : (
                  schedule.map(slot => {
                    const timeRange = slot.end_time ? `${slot.start_time || slot.time} – ${slot.end_time}` : `${slot.time}`;
                    return (
                      <tr key={slot.session_id || slot.time} className="hover:bg-[#141b2b] transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-200 whitespace-nowrap">
                          {slot.session_name && <div className="text-xs text-amber-300 font-semibold">{slot.session_name}</div>}
                          <div className="font-mono text-xs text-slate-300">{timeRange} WIB</div>
                        </td>

                        {slot.tables.map(tbl => {
                          let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                          let label = 'AVAILABLE';

                          if (tbl.status === 'PENDING') {
                            badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                            label = 'PENDING';
                          } else if (tbl.status === 'BOOKED') {
                            badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                            label = 'BOOKED';
                          }

                          return (
                            <td key={tbl.table_id} className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${badgeBg}`}>
                                {label}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick CTA to book */}
        <div className="mt-6 text-center">
          <a
            href="#booking-section"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
          >
            Pilih Meja dan Booking Sesi Sekarang →
          </a>
        </div>

      </div>
    </section>
  );
};
