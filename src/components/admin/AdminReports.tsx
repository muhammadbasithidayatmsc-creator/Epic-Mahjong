import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  CalendarDays, 
  Clock, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileDown, 
  Search, 
  Filter, 
  RefreshCw, 
  TableProperties, 
  Users, 
  CheckCircle2, 
  Clock4, 
  XCircle, 
  Award, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  Layers,
  Sparkles
} from 'lucide-react';
import { Reservation, UserProfile, MahjongTable, BusinessSettings, ReservationStatus } from '../../types';
import { api } from '../../lib/api';
import { 
  ReportStats, 
  exportReportPDF, 
  exportReportExcel, 
  exportReportCSV,
  formatIndoDate,
  formatRupiah
} from '../../lib/exportUtils';

interface AdminReportsProps {
  user: UserProfile;
  tables: MahjongTable[];
  settings?: BusinessSettings | null;
  onErrorToast: (msg: string) => void;
  onSuccessToast?: (msg: string) => void;
}

type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';

export const AdminReports: React.FC<AdminReportsProps> = ({
  user,
  tables,
  settings,
  onErrorToast,
  onSuccessToast
}) => {
  // Current local date in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [reportType, setReportType] = useState<ReportType>('daily');
  
  // Date states
  const [dailyDate, setDailyDate] = useState<string>(todayStr);
  const [weeklyOffset, setWeeklyOffset] = useState<number>(0); // 0 = this week, -1 = last week, etc.
  const [monthlyMonth, setMonthlyMonth] = useState<number>(new Date().getMonth()); // 0 - 11
  const [monthlyYear, setMonthlyYear] = useState<number>(new Date().getFullYear());
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  // Filters inside Report
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTable, setFilterTable] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Compute Active Date Range for the query
  const activePeriod = useMemo(() => {
    if (reportType === 'daily') {
      return {
        startDate: dailyDate,
        endDate: dailyDate,
        title: `Harian — ${formatIndoDate(dailyDate)}`
      };
    }

    if (reportType === 'weekly') {
      const now = new Date();
      now.setDate(now.getDate() + (weeklyOffset * 7));
      // Calculate Monday of this week
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const sStr = monday.toISOString().split('T')[0];
      const eStr = sunday.toISOString().split('T')[0];

      return {
        startDate: sStr,
        endDate: eStr,
        title: `Mingguan (${formatIndoDate(sStr)} s/d ${formatIndoDate(eStr)})`
      };
    }

    if (reportType === 'monthly') {
      const firstDay = new Date(monthlyYear, monthlyMonth, 1);
      const lastDay = new Date(monthlyYear, monthlyMonth + 1, 0);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const sStr = firstDay.toISOString().split('T')[0];
      const eStr = lastDay.toISOString().split('T')[0];

      return {
        startDate: sStr,
        endDate: eStr,
        title: `Bulanan — ${months[monthlyMonth]} ${monthlyYear}`
      };
    }

    // Custom
    return {
      startDate: customStartDate,
      endDate: customEndDate,
      title: `Periode ${formatIndoDate(customStartDate)} s/d ${formatIndoDate(customEndDate)}`
    };
  }, [reportType, dailyDate, weeklyOffset, monthlyMonth, monthlyYear, customStartDate, customEndDate]);

  // Fetch reservations whenever the active date range changes
  const loadReportData = async () => {
    setLoading(true);
    try {
      const data = await api.getReservations({
        startDate: activePeriod.startDate,
        endDate: activePeriod.endDate
      });
      setReservations(data);
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal mengambil data laporan dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [activePeriod.startDate, activePeriod.endDate]);

  // Filter and Search Reactivity on the fetched period reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      // Status filter
      if (filterStatus !== 'ALL' && r.status !== filterStatus) {
        return false;
      }
      // Table filter
      if (filterTable !== 'ALL' && r.table_id !== filterTable) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.customer_name.toLowerCase().includes(q);
        const matchPhone = r.customer_phone.includes(q);
        const matchCode = r.booking_code.toLowerCase().includes(q);
        const matchTable = (r.table_name || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCode && !matchTable) {
          return false;
        }
      }
      return true;
    });
  }, [reservations, filterStatus, filterTable, searchQuery]);

  // Computed Report Statistics (updates dynamically with filters)
  const stats: ReportStats = useMemo(() => {
    const totalReservations = filteredReservations.length;
    
    // Unique Customers
    const uniquePhones = new Set(
      filteredReservations.map(r => (r.customer_phone || '').trim().replace(/[^0-9]/g, '') || r.customer_name.trim().toLowerCase())
    );
    const totalCustomers = uniquePhones.size;

    let confirmedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;
    let completedCount = 0;
    let totalRevenue = 0;

    // Table usage tracking
    const tableUsageMap: { [key: string]: number } = {};

    filteredReservations.forEach(r => {
      if (r.status === 'CONFIRMED') confirmedCount++;
      else if (r.status === 'PENDING') pendingCount++;
      else if (r.status === 'CANCELLED') cancelledCount++;
      else if (r.status === 'COMPLETED') completedCount++;

      const nominal = r.nominal || (r.status === 'CONFIRMED' || r.status === 'COMPLETED' ? (r.table_id === 'tbl-05' ? 250000 : 150000) : 0);
      if (r.status === 'CONFIRMED' || r.status === 'COMPLETED') {
        totalRevenue += nominal;
      }

      const tName = r.table_name || r.table_id;
      tableUsageMap[tName] = (tableUsageMap[tName] || 0) + 1;
    });

    const tableStats = Object.entries(tableUsageMap).map(([name, count]) => ({
      tableName: name,
      count,
      percentage: totalReservations > 0 ? Math.round((count / totalReservations) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    return {
      totalReservations,
      totalCustomers,
      confirmedCount,
      pendingCount,
      cancelledCount,
      completedCount,
      totalRevenue,
      tableStats
    };
  }, [filteredReservations]);

  // Top Table for Monthly
  const topTable = stats.tableStats.length > 0 ? stats.tableStats[0] : null;

  // Daily Trend breakdown for Monthly or Weekly
  const dailyBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; confirmedOrDone: number; revenue: number }>();
    filteredReservations.forEach(r => {
      const d = r.reservation_date;
      const cur = map.get(d) || { total: 0, confirmedOrDone: 0, revenue: 0 };
      cur.total += 1;
      const nominal = r.nominal || (r.status === 'CONFIRMED' || r.status === 'COMPLETED' ? (r.table_id === 'tbl-05' ? 250000 : 150000) : 0);
      if (r.status === 'CONFIRMED' || r.status === 'COMPLETED') {
        cur.confirmedOrDone += 1;
        cur.revenue += nominal;
      }
      map.set(d, cur);
    });

    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredReservations]);

  // Export handlers
  const handleDownloadPDF = () => {
    exportReportPDF(
      activePeriod.title,
      stats,
      filteredReservations,
      settings?.business_name || 'EPIC MAHJONG',
      settings?.location || 'Alam Sutera'
    );
  };

  const handleExportExcel = () => {
    exportReportExcel(activePeriod.title, stats, filteredReservations);
  };

  const handleExportCSV = () => {
    exportReportCSV(activePeriod.title, filteredReservations);
  };

  return (
    <div id="admin-reports-page" className="space-y-6">
      
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>PORTAL ANALITIK & KEUANGAN</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <span>REPORT RESERVASI</span>
            <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Data Aktual Real-Time
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Laporan akurat performa reservasi, statistik meja, dan estimasi omzet Epic Mahjong.
          </p>
        </div>

        {/* 3 Prominent Download Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadReportData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            title="Unduh laporan dalam format PDF resmi"
          >
            <FileText className="w-4 h-4" />
            <span>DOWNLOAD PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Unduh laporan dalam spreadsheet Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXPORT EXCEL</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Unduh file CSV (.csv)"
          >
            <FileDown className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Mode Selection Tabs (Harian, Mingguan, Bulanan, Custom) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800/80">
            <button
              onClick={() => setReportType('daily')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                reportType === 'daily'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Report Harian</span>
            </button>

            <button
              onClick={() => setReportType('weekly')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                reportType === 'weekly'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Report Mingguan</span>
            </button>

            <button
              onClick={() => setReportType('monthly')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                reportType === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Report Bulanan</span>
            </button>

            <button
              onClick={() => setReportType('custom')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                reportType === 'custom'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Custom Date Range</span>
            </button>
          </div>

          <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            <span>{activePeriod.title}</span>
          </div>
        </div>

        {/* Date Selector Row based on selected Mode */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
          
          {/* DAILY PICKER */}
          {reportType === 'daily' && (
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs text-slate-400 font-semibold">Pilih Tanggal:</label>
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDailyDate(todayStr)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setDailyDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  Kemarin
                </button>
                <button
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setDailyDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  Besok
                </button>
              </div>
            </div>
          )}

          {/* WEEKLY PICKER */}
          {reportType === 'weekly' && (
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs text-slate-400 font-semibold">Pilih Periode Minggu:</label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setWeeklyOffset(0)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    weeklyOffset === 0
                      ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Minggu Ini
                </button>
                <button
                  onClick={() => setWeeklyOffset(-1)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    weeklyOffset === -1
                      ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  1 Minggu Lalu
                </button>
                <button
                  onClick={() => setWeeklyOffset(-2)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    weeklyOffset === -2
                      ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  2 Minggu Lalu
                </button>
              </div>
            </div>
          )}

          {/* MONTHLY PICKER */}
          {reportType === 'monthly' && (
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs text-slate-400 font-semibold">Pilih Bulan & Tahun:</label>
              <select
                value={monthlyMonth}
                onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {[
                  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                ].map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>

              <select
                value={monthlyYear}
                onChange={(e) => setMonthlyYear(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {[2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          )}

          {/* CUSTOM DATE RANGE */}
          {reportType === 'custom' && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Mulai:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Sampai:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Live Result Indicator */}
          <div className="text-xs text-slate-400 font-medium">
            Ditemukan: <span className="text-amber-400 font-bold">{filteredReservations.length} reservasi</span>
          </div>

        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Reservasi */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="text-[11px] text-slate-400 mb-1">Total Reservasi</div>
          <div className="text-2xl font-bold text-slate-100">{stats.totalReservations}</div>
          <div className="text-[10px] text-slate-500">Booking tercatat</div>
        </div>

        {/* Confirmed */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="text-[11px] text-emerald-400 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmed</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.confirmedCount}</div>
          <div className="text-[10px] text-slate-500">Siap bertanding</div>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="text-[11px] text-blue-400 mb-1 flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span>Completed</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.completedCount}</div>
          <div className="text-[10px] text-slate-500">Selesai main</div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="text-[11px] text-amber-400 mb-1 flex items-center gap-1">
            <Clock4 className="w-3 h-3" />
            <span>Pending</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.pendingCount}</div>
          <div className="text-[10px] text-slate-500">Menunggu konfirmasi</div>
        </div>

        {/* Cancelled */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="text-[11px] text-rose-400 mb-1 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </div>
          <div className="text-2xl font-bold text-rose-400">{stats.cancelledCount}</div>
          <div className="text-[10px] text-slate-500">Batal / Expired</div>
        </div>

        {/* Total Omzet */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="text-[11px] text-indigo-400 mb-1 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            <span>Total Pendapatan</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-100 truncate">
            {formatRupiah(stats.totalRevenue)}
          </div>
          <div className="text-[10px] text-slate-500">Confirmed & Completed</div>
        </div>
      </div>

      {/* Additional Analytics: Table Usage & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table Usage Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <TableProperties className="w-4 h-4 text-amber-400" />
              <span>STATISTIK PENGGUNAAN MEJA (DISTRIBUSI)</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {tables.length} Meja Tersedia
            </span>
          </div>

          {stats.tableStats.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Belum ada data penggunaan meja pada filter ini.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.tableStats.map((item, idx) => (
                <div key={item.tableName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{item.tableName}</span>
                    </span>
                    <span className="text-slate-400 font-mono">
                      <strong className="text-slate-100">{item.count}</strong> booking ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highlight Card: Top Table & Unique Customers */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>RINGKASAN PERFORMA</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Meja Paling Sering Digunakan:</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {topTable ? topTable.tableName : '-'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {topTable ? `${topTable.count} reservasi (${topTable.percentage}% dari total)` : 'Belum ada data'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Total Customer Unik:</div>
                <div className="text-base font-bold text-slate-100 mt-0.5">
                  {stats.totalCustomers} Orang
                </div>
                <div className="text-[10px] text-slate-500">
                  Customer berbeda yang memesan di periode ini
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90">
            💡 <strong>Info:</strong> Data laporan terintegrasi otomatis dengan sistem database. Perubahan status di tab Reservasi langsung merefleksikan angka di atas.
          </div>
        </div>
      </div>

      {/* Real-time Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari customer, WhatsApp, atau booking ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Filter by Status & Table */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Status</option>
              <option value="CONFIRMED" className="bg-slate-900">CONFIRMED</option>
              <option value="COMPLETED" className="bg-slate-900">COMPLETED</option>
              <option value="PENDING" className="bg-slate-900">PENDING</option>
              <option value="CANCELLED" className="bg-slate-900">CANCELLED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Meja:</span>
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Meja</option>
              {tables.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Reservation Report Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-[#111c34] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider">
              DAFTAR RESERVASI LAPORAN
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredReservations.length} Transaksi)
            </span>
          </div>

          <div className="text-xs text-slate-400">
            {activePeriod.title}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <div className="text-xs text-slate-400 font-medium">Memuat data laporan aktual...</div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-slate-300 font-bold text-sm">
              Belum ada data untuk periode ini.
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ditemukan reservasi pada rentang tanggal atau filter yang dipilih. Silakan pilih periode tanggal lainnya.
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0d1424] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Booking Code</th>
                    <th className="py-3 px-4">Waktu Reservasi</th>
                    <th className="py-3 px-4">Meja</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">WhatsApp</th>
                    <th className="py-3 px-4 text-center">Pax</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredReservations.map((r, idx) => {
                    const nominal = r.nominal || (r.status === 'CONFIRMED' || r.status === 'COMPLETED' ? (r.table_id === 'tbl-05' ? 250000 : 150000) : 0);
                    return (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          {r.booking_code}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200 font-medium">
                            {formatIndoDate(r.reservation_date)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {r.reservation_time} WIB
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 font-semibold border border-slate-700">
                            {r.table_name || r.table_id}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-100">
                          {r.customer_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {r.customer_phone}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-slate-300 font-medium">{r.guest_count} Orang</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {r.status === 'CONFIRMED' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              CONFIRMED
                            </span>
                          )}
                          {r.status === 'COMPLETED' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              COMPLETED
                            </span>
                          )}
                          {r.status === 'PENDING' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              PENDING
                            </span>
                          )}
                          {r.status === 'CANCELLED' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              CANCELLED
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                          {formatRupiah(nominal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-800">
              {filteredReservations.map((r, idx) => {
                const nominal = r.nominal || (r.status === 'CONFIRMED' || r.status === 'COMPLETED' ? (r.table_id === 'tbl-05' ? 250000 : 150000) : 0);
                return (
                  <div key={r.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {r.booking_code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' :
                        r.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400' :
                        r.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-100">{r.customer_name}</span>
                      <span className="text-slate-300 font-semibold">{r.table_name || r.table_id}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>{r.customer_phone}</span>
                      <span>{formatRupiah(nominal)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>{formatIndoDate(r.reservation_date)} • {r.reservation_time} WIB</span>
                      <span>{r.guest_count} Orang</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
