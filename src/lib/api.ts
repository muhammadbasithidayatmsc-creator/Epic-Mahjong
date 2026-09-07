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
    const res = await fetch('/api/public/settings');
    if (!res.ok) throw new Error('Gagal memuat pengaturan bisnis.');
    return res.json();
  },

  async getTables(): Promise<MahjongTable[]> {
    const res = await fetch('/api/public/tables');
    if (!res.ok) throw new Error('Gagal memuat daftar meja.');
    return res.json();
  },

  async getAvailability(date?: string, time?: string): Promise<TableWithAvailability[]> {
    try {
      const qDate = date || new Date().toISOString().split('T')[0];
      const qTime = time || '14:00';
      const res = await fetch(`/api/public/availability?date=${encodeURIComponent(qDate)}&time=${encodeURIComponent(qTime)}`);
      if (!res.ok) {
        // Fallback gracefully to basic tables
        const baseTables = await this.getTables().catch(() => []);
        return baseTables.map(t => ({ ...t, status: 'AVAILABLE' as TableAvailabilityStatus }));
      }
      return await res.json();
    } catch (err) {
      console.warn('[api] getAvailability fallback triggered:', err);
      const baseTables = await this.getTables().catch(() => []);
      return baseTables.map(t => ({ ...t, status: 'AVAILABLE' as TableAvailabilityStatus }));
    }
  },

  async getSchedule(date?: string): Promise<ScheduleSlot[]> {
    try {
      const qDate = date || new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/public/schedule?date=${encodeURIComponent(qDate)}`);
      if (!res.ok) throw new Error('Gagal memuat jadwal meja.');
      return await res.json();
    } catch (err) {
      console.warn('[api] getSchedule error:', err);
      return [];
    }
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
    const res = await fetch('/api/public/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal membuat reservasi.');
    }
    return data;
  },

  // AUTH APIS
  async login(usernameOrEmail: string, password: string):Promise<{
    success: boolean;
    token: string;
    user: UserProfile;
  }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login gagal.');
    }
    this.setToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: UserProfile }> {
    const res = await fetch('/api/auth/me', {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  logout() {
    this.removeToken();
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
    const res = await fetch('/api/admin/stats', {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Gagal memuat statistik admin.');
    return res.json();
  },

  async getReservations(filters?: { date?: string; status?: string; search?: string }): Promise<Reservation[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`/api/admin/reservations?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Gagal memuat reservasi.');
    return res.json();
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
    const res = await fetch('/api/admin/reservations', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal membuat reservasi manual.');
    return data;
  },

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<{ success: boolean; reservation: Reservation }> {
    const res = await fetch(`/api/admin/reservations/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengubah status.');
    return data;
  },

  async deleteReservation(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menghapus reservasi.');
    return data;
  },

  async getAdminTables(): Promise<MahjongTable[]> {
    const res = await fetch('/api/admin/tables', {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Gagal memuat meja admin.');
    return res.json();
  },

  async createTable(payload: Partial<MahjongTable>): Promise<{ success: boolean; table: MahjongTable }> {
    const res = await fetch('/api/admin/tables', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menambah meja.');
    return data;
  },

  async updateTable(id: string, payload: Partial<MahjongTable>): Promise<{ success: boolean; table: MahjongTable }> {
    const res = await fetch(`/api/admin/tables/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengedit meja.');
    return data;
  },

  async deleteTable(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/tables/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menghapus meja.');
    return data;
  },

  async getUsers(): Promise<UserProfile[]> {
    const res = await fetch('/api/admin/users', {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Gagal memuat pengguna.');
    return res.json();
  },

  async createOwner(payload: { username: string; email: string; password: string; full_name: string }): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal membuat akun Owner.');
    return data;
  },

  async createOwnerUser(payload: { username: string; email: string; password: string; full_name: string }): Promise<{ success: boolean; user: UserProfile }> {
    return this.createOwner(payload);
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menghapus akun.');
    return data;
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<{ success: boolean; settings: BusinessSettings }> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pengaturan.');
    return data;
  }
};
