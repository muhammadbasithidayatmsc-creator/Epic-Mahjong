import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  User, 
  Phone, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Info, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  CalendarDays,
  Lock,
  X,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { api, formatIndoDate, formatSlotTime } from '../lib/api';
import { TableWithAvailability, BusinessSettings, Reservation, MahjongTable, ScheduleSlot } from '../types';

interface BookingSectionProps {
  tables?: MahjongTable[];
  settings: BusinessSettings | null;
  preselectedTableId?: string | null;
  onBookingSuccess: (reservation: Reservation, whatsappUrl: string) => void;
  onErrorToast: (message: string) => void;
}

const DEFAULT_FALLBACK_TABLES: TableWithAvailability[] = [
  {
    id: 'tbl-01',
    name: 'TABLE 01',
    capacity: 4,
    description: 'Meja Otomatis Elektrik Generasi Terbaru, Kursi Ergonomis, Soundproofing Premium',
    features: ['Automatic Shuffler', 'Premium Soundproofing', '4 Pax'],
    is_active: true,
    created_at: '',
    status: 'AVAILABLE'
  },
  {
    id: 'tbl-02',
    name: 'TABLE 02',
    capacity: 4,
    description: 'Meja Otomatis Elektrik Halus, Suasana Santai, Akses Minuman & Snack Bar',
    features: ['Automatic Shuffler', 'Snack Bar Access', '4 Pax'],
    is_active: true,
    created_at: '',
    status: 'AVAILABLE'
  },
  {
    id: 'tbl-03',
    name: 'TABLE 03',
    capacity: 4,
    description: 'Meja Otomatis Elektrik Sentral, Pencahayaan Khusus Game, Area Nyaman',
    features: ['Automatic Shuffler', 'Game Lighting', '4 Pax'],
    is_active: true,
    created_at: '',
    status: 'AVAILABLE'
  },
  {
    id: 'tbl-04',
    name: 'TABLE 04',
    capacity: 4,
    description: 'Meja Otomatis Elektrik Sudut Tenang, Privasi Ekstra, Sirkulasi Udara Nyaman',
    features: ['Automatic Shuffler', 'Private Corner', '4 Pax'],
    is_active: true,
    created_at: '',
    status: 'AVAILABLE'
  },
  {
    id: 'tbl-05',
    name: 'TABLE 05',
    capacity: 6,
    description: 'VIP Private Mahjong Room, Meja Otomatis Elektrik Eksekutif, Sofa Lounge & Meja Lebar',
    features: ['VIP Private Suite', 'Automatic Shuffler', 'Sofa Lounge', '6 Pax'],
    is_active: true,
    created_at: '',
    status: 'AVAILABLE'
  }
];

const STANDARD_TIME_SLOTS = [
  '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'
];

function getIndoDayName(dateObj: Date): string {
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return days[dateObj.getDay()];
}

function getIndoMonthShort(dateObj: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return months[dateObj.getMonth()];
}

function getTablePrice(tableId: string): string {
  if (tableId === 'tbl-05') {
    return 'Rp 250.000 / sesi (2 Jam)';
  }
  return 'Rp 150.000 / sesi (2 Jam)';
}

