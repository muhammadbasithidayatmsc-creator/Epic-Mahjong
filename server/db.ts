import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  MahjongTable,
  Reservation,
  BusinessSettings,
  UserProfile,
  TableAvailabilityStatus,
  TableWithAvailability,
  ScheduleSlot,
  ReservationStatus
} from '../src/types';

interface DatabaseSchema {
  users: (UserProfile & { password_hash: string })[];
  tables: MahjongTable[];
  reservations: Reservation[];
  settings: BusinessSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'epic_mahjong_db.json');

// Supabase client instance (if configured)
let supabase: SupabaseClient | null = null;
if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
  supabase = createClient(process.env.SUPABASE_URL, key);
  console.log('[Database] Connected to external Supabase instance:', process.env.SUPABASE_URL);
}

// Initial default settings
const defaultSettings: BusinessSettings = {
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

// Initial 5 tables
const defaultTables: MahjongTable[] = [
  {
    id: 'tbl-01',
    name: 'TABLE 01',
    capacity: 4,
    description: 'Meja Otomatis Elektrik, Kursi Ergonomis Premium, Soundproofing Luas',
    is_active: true,
    features: ['Automatic Shuffler', 'Premium Audio', '4 Pax'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tbl-02',
    name: 'TABLE 02',
    capacity: 4,
    description: 'Meja Otomatis Elektrik, Deluxe Lounge Seating, Pencahayaan Ambient Emas',
    is_active: true,
    features: ['Automatic Shuffler', 'Deluxe Lounge', '4 Pax'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tbl-03',
    name: 'TABLE 03',
    capacity: 4,
    description: 'VIP Private Corner, Meja Otomatis Elektrik, Mini Bar Access',
    is_active: true,
    features: ['VIP Private Corner', 'Mini Bar Access', '4 Pax'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tbl-04',
    name: 'TABLE 04',
    capacity: 6,
    description: 'Grand Suite Table, Meja Otomatis Luxury Sofa, Kapasitas hingga 6 orang',
    is_active: true,
    features: ['Grand Suite Table', 'Luxury Sofa', '4-6 Pax'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tbl-05',
    name: 'TABLE 05',
    capacity: 4,
    description: 'Meja Otomatis Elektrik, High Rollers Ambient, Privasi Eksklusif',
    is_active: true,
    features: ['Automatic Shuffler', 'High Rollers Vibe', '4 Pax'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper to seed initial users with bcrypt hashes
function getInitialUsers(): (UserProfile & { password_hash: string })[] {
  // epicadmin2026 hash & epicowner2026 hash
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('epicadmin2026', salt);
  const ownerHash = bcrypt.hashSync('epicowner2026', salt);

  return [
    {
      id: 'usr-admin-01',
      username: 'superadmin',
      email: 'admin@epicmahjong.com',
      password_hash: adminHash,
      role: 'SUPER_ADMIN',
      full_name: 'Super Admin Epic Mahjong',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-owner-01',
      username: 'owner',
      email: 'owner@epicmahjong.com',
      password_hash: ownerHash,
      role: 'OWNER',
      full_name: 'Owner Epic Mahjong',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

// In-memory cache synced to local file
let memoryDb: DatabaseSchema;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  ensureDataDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Ensure required collections
      return {
        users: parsed.users || getInitialUsers(),
        tables: parsed.tables && parsed.tables.length > 0 ? parsed.tables : defaultTables,
        reservations: parsed.reservations || [],
        settings: { ...defaultSettings, ...(parsed.settings || {}) }
      };
    } catch (e) {
      console.error('[Database] Failed to read database file, reinitializing default:', e);
    }
  }

  // Today's sample reservation to demonstrate statuses immediately
  const todayStr = new Date().toISOString().split('T')[0];
  const initialReservations: Reservation[] = [
    {
      id: 'res-demo-01',
      booking_code: `EM-${todayStr.replace(/-/g, '')}-1001`,
      customer_name: 'Kevin Hartanto',
      customer_phone: '081298765432',
      reservation_date: todayStr,
      reservation_time: '14:00',
      table_id: 'tbl-02',
      table_name: 'TABLE 02',
      guest_count: 4,
      notes: 'Main 2 jam santai bersama rekan',
      status: 'CONFIRMED',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'res-demo-02',
      booking_code: `EM-${todayStr.replace(/-/g, '')}-1002`,
      customer_name: 'Clarissa Wijaya',
      customer_phone: '081388990011',
      reservation_date: todayStr,
      reservation_time: '14:00',
      table_id: 'tbl-04',
      table_name: 'TABLE 04',
      guest_count: 5,
      notes: 'Menunggu transfer DP',
      status: 'PENDING',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const initialDb: DatabaseSchema = {
    users: getInitialUsers(),
    tables: defaultTables,
    reservations: initialReservations,
    settings: defaultSettings
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  ensureDataDir();
  try {
    const tempPath = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE);
  } catch (err) {
    console.error('[Database] Error saving database:', err);
  }
}

// Initialize memoryDb
memoryDb = loadDatabase();

export const db = {
  // SETTINGS
  getSettings(): BusinessSettings {
    return { ...memoryDb.settings };
  },

  updateSettings(updates: Partial<BusinessSettings>): BusinessSettings {
    memoryDb.settings = {
      ...memoryDb.settings,
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveDatabase(memoryDb);
    return { ...memoryDb.settings };
  },

  // TABLES
  getTables(includeInactive = false): MahjongTable[] {
    if (includeInactive) {
      return [...memoryDb.tables];
    }
    return memoryDb.tables.filter(t => t.is_active);
  },

  getTableById(id: string): MahjongTable | undefined {
    return memoryDb.tables.find(t => t.id === id);
  },

  createTable(tableData: Omit<MahjongTable, 'id' | 'created_at' | 'updated_at'>): MahjongTable {
    const newId = `tbl-${Date.now().toString().slice(-4)}`;
    const newTable: MahjongTable = {
      ...tableData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryDb.tables.push(newTable);
    saveDatabase(memoryDb);
    return newTable;
  },

  updateTable(id: string, updates: Partial<MahjongTable>): MahjongTable | null {
    const idx = memoryDb.tables.findIndex(t => t.id === id);
    if (idx === -1) return null;

    memoryDb.tables[idx] = {
      ...memoryDb.tables[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveDatabase(memoryDb);
    return { ...memoryDb.tables[idx] };
  },

  deleteTable(id: string): boolean {
    const initialLen = memoryDb.tables.length;
    memoryDb.tables = memoryDb.tables.filter(t => t.id !== id);
    if (memoryDb.tables.length !== initialLen) {
      saveDatabase(memoryDb);
      return true;
    }
    return false;
  },

  // ANTI-DOUBLE BOOKING VALIDATION
  isSlotOccupied(tableId: string, date: string, time: string, excludeReservationId?: string): boolean {
    return memoryDb.reservations.some(r => {
      if (excludeReservationId && r.id === excludeReservationId) return false;
      if (r.table_id !== tableId) return false;
      if (r.reservation_date !== date) return false;
      if (r.reservation_time !== time) return false;
      // Active reservations: PENDING or CONFIRMED
      return r.status === 'PENDING' || r.status === 'CONFIRMED';
    });
  },

  // GET TABLE AVAILABILITY FOR A SPECIFIC DATE & TIME
  getTableAvailability(date: string, time: string): TableWithAvailability[] {
    const activeTables = memoryDb.tables.filter(t => t.is_active);

    return activeTables.map(table => {
      const activeRes = memoryDb.reservations.find(r => 
        r.table_id === table.id &&
        r.reservation_date === date &&
        r.reservation_time === time &&
        (r.status === 'PENDING' || r.status === 'CONFIRMED')
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
          customer_name: activeRes.customer_name,
          status: activeRes.status
        } : undefined
      };
    });
  },

  // GET COMPLETE SCHEDULE MATRIX FOR A DATE
  getScheduleForDate(date: string): ScheduleSlot[] {
    const slots = memoryDb.settings.time_slots || defaultSettings.time_slots;
    const activeTables = memoryDb.tables.filter(t => t.is_active);

    return slots.map(time => {
      const tablesInSlot = activeTables.map(t => {
        const res = memoryDb.reservations.find(r => 
          r.table_id === t.id &&
          r.reservation_date === date &&
          r.reservation_time === time &&
          (r.status === 'PENDING' || r.status === 'CONFIRMED')
        );

        let status: TableAvailabilityStatus = 'AVAILABLE';
        if (res) {
          status = res.status === 'CONFIRMED' ? 'BOOKED' : 'PENDING';
        }

        return {
          table_id: t.id,
          table_name: t.name,
          status,
          booking_code: res?.booking_code
        };
      });

      return {
        time,
        tables: tablesInSlot
      };
    });
  },

  // RESERVATIONS
  createReservation(data: {
    customer_name: string;
    customer_phone: string;
    reservation_date: string;
    reservation_time: string;
    table_id: string;
    guest_count: number;
    notes?: string;
    status?: ReservationStatus;
  }): Reservation {
    // 1. Strict Anti-Double Booking Check
    if (this.isSlotOccupied(data.table_id, data.reservation_date, data.reservation_time)) {
      throw new Error('Maaf, meja tersebut baru saja dibooking. Silakan pilih meja atau jam lainnya.');
    }

    const table = this.getTableById(data.table_id);
    if (!table || !table.is_active) {
      throw new Error('Meja yang dipilih tidak ditemukan atau sedang tidak aktif.');
    }

    const dateDigits = data.reservation_date.replace(/[^0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const booking_code = `EM-${dateDigits}-${randomSuffix}`;

    const newReservation: Reservation = {
      id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      booking_code,
      customer_name: data.customer_name.trim(),
      customer_phone: data.customer_phone.trim(),
      reservation_date: data.reservation_date,
      reservation_time: data.reservation_time,
      table_id: data.table_id,
      table_name: table.name,
      guest_count: Number(data.guest_count) || 4,
      notes: (data.notes || '').trim(),
      status: data.status || 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memoryDb.reservations.unshift(newReservation);
    saveDatabase(memoryDb);
    return newReservation;
  },

  getReservations(filters?: {
    date?: string;
    status?: string;
    search?: string;
  }): Reservation[] {
    let result = [...memoryDb.reservations];

    if (filters) {
      if (filters.date) {
        result = result.filter(r => r.reservation_date === filters.date);
      }
      if (filters.status && filters.status !== 'ALL') {
        result = result.filter(r => r.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(r => 
          r.booking_code.toLowerCase().includes(q) ||
          r.customer_name.toLowerCase().includes(q) ||
          r.customer_phone.toLowerCase().includes(q) ||
          (r.table_name && r.table_name.toLowerCase().includes(q))
        );
      }
    }

    // Sort by reservation_date desc, reservation_time desc
    result.sort((a, b) => {
      const dtA = `${a.reservation_date} ${a.reservation_time}`;
      const dtB = `${b.reservation_date} ${b.reservation_time}`;
      return dtB.localeCompare(dtA);
    });

    return result;
  },

  getReservationById(id: string): Reservation | undefined {
    return memoryDb.reservations.find(r => r.id === id || r.booking_code === id);
  },

  updateReservationStatus(id: string, newStatus: ReservationStatus): Reservation | null {
    const reservation = memoryDb.reservations.find(r => r.id === id);
    if (!reservation) return null;

    // If changing to PENDING or CONFIRMED, ensure no conflict exists with another booking
    if (newStatus === 'PENDING' || newStatus === 'CONFIRMED') {
      if (this.isSlotOccupied(reservation.table_id, reservation.reservation_date, reservation.reservation_time, reservation.id)) {
        throw new Error('Konflik jadwal: Jadwal meja ini sudah terisi oleh reservasi lain.');
      }
    }

    reservation.status = newStatus;
    reservation.updated_at = new Date().toISOString();
    saveDatabase(memoryDb);
    return { ...reservation };
  },

  deleteReservation(id: string): boolean {
    const initialLen = memoryDb.reservations.length;
    memoryDb.reservations = memoryDb.reservations.filter(r => r.id !== id);
    if (memoryDb.reservations.length !== initialLen) {
      saveDatabase(memoryDb);
      return true;
    }
    return false;
  },

  getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const all = memoryDb.reservations;
    const todayReservations = all.filter(r => r.reservation_date === today);

    return {
      today_bookings_count: todayReservations.length,
      pending_count: all.filter(r => r.status === 'PENDING').length,
      confirmed_count: all.filter(r => r.status === 'CONFIRMED').length,
      completed_count: all.filter(r => r.status === 'COMPLETED').length,
      cancelled_count: all.filter(r => r.status === 'CANCELLED').length,
      today_reservations: todayReservations.sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
    };
  },

  // USERS / AUTH
  findUserByCredential(usernameOrEmail: string): (UserProfile & { password_hash: string }) | undefined {
    const query = usernameOrEmail.toLowerCase().trim();
    return memoryDb.users.find(u => u.username.toLowerCase() === query || u.email.toLowerCase() === query);
  },

  findUserById(id: string): UserProfile | undefined {
    const user = memoryDb.users.find(u => u.id === id);
    if (!user) return undefined;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  getUsers(): UserProfile[] {
    return memoryDb.users.map(({ password_hash, ...safeUser }) => safeUser);
  },

  createOwnerAccount(data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
  }): UserProfile {
    const existing = memoryDb.users.find(
      u => u.username.toLowerCase() === data.username.toLowerCase().trim() ||
           u.email.toLowerCase() === data.email.toLowerCase().trim()
    );
    if (existing) {
      throw new Error('Username atau Email sudah terdaftar.');
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(data.password, salt);

    const newUser: UserProfile & { password_hash: string } = {
      id: `usr-owner-${Date.now().toString().slice(-4)}`,
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      password_hash,
      role: 'OWNER',
      full_name: data.full_name.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memoryDb.users.push(newUser);
    saveDatabase(memoryDb);
    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  },

  deleteUser(id: string): boolean {
    const user = memoryDb.users.find(u => u.id === id);
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') {
      throw new Error('Akun Super Admin tidak boleh dihapus.');
    }
    memoryDb.users = memoryDb.users.filter(u => u.id !== id);
    saveDatabase(memoryDb);
    return true;
  },

  changePassword(userId: string, oldPass: string, newPass: string): boolean {
    const user = memoryDb.users.find(u => u.id === userId);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    const isValid = bcrypt.compareSync(oldPass, user.password_hash);
    if (!isValid) throw new Error('Password lama tidak cocok.');

    const salt = bcrypt.genSaltSync(10);
    user.password_hash = bcrypt.hashSync(newPass, salt);
    user.updated_at = new Date().toISOString();
    saveDatabase(memoryDb);
    return true;
  }
};
