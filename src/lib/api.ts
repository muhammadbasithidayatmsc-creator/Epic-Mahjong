import {
  BusinessSettings,
  MahjongTable,
  Reservation,
  TableWithAvailability,
  TableAvailabilityStatus,
  ScheduleSlot,
  UserProfile,
  ReservationStatus
} from '../types';

const TOKEN_KEY = 'epic_mahjong_token';
const LOCAL_RES_KEY = 'epic_mahjong_client_reservations';
const LOCAL_SETTINGS_KEY = 'epic_mahjong_client_settings';

export const DEFAULT_SETTINGS: BusinessSettings = {
  business_name: 'EPIC MAHJONG',
  location: 'Alam Sutera',
  admin_whatsapp: '085181959275',
  owner_whatsapp: '08159804100',
  logo: '',
  hero_image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1600&q=80',
  operating_hours: '10:00 - 02:00 WIB',
  time_slots: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'],
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
  if (timeStr.includes('-')) return timeStr;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const hour = parseInt(match[1], 10);
    const min = match[2];
    const endHour = (hour + 2) % 24;
    const startStr = `${String(hour).padStart(2, '0')}:${min}`;
    const endStr = `${String(endHour).padStart(2, '0')}:${min}`;
    return `${startStr} - ${endStr}`;
  }
  return timeStr;
}

