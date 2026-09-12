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
  ReservationStatus,
  PlaySession,
  SessionStatus
} from '../src/types';

interface DatabaseSchema {
  users: (UserProfile & { password_hash: string })[];
  tables: MahjongTable[];
  reservations: Reservation[];
  settings: BusinessSettings;
  sessions: PlaySession[];
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

// Initial default sessions
export const defaultSessions: PlaySession[] = [
  {
    session_id: 'ses-01',
    session_name: 'Sesi 1',
    start_time: '10:00',
    end_time: '12:00',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    session_id: 'ses-02',
    session_name: 'Sesi 2',
    start_time: '12:00',
    end_time: '14:00',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    session_id: 'ses-03',
    session_name: 'Sesi 3',
    start_time: '14:00',
    end_time: '16:00',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    session_id: 'ses-04',
    session_name: 'Sesi 4',
    start_time: '16:00',
    end_time: '18:00',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    session_id: 'ses-05',
    session_name: 'Sesi 5',
    start_time: '18:00',
    end_time: '20:00',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    session_id: 'ses-06',
    session_name: 'Sesi 6',
    start_time: '20:00',
    end_time: '22:00',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    session_id: 'ses-07',
    session_name: 'Sesi 7',
    start_time: '22:00',
    end_time: '00:00',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    session_id: 'ses-08',
    session_name: 'Sesi 8',
    start_time: '00:00',
    end_time: '02:00',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Parse HH:mm to minutes from midnight
export function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const parts = t.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Check if two time intervals [startA, endA) and [startB, endB) overlap.
function checkIntervalOverlap(sA: number, eA: number, sB: number, eB: number): boolean {
  return Math.max(sA, sB) < Math.min(eA, eB);
}

// True if session A and session B overlap in time
export function doSessionsOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  let sA = parseTimeToMinutes(startA);
  let eA = parseTimeToMinutes(endA);
  if (eA <= sA) eA += 1440; // crosses midnight or reaches 00:00

  let sB = parseTimeToMinutes(startB);
  let eB = parseTimeToMinutes(endB);
  if (eB <= sB) eB += 1440;

  if (checkIntervalOverlap(sA, eA, sB, eB)) return true;
  if (checkIntervalOverlap(sA + 1440, eA + 1440, sB, eB)) return true;
  if (checkIntervalOverlap(sA, eA, sB + 1440, eB + 1440)) return true;

  return false;
}

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
      is_active: true,
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
      is_active: true,
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
      const loadedSessions: PlaySession[] = parsed.sessions && Array.isArray(parsed.sessions) && parsed.sessions.length > 0 
        ? parsed.sessions 
        : defaultSessions;

      // Migrate reservations without session_id if any
      const loadedReservations: Reservation[] = (parsed.reservations || []).map((r: any) => {
        if (!r.session_id && r.reservation_time) {
          const matchedSession = loadedSessions.find(s => s.start_time === r.reservation_time);
          if (matchedSession) {
            return {
              ...r,
              session_id: matchedSession.session_id,
              session_name: matchedSession.session_name,
              start_time: matchedSession.start_time,
              end_time: matchedSession.end_time
            };
          }
        }
        return r;
      });

      return {
        users: parsed.users || getInitialUsers(),
        tables: parsed.tables && parsed.tables.length > 0 ? parsed.tables : defaultTables,
        reservations: loadedReservations,
        settings: { ...defaultSettings, ...(parsed.settings || {}) },
        sessions: loadedSessions
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
      session_id: 'ses-03',
      session_name: 'Sesi 3',
      start_time: '14:00',
      end_time: '16:00',
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
      session_id: 'ses-03',
      session_name: 'Sesi 3',
      start_time: '14:00',
      end_time: '16:00',
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
    settings: defaultSettings,
    sessions: defaultSessions
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

  // PLAY SESSIONS (CUSTOM SESI JAM BERMAIN)
  getSessions(activeOnly = false): PlaySession[] {
    const list = memoryDb.sessions || defaultSessions;
    if (activeOnly) {
      return list
        .filter(s => s.status === 'ACTIVE')
        .sort((a, b) => parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time));
    }
    return [...list].sort((a, b) => parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time));
  },

