import React, { useState, useEffect } from 'react';
import { Settings, Save, Shield, RefreshCw, MessageCircle, MapPin, Clock, Building, Phone } from 'lucide-react';
import { api } from '../../lib/api';
import { BusinessSettings, UserProfile } from '../../types';

interface AdminSettingsProps {
  user: UserProfile;
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
  onSettingsUpdated?: (settings: BusinessSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  user,
  onSuccessToast,
  onErrorToast,
  onSettingsUpdated
}) => {
  const [businessName, setBusinessName] = useState('EPIC MAHJONG');
  const [location, setLocation] = useState('Alam Sutera');
  const [adminWhatsApp, setAdminWhatsApp] = useState('085181959275');
  const [ownerWhatsApp, setOwnerWhatsApp] = useState('08159804100');
  const [operatingHours, setOperatingHours] = useState('10:00 - 02:00 WIB');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setBusinessName(data.business_name || 'EPIC MAHJONG');
      setLocation(data.location || 'Alam Sutera');
      setAdminWhatsApp(data.admin_whatsapp || '085181959275');
      setOwnerWhatsApp(data.owner_whatsapp || '08159804100');
      setOperatingHours(data.operating_hours || '10:00 - 02:00 WIB');
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal memuat pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      onErrorToast('Hanya Super Admin yang berhak menyimpan pengaturan.');
      return;
    }

    setSaving(true);
    try {
      const updated = await api.updateSettings({
        business_name: businessName.trim(),
        location: location.trim(),
        admin_whatsapp: adminWhatsApp.trim(),
        owner_whatsapp: ownerWhatsApp.trim(),
        operating_hours: operatingHours.trim()
      });

      onSuccessToast('Pengaturan bisnis berhasil diperbarui!');
      if (onSettingsUpdated) onSettingsUpdated(updated);
    } catch (err: any) {
      onErrorToast(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center text-slate-400 bg-[#111724] border border-slate-800 rounded-2xl">
        <Shield className="w-10 h-10 mx-auto text-amber-500 mb-2 opacity-60" />
        <h3 className="text-base font-bold text-slate-200">Akses Terbatas</h3>
        <p className="text-xs text-slate-400 mt-1">Pengaturan profil dan nomor WhatsApp Super Admin hanya dapat diedit oleh Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100">
            Pengaturan Bisnis Epic Mahjong
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Konfigurasi informasi bisnis utama dan nomor WhatsApp tujuan reservasi customer
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-[#111724] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          
          {/* Business Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-slate-300 uppercase tracking-wider">
              <Building className="w-4 h-4 text-amber-400" />
              <span>Nama Bisnis Venue</span>
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-[#161f30] border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              Nama ini akan ditampilkan pada header, hero banner, WhatsApp format, dan footer.
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-slate-300 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Lokasi Venue</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#161f30] border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              Lokasi saat ini: Alam Sutera.
            </p>
          </div>

          {/* WhatsApp Super Admin */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-slate-300 uppercase tracking-wider">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Nomor WhatsApp Super Admin (Tujuan Reservasi)</span>
            </label>
            <input
              type="text"
              required
              value={adminWhatsApp}
              onChange={(e) => setAdminWhatsApp(e.target.value)}
              className="w-full bg-[#161f30] border border-slate-700 rounded-xl p-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
              <strong>PENTING:</strong> Nomor ini (<code className="font-bold">{adminWhatsApp}</code>) menjadi nomor tujuan utama ketika customer selesai mengisi form dan menekan tombol booking di website.
            </div>
          </div>

          {/* WhatsApp Owner (Data Kontak Internal) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-slate-300 uppercase tracking-wider">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Nomor WhatsApp Owner (Kontak Internal Sistem)</span>
            </label>
            <input
              type="text"
              value={ownerWhatsApp}
              onChange={(e) => setOwnerWhatsApp(e.target.value)}
              className="w-full bg-[#161f30] border border-slate-700 rounded-xl p-3 text-amber-400 font-mono text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              Data kontak Owner di sistem jika sewaktu-waktu diperlukan koordinasi internal: 08159804100.
            </p>
          </div>

          {/* Operating Hours */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-slate-300 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Jam Operasional</span>
            </label>
            <input
              type="text"
              required
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="w-full bg-[#161f30] border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              Contoh format: 10:00 - 02:00 WIB
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
