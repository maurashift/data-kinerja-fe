import { AlertNotification } from "../components/common/alert/alert";

// ==========================
// Utilities: Core Cookie Helpers
// ==========================
type CookieOptions = {
  path?: string;
  maxAge?: number;
  expires?: Date;
  sameSite?: "lax" | "strict" | "none" | "Lax" | "Strict" | "None";
  secure?: boolean;
};

// Menyimpan cookie (Dipakai di Header untuk simpan filter)
export const setCookie = (
  name: string,
  value: string,
  opts: CookieOptions = {},
) => {
  if (typeof document === "undefined") return;

  const {
    path = "/",
    sameSite = "Lax",
    secure = process.env.NODE_ENV === "production",
    maxAge,
    expires,
  } = opts;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; Path=${path}; SameSite=${sameSite}`;
  if (secure) cookie += "; Secure";
  if (typeof maxAge === "number") cookie += `; Max-Age=${maxAge}`;
  if (expires instanceof Date) cookie += `; Expires=${expires.toUTCString()}`;

  document.cookie = cookie;
};

// Mengambil cookie
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const target = `; ${encodeURIComponent(name)}=`;
  const value = `; ${document.cookie}`;
  const parts = value.split(target);
  if (parts.length === 2) {
    const raw = parts.pop()!.split(";").shift()!;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
};

// Menghapus cookie
export const removeCookie = (name: string, path = "/") => {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(
    name,
  )}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

// ==================================
// App State / Filter Helpers
// ==================================

/**
 * Menggantikan fungsi logout.
 * Fungsinya untuk mereset semua filter aplikasi ke kondisi awal.
 * Bisa dipasang di tombol "Reset" atau tombol keluar di sidebar.
 */
export const logout = () => {
  // Hapus cookie filter yang digunakan di Header.tsx
  removeCookie("selectedDinas", "/");
  removeCookie("selectedCategory", "/");
  removeCookie("selectedPeriode", "/");
  removeCookie("selectedYear", "/");

  // Notifikasi Feedback
  AlertNotification(
    "Aplikasi Direset", 
    "Filter data telah dibersihkan.", 
    "success", 
    1500, 
    false
  );
  
  // Reload halaman agar kembali bersih
  setTimeout(() => {
    if (typeof window !== "undefined") {
        window.location.reload();
    }
  }, 1000);
};

// Helper untuk membaca Data Dinas & Tahun yang sedang aktif (JSON Parsed)
// Berguna jika Anda butuh data ini di komponen lain selain Header
export const getOpdTahun = () => {
  const tRaw = getCookie("selectedYear");
  const oRaw = getCookie("selectedDinas");
  
  let tahun: any = null;
  let opd: any = null;

  try {
    if (tRaw) tahun = tRaw; // Tahun biasanya string biasa "2024"
  } catch {}

  try {
    if (oRaw) opd = JSON.parse(oRaw); // Dinas tersimpan sebagai JSON Object {value, label}
  } catch {}

  return { tahun, opd };
};

// Helper untuk membaca Periode yang sedang aktif
export const getPeriode = () => {
  const pRaw = getCookie("selectedPeriode");
  try {
    if (pRaw) return { periode: JSON.parse(pRaw) };
  } catch {}
  return { periode: null };
};