// Helper: generate formatted WhatsApp details for Super Admin
export function buildWhatsAppLinks(adminPhoneInput: string, res: {
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
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
  const formattedTime = formatSlotTime(res.reservation_time);

  const message = 
`Halo EPIC MAHJONG,

Saya ingin melakukan reservasi meja.

Booking ID: ${res.booking_code}
Nama: ${res.customer_name}
No. WhatsApp: ${res.customer_phone}
Tanggal: ${formattedDate}
Jam: ${formattedTime}
Meja: ${res.table_name}
Jumlah orang: ${res.guest_count}
Catatan: ${res.notes && res.notes.trim() ? res.notes.trim() : '-'}

Mohon informasi terkait pembayaran dan konfirmasi reservasi.

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

// Local Storage helpers for client-side persistence (Vercel static support)
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
    const updated = [r, ...list.filter(item => item.id !== r.id)];
    localStorage.setItem(LOCAL_RES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[LocalStorage] Save failed:', err);
  }
}

// Safe fetch wrapper that handles HTML 404s (e.g. on Vercel) without JSON parse error
async function safeFetch(url: string, options?: RequestInit): Promise<{
  ok: boolean;
  status: number;
  data: any;
  isJson: boolean;
}> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const data = await res.json();
        return { ok: res.ok, status: res.status, data, isJson: true };
      } catch (e: any) {
        return { ok: false, status: res.status, data: { error: 'Invalid JSON response' }, isJson: false };
      }
    }
    // Response is HTML or plain text (e.g. 404 page on Vercel)
    const text = await res.text();
    return { ok: false, status: res.status, data: { error: text || res.statusText }, isJson: false };
  } catch (err: any) {
    // Network error / unreachable
    return { ok: false, status: 0, data: { error: err?.message || 'Network error' }, isJson: false };
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

  // PUBLIC APIS
  async getSettings(): Promise<BusinessSettings> {
    const res = await safeFetch('/api/public/settings');
    if (res.ok && res.isJson && res.data?.admin_whatsapp) {
      try {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(res.data));
      } catch (_) {}
      return res.data;
    }
    // Fallback to locally stored settings or default settings
    try {
      const cached = localStorage.getItem(LOCAL_SETTINGS_KEY);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return DEFAULT_SETTINGS;
  },

  async getTables(): Promise<MahjongTable[]> {
    const res = await safeFetch('/api/public/tables');
    if (res.ok && res.isJson && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return DEFAULT_TABLES;
  },

  async getAvailability(date?: string, time?: string): Promise<TableWithAvailability[]> {
    const qDate = date || new Date().toISOString().split('T')[0];
    const qTime = time || '14:00';
    const res = await safeFetch(`/api/public/availability?date=${encodeURIComponent(qDate)}&time=${encodeURIComponent(qTime)}`);

    if (res.ok && res.isJson && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }

    // Fallback: Compute availability from DEFAULT_TABLES and local reservations
    const localReservations = getLocalReservations();
    return DEFAULT_TABLES.map(t => {
      const activeRes = localReservations.find(
        r => r.table_id === t.id &&
             r.reservation_date === qDate &&
             r.reservation_time === qTime &&
             (r.status === 'PENDING' || r.status === 'CONFIRMED')
      );
      let status: TableAvailabilityStatus = 'AVAILABLE';
      if (activeRes) {
        if (activeRes.status === 'PENDING') status = 'PENDING';
        else if (activeRes.status === 'CONFIRMED') status = 'BOOKED';
      }
      return {
        ...t,
        status,
        current_reservation: activeRes
      };
    });
  },

  async getSchedule(date?: string): Promise<ScheduleSlot[]> {
    const qDate = date || new Date().toISOString().split('T')[0];
    const res = await safeFetch(`/api/public/schedule?date=${encodeURIComponent(qDate)}`);

    if (res.ok && res.isJson && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }

    // Fallback: Generate full schedule matrix for all 8 time slots and all 5 tables
    const timeSlots = DEFAULT_SETTINGS.time_slots;
    const localReservations = getLocalReservations().filter(
      r => r.reservation_date === qDate && (r.status === 'PENDING' || r.status === 'CONFIRMED')
    );

    const slots: ScheduleSlot[] = timeSlots.map(tSlot => {
      return {
        time: tSlot,
        tables: DEFAULT_TABLES.map(tbl => {
          const matchingRes = localReservations.find(
            r => r.table_id === tbl.id && r.reservation_time === tSlot
          );
          let tblStatus: TableAvailabilityStatus = 'AVAILABLE';
          if (matchingRes) {
            if (matchingRes.status === 'PENDING') tblStatus = 'PENDING';
            else if (matchingRes.status === 'CONFIRMED') tblStatus = 'BOOKED';
          }
          return {
            table_id: tbl.id,
            table_name: tbl.name,
            status: tblStatus,
            reservation_id: matchingRes?.id,
            customer_name: matchingRes ? matchingRes.customer_name : undefined
          };
        })
      };
    });

    return slots;
  },

  async createReservation(payload: {
    customer_name: string;
    customer_phone: string;
    reservation_date: string;
    reservation_time: string;
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
    // Attempt backend first
    const res = await safeFetch('/api/public/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok && res.isJson && res.data?.success) {
      if (res.data.reservation) {
        saveLocalReservation(res.data.reservation);
      }
      return res.data;
    }

    // If backend returns an explicit JSON error (e.g. double booking validation)
    if (res.isJson && res.data?.error && (res.status === 400 || res.status === 409)) {
      // If table is already booked on backend, throw the message
      throw new Error(res.data.error);
    }

    // FALLBACK for static environments (e.g., Vercel static deployment or offline server)
    // Validate anti-double booking locally first
    const localReservations = getLocalReservations();
    const isOccupiedLocally = localReservations.some(
      r => r.table_id === payload.table_id &&
           r.reservation_date === payload.reservation_date &&
           r.reservation_time === payload.reservation_time &&
           (r.status === 'PENDING' || r.status === 'CONFIRMED')
    );
    if (isOccupiedLocally) {
      throw new Error('Maaf, meja ini baru saja dipesan oleh customer lain. Silakan pilih meja atau waktu lainnya.');
    }

    const targetTable = DEFAULT_TABLES.find(t => t.id === payload.table_id) || {
      id: payload.table_id,
      name: payload.table_id.toUpperCase()
    };

    const dateDigits = (payload.reservation_date || '').replace(/[^0-9]/g, '') || '20260907';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `EM-${dateDigits}-${randomSuffix}`;
    const reservationId = `res-client-${Date.now()}-${randomSuffix}`;

    const localReservation: Reservation = {
      id: reservationId,
      booking_code: bookingCode,
      table_id: payload.table_id,
      table_name: targetTable.name,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      reservation_date: payload.reservation_date,
      reservation_time: payload.reservation_time,
      guest_count: payload.guest_count,
      notes: payload.notes || '',
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    saveLocalReservation(localReservation);

    const waLinks = buildWhatsAppLinks('085181959275', {
      booking_code: bookingCode,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      reservation_date: payload.reservation_date,
      reservation_time: payload.reservation_time,
      table_name: targetTable.name,
      guest_count: payload.guest_count,
      notes: payload.notes
    });

    return {
      success: true,
      message: 'Booking berhasil dibuat. Silakan hubungi WhatsApp Admin untuk konfirmasi.',
      reservation: localReservation,
      whatsappUrl: waLinks.whatsappUrl,
      fallbackWhatsappUrl: waLinks.fallbackWhatsappUrl,
      webWhatsappUrl: waLinks.webWhatsappUrl,
      formattedMessage: waLinks.formattedMessage,
      adminPhone: waLinks.adminPhone
    };
  },

  // AUTH APIS
  async login(usernameOrEmail: string, password: string): Promise<{
    success: boolean;
    token: string;
    user: UserProfile;
  }> {
    const cleanU = String(usernameOrEmail || '').trim();
    const cleanP = String(password || '').trim();

    if (!cleanU || !cleanP) {
      throw new Error('Username/Email dan Password wajib diisi.');
    }

    // 1. Try real server API first
    const res = await safeFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: cleanU, password: cleanP })
    });

    if (res.isJson) {
      if (res.ok && res.data?.token && res.data?.user) {
        this.setToken(res.data.token);
        try {
          localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(res.data.user));
        } catch (_) {}
        return res.data;
      }
      // If server returned a specific JSON error (status 400 or 401 with message)
      if (res.data?.error) {
        throw new Error(res.data.error);
      }
    }

    // 2. Static host fallback (e.g. Vercel SPA where /api/* is rewritten to /index.html)
    const users = getLocalAuthUsers();
    const lowerInput = cleanU.toLowerCase();
    const matched = users.find(
      u => u.username.toLowerCase() === lowerInput || u.email.toLowerCase() === lowerInput
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

    const token = `static_jwt_${matched.role.toLowerCase()}_${Date.now()}`;
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
    const res = await safeFetch('/api/auth/me', {
      headers: this.getAuthHeaders()
    });
    if (res.ok && res.isJson && res.data?.user) {
      return res.data;
    }
    // Fallback on static hosting
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
    localStorage.removeItem('epic_mahjong_demo_user');
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const data = await this.getMe();
      return data.user;
    } catch {
      const raw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
      if (raw) {
        try {
          const u = JSON.parse(raw);
          if (u && u.id && u.role) return u;
        } catch (_) {}
      }
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

    const res = await safeFetch('/api/auth/change-password', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
    });
    if (res.isJson) {
      if (res.ok && res.data?.message) return res.data;
      if (res.data?.error) throw new Error(res.data.error);
    }

    // Static fallback
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

  // ADMIN APIS
  async getStats(): Promise<{
    today_bookings_count: number;
    pending_count: number;
    confirmed_count: number;
    completed_count: number;
    cancelled_count: number;
    today_reservations: Reservation[];
  }> {
    const res = await safeFetch('/api/admin/stats', {
      headers: this.getAuthHeaders()
    });
    if (res.ok && res.isJson && res.data) {
      return res.data;
    }
    // Fallback from local reservations
    const reservations = getLocalReservations();
    const today = new Date().toISOString().split('T')[0];
    const todayRes = reservations.filter(r => r.reservation_date === today);

    return {
      today_bookings_count: todayRes.length,
      pending_count: reservations.filter(r => r.status === 'PENDING').length,
      confirmed_count: reservations.filter(r => r.status === 'CONFIRMED').length,
      completed_count: reservations.filter(r => r.status === 'COMPLETED').length,
      cancelled_count: reservations.filter(r => r.status === 'CANCELLED').length,
      today_reservations: todayRes
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
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.tableId && filters.tableId !== 'ALL') params.append('tableId', filters.tableId);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const res = await safeFetch(`/api/admin/reservations?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });
    if (res.ok && res.isJson && Array.isArray(res.data)) {
      return res.data;
    }

    // Fallback from local
    let list = getLocalReservations();
    if (filters?.date) {
      list = list.filter(r => r.reservation_date === filters.date);
    }
    if (filters?.startDate) {
      list = list.filter(r => r.reservation_date >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter(r => r.reservation_date <= filters.endDate!);
    }
    if (filters?.tableId && filters.tableId !== 'ALL') {
      list = list.filter(r => r.table_id === filters.tableId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        r => r.customer_name.toLowerCase().includes(s) ||
             r.customer_phone.includes(s) ||
             r.booking_code.toLowerCase().includes(s) ||
             (r.table_name && r.table_name.toLowerCase().includes(s))
      );
    }
    return list;
  },

  async createManualReservation(payload: {
    customer_name: string;
    customer_phone: string;
    reservation_date: string;
    reservation_time: string;
    table_id: string;
    guest_count: number;
    notes?: string;
    status?: ReservationStatus;
  }): Promise<{ success: boolean; reservation: Reservation }> {
    const res = await safeFetch('/api/admin/reservations', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok && res.isJson && res.data?.reservation) {
      saveLocalReservation(res.data.reservation);
      return res.data;
    }

    const targetTable = DEFAULT_TABLES.find(t => t.id === payload.table_id);
    const dateDigits = (payload.reservation_date || '').replace(/[^0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const manualRes: Reservation = {
      id: `manual-${Date.now()}`,
      booking_code: `EM-${dateDigits}-${randomSuffix}`,
      table_id: payload.table_id,
      table_name: targetTable ? targetTable.name : payload.table_id,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      reservation_date: payload.reservation_date,
      reservation_time: payload.reservation_time,
      guest_count: payload.guest_count,
      notes: payload.notes || '',
      status: payload.status || 'CONFIRMED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    saveLocalReservation(manualRes);
    return { success: true, reservation: manualRes };
  },

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<{ success: boolean; reservation: Reservation }> {
    const res = await safeFetch(`/api/admin/reservations/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (res.ok && res.isJson && res.data?.reservation) {
      saveLocalReservation(res.data.reservation);
      return res.data;
    }

    const list = getLocalReservations();
    const target = list.find(r => r.id === id);
    if (!target) throw new Error('Reservasi tidak ditemukan.');
    target.status = status;
    target.updated_at = new Date().toISOString();
    saveLocalReservation(target);
    return { success: true, reservation: target };
  },

  async deleteReservation(id: string): Promise<{ success: boolean; message: string }> {
    const res = await safeFetch(`/api/admin/reservations/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (res.ok && res.isJson) {
      return res.data;
    }
    const list = getLocalReservations().filter(r => r.id !== id);
    localStorage.setItem(LOCAL_RES_KEY, JSON.stringify(list));
    return { success: true, message: 'Reservasi dihapus' };
  },

  async getAdminTables(): Promise<MahjongTable[]> {
    const res = await safeFetch('/api/admin/tables', {
      headers: this.getAuthHeaders()
    });
    if (res.ok && res.isJson && Array.isArray(res.data)) {
      return res.data;
    }
    return DEFAULT_TABLES;
  },

  async createTable(payload: Partial<MahjongTable>): Promise<{ success: boolean; table: MahjongTable }> {
    const res = await safeFetch('/api/admin/tables', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok && res.isJson && res.data?.table) return res.data;
    const newT: MahjongTable = {
      id: `tbl-${Date.now()}`,
      name: payload.name || 'NEW TABLE',
      capacity: payload.capacity || 4,
      description: payload.description || '',
      is_active: payload.is_active ?? true,
      features: payload.features || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return { success: true, table: newT };
  },

  async updateTable(id: string, payload: Partial<MahjongTable>): Promise<{ success: boolean; table: MahjongTable }> {
    const res = await safeFetch(`/api/admin/tables/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok && res.isJson && res.data?.table) return res.data;
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
    const res = await safeFetch(`/api/admin/tables/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return { success: true };
  },

  async getUsers(): Promise<UserProfile[]> {
    const res = await safeFetch('/api/admin/users', {
      headers: this.getAuthHeaders()
    });
    if (res.ok && res.isJson && Array.isArray(res.data)) {
      return res.data;
    }
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
    const res = await safeFetch('/api/admin/users', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok && res.isJson && res.data?.user) return res.data;
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
    const res = await safeFetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok && res.isJson && res.data?.user) return res.data;
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
    const res = await safeFetch(`/api/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });
    if (res.ok && res.isJson && res.data?.message) return res.data;
    const users = getLocalAuthUsers();
    const target = users.find(u => u.id === id);
    if (!target) throw new Error('Pengguna tidak ditemukan.');
    target.password = newPassword;
    target.updated_at = new Date().toISOString();
    saveLocalAuthUsers(users);
    return { success: true, message: 'Password Owner berhasil direset.' };
  },

  async toggleOwnerStatus(id: string, is_active: boolean): Promise<{ success: boolean; user: UserProfile; message: string }> {
    const res = await safeFetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_active })
    });
    if (res.ok && res.isJson && res.data?.user) return res.data;
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
    const res = await safeFetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (res.ok) return { success: true };
    const users = getLocalAuthUsers();
    const filtered = users.filter(u => u.id !== id);
    saveLocalAuthUsers(filtered);
    return { success: true };
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<{ success: boolean; settings: BusinessSettings }> {
    const res = await safeFetch('/api/admin/settings', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    if (res.ok && res.isJson && res.data?.settings) {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(res.data.settings));
      return res.data;
    }
    const current = await this.getSettings();
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
    return { success: true, settings: updated };
  }
};