  getSessionById(id: string): PlaySession | undefined {
    return (memoryDb.sessions || defaultSessions).find(s => s.session_id === id);
  },

  createSession(data: {
    session_name: string;
    start_time: string;
    end_time: string;
    status?: SessionStatus;
  }): PlaySession {
    const name = (data.session_name || '').trim();
    const start = (data.start_time || '').trim();
    const end = (data.end_time || '').trim();
    const status: SessionStatus = data.status || 'ACTIVE';

    if (!name || !start || !end) {
      throw new Error('Nama sesi, jam mulai, dan jam selesai wajib diisi.');
    }

    // Overlap validation among ACTIVE sessions
    if (status === 'ACTIVE') {
      const activeList = (memoryDb.sessions || []).filter(s => s.status === 'ACTIVE');
      const overlapping = activeList.find(s => doSessionsOverlap(start, end, s.start_time, s.end_time));
      if (overlapping) {
        throw new Error(
          `Jam sesi bertabrakan dengan sesi yang sudah aktif (${overlapping.session_name}: ${overlapping.start_time}–${overlapping.end_time}). Silakan pilih rentang waktu lainnya.`
        );
      }
    }

    const newId = `ses-${Date.now().toString().slice(-5)}`;
    const newSession: PlaySession = {
      session_id: newId,
      session_name: name,
      start_time: start,
      end_time: end,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!memoryDb.sessions) memoryDb.sessions = [...defaultSessions];
    memoryDb.sessions.push(newSession);
    saveDatabase(memoryDb);
    return newSession;
  },

  updateSession(id: string, updates: Partial<PlaySession>): PlaySession {
    if (!memoryDb.sessions) memoryDb.sessions = [...defaultSessions];
    const idx = memoryDb.sessions.findIndex(s => s.session_id === id);
    if (idx === -1) {
      throw new Error('Sesi tidak ditemukan.');
    }

    const current = memoryDb.sessions[idx];
    const updatedName = updates.session_name !== undefined ? updates.session_name.trim() : current.session_name;
    const updatedStart = updates.start_time !== undefined ? updates.start_time.trim() : current.start_time;
    const updatedEnd = updates.end_time !== undefined ? updates.end_time.trim() : current.end_time;
    const updatedStatus = updates.status !== undefined ? updates.status : current.status;

    if (!updatedName || !updatedStart || !updatedEnd) {
      throw new Error('Nama sesi, jam mulai, dan jam selesai tidak boleh kosong.');
    }

    // Overlap validation among other ACTIVE sessions
    if (updatedStatus === 'ACTIVE') {
      const overlapping = memoryDb.sessions.find(
        s => s.session_id !== id && s.status === 'ACTIVE' && doSessionsOverlap(updatedStart, updatedEnd, s.start_time, s.end_time)
      );
      if (overlapping) {
        throw new Error(
          `Jam sesi bertabrakan dengan sesi yang sudah aktif (${overlapping.session_name}: ${overlapping.start_time}–${overlapping.end_time}). Silakan pilih rentang waktu lainnya.`
        );
      }
    }

    memoryDb.sessions[idx] = {
      ...current,
      session_name: updatedName,
      start_time: updatedStart,
      end_time: updatedEnd,
      status: updatedStatus,
      updated_at: new Date().toISOString()
    };

    saveDatabase(memoryDb);
    return { ...memoryDb.sessions[idx] };
  },

  deleteSession(id: string): { success: boolean; deactivated?: boolean; message: string } {
    if (!memoryDb.sessions) memoryDb.sessions = [...defaultSessions];
    const session = memoryDb.sessions.find(s => s.session_id === id);
    if (!session) {
      throw new Error('Sesi tidak ditemukan.');
    }

    // Check if session has reservations
    const hasReservations = memoryDb.reservations.some(
      r => r.session_id === id || r.reservation_time === session.start_time
    );

    if (hasReservations) {
      // Safe deactivation: do not delete, set to INACTIVE to protect history
      session.status = 'INACTIVE';
      session.updated_at = new Date().toISOString();
      saveDatabase(memoryDb);
      return {
        success: true,
        deactivated: true,
        message: `Sesi "${session.session_name}" memiliki riwayat reservasi dan telah dinonaktifkan (NONAKTIF) agar histori booking tetap aman.`
      };
    }

    memoryDb.sessions = memoryDb.sessions.filter(s => s.session_id !== id);
    saveDatabase(memoryDb);
    return {
      success: true,
      deactivated: false,
      message: `Sesi "${session.session_name}" berhasil dihapus.`
    };
  },

