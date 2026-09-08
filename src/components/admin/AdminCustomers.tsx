import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileDown, 
  ExternalLink, 
  Calendar, 
  Phone, 
  Sparkles, 
  TrendingUp, 
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Award,
  Filter
} from 'lucide-react';
import { Reservation, UserProfile, BusinessSettings } from '../../types';
import { api } from '../../lib/api';
import { 
  CustomerRecord, 
  exportCustomersExcel, 
  exportCustomersCSV, 
  exportCustomersPDF,
  formatIndoDate,
  formatRupiah
} from '../../lib/exportUtils';
import { CustomerDetailModal } from './CustomerDetailModal';

interface AdminCustomersProps {
  user: UserProfile;
  settings?: BusinessSettings | null;
  onErrorToast: (msg: string) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({
  user,
  settings,
  onErrorToast
}) => {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'most_bookings' | 'latest' | 'name_asc' | 'highest_spent'>('most_bookings');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [filterSegment, setFilterSegment] = useState<'ALL' | 'VIP' | 'RECENT'>('ALL');
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await api.getReservations();
      setReservations(data);
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memuat database customer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Aggregation of raw reservations into customer records
  const allCustomers: CustomerRecord[] = useMemo(() => {
    const map = new Map<string, CustomerRecord>();

    reservations.forEach((res) => {
      // Normalize phone as main customer identifier (fallback to name if phone is identical)
      const cleanPhone = (res.customer_phone || '').trim().replace(/[^0-9]/g, '');
      const key = cleanPhone || res.customer_name.trim().toLowerCase();

      const nominal = res.nominal || (res.status === 'CONFIRMED' || res.status === 'COMPLETED' ? (res.table_id === 'tbl-05' ? 250000 : 150000) : 0);

      if (!map.has(key)) {
        map.set(key, {
          id: `cust-${key}`,
          name: res.customer_name.trim(),
          phone: res.customer_phone.trim(),
          totalReservations: 1,
          confirmedCount: res.status === 'CONFIRMED' ? 1 : 0,
          completedCount: res.status === 'COMPLETED' ? 1 : 0,
          cancelledCount: res.status === 'CANCELLED' ? 1 : 0,
          pendingCount: res.status === 'PENDING' ? 1 : 0,
          lastReservationDate: res.reservation_date,
          lastReservationTime: res.reservation_time,
          totalSpent: (res.status === 'CONFIRMED' || res.status === 'COMPLETED') ? nominal : 0,
          reservations: [res]
        });
      } else {
        const existing = map.get(key)!;
        existing.totalReservations += 1;
        if (res.status === 'CONFIRMED') existing.confirmedCount += 1;
        if (res.status === 'COMPLETED') existing.completedCount += 1;
        if (res.status === 'CANCELLED') existing.cancelledCount += 1;
        if (res.status === 'PENDING') existing.pendingCount += 1;

        if (res.status === 'CONFIRMED' || res.status === 'COMPLETED') {
          existing.totalSpent += nominal;
        }

        // Keep track of the most recent booking
        const existingDateTime = `${existing.lastReservationDate} ${existing.lastReservationTime}`;
        const currentDateTime = `${res.reservation_date} ${res.reservation_time}`;
        if (currentDateTime > existingDateTime) {
          existing.lastReservationDate = res.reservation_date;
          existing.lastReservationTime = res.reservation_time;
          // Prefer the most recently recorded name
          existing.name = res.customer_name.trim();
        }

        existing.reservations.push(res);
      }
    });

    // Sort each customer's reservations chronologically descending
    const result = Array.from(map.values());
    result.forEach(c => {
      c.reservations.sort((a, b) => {
        const dtA = `${a.reservation_date} ${a.reservation_time}`;
        const dtB = `${b.reservation_date} ${b.reservation_time}`;
        return dtB.localeCompare(dtA);
      });
    });

    return result;
  }, [reservations]);

  // Filtered and Sorted Customers
  const filteredCustomers = useMemo(() => {
    let list = [...allCustomers];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.reservations.some(r => r.booking_code.toLowerCase().includes(q))
      );
    }

    // Segment filter
    if (filterSegment === 'VIP') {
      list = list.filter(c => c.totalReservations >= 2 || (c.confirmedCount + c.completedCount) >= 2);
    } else if (filterSegment === 'RECENT') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      list = list.filter(c => c.lastReservationDate >= sevenDaysAgo);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'most_bookings') {
        return b.totalReservations - a.totalReservations;
      }
      if (sortBy === 'latest') {
        const dtA = `${a.lastReservationDate} ${a.lastReservationTime}`;
        const dtB = `${b.lastReservationDate} ${b.lastReservationTime}`;
        return dtB.localeCompare(dtA);
      }
      if (sortBy === 'highest_spent') {
        return b.totalSpent - a.totalSpent;
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [allCustomers, searchQuery, filterSegment, sortBy]);

  // Export handlers
  const handleExportPDF = (scope: 'all' | 'filtered') => {
    const dataToExport = scope === 'all' ? allCustomers : filteredCustomers;
    const title = scope === 'all' ? 'Seluruh Customer' : `Filter (${dataToExport.length} Customer)`;
    exportCustomersPDF(
      dataToExport, 
      title, 
      settings?.business_name || 'EPIC MAHJONG',
      settings?.location || 'Alam Sutera'
    );
    setShowExportMenu(false);
  };

