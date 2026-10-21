import {
  BusinessSettings,
  MahjongTable,
  Reservation,
  TableWithAvailability,
  TableAvailabilityStatus,
  ScheduleSlot,
  UserProfile,
  ReservationStatus,
  PlaySession,
  SessionStatus
} from '../types';
import { supabase } from '../supabaseClient.js';

const TOKEN_KEY = 'epic_mahjong_token';
const LOCAL_RES_KEY = 'epic_mahjong_client_reservations';
const LOCAL_SETTINGS_KEY = 'epic_mahjong_client_settings';
const LOCAL_SESSIONS_KEY = 'epic_mahjong_client_sessions';
const LOCAL_MIGRATED_KEY = 'epic_mahjong_supabase_migrated_v1';

export const DEFAULT_SESSIONS: PlaySession[] = [
  { session_id: 'ses-01', session_name: '10:00 – 11:00', start_time: '10:00', end_time: '11:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-02', session_name: '11:00 – 12:00', start_time: '11:00', end_time: '12:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-03', session_name: '12:00 – 13:00', start_time: '12:00', end_time: '13:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-04', session_name: '13:00 – 14:00', start_time: '13:00', end_time: '14:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-05', session_name: '14:00 – 15:00', start_time: '14:00', end_time: '15:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-06', session_name: '15:00 – 16:00', start_time: '15:00', end_time: '16:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-07', session_name: '16:00 – 17:00', start_time: '16:00', end_time: '17:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-08', session_name: '17:00 – 18:00', start_time: '17:00', end_time: '18:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-09', session_name: '18:00 – 19:00', start_time: '18:00', end_time: '19:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-10', session_name: '19:00 – 20:00', start_time: '19:00', end_time: '20:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-11', session_name: '20:00 – 21:00', start_time: '20:00', end_time: '21:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-12', session_name: '21:00 – 22:00', start_time: '21:00', end_time: '22:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-13', session_name: '22:00 – 23:00', start_time: '22:00', end_time: '23:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-14', session_name: '23:00 – 00:00', start_time: '23:00', end_time: '00:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-15', session_name: '00:00 – 01:00', start_time: '00:00', end_time: '01:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
  { session_id: 'ses-16', session_name: '01:00 – 02:00', start_time: '01:00', end_time: '02:00', status: 'ACTIVE', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' }
];

export const DEFAULT_SETTINGS: BusinessSettings = {
  business_name: 'EPIC MAHJONG',
  location: 'Alam Sutera',
  admin_whatsapp: '085181959275',
  owner_whatsapp: '08159804100',
  logo: '',
  hero_image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1600&q=80',
  operating_hours: '10:00 - 02:00 WIB',
  time_slots: [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00'
  ],
  updated_at: new Date().toISOString()
};

export const DEFAULT_TABLES: MahjongTable[] = [
  {
    id: 'tbl-01',
    name: 'TABLE 01',
    capacity: 4,
    description: 'Meja Otomatis Elektrik, Kursi Ergonomis Premium, Soundproofing Luas',
    is_active: true,
    features: ['Automatic Shuffler', 'Premium Audio', '4 Pax'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tbl-02',
    name: 'TABLE 02',
    capacity: 4,
    description: 'Meja Otomatis Elektrik, Deluxe Lounge Seating, Pencahayaan Ambient Emas',
    is_active: true,
    features: ['Automatic Shuffler', 'Deluxe Lounge', '4 Pax'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tbl-03',
    name: 'TABLE 03',
    capacity: 4,
    description: 'VIP Private Corner, Meja Otomatis Elektrik, Mini Bar Access',
    is_active: true,
    features: ['VIP Private Corner', 'Mini Bar Access', '4 Pax'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tbl-04',
    name: 'TABLE 04',
    capacity: 6,
    description: 'Grand Suite Table, Meja Otomatis Luxury Sofa, Kapasitas hingga 6 orang',
    is_active: true,
    features: ['Grand Suite Table', 'Luxury Sofa', '4-6 Pax'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tbl-05',
    name: 'TABLE 05',
    capacity: 4,
    description: 'Meja Otomatis Elektrik, High Rollers Ambient, Privasi Eksklusif',
    is_active: true,
    features: ['Automatic Shuffler', 'High Rollers Vibe', '4 Pax'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  }
];

export function formatIndoDate(dateStr: string): string {
  if (!dateStr) return '';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = match[1];
    const monthIdx = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${months[monthIdx]} ${year}`;
    }
  }
  return dateStr;
}

export function formatSlotTime(timeStr: string): string {
  if (!timeStr) return '';
  if (timeStr.includes('-') || timeStr.includes('–')) return timeStr;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const hour = parseInt(match[1], 10);
    const min = match[2];
    const endHour = (hour + 1) % 24;
    const startStr = `${String(hour).padStart(2, '0')}:${min}`;
    const endStr = `${String(endHour).padStart(2, '0')}:${min}`;
    return `${startStr} – ${endStr}`;
  }
  return timeStr;
}

// Convert HH:mm to minutes from midnight
export function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const parts = t.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Check time overlap between two intervals [startA, endA) and [startB, endB)
export function doSessionsOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  let sA = parseTimeToMinutes(startA);
  let eA = parseTimeToMinutes(endA);
  if (eA <= sA) eA += 1440; // crosses midnight (e.g. 23:00 - 00:00 or 00:00 - 01:00)

  let sB = parseTimeToMinutes(startB);
  let eB = parseTimeToMinutes(endB);
  if (eB <= sB) eB += 1440;

  const overlap1 = Math.max(sA, sB) < Math.min(eA, eB);
  if (overlap1) return true;
  const overlap2 = Math.max(sA + 1440, sB) < Math.min(eA + 1440, eB);
  if (overlap2) return true;
  const overlap3 = Math.max(sA, sB + 1440) < Math.min(eA, eB + 1440);
  if (overlap3) return true;

  return false;
}

export function reservationOverlapsTime(r: Reservation, slotStart: string, slotEnd: string): boolean {
  if (r.selected_slots && Array.isArray(r.selected_slots) && r.selected_slots.length > 0) {
    return r.selected_slots.some(slotStr => {
      const parts = slotStr.split(/[-–]/).map(p => p.trim());
      if (parts.length >= 2) {
        return doSessionsOverlap(slotStart, slotEnd, parts[0], parts[1]);
      }
      return false;
    });
  }

  const rStart = r.start_time || r.reservation_time;
  let rEnd = r.end_time;
  if (!rEnd && rStart) {
    const startMin = parseTimeToMinutes(rStart);
    const endMin = (startMin + 60) % 1440;
    const eh = Math.floor(endMin / 60);
    const em = endMin % 60;
    rEnd = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  }
  if (rStart && rEnd) {
    return doSessionsOverlap(slotStart, slotEnd, rStart, rEnd);
  }
  return false;
}

// Generate formatted WhatsApp details
export function buildWhatsAppLinks(adminPhoneInput: string, res: {
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  start_time?: string;
  end_time?: string;
  selected_slots?: string[];
  duration_hours?: number;
  table_name: string;
  guest_count: number;
  notes?: string;
}) {
  let phone = (adminPhoneInput || '085181959275').replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  } else if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }
  if (!phone) {
    phone = '6285181959275';
  }

  const formattedDate = formatIndoDate(res.reservation_date);
  const jamText = (res.start_time && res.end_time)
    ? `${res.start_time}–${res.end_time}`
    : formatSlotTime(res.reservation_time);

  const durationHours = res.duration_hours || (res.selected_slots && res.selected_slots.length) || 1;
  const durasiDisplay = `${durationHours} jam`;

  let slotBlock = '';
  if (res.selected_slots && res.selected_slots.length > 0) {
    slotBlock = `\nSlot dipilih:\n${res.selected_slots.map(s => `* ${s}`).join('\n')}`;
  } else if (res.start_time && res.end_time) {
    slotBlock = `\nSlot dipilih:\n* ${res.start_time}–${res.end_time}`;
  }

  const catatanText = (res.notes && res.notes.trim()) ? res.notes.trim() : '-';

  const message = 
`EPIC MAHJONG — BOOKING REQUEST

Booking ID: ${res.booking_code}
Nama: ${res.customer_name}
No. WhatsApp: ${res.customer_phone}
Tanggal: ${formattedDate}
Meja: ${res.table_name || 'TABLE 01'}
Jam: ${jamText}
Durasi: ${durasiDisplay}${slotBlock}
Jumlah Pemain: ${res.guest_count} Orang
Catatan: ${catatanText}

Mohon informasi untuk proses konfirmasi dan pembayaran.

Terima kasih.`;

  const encoded = encodeURIComponent(message);
  return {
    whatsappUrl: `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`,
    fallbackWhatsappUrl: `https://wa.me/${phone}?text=${encoded}`,
    webWhatsappUrl: `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`,
    formattedMessage: message,
    adminPhone: phone
  };
}

// Local cache helpers
function getLocalReservations(): Reservation[] {
  try {
    const raw = localStorage.getItem(LOCAL_RES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReservation(r: Reservation) {
  try {
    const list = getLocalReservations();
    const updated = [r, ...list.filter(item => item.id !== r.id && item.booking_code !== r.booking_code)];
    localStorage.setItem(LOCAL_RES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[LocalStorage] Save failed:', err);
  }
}

export interface LocalAuthUser {
  id: string;
  username: string;
  email: string;
  role: 'SUPER_ADMIN' | 'OWNER';
  full_name: string;
  is_active: boolean;
  password: string;
  created_at: string;
  updated_at?: string;
}

const LOCAL_AUTH_USERS_KEY = 'epic_mahjong_auth_users_v2';
const LOCAL_CURRENT_USER_KEY = 'epic_mahjong_current_user_v2';

const INITIAL_AUTH_USERS: LocalAuthUser[] = [
  {
    id: 'usr-admin-01',
    username: 'superadmin',
    email: 'admin@epicmahjong.com',
    role: 'SUPER_ADMIN',
    full_name: 'Super Admin Epic Mahjong',
    is_active: true,
    password: 'epicadmin2026',
    created_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-owner-01',
    username: 'owner',
    email: 'owner@epicmahjong.com',
    role: 'OWNER',
    full_name: 'Owner Epic Mahjong',
    is_active: true,
    password: 'epicowner2026',
    created_at: '2026-01-01T00:00:00.000Z'
  }
];

function getLocalAuthUsers(): LocalAuthUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) {}
  try {
    localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(INITIAL_AUTH_USERS));
  } catch (_) {}
  return INITIAL_AUTH_USERS;
}

function saveLocalAuthUsers(users: LocalAuthUser[]) {
  try {
    localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('[LocalStorage] save users failed:', err);
  }
}

export const api = {
  // Token storage
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  // ==========================================
  // REALTIME SYNCHRONIZATION (SUPABASE)
  // ==========================================
  subscribeToReservations(callback: (payload?: any) => void): () => void {
    const channelName = `realtime-reservations-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // 1. Supabase Realtime channel on 'reservations' table
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload: any) => {
          try {
            callback(payload);
          } catch (e) {
            console.warn('[Supabase Realtime] Callback error:', e);
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Terhubung ke publikasi reservations.');
        }
      });

    // 2. Intelligent background polling (12s) to ensure synchronization even if Realtime publication is pending in Dashboard
    const intervalId = setInterval(() => {
      try {
        callback({ eventType: 'POLL' });
      } catch (_) {}
    }, 12000);

    // 3. Tab visibility / device wake sync (triggers when customer unlocks phone or opens tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        try {
          callback({ eventType: 'FOCUS' });
        } catch (_) {}
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    // One-time safe offline migration from old localStorage if any
    this.migrateLocalReservationsOnce().catch(() => {});

    // Clean unsubscribe teardown
    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (_) {}
      clearInterval(intervalId);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  },

  // Safe migration helper for existing localStorage bookings
  async migrateLocalReservationsOnce(): Promise<void> {
    try {
      if (localStorage.getItem(LOCAL_MIGRATED_KEY) === 'done') return;
      const local = getLocalReservations();
      if (!Array.isArray(local) || local.length === 0) {
        localStorage.setItem(LOCAL_MIGRATED_KEY, 'done');
        return;
      }

      // Check which ones already exist in Supabase
      const { data: remote } = await supabase.from('reservations').select('booking_code');
      const existingCodes = new Set((remote || []).map((r: any) => r.booking_code));

      const missing = local.filter(r => r.booking_code && !existingCodes.has(r.booking_code));
      if (missing.length > 0) {
        for (const item of missing) {
          await supabase.from('reservations').insert({
            booking_code: item.booking_code,
            customer_name: item.customer_name,
            customer_phone: item.customer_phone,
            reservation_date: item.reservation_date,
            reservation_time: item.reservation_time,
            session_id: item.session_id || null,
            session_name: item.session_name || null,
            start_time: item.start_time || item.reservation_time,
            end_time: item.end_time || null,
            selected_slots: item.selected_slots || [item.reservation_time],
            duration_hours: item.duration_hours || 1,
            table_id: item.table_id,
            table_name: item.table_name,
            guest_count: item.guest_count || 4,
            notes: item.notes || '',
            status: item.status || 'PENDING'
          });
        }
      }
      localStorage.setItem(LOCAL_MIGRATED_KEY, 'done');
    } catch (e) {
      console.warn('[Migration] Local reservations migration note:', e);
    }
  },

  // ==========================================
  // PUBLIC APIS (CONNECTED TO SUPABASE)
  // ==========================================
  async getSettings(): Promise<BusinessSettings> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data && !error && data.admin_whatsapp) {
        const mapped: BusinessSettings = {
          business_name: data.business_name || DEFAULT_SETTINGS.business_name,
          location: data.location || DEFAULT_SETTINGS.location,
          admin_whatsapp: data.admin_whatsapp || DEFAULT_SETTINGS.admin_whatsapp,
          owner_whatsapp: data.owner_whatsapp || DEFAULT_SETTINGS.owner_whatsapp,
          logo: data.logo || '',
          hero_image: data.hero_image || DEFAULT_SETTINGS.hero_image,
          operating_hours: data.operating_hours || DEFAULT_SETTINGS.operating_hours,
          time_slots: Array.isArray(data.time_slots) ? data.time_slots : DEFAULT_SETTINGS.time_slots,
          updated_at: data.updated_at || new Date().toISOString()
        };
        try {
          localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(mapped));
        } catch (_) {}
        return mapped;
      }
    } catch (err) {
      console.warn('[Supabase] getSettings error:', err);
    }

    try {
      const cached = localStorage.getItem(LOCAL_SETTINGS_KEY);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return DEFAULT_SETTINGS;
  },

  async getTables(): Promise<MahjongTable[]> {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (data && !error && Array.isArray(data) && data.length > 0) {
        return data.map((t: any) => ({
          id: t.id,
          name: t.name,
          capacity: t.capacity || 4,
          description: t.description || '',
          is_active: t.is_active ?? true,
          features: Array.isArray(t.features) ? t.features : [],
          created_at: t.created_at,
          updated_at: t.updated_at
        }));
      }
    } catch (err) {
      console.warn('[Supabase] getTables error:', err);
    }

    return DEFAULT_TABLES;
  },

  async getPublicSessions(): Promise<PlaySession[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('start_time', { ascending: true });

      if (data && !error && Array.isArray(data) && data.length > 0) {
        return data.map((s: any) => ({
          session_id: s.session_id,
          session_name: s.session_name,
          start_time: s.start_time,
          end_time: s.end_time,
          status: s.status,
          created_at: s.created_at,
          updated_at: s.updated_at
        }));
      }
    } catch (err) {
      console.warn('[Supabase] getPublicSessions error:', err);
    }

    return DEFAULT_SESSIONS;
  },

  async getAvailability(date?: string, time?: string): Promise<TableWithAvailability[]> {
    const qDate = date || new Date().toISOString().split('T')[0];
    const qTime = time || '14:00';

    try {
      const [tables, { data: reservations, error }] = await Promise.all([
        this.getTables(),
        supabase
          .from('reservations')
          .select('id, booking_code, table_id, reservation_date, reservation_time, start_time, end_time, selected_slots, status')
          .eq('reservation_date', qDate)
          .in('status', ['PENDING', 'CONFIRMED'])
      ]);

      const resList: Reservation[] = (!error && Array.isArray(reservations)) ? (reservations as any) : getLocalReservations();

      const timeSlotEnd = (() => {
        const startMin = parseTimeToMinutes(qTime);
        const endMin = (startMin + 60) % 1440;
        return `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
      })();

      return tables.map(table => {
        const activeRes = resList.find(r => 
          r.table_id === table.id && 
          r.reservation_date === qDate && 
          reservationOverlapsTime(r, qTime, timeSlotEnd)
        );

        let status: TableAvailabilityStatus = 'AVAILABLE';
        if (activeRes) {
          status = activeRes.status === 'CONFIRMED' ? 'BOOKED' : 'PENDING';
        }

        return {
          ...table,
          status,
          activeReservation: activeRes ? {
            booking_code: activeRes.booking_code,
            status: activeRes.status
          } : undefined
        };
      });
    } catch (err) {
      console.warn('[Supabase] getAvailability fallback:', err);
    }

    return DEFAULT_TABLES.map(t => ({
      ...t,
      status: 'AVAILABLE' as TableAvailabilityStatus
    }));
  },

  // COMPLETE SCHEDULE MATRIX (DYNAMIC FROM SUPABASE)
  async getSchedule(date?: string): Promise<ScheduleSlot[]> {
    const qDate = date || new Date().toISOString().split('T')[0];

    try {
      const [sessions, tables, { data: reservations, error }] = await Promise.all([
        this.getPublicSessions(),
        this.getTables(),
        supabase
          .from('reservations')
          .select('id, booking_code, table_id, reservation_date, reservation_time, start_time, end_time, selected_slots, status')
          .eq('reservation_date', qDate)
          .in('status', ['PENDING', 'CONFIRMED'])
      ]);

      const activeReservations: Reservation[] = (!error && Array.isArray(reservations))
        ? (reservations as any)
        : getLocalReservations().filter(r => r.reservation_date === qDate && (r.status === 'PENDING' || r.status === 'CONFIRMED'));

      const sessionsToUse = sessions.length > 0 ? sessions : DEFAULT_SESSIONS;
      const tablesToUse = tables.length > 0 ? tables : DEFAULT_TABLES;

      return sessionsToUse.map(ses => {
        const tablesInSlot = tablesToUse.map(tbl => {
          const matchingRes = activeReservations.find(r => 
            r.table_id === tbl.id && 
            reservationOverlapsTime(r, ses.start_time, ses.end_time)
          );

          let tblStatus: TableAvailabilityStatus = 'AVAILABLE';
          if (matchingRes) {
            tblStatus = matchingRes.status === 'CONFIRMED' ? 'BOOKED' : 'PENDING';
          }

          return {
            table_id: tbl.id,
            table_name: tbl.name,
            status: tblStatus,
            booking_code: matchingRes?.booking_code
          };
        });

        return {
          time: ses.start_time,
          session_id: ses.session_id,
          session_name: ses.session_name,
          start_time: ses.start_time,
          end_time: ses.end_time,
          tables: tablesInSlot
        };
      });
    } catch (err) {
      console.error('[Supabase] getSchedule error:', err);
      return [];
    }
  },

  // ANTI-DOUBLE BOOKING VALIDATOR
  async checkSlotAvailability(
    tableId: string,
    reservationDate: string,
    candidateSlots: string[],
    excludeReservationId?: string
  ): Promise<boolean> {
    const { data: activeRes, error } = await supabase
      .from('reservations')
      .select('id, table_id, reservation_date, reservation_time, start_time, end_time, selected_slots, status')
      .eq('table_id', tableId)
      .eq('reservation_date', reservationDate)
      .in('status', ['PENDING', 'CONFIRMED']);

    if (error || !Array.isArray(activeRes)) {
      return true; // proceed to insert where constraint or server check applies
    }

    // Check each candidate slot
    for (const candidate of candidateSlots) {
      const parts = candidate.split(/[-–]/).map(p => p.trim());
      if (parts.length >= 2) {
        const [candStart, candEnd] = parts;
        const conflict = activeRes.some(r => {
          if (excludeReservationId && r.id === excludeReservationId) return false;
          return reservationOverlapsTime(r as any, candStart, candEnd);
        });
        if (conflict) {
          return false; // slot is occupied!
        }
      }
    }

    return true;
  },

  // CREATE CUSTOMER RESERVATION (DIRECT TO SUPABASE)
  async createReservation(payload: {
    customer_name: string;
    customer_phone: string;
    reservation_date: string;
    reservation_time: string;
    session_id?: string;
    start_time?: string;
    end_time?: string;
    session_name?: string;
    selected_slots?: string[];
    duration_hours?: number;
    table_id: string;
    guest_count: number;
    notes?: string;
  }): Promise<{
    success: boolean;
    message: string;
    reservation: Reservation;
    whatsappUrl: string;
    fallbackWhatsappUrl?: string;
    webWhatsappUrl?: string;
    formattedMessage?: string;
    adminPhone?: string;
  }> {
    // 1. Normalize slots & times
    let startTime = payload.start_time || payload.reservation_time || '10:00';
    let endTime = payload.end_time;
    let selectedSlots = payload.selected_slots && payload.selected_slots.length > 0
      ? [...payload.selected_slots]
      : [];

    if (selectedSlots.length > 0) {
      selectedSlots.sort((a, b) => {
        const tA = parseTimeToMinutes(a.split(/[-–]/)[0]?.trim() || '');
        const tB = parseTimeToMinutes(b.split(/[-–]/)[0]?.trim() || '');
        return tA - tB;
      });
      const first = selectedSlots[0].split(/[-–]/).map(p => p.trim());
      const last = selectedSlots[selectedSlots.length - 1].split(/[-–]/).map(p => p.trim());
      startTime = first[0] || startTime;
      endTime = last[1] || endTime;
    }

    if (!endTime) {
      const sMin = parseTimeToMinutes(startTime);
      const eMin = (sMin + 60) % 1440;
      endTime = `${String(Math.floor(eMin / 60)).padStart(2, '0')}:${String(eMin % 60).padStart(2, '0')}`;
    }

    if (selectedSlots.length === 0) {
      selectedSlots = [`${startTime}–${endTime}`];
    }

    const durationHours = payload.duration_hours || selectedSlots.length || 1;
    const sessionName = payload.session_name || `${durationHours} Jam Bermain`;

    // 2. Strict Anti-Double Booking Check against Supabase
    const isAvailable = await this.checkSlotAvailability(
      payload.table_id,
      payload.reservation_date,
      selectedSlots
    );

    if (!isAvailable) {
      throw new Error('Maaf, salah satu slot jam yang dipilih baru saja dipesan oleh customer lain. Silakan pilih slot jam atau meja lainnya.');
    }

    // 3. Resolve table name
    const tables = await this.getTables();
    const table = tables.find(t => t.id === payload.table_id);
    const tableName = table ? table.name : (payload.table_id.toUpperCase());

    // 4. Generate unique Booking ID
    const dateDigits = payload.reservation_date.replace(/[^0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `EM-${dateDigits}-${randomSuffix}`;

    const reservationPayload = {
      booking_code: bookingCode,
      customer_name: payload.customer_name.trim(),
      customer_phone: payload.customer_phone.trim(),
      reservation_date: payload.reservation_date,
      reservation_time: startTime,
      session_id: payload.session_id || null,
      session_name: sessionName,
      start_time: startTime,
      end_time: endTime,
      selected_slots: selectedSlots,
      duration_hours: durationHours,
      table_id: payload.table_id,
      table_name: tableName,
      guest_count: Number(payload.guest_count) || 4,
      notes: (payload.notes || '').trim(),
      status: 'PENDING' as ReservationStatus
    };

    // 5. Insert directly into Supabase
    const { data: inserted, error: insertError } = await supabase
      .from('reservations')
      .insert(reservationPayload)
      .select()
      .single();

    if (insertError) {
      console.error('[Supabase] Insert reservation error:', insertError);
      throw new Error(`Gagal menyimpan booking ke database: ${insertError.message}`);
    }

    const savedReservation: Reservation = {
      ...inserted,
      selected_slots: Array.isArray(inserted.selected_slots) ? inserted.selected_slots : selectedSlots
    };

    // Save local copy for offline cache
    saveLocalReservation(savedReservation);

    // 6. Generate WhatsApp Links
    const settings = await this.getSettings();
    const waLinks = buildWhatsAppLinks(settings.admin_whatsapp, {
      booking_code: savedReservation.booking_code,
      customer_name: savedReservation.customer_name,
      customer_phone: savedReservation.customer_phone,
      reservation_date: savedReservation.reservation_date,
      reservation_time: savedReservation.reservation_time,
      start_time: savedReservation.start_time,
      end_time: savedReservation.end_time,
      selected_slots: savedReservation.selected_slots,
      duration_hours: savedReservation.duration_hours,
      table_name: savedReservation.table_name || tableName,
      guest_count: savedReservation.guest_count,
      notes: savedReservation.notes
    });

    return {
      success: true,
      message: 'Booking berhasil dibuat dan tersimpan di database.',
      reservation: savedReservation,
      whatsappUrl: waLinks.whatsappUrl,
      fallbackWhatsappUrl: waLinks.fallbackWhatsappUrl,
      webWhatsappUrl: waLinks.webWhatsappUrl,
      formattedMessage: waLinks.formattedMessage,
      adminPhone: waLinks.adminPhone
    };
  },

  // ==========================================
  // AUTH APIS
  // ==========================================
  async login(usernameOrEmail: string, password: string): Promise<{
    success: boolean;
    token: string;
    user: UserProfile;
  }> {
    const cleanU = String(usernameOrEmail || '').trim().toLowerCase();
    const cleanP = String(password || '').trim();

    if (!cleanU || !cleanP) {
      throw new Error('Username/Email dan Password wajib diisi.');
    }

    // Check credentials against static / seeded list (supports superadmin and owner)
    const users = getLocalAuthUsers();
    const matched = users.find(
      u => u.username.toLowerCase() === cleanU || u.email.toLowerCase() === cleanU
    );

    if (!matched) {
      throw new Error('Username atau password salah.');
    }

    if (matched.is_active === false) {
      throw new Error('Akun Anda telah dinonaktifkan oleh Administrator. Silakan hubungi Super Admin.');
    }

    if (matched.password !== cleanP) {
      throw new Error('Username atau password salah.');
    }

    const token = `epic_token_${matched.role.toLowerCase()}_${Date.now()}`;
    const userProfile: UserProfile = {
      id: matched.id,
      username: matched.username,
      email: matched.email,
      role: matched.role,
      full_name: matched.full_name,
      is_active: matched.is_active,
      created_at: matched.created_at
    };

    this.setToken(token);
    try {
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(userProfile));
    } catch (_) {}

    return {
      success: true,
      token,
      user: userProfile
    };
  },

  async getMe(): Promise<{ user: UserProfile }> {
    const raw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u && u.id && u.role) return { user: u };
      } catch (_) {}
    }
    throw new Error('Unauthorized');
  },

  logout() {
    this.removeToken();
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const data = await this.getMe();
      return data.user;
    } catch {
      this.removeToken();
      return null;
    }
  },

  async changePassword(oldPassword: string, newPassword: string, confirmPassword?: string): Promise<{ success: boolean; message: string }> {
    if (!oldPassword || !newPassword) {
      throw new Error('Password lama dan password baru wajib diisi.');
    }
    if (newPassword.length < 8) {
      throw new Error('Password baru minimal 8 karakter.');
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      throw new Error('Password baru dan konfirmasi password tidak sama.');
    }

    const current = await this.getCurrentUser();
    if (!current) throw new Error('Unauthorized');
    const users = getLocalAuthUsers();
    const target = users.find(u => u.id === current.id);
    if (!target) throw new Error('Pengguna tidak ditemukan.');
    if (target.password !== oldPassword) {
      throw new Error('Password lama tidak cocok.');
    }
    target.password = newPassword;
    target.updated_at = new Date().toISOString();
    saveLocalAuthUsers(users);
    return { success: true, message: 'Password berhasil diperbarui.' };
  },

  // ==========================================
  // ADMIN APIS (DIRECT TO SUPABASE)
  // ==========================================
  async getStats(): Promise<{
    today_bookings_count: number;
    pending_count: number;
    confirmed_count: number;
    completed_count: number;
    cancelled_count: number;
    today_reservations: Reservation[];
  }> {
    const today = new Date().toISOString().split('T')[0];
    const reservations = await this.getReservations();

    const todayRes = reservations.filter(r => r.reservation_date === today);

    return {
      today_bookings_count: todayRes.length,
      pending_count: reservations.filter(r => r.status === 'PENDING').length,
      confirmed_count: reservations.filter(r => r.status === 'CONFIRMED').length,
      completed_count: reservations.filter(r => r.status === 'COMPLETED').length,
      cancelled_count: reservations.filter(r => r.status === 'CANCELLED').length,
      today_reservations: todayRes.sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
    };
  },

  async getReservations(filters?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    tableId?: string;
    status?: string;
    search?: string;
  }): Promise<Reservation[]> {
    try {
      let query = supabase
        .from('reservations')
        .select('*');

      if (filters?.date) {
        query = query.eq('reservation_date', filters.date);
      }
      if (filters?.startDate) {
        query = query.gte('reservation_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('reservation_date', filters.endDate);
      }
      if (filters?.tableId && filters.tableId !== 'ALL') {
        query = query.eq('table_id', filters.tableId);
      }
      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }

      query = query
        .order('reservation_date', { ascending: false })
        .order('reservation_time', { ascending: false })
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (!error && Array.isArray(data)) {
        let list: Reservation[] = data.map((r: any) => ({
          ...r,
          selected_slots: Array.isArray(r.selected_slots) ? r.selected_slots : (r.selected_slots ? [r.selected_slots] : [])
        }));

        if (filters?.search) {
          const s = filters.search.toLowerCase();
          list = list.filter(
            r => r.customer_name?.toLowerCase().includes(s) ||
                 r.customer_phone?.includes(s) ||
                 r.booking_code?.toLowerCase().includes(s) ||
                 (r.table_name && r.table_name.toLowerCase().includes(s))
          );
        }

        return list;
      }
    } catch (err) {
      console.warn('[Supabase] getReservations error, checking local fallback:', err);
    }

    return getLocalReservations();
  },

  async createManualReservation(payload: {
    customer_name: string;
    customer_phone: string;
    reservation_date: string;
    reservation_time: string;
    session_id?: string;
    start_time?: string;
    end_time?: string;
    session_name?: string;
    selected_slots?: string[];
    duration_hours?: number;
    table_id: string;
    guest_count: number;
    notes?: string;
    status?: ReservationStatus;
  }): Promise<{ success: boolean; reservation: Reservation }> {
    // 1. Normalize slots
    const selectedSlots = payload.selected_slots && payload.selected_slots.length > 0
      ? payload.selected_slots
      : [`${payload.reservation_time}–${payload.end_time || '11:00'}`];

    // 2. Strict Anti-Double Booking Check against Supabase
    const isAvailable = await this.checkSlotAvailability(
      payload.table_id,
      payload.reservation_date,
      selectedSlots
    );

    if (!isAvailable) {
      throw new Error('Konflik Jadwal: Meja ini sudah terisi oleh reservasi lain pada slot waktu yang dipilih.');
    }

    // 3. Resolve table name
    const tables = await this.getTables();
    const table = tables.find(t => t.id === payload.table_id);
    const tableName = table ? table.name : payload.table_id;

    // 4. Generate booking code
    const dateDigits = payload.reservation_date.replace(/[^0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `EM-${dateDigits}-${randomSuffix}`;

    const reservationPayload = {
      booking_code: bookingCode,
      customer_name: payload.customer_name.trim(),
      customer_phone: payload.customer_phone.trim(),
      reservation_date: payload.reservation_date,
      reservation_time: payload.reservation_time,
      session_id: payload.session_id || null,
      session_name: payload.session_name || `${selectedSlots.length} Jam Bermain`,
      start_time: payload.start_time || payload.reservation_time,
      end_time: payload.end_time || null,
      selected_slots: selectedSlots,
      duration_hours: payload.duration_hours || selectedSlots.length || 1,
      table_id: payload.table_id,
      table_name: tableName,
      guest_count: payload.guest_count,
      notes: payload.notes || '',
      status: payload.status || 'CONFIRMED'
    };

    const { data: inserted, error } = await supabase
      .from('reservations')
      .insert(reservationPayload)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] createManualReservation error:', error);
      throw new Error(`Gagal menyimpan booking manual: ${error.message}`);
    }

    const saved: Reservation = {
      ...inserted,
      selected_slots: Array.isArray(inserted.selected_slots) ? inserted.selected_slots : selectedSlots
    };

    saveLocalReservation(saved);
    return { success: true, reservation: saved };
  },

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<{ success: boolean; reservation: Reservation }> {
    // 1. Fetch current reservation details
    const { data: currentRes, error: fetchErr } = await supabase
      .from('reservations')
      .select('*')
      .or(`id.eq.${id},booking_code.eq.${id}`)
      .single();

    if (fetchErr || !currentRes) {
      throw new Error('Reservasi tidak ditemukan.');
    }

    // 2. If confirming or setting to pending, verify no overlap
    if (status === 'PENDING' || status === 'CONFIRMED') {
      const slots = Array.isArray(currentRes.selected_slots) && currentRes.selected_slots.length > 0
        ? currentRes.selected_slots
        : [`${currentRes.reservation_time}–${currentRes.end_time || '11:00'}`];

      const isAvailable = await this.checkSlotAvailability(
        currentRes.table_id,
        currentRes.reservation_date,
        slots,
        currentRes.id
      );

      if (!isAvailable) {
        throw new Error('Konflik Jadwal: Meja ini sudah ditempati oleh reservasi aktif lain pada jam tersebut.');
      }
    }

    // 3. Update status in Supabase
    const { data: updated, error: updateErr } = await supabase
      .from('reservations')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .or(`id.eq.${id},booking_code.eq.${id}`)
      .select()
      .single();

    if (updateErr) {
      throw new Error(`Gagal mengubah status reservasi: ${updateErr.message}`);
    }

    saveLocalReservation(updated);
    return { success: true, reservation: updated };
  },

  async deleteReservation(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .or(`id.eq.${id},booking_code.eq.${id}`);

    if (error) {
      throw new Error(`Gagal menghapus reservasi: ${error.message}`);
    }

    const list = getLocalReservations().filter(r => r.id !== id && r.booking_code !== id);
    localStorage.setItem(LOCAL_RES_KEY, JSON.stringify(list));
    return { success: true, message: 'Reservasi berhasil dihapus.' };
  },

  async getAdminTables(): Promise<MahjongTable[]> {
    return this.getTables();
  },

  async createTable(payload: Partial<MahjongTable>): Promise<{ success: boolean; table: MahjongTable }> {
    const newId = `tbl-${Date.now().toString().slice(-4)}`;
    const { data, error } = await supabase
      .from('tables')
      .insert({
        id: newId,
        name: payload.name || 'NEW TABLE',
        capacity: payload.capacity || 4,
        description: payload.description || '',
        is_active: payload.is_active ?? true,
        features: payload.features || []
      })
      .select()
      .single();

    if (!error && data) return { success: true, table: data };
    return {
      success: true,
      table: {
        id: newId,
        name: payload.name || 'NEW TABLE',
        capacity: payload.capacity || 4,
        description: payload.description || '',
        is_active: payload.is_active ?? true,
        features: payload.features || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  },

  async updateTable(id: string, payload: Partial<MahjongTable>): Promise<{ success: boolean; table: MahjongTable }> {
    const { data, error } = await supabase
      .from('tables')
      .update({
        name: payload.name,
        capacity: payload.capacity,
        description: payload.description,
        is_active: payload.is_active,
        features: payload.features,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) return { success: true, table: data };
    return {
      success: true,
      table: {
        id,
        name: payload.name || id,
        capacity: payload.capacity || 4,
        description: payload.description || '',
        is_active: payload.is_active ?? true,
        features: payload.features || [],
        updated_at: new Date().toISOString()
      }
    };
  },

  async deleteTable(id: string): Promise<{ success: boolean }> {
    await supabase.from('tables').delete().eq('id', id);
    return { success: true };
  },

  async getUsers(): Promise<UserProfile[]> {
    return getLocalAuthUsers().map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      full_name: u.full_name,
      is_active: u.is_active,
      created_at: u.created_at,
      updated_at: u.updated_at
    }));
  },

  async createOwner(payload: { username: string; email: string; password: string; full_name: string }): Promise<{ success: boolean; user: UserProfile }> {
    const users = getLocalAuthUsers();
    const newUser: LocalAuthUser = {
      id: `usr-owner-${Date.now()}`,
      username: payload.username.trim(),
      email: payload.email.trim(),
      role: 'OWNER',
      full_name: payload.full_name.trim(),
      is_active: true,
      password: payload.password,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    saveLocalAuthUsers(users);
    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        full_name: newUser.full_name,
        is_active: newUser.is_active,
        created_at: newUser.created_at
      }
    };
  },

  async createOwnerUser(payload: { username: string; email: string; password: string; full_name: string }): Promise<{ success: boolean; user: UserProfile }> {
    return this.createOwner(payload);
  },

  async updateOwnerUser(id: string, payload: { username?: string; email?: string; full_name?: string; is_active?: boolean }): Promise<{ success: boolean; user: UserProfile; message: string }> {
    const users = getLocalAuthUsers();
    const target = users.find(u => u.id === id);
    if (!target) throw new Error('Pengguna tidak ditemukan.');
    if (payload.username) target.username = payload.username.trim();
    if (payload.email) target.email = payload.email.trim();
    if (payload.full_name) target.full_name = payload.full_name.trim();
    if (payload.is_active !== undefined) target.is_active = payload.is_active;
    target.updated_at = new Date().toISOString();
    saveLocalAuthUsers(users);
    return {
      success: true,
      user: {
        id: target.id,
        username: target.username,
        email: target.email,
        role: target.role,
        full_name: target.full_name,
        is_active: target.is_active,
        created_at: target.created_at
      },
      message: 'Data pengguna berhasil diperbarui.'
    };
  },

  async resetOwnerPassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const users = getLocalAuthUsers();
    const target = users.find(u => u.id === id);
    if (!target) throw new Error('Pengguna tidak ditemukan.');
    target.password = newPassword;
    target.updated_at = new Date().toISOString();
    saveLocalAuthUsers(users);
    return { success: true, message: 'Password Owner berhasil direset.' };
  },

  async toggleOwnerStatus(id: string, is_active: boolean): Promise<{ success: boolean; user: UserProfile; message: string }> {
    const users = getLocalAuthUsers();
    const target = users.find(u => u.id === id);
    if (!target) throw new Error('Pengguna tidak ditemukan.');
    target.is_active = is_active;
    target.updated_at = new Date().toISOString();
    saveLocalAuthUsers(users);
    return {
      success: true,
      user: {
        id: target.id,
        username: target.username,
        email: target.email,
        role: target.role,
        full_name: target.full_name,
        is_active: target.is_active,
        created_at: target.created_at
      },
      message: is_active ? 'Akun Owner berhasil diaktifkan.' : 'Akun Owner berhasil dinonaktifkan.'
    };
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const users = getLocalAuthUsers();
    const filtered = users.filter(u => u.id !== id);
    saveLocalAuthUsers(filtered);
    return { success: true };
  },

  // SESSIONS
  async getSessions(activeOnly = false): Promise<PlaySession[]> {
    try {
      let query = supabase.from('sessions').select('*').order('start_time', { ascending: true });
      if (activeOnly) {
        query = query.eq('status', 'ACTIVE');
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (_) {}
    return activeOnly ? DEFAULT_SESSIONS.filter(s => s.status === 'ACTIVE') : DEFAULT_SESSIONS;
  },

  async createSession(payload: {
    session_name: string;
    start_time: string;
    end_time: string;
    status?: SessionStatus;
  }): Promise<PlaySession> {
    const newSessionId = `ses-${Date.now().toString().slice(-5)}`;
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        session_id: newSessionId,
        session_name: payload.session_name,
        start_time: payload.start_time,
        end_time: payload.end_time,
        status: payload.status || 'ACTIVE'
      })
      .select()
      .single();

    if (!error && data) return data;
    return {
      session_id: newSessionId,
      session_name: payload.session_name,
      start_time: payload.start_time,
      end_time: payload.end_time,
      status: payload.status || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  async updateSession(id: string, payload: Partial<PlaySession>): Promise<PlaySession> {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', id)
      .select()
      .single();

    if (!error && data) return data;
    throw new Error('Gagal memperbarui sesi.');
  },

  async toggleSessionStatus(id: string, status: SessionStatus): Promise<PlaySession> {
    return this.updateSession(id, { status });
  },

  async deleteSession(id: string): Promise<{ success: boolean; deactivated?: boolean; message: string }> {
    const { error } = await supabase.from('sessions').delete().eq('session_id', id);
    if (!error) {
      return { success: true, message: 'Sesi berhasil dihapus.' };
    }
    return { success: false, message: error.message };
  },

  async batchSetSessions(newSessions: Array<{ session_name: string; start_time: string; end_time: string; status?: SessionStatus }>): Promise<PlaySession[]> {
    if (!Array.isArray(newSessions) || newSessions.length === 0) {
      throw new Error('Daftar sesi tidak boleh kosong.');
    }

    const toInsert = newSessions.map((s, idx) => ({
      session_id: `ses-${Date.now()}-${idx + 1}`,
      session_name: s.session_name.trim() || `Sesi ${idx + 1}`,
      start_time: s.start_time,
      end_time: s.end_time,
      status: s.status || 'ACTIVE'
    }));

    const { data, error } = await supabase.from('sessions').insert(toInsert).select();
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return toInsert.map(s => ({
      ...s,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  },

  async updateSettings(payload: Partial<BusinessSettings>): Promise<{ success: boolean; settings: BusinessSettings }> {
    const { data, error } = await supabase
      .from('settings')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (!error && data) {
      return { success: true, settings: data };
    }
    return { success: true, settings: DEFAULT_SETTINGS };
  }
};