  // BATCH SET SESSIONS (SUPER ADMIN & OWNER)
  batchSetSessions(newSessions: Array<{ session_name: string; start_time: string; end_time: string; status?: SessionStatus }>): PlaySession[] {
    if (!memoryDb.sessions) memoryDb.sessions = [...defaultSessions];
    if (!Array.isArray(newSessions) || newSessions.length === 0) {
      throw new Error('Daftar sesi tidak boleh kosong.');
    }

    const now = new Date().toISOString();

    // Preserve previous sessions that have reservations by marking them INACTIVE so reservation history remains consistent
    for (const oldS of memoryDb.sessions) {
      const hasRes = memoryDb.reservations.some(r => r.session_id === oldS.session_id);
      if (hasRes) {
        oldS.status = 'INACTIVE';
        oldS.updated_at = now;
      }
    }

    // Retain only sessions that have historical reservations
    memoryDb.sessions = memoryDb.sessions.filter(oldS => 
      memoryDb.reservations.some(r => r.session_id === oldS.session_id)
    );

    // Append new sessions
    newSessions.forEach((s, idx) => {
      const sesId = `ses-${Date.now()}-${idx + 1}`;
      memoryDb.sessions.push({
        session_id: sesId,
        session_name: s.session_name.trim() || `Sesi ${idx + 1}`,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status || 'ACTIVE',
        created_at: now,
        updated_at: now
      });
    });

    saveDatabase(memoryDb);
    return this.getSessions(false);
  },

  // ANTI-DOUBLE BOOKING VALIDATION WITH SESSION & TIME OVERLAP CHECK
  isSlotOccupied(
    tableId: string,
    date: string,
    timeOrSessionId: string,
    excludeReservationId?: string,
    sessionInfo?: { start_time: string; end_time: string; session_id?: string }
  ): boolean {
    return memoryDb.reservations.some(r => {
      if (excludeReservationId && r.id === excludeReservationId) return false;
      if (r.table_id !== tableId) return false;
      if (r.reservation_date !== date) return false;
      // Active reservations: PENDING or CONFIRMED
      if (r.status !== 'PENDING' && r.status !== 'CONFIRMED') return false;

      // 1. Direct session_id match
      if (sessionInfo?.session_id && r.session_id && r.session_id === sessionInfo.session_id) {
        return true;
      }

      // 2. Direct time string match
      if (r.reservation_time === timeOrSessionId) {
        return true;
      }

      // 3. Time overlap check
      if (sessionInfo?.start_time && sessionInfo?.end_time) {
        const rStart = r.start_time || r.reservation_time;
        let rEnd = r.end_time;
        if (!rEnd && rStart) {
          const startMin = parseTimeToMinutes(rStart);
          const endMin = (startMin + 120) % 1440;
          const eh = Math.floor(endMin / 60);
          const em = endMin % 60;
          rEnd = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
        }
        if (rStart && rEnd) {
          if (doSessionsOverlap(sessionInfo.start_time, sessionInfo.end_time, rStart, rEnd)) {
            return true;
          }
        }
      }

      return false;
    });
  },

