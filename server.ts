import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { ReservationStatus, UserRole } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'epic_mahjong_secret_jwt_key_alam_sutera_2026';

app.use(express.json());

// ==========================================
// AUTH MIDDLEWARES
// ==========================================
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    full_name: string;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Sesi telah kedaluwarsa atau token tidak valid.' });
  }
}

function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Anda tidak memiliki hak akses untuk tindakan ini.' });
    }
    next();
  };
}

// ==========================================
// WHATSAPP URL GENERATOR HELPER
// ==========================================
function formatWhatsAppUrl(adminPhone: string, reservation: {
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  table_name: string;
  guest_count: number;
  notes?: string;
}) {
  // Normalize phone number to digits only (e.g., 085181959275 -> 6285181959275)
  let phone = (adminPhone || '085181959275').replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  } else if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }

  const message = 
`Halo Admin EPIC MAHJONG,

Saya ingin melakukan reservasi meja.

Booking ID:
${reservation.booking_code}

Nama:
${reservation.customer_name}

No. WhatsApp:
${reservation.customer_phone}

Tanggal:
${reservation.reservation_date}

Jam:
${reservation.reservation_time}

Meja:
${reservation.table_name}

Jumlah orang:
${reservation.guest_count}

Catatan:
${reservation.notes ? reservation.notes : '-'}

Mohon informasi terkait harga dan proses pembayaran.

Terima kasih.`;

  const encoded = encodeURIComponent(message);
  return {
    url: `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`,
    waMeUrl: `https://wa.me/${phone}?text=${encoded}`,
    webUrl: `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`,
    phone,
    message
  };
}

// ==========================================
// PUBLIC API ROUTES (CUSTOMER - NO LOGIN REQUIRED)
// ==========================================

// 1. Get Business Settings
app.get('/api/public/settings', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memuat pengaturan bisnis.' });
  }
});

// 2. Get Active Tables
app.get('/api/public/tables', (req, res) => {
  try {
    const tables = db.getTables(false);
    res.json(tables);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memuat data meja.' });
  }
});

// 3. Get Table Availability for Selected Date & Time (with safe fallback)
app.get('/api/public/availability', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const date = String(req.query.date || today).trim() || today;
    const time = String(req.query.time || '14:00').trim() || '14:00';

    const tables = db.getTableAvailability(date, time);
    res.json(tables);
  } catch (err: any) {
    console.error('[API] getTableAvailability error:', err);
    res.status(500).json({ error: err.message || 'Gagal memeriksa ketersediaan meja.' });
  }
});

// 4. Get Table Schedule Matrix for a Given Date (with safe fallback)
app.get('/api/public/schedule', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const date = String(req.query.date || today).trim() || today;

    const schedule = db.getScheduleForDate(date);
    res.json(schedule);
  } catch (err: any) {
    console.error('[API] getScheduleForDate error:', err);
    res.status(500).json({ error: err.message || 'Gagal memuat jadwal meja.' });
  }
});

// 5. Submit Customer Reservation (Anti-Double Booking Enforced)
app.post('/api/public/reservations', (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      reservation_date,
      reservation_time,
      table_id,
      guest_count,
      notes
    } = req.body;

    // Field validation
    if (!customer_name || !customer_phone || !reservation_date || !reservation_time || !table_id) {
      return res.status(400).json({ error: 'Nama, WhatsApp, Tanggal, Jam, dan Meja wajib diisi.' });
    }

    // Anti-Double Booking validation happens atomically inside createReservation
    const reservation = db.createReservation({
      customer_name,
      customer_phone,
      reservation_date,
      reservation_time,
      table_id,
      guest_count: Number(guest_count) || 4,
      notes,
      status: 'PENDING'
    });

    const settings = db.getSettings();
    const adminPhone = settings.admin_whatsapp || '085181959275';
    const waData = formatWhatsAppUrl(adminPhone, {
      booking_code: reservation.booking_code,
      customer_name: reservation.customer_name,
      customer_phone: reservation.customer_phone,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      table_name: reservation.table_name || 'TABLE',
      guest_count: reservation.guest_count,
      notes: reservation.notes
    });

    res.status(201).json({
      success: true,
      message: 'Booking berhasil dibuat. Silakan lanjutkan ke WhatsApp Admin untuk proses berikutnya.',
      reservation,
      whatsappUrl: waData.url,
      fallbackWhatsappUrl: waData.waMeUrl,
      webWhatsappUrl: waData.webUrl,
      formattedMessage: waData.message,
      adminPhone: waData.phone
    });
  } catch (err: any) {
    // Check for double-booking conflict error
    if (err.message && err.message.includes('baru saja dibooking')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(400).json({ error: err.message || 'Gagal membuat reservasi.' });
  }
});

// ==========================================
// AUTHENTICATION ROUTES (SUPER ADMIN & OWNER)
// ==========================================

app.post('/api/auth/login', (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/Email dan Password wajib diisi.' });
    }

    const user = db.findUserByCredential(usernameOrEmail);
    if (!user) {
      return res.status(401).json({ error: 'Kredensial tidak valid. Silakan periksa kembali.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password salah.' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: payload
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Terjadi kesalahan saat login.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/change-password', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Password lama dan password baru wajib diisi.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
    }

    db.changePassword(req.user!.id, oldPassword, newPassword);
    res.json({ success: true, message: 'Password berhasil diperbarui.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal memperbarui password.' });
  }
});