function getTableCapacityLabel(capacity: number, tableId: string): string {
  if (tableId === 'tbl-05' || capacity >= 6) {
    return '4–6 Players';
  }
  return `${capacity} Players`;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  tables: tablesProp,
  settings,
  preselectedTableId,
  onBookingSuccess,
  onErrorToast
}) => {
  // Today formatted as YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Quick date options for the next 7 days
  const quickDates = useMemo(() => {
    const list: Array<{ dateStr: string; label: string; subLabel: string; isToday: boolean; isTomorrow: boolean }> = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let label = `${d.getDate()} ${getIndoMonthShort(d)}`;
      let subLabel = getIndoDayName(d);
      let isToday = i === 0;
      let isTomorrow = i === 1;

      if (isToday) {
        subLabel = 'HARI INI';
      } else if (isTomorrow) {
        subLabel = 'BESOK';
      }

      list.push({ dateStr, label, subLabel, isToday, isTomorrow });
    }
    return list;
  }, []);

  // Primary Selection States
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [selectedTable, setSelectedTable] = useState<TableWithAvailability | null>(null);

  // Customer input fields
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');

  // Table availability & schedule from database
  const [tables, setTables] = useState<TableWithAvailability[]>(() => {
    if (tablesProp && tablesProp.length > 0) {
      return tablesProp.map(t => ({
        ...t,
        status: 'AVAILABLE' as const
      }));
    }
    return DEFAULT_FALLBACK_TABLES;
  });

  const [daySchedule, setDaySchedule] = useState<ScheduleSlot[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Baru saja');

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  const formContainerRef = useRef<HTMLDivElement>(null);
  const calendarInputRef = useRef<HTMLInputElement>(null);
  const customerNameInputRef = useRef<HTMLInputElement>(null);

  const timeSlots = settings?.time_slots || STANDARD_TIME_SLOTS;
  const adminWhatsApp = settings?.admin_whatsapp || '085181959275';

  // Sync tables from props if provided
  useEffect(() => {
    if (tablesProp && tablesProp.length > 0) {
      setTables(prev => {
        return tablesProp.map(tp => {
          const match = prev.find(p => p.id === tp.id);
          return {
            ...tp,
            status: match?.status || 'AVAILABLE'
          };
        });
      });
    }
  }, [tablesProp]);

  // Handle preselected table ID from props
  useEffect(() => {
    if (preselectedTableId && tables.length > 0) {
      const match = tables.find(t => t.id === preselectedTableId);
      if (match) {
        setSelectedTable(match);
        setGuestCount(match.capacity || 4);
      }
    }
  }, [preselectedTableId, tables]);

  // Fetch full schedule matrix for selected date from real database
  const fetchScheduleAndAvailability = async (isSilent = false) => {
    if (!selectedDate) return;
    if (!isSilent) setLoadingSchedule(true);
    setConflictError(null);

    try {
      const [schedData, availData] = await Promise.all([
        api.getSchedule(selectedDate),
        api.getAvailability(selectedDate, selectedTime)
      ]);

      if (Array.isArray(schedData)) {
        setDaySchedule(schedData);
      }

      if (Array.isArray(availData) && availData.length > 0) {
        setTables(availData);

        // If user already had a table selected, verify it hasn't become booked
        if (selectedTable) {
          const fresh = availData.find(t => t.id === selectedTable.id);
          if (fresh) {
            if (fresh.status !== 'AVAILABLE') {
              // Table became booked during session
              setSelectedTable(null);
            } else {
              setSelectedTable(fresh);
            }
          }
        }
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastRefreshedAt(timeStr);
    } catch (err: any) {
      console.warn('[BookingSection] Notice fetching schedule:', err);
    } finally {
      if (!isSilent) setLoadingSchedule(false);
    }
  };

  // Trigger fetch when date changes
  useEffect(() => {
    fetchScheduleAndAvailability();
  }, [selectedDate]);

  // Background Auto-Polling: Refresh schedule every 18 seconds for live anti double-booking updates
  useEffect(() => {
    const timer = setInterval(() => {
      fetchScheduleAndAvailability(true);
    }, 18000);
    return () => clearInterval(timer);
  }, [selectedDate, selectedTime, selectedTable]);

  // Check status of a specific table at a specific time slot from daySchedule
  const getSlotStatus = (tableId: string, time: string): 'AVAILABLE' | 'PENDING' | 'BOOKED' => {
    if (!daySchedule || daySchedule.length === 0) return 'AVAILABLE';
    const slot = daySchedule.find(s => s.time === time);
    if (!slot) return 'AVAILABLE';
    const tbl = slot.tables.find(t => t.table_id === tableId);
    return tbl?.status || 'AVAILABLE';
  };

  // Handle clicking a specific time slot for a table
  const handleSelectSlot = (table: TableWithAvailability, time: string) => {
    const status = getSlotStatus(table.id, time);

    if (status === 'BOOKED') {
      onErrorToast(`Slot ${formatSlotTime(time)} WIB untuk ${table.name} sudah terisi (BOOKED). Silakan pilih slot hijau (AVAILABLE) lainnya.`);
      return;
    }
    if (status === 'PENDING') {
      onErrorToast(`Slot ${formatSlotTime(time)} WIB untuk ${table.name} sedang dalam proses konfirmasi (PENDING). Silakan pilih slot yang berstatus AVAILABLE.`);
      return;
    }

    // Set selected table, time slot, and guest count
    setSelectedTable(table);
    setSelectedTime(time);
    setGuestCount(table.capacity || 4);
    setConflictError(null);

    // Smooth scroll down to customer form & focus on customer name
    setTimeout(() => {
      if (formContainerRef.current) {
        formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          customerNameInputRef.current?.focus();
        }, 400);
      }
    }, 50);
  };

  // Open native calendar picker
  const handleOpenCalendar = () => {
    if (calendarInputRef.current) {
      calendarInputRef.current.showPicker?.();
      calendarInputRef.current.focus();
    }
  };

  // Pre-submit validation
  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    if (!selectedDate || !selectedTime) {
      onErrorToast('Silakan pilih Tanggal dan Jam sesi reservasi.');
      return;
    }
    if (!selectedTable) {
      onErrorToast('Silakan pilih salah satu slot meja yang berstatus AVAILABLE.');
      return;
    }
    if (!customerName.trim()) {
      onErrorToast('Silakan isi Nama lengkap Anda.');
      return;
    }
    if (!customerPhone.trim()) {
      onErrorToast('Silakan isi nomor WhatsApp Anda.');
      return;
    }
    if (!guestCount || guestCount < 1) {
      onErrorToast('Jumlah orang minimal 1.');
      return;
    }
    if (guestCount > (selectedTable.capacity || 6)) {
      onErrorToast(`Jumlah orang melebihi kapasitas ${selectedTable.name} (maks. ${selectedTable.capacity} orang).`);
      return;
    }

    setShowReviewModal(true);
  };

  // Submit reservation and trigger WhatsApp (Strict Anti-Double Booking validation enforced)
  const handleConfirmBooking = async () => {
    if (!selectedTable) return;
    setSubmitting(true);
    setConflictError(null);

    try {
      const res = await api.createReservation({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        reservation_date: selectedDate,
        reservation_time: selectedTime,
        table_id: selectedTable.id,
        guest_count: guestCount,
        notes: notes.trim()
      });

      setShowReviewModal(false);

      const targetWaUrl = res.whatsappUrl || res.fallbackWhatsappUrl || `https://api.whatsapp.com/send?phone=6285181959275`;

      // Trigger success callback to show reservation success details
      onBookingSuccess(res.reservation, targetWaUrl);

      // Attempt to launch WhatsApp
      const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      try {
        if (isMobile) {
          window.location.href = targetWaUrl;
        } else {
          const win = window.open(targetWaUrl, '_blank');
          if (!win) {
            window.location.href = targetWaUrl;
          }
        }
      } catch (_) {}

      // Reset form fields
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setSelectedTable(null);

      // Refresh schedule immediately to reflect new status
      fetchScheduleAndAvailability();
    } catch (err: any) {
      console.error('[BookingSection] Submission caught error:', err);
      setShowReviewModal(false);

      const errMsg = err?.message || 'Maaf, meja ini baru saja dipesan oleh customer lain. Silakan pilih meja atau waktu lainnya.';
      setConflictError(errMsg);
      onErrorToast(errMsg);

      // Reset selected table so user picks another available one
      setSelectedTable(null);
      // Immediately refresh table availability to show new BOOKED status
      fetchScheduleAndAvailability();
    } finally {
      setSubmitting(false);
    }
  };

  // Check if selectedDate is outside the 7 quick dates
  const isCustomDateSelected = useMemo(() => {
    return !quickDates.some(q => q.dateStr === selectedDate);
  }, [quickDates, selectedDate]);

  return (
    <section id="schedule-section" className="py-8 sm:py-12 md:py-16 bg-[#0b0f17] border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ========================================================================= */}
        {/* 1. TOP HEADER: TABLE AVAILABILITY & SCHEDULE (PRIORITAS JADWAL MEJA)      */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>TABLE AVAILABILITY & SCHEDULE</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight">
            JADWAL MEJA HARI INI & MENDATANG
          </h1>
          <p className="font-serif text-base sm:text-xl text-amber-400/90 font-medium mt-1">
            Ketersediaan 5 Meja Otomatis Elektrik Epic Mahjong Alam Sutera
          </p>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
            Pilih tanggal di bawah untuk melihat jam kosong tiap meja secara real-time. Klik pada slot hijau (<span className="text-emerald-400 font-bold">AVAILABLE</span>) untuk langsung melakukan reservasi tanpa antre.
          </p>
        </div>

        {/* Anti-Double Booking Conflict Error Alert Banner */}
        {conflictError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3 shadow-lg animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block text-rose-200">Reservasi Meja Tidak Tersedia:</strong>
              <span>{conflictError}</span>
            </div>
            <button
              onClick={() => setConflictError(null)}
              className="text-xs px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. DATE SELECTOR BAR (HARI INI, BESOK, TANGGAL MENDATANG & LIHAT KALENDER) */}
        {/* ========================================================================= */}
        <div className="bg-[#111724] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  PILIH TANGGAL BERMAIN
                </span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {formatIndoDate(selectedDate)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Default menampilkan jadwal <strong>HARI INI</strong>. Pilih tanggal untuk melihat jadwal mendatang.
              </p>
            </div>

            {/* Live refresh indicator and button */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
              <span className="text-[10px] text-slate-400 hidden md:inline">
                Update terakhir: {lastRefreshedAt}
              </span>
              <button
                type="button"
                onClick={() => fetchScheduleAndAvailability(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
                title="Segarkan jadwal dari database"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loadingSchedule ? 'animate-spin' : ''}`} />
                <span>Segarkan Jadwal</span>
              </button>
            </div>
          </div>

          {/* Quick Date Pills Horizontal Scrollable */}
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
            {quickDates.map(item => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`shrink-0 flex flex-col items-center justify-center py-2.5 px-3.5 sm:px-4 rounded-xl border text-center transition-all cursor-pointer min-w-[92px] ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/50'
                      : 'bg-[#161f30] border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-[#1b273d]'
                  }`}
                >
                  <span className={`text-[10px] font-bold tracking-wider uppercase ${isSelected ? 'text-slate-950 font-black' : 'text-amber-400'}`}>
                    {item.subLabel}
                  </span>
                  <span className={`text-xs sm:text-sm font-extrabold mt-0.5 ${isSelected ? 'text-slate-950' : 'text-slate-100'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Custom Date Pill (If selected via Calendar outside 7 days) */}
            {isCustomDateSelected && (
              <div className="shrink-0 flex flex-col items-center justify-center py-2.5 px-3.5 rounded-xl bg-amber-500 text-slate-950 border border-amber-400 shadow-md ring-2 ring-amber-400/50 min-w-[100px]">
                <span className="text-[10px] font-black uppercase text-slate-950">
                  TANGGAL LAIN
                </span>
                <span className="text-xs font-extrabold mt-0.5 text-slate-950">
                  {formatIndoDate(selectedDate)}
                </span>
              </div>
            )}

            {/* Button: LIHAT KALENDER */}
            <div className="relative shrink-0">
              <input
                ref={calendarInputRef}
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                className="absolute inset-0 opacity-0 pointer-events-auto cursor-pointer w-full h-full z-10"
                aria-label="Pilih tanggal dari kalender"
              />
              <button
                type="button"
                onClick={handleOpenCalendar}
                className="flex items-center gap-2 py-3 px-4 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span>PILIH TANGGAL</span>
              </button>
            </div>
          </div>

          {/* Status Legend Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
                <span>AVAILABLE (Tersedia)</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>PENDING (Menunggu Konfirmasi)</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>BOOKED (Terkonfirmasi)</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tabel Matriks Ketersediaan 5 Meja</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TABEL MATRIKS JADWAL 5 MEJA (REALTIME DATABASE)                        */}
        {/* ========================================================================= */}
        <div className="mb-10">
          
          {/* Active selection helper notice */}
          {selectedTable ? (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs sm:text-sm flex items-center justify-between flex-wrap gap-2 animate-in fade-in shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Slot Terpilih: <strong className="text-slate-100">{selectedTable.name}</strong> • Pukul <strong className="text-amber-300">{formatSlotTime(selectedTime)} WIB</strong> ({formatIndoDate(selectedDate)})
                </span>
              </div>
              <a
                href="#booking-form-card"
                onClick={(e) => {
                  e.preventDefault();
                  formContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                  customerNameInputRef.current?.focus();
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors shadow-sm"
              >
                <span>Isi Data Reservasi ↓</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="mb-4 text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Klik pada salah satu kotak hijau (<strong className="text-emerald-400 font-bold">AVAILABLE</strong>) di Tabel Matriks untuk langsung memesan slot.</span>
            </div>
          )}

          {/* TABEL MATRIKS 5 MEJA */}
          <div className="bg-[#111724] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[720px]">
                <thead className="bg-[#172030] text-xs uppercase tracking-wider text-slate-300 border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-5 font-bold text-amber-400 flex items-center gap-1.5 whitespace-nowrap bg-[#172030]">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Jam Sesi (2 Jam)</span>
                    </th>
                    {tables.map(table => (
                      <th key={table.id} className="py-4 px-3 font-bold text-center border-l border-slate-800/80">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-slate-100 font-serif text-sm tracking-wide">{table.name}</span>
                          {table.id === 'tbl-05' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                          <Users className="w-3 h-3 text-amber-400" />
                          <span>{getTableCapacityLabel(table.capacity, table.id)}</span>
                        </div>
                        <div className="text-[10px] font-mono text-amber-400 font-bold mt-0.5">
                          {getTablePrice(table.id).split(' ')[1]} / 2 Jam
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {timeSlots.map(time => {
                    const timeRangeText = formatSlotTime(time);
                    return (
                      <tr key={time} className="hover:bg-[#141b2b] transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-200 whitespace-nowrap bg-[#111724]/70">
                          {timeRangeText} WIB
                        </td>

                        {tables.map(table => {
                          const status = getSlotStatus(table.id, time);
                          const isSelected = selectedTable?.id === table.id && selectedTime === time;

                          if (status === 'AVAILABLE') {
                            return (
                              <td key={table.id} className="py-2.5 px-2.5 text-center border-l border-slate-800/60">
                                <button
                                  type="button"
                                  onClick={() => handleSelectSlot(table, time)}
                                  className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                    isSelected
                                      ? 'bg-amber-400 text-slate-950 font-black shadow-lg ring-2 ring-amber-300'
                                      : 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 hover:border-emerald-400 shadow-sm'
                                  }`}
                                  title={`Pilih ${table.name} pukul ${timeRangeText} WIB`}
                                >
                                  {isSelected ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>TERPILIH</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                      <span>AVAILABLE</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            );
                          }

                          if (status === 'PENDING') {
                            return (
                              <td key={table.id} className="py-2.5 px-2.5 text-center border-l border-slate-800/60">
                                <button
                                  type="button"
                                  onClick={() => onErrorToast(`Slot ${timeRangeText} WIB di ${table.name} sedang dalam proses konfirmasi.`)}
                                  className="w-full py-2 px-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400/90 border border-amber-500/25 cursor-not-allowed opacity-80 flex items-center justify-center gap-1"
                                  title="Menunggu konfirmasi admin"
                                >
                                  <Clock className="w-3 h-3 text-amber-400/70" />
                                  <span>PENDING</span>
                                </button>
                              </td>
                            );
                          }

                          return (
                            <td key={table.id} className="py-2.5 px-2.5 text-center border-l border-slate-800/60">
                              <button
                                type="button"
                                onClick={() => onErrorToast(`Slot ${timeRangeText} WIB di ${table.name} sudah terisi penuh (BOOKED).`)}
                                className="w-full py-2 px-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400/80 border border-rose-500/20 cursor-not-allowed opacity-75 flex items-center justify-center gap-1"
                                title="Slot sudah terisi penuh"
                              >
                                <Lock className="w-3 h-3 text-rose-400/60" />
                                <span className="line-through text-slate-400 font-mono text-[11px]">{time}</span>
                                <span>BOOKED</span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Guide */}
            <div className="p-3.5 bg-[#0e131d] border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400 px-5">
              <span className="text-[11px] sm:text-xs text-slate-400">
                * Geser tabel ke kanan/kiri jika melihat melalui layar HP
              </span>
              <span className="text-amber-400 font-semibold text-[11px] sm:text-xs">
                Klik tombol hijau AVAILABLE untuk booking langsung
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. BOOKING FORM (LANGSUNG TERHUBUNG KE JADWAL DI ATAS)                     */}
        {/* ========================================================================= */}
        <div 
          ref={formContainerRef} 
          id="booking-form-card" 
          className="bg-[#111724] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-xs">
                ✓
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                  FORMULIR RESERVASI MEJA
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedTable 
                    ? `Slot jadwal telah terpilih otomatis. Lengkapi data pemesan di bawah untuk konfirmasi.`
                    : 'Pilih slot hijau (AVAILABLE) pada jadwal di atas untuk mengisi formulir ini.'
                  }
                </p>
              </div>
            </div>

            {selectedTable && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('schedule-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Ubah Slot di Jadwal ↑</span>
              </button>
            )}
          </div>

          {!selectedTable ? (
            /* Banner if no slot clicked yet */
            <div className="py-12 text-center bg-[#0d121c] border border-dashed border-slate-800 rounded-xl px-4">
              <Info className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-80" />
              <h4 className="text-base text-slate-100 font-bold">Belum Ada Meja & Jam yang Dipilih</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                Silakan lihat jadwal meja di atas, lalu klik salah satu slot waktu yang berstatus <strong className="text-emerald-400 font-bold">AVAILABLE</strong> (kotak hijau).
              </p>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('schedule-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-4 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all"
              >
                Lihat Jadwal Meja di Atas ↑
              </button>
            </div>
          ) : (
            /* Active pre-filled reservation form */
            <form onSubmit={handleOpenReview} className="space-y-6">
              
              {/* Highlighted Banner of Selected Slot */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-400/40 text-xs sm:text-sm text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Slot Meja Berhasil Dipilih dari Jadwal:</span>
                  </div>
                  <div className="font-serif text-xl font-extrabold text-slate-100 mt-1">
                    {selectedTable.name} • {getTableCapacityLabel(selectedTable.capacity, selectedTable.id)}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Tanggal: <strong className="text-amber-300">{formatIndoDate(selectedDate)}</strong> • Jam: <strong className="text-amber-300">{formatSlotTime(selectedTime)} WIB (2 Jam)</strong>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono font-bold text-amber-300 text-sm sm:text-base border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div>{getTablePrice(selectedTable.id)}</div>
                  <div className="text-[11px] font-sans font-normal text-slate-400">Epic Mahjong Alam Sutera</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Nama Customer */}
                <div className="space-y-1.5">
                  <label htmlFor="customer_name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Nama Pemesan <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      ref={customerNameInputRef}
                      id="customer_name"
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#161f30] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Nomor WhatsApp */}
                <div className="space-y-1.5">
                  <label htmlFor="customer_phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Nomor WhatsApp <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="customer_phone"
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#161f30] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Konfirmasi reservasi dan tiket akan dikirimkan ke nomor WhatsApp ini.
                  </p>
                </div>

                {/* Rincian Terkunci: Tanggal & Jam Terpilih */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Tanggal & Jam Sesi (Otomatis dari Jadwal)
                  </label>
                  <div className="bg-[#161f30]/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 text-xs sm:text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-slate-100">{formatIndoDate(selectedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-amber-400">{formatSlotTime(selectedTime)} WIB</span>
                    </div>
                  </div>
                </div>

                {/* Meja & Jumlah Orang */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Meja Terpilih
                    </label>
                    <div className="bg-[#161f30]/80 border border-slate-800 rounded-xl px-4 py-3 text-amber-300 font-extrabold text-sm">
                      {selectedTable.name}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="guest_count" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Jumlah Pemain <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="guest_count"
                      type="number"
                      min={1}
                      max={selectedTable.capacity || 6}
                      required
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full bg-[#161f30] border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Catatan (Opsional) */}
                <div className="md:col-span-2 space-y-1.5">
                  <label htmlFor="notes" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Catatan Khusus (Opsional)
                  </label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      id="notes"
                      rows={2}
                      placeholder="Contoh: Request air mineral dingin, panduan bagi pemula mahjong..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#161f30] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Admin WhatsApp: <strong className="text-emerald-400 font-mono">{adminWhatsApp}</strong>
                </div>

                <button
                  id="btn-periksa-reservasi"
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <span>PERIKSA RESERVASI ANDA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. REVIEW BOOKING MODAL (SEBELUM SUBMIT)                                  */}
      {/* ========================================================================= */}
      {showReviewModal && selectedTable && (
        <div id="booking-review-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-amber-500/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100 relative">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-serif tracking-widest text-xs font-bold text-amber-400 uppercase">EPIC MAHJONG</span>
                <h3 className="text-lg font-extrabold text-slate-100">PERIKSA RESERVASI ANDA</h3>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                Menunggu Konfirmasi
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-2.5 text-xs sm:text-sm font-sans">
                
                <div className="text-center pb-3 border-b border-slate-800/80">
                  <div className="font-serif font-black text-amber-400 text-lg">EPIC MAHJONG</div>
                  <div className="font-serif font-bold text-slate-100 text-base">{selectedTable.name}</div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {formatIndoDate(selectedDate)} • {formatSlotTime(selectedTime)} WIB
                  </div>
                  <div className="text-xs text-amber-400 font-semibold mt-0.5">
                    {guestCount} Players • {getTablePrice(selectedTable.id)}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Nama Pemesan:</span>
                    <span className="text-slate-100 font-semibold">{customerName}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">WhatsApp:</span>
                    <span className="text-slate-100 font-mono font-medium">{customerPhone}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Catatan:</span>
                    <span className="text-slate-300 italic">{notes.trim() || '-'}</span>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Status Awal:</span>
                    <span className="text-amber-400 font-bold">Menunggu Konfirmasi (PENDING)</span>
                  </div>
                </div>
              </div>

              {/* Anti-Double Booking Note */}
              <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                Sistem database akan memvalidasi slot meja secara real-time. Jika slot telah diambil customer lain beberapa detik lalu, sistem akan memberitahukan Anda.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-[#172030] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowReviewModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Ubah Data
              </button>

              <button
                id="btn-konfirmasi-reservasi"
                type="button"
                disabled={submitting}
                onClick={handleConfirmBooking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>MEMVALIDASI KE DATABASE...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>KONFIRMASI RESERVASI</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