  // GET TABLE AVAILABILITY FOR A SPECIFIC DATE & TIME/SESSION
  getTableAvailability(date: string, timeOrSessionId: string): TableWithAvailability[] {
    const activeTables = memoryDb.tables.filter(t => t.is_active);
    const session = (memoryDb.sessions || defaultSessions).find(
      s => s.session_id === timeOrSessionId || s.start_time === timeOrSessionId
    );

    return activeTables.map(table => {
      const activeRes = memoryDb.reservations.find(r => {
        if (r.table_id !== table.id) return false;
        if (r.reservation_date !== date) return false;
        if (r.status !== 'PENDING' && r.status !== 'CONFIRMED') return false;

        if (session && r.session_id && r.session_id === session.session_id) return true;
        if (r.reservation_time === timeOrSessionId) return true;
        if (session && r.start_time && r.end_time) {
          return doSessionsOverlap(session.start_time, session.end_time, r.start_time, r.end_time);
        }
        return false;
      });

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
  },

  // GET COMPLETE SCHEDULE MATRIX FOR A DATE (DYNAMIC ACTIVE SESSIONS)
  getScheduleForDate(date: string): ScheduleSlot[] {
    // Read only active sessions sorted by start_time
    const activeSessions = this.getSessions(true);
    const activeTables = memoryDb.tables.filter(t => t.is_active);

    return activeSessions.map(session => {
      const tablesInSlot = activeTables.map(t => {
        const res = memoryDb.reservations.find(r => {
          if (r.table_id !== t.id) return false;
          if (r.reservation_date !== date) return false;
          if (r.status !== 'PENDING' && r.status !== 'CONFIRMED') return false;

          if (r.session_id && r.session_id === session.session_id) return true;
          if (r.reservation_time === session.start_time) return true;
          const rStart = r.start_time || r.reservation_time;
          let rEnd = r.end_time;
          if (!rEnd && rStart) {
            const startMin = parseTimeToMinutes(rStart);
            const endMin = (startMin + 120) % 1440;
            const eh = Math.floor(endMin / 60);
            const em = endMin % 60;
            rEnd = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
          }
          if (rStart && rEnd) {
            return doSessionsOverlap(session.start_time, session.end_time, rStart, rEnd);
          }
          return false;
        });

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
        time: session.start_time,
        session_id: session.session_id,
        session_name: session.session_name,
        start_time: session.start_time,
        end_time: session.end_time,
        tables: tablesInSlot
      };
    });
  },

  // RESERVATIONS
  createReservation(data: {
    customer_name: string;
    customer_phone: string;
    reservation_date: string;
    reservation_time?: string;
    session_id?: string;
    start_time?: string;
    end_time?: string;
    session_name?: string;
    table_id: string;
    guest_count: number;
    notes?: string;
    status?: ReservationStatus;
  }): Reservation {
    // Resolve session if session_id or times provided
    let matchedSession: PlaySession | undefined;
    if (data.session_id) {
      matchedSession = this.getSessionById(data.session_id);
    }
    if (!matchedSession && data.reservation_time) {
      matchedSession = (memoryDb.sessions || defaultSessions).find(
        s => s.start_time === data.reservation_time
      );
    }

    const sessionId = matchedSession?.session_id || data.session_id;
    const sessionName = matchedSession?.session_name || data.session_name || 'Sesi Bermain';
    const startTime = matchedSession?.start_time || data.start_time || data.reservation_time || '10:00';
    const endTime = matchedSession?.end_time || data.end_time || '12:00';
    const reservationTime = startTime;

    // 1. Strict Anti-Double Booking Check
    if (
      this.isSlotOccupied(data.table_id, data.reservation_date, reservationTime, undefined, {
        start_time: startTime,
        end_time: endTime,
        session_id: sessionId
      })
    ) {
      throw new Error('Maaf, slot ini baru saja dipesan. Silakan pilih jam atau meja lainnya.');
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
      reservation_time: reservationTime,
      session_id: sessionId,
      session_name: sessionName,
      start_time: startTime,
      end_time: endTime,
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
    startDate?: string;
    endDate?: string;
    tableId?: string;
    status?: string;
    search?: string;
  }): Reservation[] {
    let result = [...memoryDb.reservations];

    if (filters) {
      if (filters.date) {
        result = result.filter(r => r.reservation_date === filters.date);
      }
      if (filters.startDate) {
        result = result.filter(r => r.reservation_date >= filters.startDate!);
      }
      if (filters.endDate) {
        result = result.filter(r => r.reservation_date <= filters.endDate!);
      }
      if (filters.tableId && filters.tableId !== 'ALL') {
        result = result.filter(r => r.table_id === filters.tableId);
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
    const found = memoryDb.users.find(u => u.username.toLowerCase() === query || u.email.toLowerCase() === query);
    if (found) return found;

    // Check aliases
    if (query === 'admin' || query === 'superadmin' || query === 'admin@epicmahjong.com') {
      return memoryDb.users.find(u => u.role === 'SUPER_ADMIN');
    }
    if (query === 'owner' || query === 'owner@epicmahjong.com') {
      return memoryDb.users.find(u => u.role === 'OWNER');
    }
    return undefined;
  },

  findUserById(id: string): UserProfile | undefined {
    const user = memoryDb.users.find(u => u.id === id);
    if (!user) return undefined;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  getUsers(): UserProfile[] {
    return memoryDb.users.map(({ password_hash, ...safeUser }) => ({
      ...safeUser,
      is_active: safeUser.is_active ?? true
    }));
  },

  createOwnerAccount(data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
  }): UserProfile {
    if (!data.password || data.password.length < 8) {
      throw new Error('Password minimal 8 karakter.');
    }

    const cleanUsername = data.username.toLowerCase().trim();
    const cleanEmail = data.email.toLowerCase().trim();

    const existing = memoryDb.users.find(
      u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );
    if (existing) {
      throw new Error('Username atau Email sudah terdaftar.');
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(data.password, salt);

    const newUser: UserProfile & { password_hash: string } = {
      id: `usr-owner-${Date.now().toString().slice(-4)}`,
      username: cleanUsername,
      email: cleanEmail,
      password_hash,
      role: 'OWNER',
      full_name: data.full_name.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memoryDb.users.push(newUser);
    saveDatabase(memoryDb);
    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  },

  updateOwnerAccount(id: string, data: {
    username?: string;
    email?: string;
    full_name?: string;
    is_active?: boolean;
  }): UserProfile {
    const user = memoryDb.users.find(u => u.id === id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');
    if (user.role === 'SUPER_ADMIN') {
      throw new Error('Akun Super Admin tidak dapat diubah dari menu ini.');
    }

    if (data.username && data.username.trim()) {
      const cleanU = data.username.toLowerCase().trim();
      const duplicate = memoryDb.users.find(u => u.id !== id && u.username.toLowerCase() === cleanU);
      if (duplicate) throw new Error('Username sudah digunakan oleh akun lain.');
      user.username = cleanU;
    }

    if (data.email && data.email.trim()) {
      const cleanE = data.email.toLowerCase().trim();
      const duplicate = memoryDb.users.find(u => u.id !== id && u.email.toLowerCase() === cleanE);
      if (duplicate) throw new Error('Email sudah digunakan oleh akun lain.');
      user.email = cleanE;
    }

    if (data.full_name && data.full_name.trim()) {
      user.full_name = data.full_name.trim();
    }

    if (data.is_active !== undefined) {
      user.is_active = data.is_active;
    }

    user.updated_at = new Date().toISOString();
    saveDatabase(memoryDb);

    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  },

  resetOwnerPassword(id: string, newPass: string): boolean {
    const user = memoryDb.users.find(u => u.id === id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');
    if (user.role === 'SUPER_ADMIN') {
      throw new Error('Password Super Admin tidak dapat direset dari menu ini.');
    }

    if (!newPass || newPass.length < 8) {
      throw new Error('Password baru minimal 8 karakter.');
    }

    const salt = bcrypt.genSaltSync(10);
    user.password_hash = bcrypt.hashSync(newPass, salt);
    user.updated_at = new Date().toISOString();
    saveDatabase(memoryDb);
    return true;
  },

  toggleUserStatus(id: string, is_active: boolean): UserProfile {
    const user = memoryDb.users.find(u => u.id === id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');
    if (user.role === 'SUPER_ADMIN') {
      throw new Error('Status akun Super Admin tidak dapat dinonaktifkan.');
    }

    user.is_active = is_active;
    user.updated_at = new Date().toISOString();
    saveDatabase(memoryDb);

    const { password_hash: _, ...safeUser } = user;
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

    if (!newPass || newPass.length < 8) {
      throw new Error('Password baru minimal 8 karakter.');
    }

    const isValid = bcrypt.compareSync(oldPass, user.password_hash);
    if (!isValid) throw new Error('Password lama tidak cocok.');

    const salt = bcrypt.genSaltSync(10);
    user.password_hash = bcrypt.hashSync(newPass, salt);
    user.updated_at = new Date().toISOString();
    saveDatabase(memoryDb);
    return true;
  }
};
