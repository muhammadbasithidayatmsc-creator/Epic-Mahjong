import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  MessageCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../lib/api';
import { TableWithAvailability, BusinessSettings, Reservation } from '../types';

interface BookingSectionProps {
  settings: BusinessSettings | null;
  onBookingSuccess: (reservation: Reservation, whatsappUrl: string) => void;
  onErrorToast: (message: string) => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  settings,
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

  // Form states
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [selectedTable, setSelectedTable] = useState<TableWithAvailability | null>(null);

  // Customer input fields
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');

  // Table availability state
  const [tables, setTables] = useState<TableWithAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  const timeSlots = settings?.time_slots || [
    '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'
  ];

  // Fetch availability whenever selectedDate or selectedTime changes
  const fetchAvailability = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoadingAvailability(true);
    try {
      const data = await api.getAvailability(selectedDate, selectedTime);
      setTables(data);

      // If currently selected table is no longer AVAILABLE in the new slot, deselect it
      if (selectedTable) {
        const stillAvailable = data.find(t => t.id === selectedTable.id && t.status === 'AVAILABLE');
        if (!stillAvailable) {
          setSelectedTable(null);
        } else {
          setSelectedTable(stillAvailable);
        }
      }
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memuat ketersediaan meja.');
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedDate, selectedTime]);

  // Handle table selection
  const handleSelectTable = (table: TableWithAvailability) => {
    if (table.status !== 'AVAILABLE') return;
    setSelectedTable(table);
    setGuestCount(table.capacity || 4);
    // Smooth scroll down to customer form on mobile
    const formElement = document.getElementById('customer-form-container');
    if (formElement && window.innerWidth < 768) {
      setTimeout(() => {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Pre-submit validation
  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      onErrorToast('Silakan isi Nama lengkap Anda.');
      return;
    }
    if (!customerPhone.trim()) {
      onErrorToast('Silakan isi nomor WhatsApp aktif Anda.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      onErrorToast('Silakan pilih Tanggal dan Jam reservasi.');
      return;
    }
    if (!selectedTable) {
      onErrorToast('Silakan pilih salah satu meja yang berstatus AVAILABLE.');
      return;
    }

    setShowReviewModal(true);
  };

  // Submit reservation and trigger WhatsApp
  const handleConfirmBooking = async () => {
    if (!selectedTable) return;
    setSubmitting(true);

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

      // Open WhatsApp deep link immediately in new tab/window
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank');
      }

      // Trigger success celebration view with reservation data
      onBookingSuccess(res.reservation, res.whatsappUrl);

      // Reset form fields
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setSelectedTable(null);

      // Refresh availability
      fetchAvailability();
    } catch (err: any) {
      setShowReviewModal(false);
      onErrorToast(err.message || 'Gagal mengirim reservasi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Preview booking code
  const previewBookingCode = useMemo(() => {
    const dStr = selectedDate ? selectedDate.replace(/[^0-9]/g, '') : '20260907';
    return `EM-${dStr}-XXXX`;
  }, [selectedDate]);

  return (
    <section id="booking-section" className="py-16 md:py-24 bg-[#0d121c] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Reservasi Cepat Tanpa Login
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
            Pilih Jadwal & 5 Meja Tersedia
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            Pilih tanggal dan jam bermain, cek status ketersediaan 5 meja secara realtime, 
            dan lanjutkan booking langsung ke WhatsApp Super Admin.
          </p>
        </div>

        {/* STEP 1: Date & Time Picker */}
        <div className="bg-[#111724] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
                1
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">Pilih Tanggal & Jam Bermain</h3>
                <p className="text-xs text-slate-400">Status 5 meja akan terupdate otomatis berdasarkan jadwal ini</p>
              </div>
            </div>

            {/* Availability Status Legend */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" />
                <span className="text-slate-300">AVAILABLE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-500/20" />
                <span className="text-slate-300">PENDING</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-rose-500/20" />
                <span className="text-slate-300">BOOKED</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Date Input */}
            <div className="md:col-span-4 space-y-2">
              <label htmlFor="booking-date" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Tanggal Bermain
              </label>
              <div className="relative">
                <input
                  id="booking-date"
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#161f30] border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Pilih tanggal mulai hari ini ke depan.
              </p>
            </div>

            {/* Time Slots Selector */}
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Pilih Sesi Jam
                </label>
                <button
                  type="button"
                  onClick={fetchAvailability}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingAvailability ? 'animate-spin' : ''}`} />
                  <span>Cek Ulang Ketersediaan</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {timeSlots.map(time => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-[#161f30] border-slate-700 text-slate-200 hover:border-slate-600 hover:bg-[#1a253a]'
                      }`}
                    >
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span>{time} WIB</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                Durasi standar per sesi adalah 2 jam permainan santai.
              </p>
            </div>
          </div>
        </div>

        {/* STEP 2: 5 Tables Realtime Status */}
        <div className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
                2
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Pilih 1 dari 5 Meja Tersedia</h3>
                <p className="text-xs text-slate-400">
                  Jadwal: <span className="text-amber-400 font-semibold">{selectedDate}</span> pukul <span className="text-amber-400 font-semibold">{selectedTime} WIB</span>
                </p>
              </div>
            </div>

            {selectedTable && (
              <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Terpilih: {selectedTable.name}</span>
              </div>
            )}
          </div>

          {loadingAvailability ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-amber-400" />
              <p className="text-sm">Memeriksa ketersediaan 5 meja di server...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {tables.map(table => {
                const isSelected = selectedTable?.id === table.id;
                const isAvailable = table.status === 'AVAILABLE';
                const isPending = table.status === 'PENDING';
                const isBooked = table.status === 'BOOKED';

                // Status Badge styling
                let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                let statusLabel = 'AVAILABLE';
                let statusIcon = '🟢';

                if (isPending) {
                  badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  statusLabel = 'PENDING';
                  statusIcon = '🟡';
                } else if (isBooked) {
                  badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                  statusLabel = 'BOOKED';
                  statusIcon = '🔴';
                }

                return (
                  <div
                    key={table.id}
                    id={`table-card-${table.id}`}
                    onClick={() => isAvailable && handleSelectTable(table)}
                    className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#152033] border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/50'
                        : isAvailable
                        ? 'bg-[#111724] border-slate-700/80 hover:border-amber-500/50 hover:bg-[#151c2b] cursor-pointer'
                        : 'bg-[#0f141e]/60 border-slate-800/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {/* Top row: Table name & status badge */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="font-serif font-bold text-lg text-slate-100">
                          {table.name}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold border ${badgeClass}`}>
                          <span>{statusIcon}</span>
                          <span>{statusLabel}</span>
                        </span>
                      </div>

                      {/* Capacity */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Kapasitas: {table.capacity} Orang</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {table.description || 'Meja Otomatis Elektrik Mahjong'}
                      </p>
                    </div>

                    {/* Action button */}
                    <div className="pt-2 border-t border-slate-800/80">
                      {isAvailable ? (
                        <button
                          type="button"
                          className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          {isSelected ? '✓ Terpilih' : 'Pilih Meja Ini'}
                        </button>
                      ) : (
                        <div className="text-center py-2 text-xs font-medium text-slate-500">
                          {isBooked ? 'Sudah Terisi' : 'Menunggu Bayar'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 3: Customer Form (Shown once a table is selected, or informs to select) */}
        <div id="customer-form-container" className="bg-[#111724] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
              3
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Data Pemesan</h3>
              <p className="text-xs text-slate-400">
                {selectedTable 
                  ? `Mengisi formulir untuk ${selectedTable.name} (${selectedDate} - ${selectedTime} WIB)`
                  : 'Silakan pilih meja dengan status AVAILABLE pada langkah di atas terlebih dahulu'
                }
              </p>
            </div>
          </div>

          {!selectedTable ? (
            <div className="py-8 text-center bg-[#0d121c] border border-dashed border-slate-800 rounded-xl px-4">
              <Info className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm text-slate-300 font-medium">Belum ada meja yang dipilih</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Silakan klik salah satu kartu meja yang berstatus <span className="text-emerald-400 font-bold">AVAILABLE</span> di atas untuk melanjutkan pengisian data.
              </p>
            </div>
          ) : (
            <form onSubmit={handleOpenReview} className="space-y-6">
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
                      id="customer_name"
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap Anda"
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
                      placeholder="Contoh: 081298765432"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#161f30] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Admin akan menghubungi nomor ini untuk konfirmasi harga & pembayaran.
                  </p>
                </div>

                {/* Read-Only: Tanggal & Jam */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Jadwal Terpilih
                  </label>
                  <div className="bg-[#161f30]/60 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>{selectedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>{selectedTime} WIB</span>
                    </div>
                  </div>
                </div>

                {/* Read-Only: Meja & Jumlah Orang */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Meja
                    </label>
                    <div className="bg-[#161f30]/60 border border-slate-800 rounded-xl px-4 py-3 text-amber-300 font-bold text-sm">
                      {selectedTable.name}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="guest_count" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Jumlah Orang
                    </label>
                    <div className="relative">
                      <input
                        id="guest_count"
                        type="number"
                        min={1}
                        max={selectedTable.capacity || 6}
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full bg-[#161f30] border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Catatan Tambahan */}
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
                      placeholder="Contoh: Perlu set ubin tambahan, request minuman, atau estimasi datang lebih awal..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#161f30] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button to open Summary */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Status booking awal adalah <span className="text-amber-400 font-bold">PENDING</span> sebelum disepakati di WhatsApp.
                </div>

                <button
                  id="btn-review-booking"
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <span>Review Ringkasan Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* RINGKASAN RESERVASI MODAL */}
      {showReviewModal && selectedTable && (
        <div id="booking-summary-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121824] border border-amber-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#172030] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-serif tracking-widest text-xs font-bold text-amber-400 uppercase">EPIC MAHJONG</span>
                <h3 className="text-lg font-bold text-slate-100">Ringkasan Reservasi</h3>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                STATUS: PENDING
              </span>
            </div>

            {/* Modal Body - Exact fields requested */}
            <div className="p-6 space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-2.5 font-mono text-xs sm:text-sm">
                <div className="text-amber-400 font-serif font-bold text-center border-b border-slate-800/80 pb-2 text-base">
                  EPIC MAHJONG
                </div>
                
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Booking:</span>
                  <span className="text-amber-300 font-semibold">{previewBookingCode}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Nama:</span>
                  <span className="text-slate-200 font-medium">{customerName}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">WhatsApp:</span>
                  <span className="text-slate-200 font-medium">{customerPhone}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Tanggal:</span>
                  <span className="text-slate-200 font-medium">{selectedDate}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Jam:</span>
                  <span className="text-slate-200 font-medium">{selectedTime} WIB</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Meja:</span>
                  <span className="text-emerald-400 font-bold">{selectedTable.name}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Jumlah Orang:</span>
                  <span className="text-slate-200 font-medium">{guestCount} Orang</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Catatan:</span>
                  <span className="text-slate-300">{notes || '-'}</span>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-amber-400 font-bold">PENDING</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-xs text-slate-400 leading-relaxed bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                Setelah menekan tombol di bawah, reservasi akan tersimpan ke sistem dan Anda akan diarahkan ke WhatsApp Admin 
                <span className="text-amber-300 font-semibold"> ({settings?.admin_whatsapp || '085181959275'})</span> untuk informasi harga dan pembayaran.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-[#172030] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowReviewModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Ubah Data
              </button>

              <button
                id="btn-confirm-whatsapp-booking"
                type="button"
                disabled={submitting}
                onClick={handleConfirmBooking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>{submitting ? 'Menyimpan...' : 'BOOKING VIA WHATSAPP'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