  const handleExportExcel = (scope: 'all' | 'filtered') => {
    const dataToExport = scope === 'all' ? allCustomers : filteredCustomers;
    const title = scope === 'all' ? 'Seluruh_Customer' : `Filter_${dataToExport.length}_Customer`;
    exportCustomersExcel(dataToExport, title);
    setShowExportMenu(false);
  };

  const handleExportCSV = (scope: 'all' | 'filtered') => {
    const dataToExport = scope === 'all' ? allCustomers : filteredCustomers;
    const title = scope === 'all' ? 'Seluruh_Customer' : `Filter_${dataToExport.length}_Customer`;
    exportCustomersCSV(dataToExport, title);
    setShowExportMenu(false);
  };

  // Top summary stats
  const totalCustomersCount = allCustomers.length;
  const totalBookingsCount = reservations.length;
  const vipCount = allCustomers.filter(c => c.totalReservations >= 2).length;
  const totalGrossSpending = allCustomers.reduce((acc, c) => acc + c.totalSpent, 0);

  return (
    <div id="admin-customers-page" className="space-y-6">
      
      {/* Page Header with Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>PORTAL MANAJEMEN</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <span>DATABASE CUSTOMER</span>
            <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {totalCustomersCount} Pelanggan
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Database customer otomatis terbentuk dari riwayat booking masuk secara real-time.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchReservations}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Dropdown Container */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT DATA</span>
            </button>

            {showExportMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 px-2">
                  Pilih Format Export
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={() => handleExportPDF('filtered')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-400" />
                      <span>Download PDF</span>
                    </span>
                    <span className="text-[10px] text-slate-400">({filteredCustomers.length})</span>
                  </button>

                  <button
                    onClick={() => handleExportExcel('filtered')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Export Excel (.xlsx)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">({filteredCustomers.length})</span>
                  </button>

                  <button
                    onClick={() => handleExportCSV('filtered')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <FileDown className="w-4 h-4 text-sky-400" />
                      <span>Export CSV (.csv)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">({filteredCustomers.length})</span>
                  </button>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 px-2">
                    Cakupan Data
                  </div>
                  <button
                    onClick={() => handleExportExcel('all')}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] text-amber-400 hover:bg-slate-800/80 transition-colors text-left font-medium"
                  >
                    <span>Export Seluruh Customer Database</span>
                    <span>({allCustomers.length})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Highlight Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Pelanggan</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalCustomersCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Unique nomor WhatsApp</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Akumulasi Booking</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{totalBookingsCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total sesi reservasi</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pelanggan Reguler / VIP</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{vipCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Booking ≥ 2 kali</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Transaksi Selesai</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-100 truncate">
            {formatRupiah(totalGrossSpending)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Confirmed & Completed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, WhatsApp, atau booking ID..."
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

        {/* Segment & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterSegment('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterSegment === 'ALL'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({allCustomers.length})
            </button>
            <button
              onClick={() => setFilterSegment('VIP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterSegment === 'VIP'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VIP / Reguler ({vipCount})
            </button>
            <button
              onClick={() => setFilterSegment('RECENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterSegment === 'RECENT'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Hari Terakhir
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="most_bookings" className="bg-slate-900">Paling Banyak Booking</option>
              <option value="latest" className="bg-slate-900">Reservasi Terkini</option>
              <option value="highest_spent" className="bg-slate-900">Nominal Tertinggi</option>
              <option value="name_asc" className="bg-slate-900">Nama (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List / Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <div className="text-xs text-slate-400 font-medium">Memuat data customer...</div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-slate-300 font-bold text-sm">
              {searchQuery ? 'Customer tidak ditemukan' : 'Belum ada data customer'}
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery 
                ? `Tidak ada customer yang cocok dengan kata kunci "${searchQuery}".`
                : 'Data customer otomatis terisi setelah reservasi pertama dibuat oleh pengunjung.'}
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#111c34] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Nama Customer</th>
                    <th className="py-3.5 px-4">Nomor WhatsApp</th>
                    <th className="py-3.5 px-4 text-center">Total Reservasi</th>
                    <th className="py-3.5 px-4 text-center">Selesai / Deal</th>
                    <th className="py-3.5 px-4">Reservasi Terakhir</th>
                    <th className="py-3.5 px-4 text-right">Total Nominal</th>
                    <th className="py-3.5 px-4 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCustomers.map((cust, idx) => (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                        <span>{cust.name}</span>
                        {cust.totalReservations >= 2 && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            VIP
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {cust.phone}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 font-bold">
                          {cust.totalReservations}x
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-emerald-400 bg-emerald-500/10 font-bold">
                          {cust.confirmedCount + cust.completedCount} Selesai
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">
                          {formatIndoDate(cust.lastReservationDate)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {cust.lastReservationTime ? `${cust.lastReservationTime} WIB` : '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-400 font-mono">
                        {formatRupiah(cust.totalSpent)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(cust);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <span>Detail</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-800">
              {filteredCustomers.map((cust, idx) => (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className="p-4 space-y-2 hover:bg-slate-800/40 active:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        {cust.name}
                      </span>
                      {cust.totalReservations >= 2 && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          VIP
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {cust.totalReservations}x Booking
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono">{cust.phone}</span>
                    <span className="text-emerald-400">
                      {cust.confirmedCount + cust.completedCount} Deal
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                    <span className="text-slate-500">
                      Terakhir: {formatIndoDate(cust.lastReservationDate)}
                    </span>
                    <span className="text-amber-300 font-bold">
                      {formatRupiah(cust.totalSpent)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

    </div>
  );
};
