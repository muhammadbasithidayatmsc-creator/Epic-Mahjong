import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Clock, Info } from 'lucide-react';
import { api } from '../../lib/api';
import { ScheduleSlot } from '../../types';

interface AdminScheduleProps {
  onErrorToast: (message: string) => void;
}

export const AdminSchedule: React.FC<AdminScheduleProps> = ({ onErrorToast }) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const data = await api.getSchedule(date);
      setSchedule(data);
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memuat jadwal meja.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [date]);

  const tableNames = schedule.length > 0 
    ? schedule[0].tables.map(t => t.table_name)
    : ['TABLE 01', 'TABLE 02', 'TABLE 03', 'TABLE 04', 'TABLE 05'];

  return (
    <div className="space-y-6">
      
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100">
            Jadwal Meja Staff
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Matriks ketersediaan 5 meja Epic Mahjong untuk tanggal {date}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111724] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-100 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={loadSchedule}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300"
            title="Refresh Jadwal"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold p-3.5 rounded-xl bg-[#111724] border border-slate-800 flex-wrap">
        <span className="text-slate-400">Keterangan:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-slate-200">AVAILABLE (Tersedia)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-slate-200">PENDING (Menunggu Konfirmasi)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="text-slate-200">BOOKED (Terkonfirmasi)</span>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-[#111724] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#172030] text-xs uppercase tracking-wider text-slate-300 border-b border-slate-800">
              <tr>
                <th className="py-4 px-5 font-semibold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Jam Sesi</span>
                </th>
                {tableNames.map(name => (
                  <th key={name} className="py-4 px-4 font-bold text-center">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
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
                          <td key={tbl.table_id} className="py-3.5 px-3 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${badgeBg}`}>
                                {label}
                              </span>
                              {tbl.booking_code && (
                                <span className="text-[10px] text-slate-400 font-mono mt-1">
                                  {tbl.booking_code}
                                </span>
                              )}
                            </div>
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

    </div>
  );
};
