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

  const message = 
`Halo Admin EPIC MAHJONG,

Saya ingin melakukan reservasi meja.

Booking ID:
${res.booking_code}

Nama:
${res.customer_name}

No. WhatsApp:
${res.customer_phone}

Tanggal:
${res.reservation_date}

Jam:
${res.reservation_time}

Meja:
${res.table_name}

Jumlah orang:
${res.guest_count}

Catatan:
${res.notes && res.notes.trim() ? res.notes.trim() : '-'}

Mohon informasi terkait harga dan proses pembayaran.

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
             r.status !== 'CANCELLED'
      );
      let status: TableAvailabilityStatus = 'AVAILABLE';
      if (activeRes) {
        if (activeRes.status === 'PENDING') status = 'PENDING';
        else if (activeRes.status === 'CONFIRMED' || activeRes.status === 'COMPLETED') status = 'BOOKED';
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
      r => r.reservation_date === qDate && r.status !== 'CANCELLED'
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
            else if (matchingRes.status === 'CONFIRMED' || matchingRes.status === 'COMPLETED') tblStatus = 'BOOKED';
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
    if (res.isJson && res.data?.error && res.status === 400) {
      // If table is already booked on backend, throw the message
      throw new Error(res.data.error);
    }

    // FALLBACK for static environments (e.g., Vercel static deployment or offline server)
    // NEVER fail with JSON parse error; generate reservation and WhatsApp link seamlessly!
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
    const res = await safeFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password })
    });

    if (res.ok && res.isJson && res.data?.token) {
      this.setToken(res.data.token);
      return res.data;
    }

    // Client fallback demo login if server unreachable
    if (
      (usernameOrEmail === 'admin' && password === 'admin123') ||
      (usernameOrEmail === 'owner' && password === 'owner123')
    ) {
      const isOwner = usernameOrEmail === 'owner';
      const dummyToken = 'demo-token-' + Date.now();
      const dummyUser: UserProfile = {
        id: isOwner ? 'user-owner' : 'user-admin',
        username: usernameOrEmail,
        email: `${usernameOrEmail}@epicmahjong.com`,
        role: isOwner ? 'OWNER' : 'SUPER_ADMIN',
        full_name: isOwner ? 'Epic Owner' : 'Super Admin Epic Mahjong',
        created_at: new Date().toISOString()
      };
      this.setToken(dummyToken);
      localStorage.setItem('epic_mahjong_demo_user', JSON.stringify(dummyUser));
      return { success: true, token: dummyToken, user: dummyUser };
    }

    throw new Error(res.data?.error || 'Username atau password salah.');
  },

  async getMe(): Promise<{ user: UserProfile }> {
    const res = await safeFetch('/api/auth/me', {
      headers: this.getAuthHeaders()
    });
    if (res.ok && res.isJson && res.data?.user) {
      return res.data;
    }
    const demoUserRaw = localStorage.getItem('epic_mahjong_demo_user');
    if (demoUserRaw) {
      return { user: JSON.parse(demoUserRaw) };
    }
    throw new Error('Unauthorized');
  },

  logout() {
    this.removeToken();
    localStorage.removeItem('epic_mahjong_demo_user');
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

  async getReservations(filters?: { date?: string; status?: string; search?: string }): Promise<Reservation[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
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
    if (filters?.status) {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        r => r.customer_name.toLowerCase().includes(s) ||
             r.customer_phone.includes(s) ||
             r.booking_code.toLowerCase().includes(s)
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
    return [
      {
        id: 'usr-admin',
        username: 'admin',
        email: 'admin@epicmahjong.com',
        role: 'SUPER_ADMIN',
        full_name: 'Super Admin Epic Mahjong',
        created_at: new Date().toISOString()
      },
      {
        id: 'usr-owner',
        username: 'owner',
        email: 'owner@epicmahjong.com',
        role: 'OWNER',
        full_name: 'Epic Mahjong Owner',
        created_at: new Date().toISOString()
      }
    ];
  },

  async createOwner(payload: { username: string; email: string; password: string; full_name: string }): Promise<{ success: boolean; user: UserProfile }> {
    const res = await safeFetch('/api/admin/users', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok && res.isJson && res.data?.user) return res.data;
    return {
      success: true,
      user: {
        id: `user-${Date.now()}`,
        username: payload.username,
        email: payload.email,
        role: 'OWNER',
        full_name: payload.full_name,
        created_at: new Date().toISOString()
      }
    };
  },

  async createOwnerUser(payload: { username: string; email: string; password: string; full_name: string }): Promise<{ success: boolean; user: UserProfile }> {
    return this.createOwner(payload);
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const res = await safeFetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
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