// ==========================================
// PROTECTED ADMIN & OWNER ROUTES
// ==========================================

// Dashboard Statistics
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memuat statistik dashboard.' });
  }
});

// List All Reservations with Filters
app.get('/api/admin/reservations', authenticateToken, (req, res) => {
  try {
    const { date, status, search } = req.query;
    const reservations = db.getReservations({
      date: date ? String(date) : undefined,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined
    });
    res.json(reservations);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memuat daftar reservasi.' });
  }
});

// Get Single Reservation Detail
app.get('/api/admin/reservations/:id', authenticateToken, (req, res) => {
  try {
    const reservation = db.getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservasi tidak ditemukan.' });
    }
    res.json(reservation);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memuat detail reservasi.' });
  }
});

// Manual Reservation (Super Admin & Owner)
app.post('/api/admin/reservations', authenticateToken, (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      reservation_date,
      reservation_time,
      table_id,
      guest_count,
      notes,
      status
    } = req.body;

    if (!customer_name || !customer_phone || !reservation_date || !reservation_time || !table_id) {
      return res.status(400).json({ error: 'Nama, WhatsApp, Tanggal, Jam, dan Meja wajib diisi.' });
    }

    const reservation = db.createReservation({
      customer_name,
      customer_phone,
      reservation_date,
      reservation_time,
      table_id,
      guest_count: Number(guest_count) || 4,
      notes,
      status: (status as ReservationStatus) || 'CONFIRMED'
    });

    res.status(201).json({
      success: true,
      message: 'Reservasi manual berhasil disimpan.',
      reservation
    });
  } catch (err: any) {
    if (err.message && err.message.includes('baru saja dibooking')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(400).json({ error: err.message || 'Gagal membuat reservasi manual.' });
  }
});

// Update Reservation Status (CONFIRM, COMPLETE, CANCEL, PENDING)
app.patch('/api/admin/reservations/:id/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid.' });
    }

    const updated = db.updateReservationStatus(req.params.id, status as ReservationStatus);
    if (!updated) {
      return res.status(404).json({ error: 'Reservasi tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: `Status reservasi berhasil diubah menjadi ${status}.`,
      reservation: updated
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal memperbarui status reservasi.' });
  }
});

// Delete Reservation (Super Admin Only)
app.delete('/api/admin/reservations/:id', authenticateToken, requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const success = db.deleteReservation(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Reservasi tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Reservasi berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menghapus reservasi.' });
  }
});

// All Tables for Admin (including inactive)
app.get('/api/admin/tables', authenticateToken, (req, res) => {
  try {
    const tables = db.getTables(true);
    res.json(tables);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memuat data meja.' });
  }
});

// Add Table (Super Admin Only)
app.post('/api/admin/tables', authenticateToken, requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const { name, capacity, description, is_active, features } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nama meja wajib diisi.' });
    }

    const newTable = db.createTable({
      name,
      capacity: Number(capacity) || 4,
      description: description || '',
      is_active: is_active !== false,
      features: features || ['Automatic Shuffler', '4 Pax']
    });

    res.status(201).json({ success: true, table: newTable });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal menambahkan meja.' });
  }
});

// Edit Table (Super Admin Only)
app.put('/api/admin/tables/:id', authenticateToken, requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const { name, capacity, description, is_active, features } = req.body;
    const updated = db.updateTable(req.params.id, {
      name,
      capacity: capacity !== undefined ? Number(capacity) : undefined,
      description,
      is_active,
      features
    });

    if (!updated) {
      return res.status(404).json({ error: 'Meja tidak ditemukan.' });
    }

    res.json({ success: true, table: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal memperbarui meja.' });
  }
});

// Delete Table (Super Admin Only)
app.delete('/api/admin/tables/:id', authenticateToken, requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const success = db.deleteTable(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Meja tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Meja berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menghapus meja.' });
  }
});

// Manage Users / Owners (Super Admin Only)
app.get('/api/admin/users', authenticateToken, requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const users = db.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memuat pengguna.' });
  }
});

app.post('/api/admin/users', authenticateToken, requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'Semua field wajib diisi.' });
    }

    const newUser = db.createOwnerAccount({ username, email, password, full_name });
    res.status(201).json({ success: true, user: newUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal membuat akun Owner.' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    db.deleteUser(req.params.id);
    res.json({ success: true, message: 'Pengguna berhasil dihapus.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal menghapus pengguna.' });
  }
});

// Update Business Settings (Super Admin Only)
app.put('/api/admin/settings', authenticateToken, requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const { business_name, location, admin_whatsapp, owner_whatsapp, logo, hero_image, operating_hours, time_slots } = req.body;
    const updated = db.updateSettings({
      business_name,
      location,
      admin_whatsapp,
      owner_whatsapp,
      logo,
      hero_image,
      operating_hours,
      time_slots
    });

    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal memperbarui pengaturan bisnis.' });
  }
});

// ==========================================
// VITE MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EPIC MAHJONG Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
