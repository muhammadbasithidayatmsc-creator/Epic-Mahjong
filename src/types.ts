export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type TableAvailabilityStatus = 'AVAILABLE' | 'PENDING' | 'BOOKED';

export type UserRole = 'SUPER_ADMIN' | 'OWNER';

export interface MahjongTable {
  id: string;
  name: string;
  capacity: number;
  description: string;
  is_active: boolean;
  features?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Reservation {
  id: string;
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:mm (e.g., "14:00")
  table_id: string;
  table_name?: string;
  guest_count: number;
  notes: string;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  business_name: string;
  location: string;
  admin_whatsapp: string;
  owner_whatsapp?: string;
  logo?: string;
  hero_image?: string;
  operating_hours?: string;
  time_slots: string[];
  updated_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
}

export interface TableWithAvailability extends MahjongTable {
  status: TableAvailabilityStatus;
  activeReservation?: {
    booking_code: string;
    customer_name?: string;
    status: ReservationStatus;
  };
}

export interface ScheduleSlot {
  time: string;
  tables: {
    table_id: string;
    table_name: string;
    status: TableAvailabilityStatus;
    booking_code?: string;
  }[];
}
