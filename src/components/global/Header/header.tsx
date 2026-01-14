"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Cookies from "js-cookie";
import { setCookie, getCookie } from "../../../lib/cookie";
import { AlertNotification } from "../../common/alert/alert";
import { usePathname } from "next/navigation";

// Definisi Tipe
interface OptionTypeString {
  value: string;
  label: string;
}

type CategoryValue = "periode" | "tahun";

// Konstanta
const CATEGORY_OPTIONS: OptionTypeString[] = [
  { value: "periode", label: "Periode (5 Tahunan)" },
  { value: "tahun", label: "Tahunan" },
];

// URL API (gunakan fallback jika env tidak ada)
const API_PERIODE =
  process.env.NEXT_PUBLIC_PERIODE_API ??
  "https://periode-service-test.zeabur.app/periode";
const API_OPD =
  process.env.NEXT_PUBLIC_OPD_API ??
  "https://periode-service-test.zeabur.app/list_opd";

// Helper parse JSON aman
const safeParseOption = (
  v: string | null | undefined
): OptionTypeString | null => {
  if (!v) return null;
  try {
    const o = JSON.parse(v);
    if (o && typeof o.value === "string" && typeof o.label === "string")
      return o;
  } catch {}
  return null;
};

// --- KOMPONEN HEADER ---
// Kita hapus props sidebarOpen/setSidebarOpen agar sesuai dengan LayoutWrapper yang error tadi
const Header = () => {
  const pathname = usePathname();

  // Hapus logika hide on login/register karena sekarang layout global
  // if (pathname === '/') return null; 

  const [isClient, setIsClient] = useState(false);

  // State Data Options
  const [dinasOptions, setDinasOptions] = useState<OptionTypeString[]>([]);
  const [loadingDinas, setLoadingDinas] = useState(false);
  const [dinasError, setDinasError] = useState<string | null>(null);

  const [periodeOptions, setPeriodeOptions] = useState<OptionTypeString[]>([]);
  const [loadingPeriode, setLoadingPeriode] = useState(false);
  const [periodeError, setPeriodeError] = useState<string | null>(null);

  // State Selected Values
  const [selectedDinas, setSelectedDinas] = useState<OptionTypeString | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] =
    useState<OptionTypeString | null>(null);
  const [selectedPeriode, setSelectedPeriode] =
    useState<OptionTypeString | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Init Client Side
  useEffect(() => {
    setIsClient(true);
    const dCookie = safeParseOption(getCookie("selectedDinas"));
    const cCookie = safeParseOption(getCookie("selectedCategory"));
    const pCookie = safeParseOption(getCookie("selectedPeriode"));
    const yCookie = getCookie("selectedYear") || "";
    if (dCookie) setSelectedDinas(dCookie);
    if (cCookie) setSelectedCategory(cCookie);
    if (pCookie) setSelectedPeriode(pCookie);
    if (yCookie) setSelectedYear(yCookie);
  }, []);

  // Fetch Options
  useEffect(() => {
    if (!isClient) return;

    const fetchDinasOptions = async () => {
      setLoadingDinas(true);
      setDinasError(null);
      try {
        const res = await fetch(API_OPD, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const options: OptionTypeString[] = (json?.data ?? []).map(
          (item: any) => ({
            value: String(item.kode_opd),
            label: String(item.nama_opd),
          })
        );
        setDinasOptions(options);
      } catch (e: any) {
        setDinasError(e?.message || "Gagal memuat OPD");
        setDinasOptions([]);
      } finally {
        setLoadingDinas(false);
      }
    };

    const fetchPeriodeOptions = async () => {
      setLoadingPeriode(true);
      setPeriodeError(null);
      try {
        const res = await fetch(API_PERIODE, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const options: OptionTypeString[] = (json?.data ?? []).map(
          (it: any) => ({
            value: String(it.id),
            label: `${it.tahun_awal}-${it.tahun_akhir}`,
          })
        );
        // Sort descending periode
        options.sort((a, b) => {
          const sa = Number(a.label.split("-")[0]);
          const sb = Number(b.label.split("-")[0]);
          return sb - sa;
        });
        setPeriodeOptions(options);
      } catch (e: any) {
        setPeriodeError(e?.message || "Gagal memuat periode");
        setPeriodeOptions([]);
      } finally {
        setLoadingPeriode(false);
      }
    };

    fetchDinasOptions();
    fetchPeriodeOptions();
  }, [isClient]);

  // Sync Cookies
  useEffect(() => {
    if (!isClient) return;
    if (selectedDinas) setCookie("selectedDinas", JSON.stringify(selectedDinas));
    else Cookies.remove("selectedDinas");
  }, [isClient, selectedDinas]);

  useEffect(() => {
    if (!isClient) return;
    if (selectedCategory)
      setCookie("selectedCategory", JSON.stringify(selectedCategory));
    else Cookies.remove("selectedCategory");
  }, [isClient, selectedCategory]);

  useEffect(() => {
    if (!isClient) return;
    if (selectedPeriode)
      setCookie("selectedPeriode", JSON.stringify(selectedPeriode));
    else Cookies.remove("selectedPeriode");
  }, [isClient, selectedPeriode]);

  useEffect(() => {
    if (!isClient) return;
    if (selectedYear) setCookie("selectedYear", selectedYear);
    else Cookies.remove("selectedYear");
  }, [isClient, selectedYear]);

  // Generate Year Options based on Periodes
  const allYearOptions: OptionTypeString[] = useMemo(() => {
    if (!periodeOptions.length) return [];
    let minStart = Infinity;
    let maxEnd = -Infinity;
    for (const p of periodeOptions) {
      const [sStr, eStr] = p.label.split("-");
      const s = Number(sStr);
      const e = Number(eStr);
      if (!Number.isNaN(s) && s < minStart) minStart = s;
      if (!Number.isNaN(e) && e > maxEnd) maxEnd = e;
    }
    if (!Number.isFinite(minStart) || !Number.isFinite(maxEnd)) return [];
    const arr: OptionTypeString[] = [];
    for (let y = maxEnd; y >= minStart; y--) {
      arr.push({ value: String(y), label: `Tahun ${y}` });
    }
    return arr;
  }, [periodeOptions]);

  const onCategoryChange = (opt: OptionTypeString | null) => {
    setSelectedCategory(opt);
    if (!opt) {
      setSelectedPeriode(null);
      setSelectedYear("");
      return;
    }
    if (opt.value === "periode") setSelectedYear("");
    else if (opt.value === "tahun") setSelectedPeriode(null);
  };

  const handleActivate = () => {
    if (!selectedDinas) {
      AlertNotification("Gagal", "Harap pilih Dinas/OPD terlebih dahulu", "error", 2000, true);
      return;
    }
    if (!selectedCategory) {
      AlertNotification("Gagal", "Harap pilih Kategori (Periode/Tahunan)", "error", 2000, true);
      return;
    }
    const cat = selectedCategory.value as CategoryValue;
    if (cat === "periode" && !selectedPeriode) {
      AlertNotification("Gagal", "Harap pilih Periode 5 tahunan", "error", 2000, true);
      return;
    }
    if (cat === "tahun" && !selectedYear) {
      AlertNotification("Gagal", "Harap pilih Tahun", "error", 2000, true);
      return;
    }
    AlertNotification(
      "Berhasil",
      cat === "periode" ? "Filter Periode diaktifkan" : "Filter Tahun diaktifkan",
      "success",
      1200,
      false
    );
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    // Wrapper div untuk header filter
    <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-30 shadow-sm">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        
        {/* Kiri: Judul OPD Terpilih */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <h2 className="text-lg font-bold text-gray-800 break-words">
            {isClient
              ? selectedDinas?.label ?? "Pilih Dinas/OPD"
              : "Pilih Dinas/OPD"}
          </h2>
        </div>

        {/* Kanan: Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
          {isClient && (
            <>
              {/* DINAS */}
              <div className="w-full sm:w-64 text-gray-900 text-sm">
                <Select
                  instanceId="select-dinas"
                  name="dinas"
                  classNamePrefix="rs"
                  value={selectedDinas ?? null}
                  options={dinasOptions}
                  onChange={(opt) => setSelectedDinas(opt ?? null)}
                  isLoading={loadingDinas}
                  placeholder={loadingDinas ? "Memuat..." : dinasError || "Pilih Dinas/OPD"}
                  isSearchable
                  isClearable
                />
              </div>

              {/* KATEGORI */}
              <div className="w-full sm:w-48 text-gray-900 text-sm">
                <Select
                  instanceId="select-category"
                  name="category"
                  classNamePrefix="rs"
                  value={selectedCategory ?? null}
                  options={CATEGORY_OPTIONS}
                  onChange={onCategoryChange}
                  placeholder="Pilih Kategori"
                  isSearchable={false}
                  isClearable
                />
              </div>

              {/* PERIODE / TAHUN */}
              {selectedCategory?.value === "periode" && (
                <div className="w-full sm:w-48 text-gray-900 text-sm">
                  <Select
                    instanceId="select-periode"
                    name="periode"
                    classNamePrefix="rs"
                    value={selectedPeriode ?? null}
                    options={periodeOptions}
                    onChange={(opt) => setSelectedPeriode(opt ?? null)}
                    isLoading={loadingPeriode}
                    placeholder={loadingPeriode ? "Memuat..." : periodeError || "Pilih Periode"}
                    isSearchable
                    isClearable
                  />
                </div>
              )}

              {selectedCategory?.value === "tahun" && (
                <div className="w-full sm:w-40 text-gray-900 text-sm">
                  <Select
                    instanceId="select-tahun"
                    name="tahun"
                    classNamePrefix="rs"
                    value={selectedYear ? { value: selectedYear, label: `Tahun ${selectedYear}` } : null}
                    options={allYearOptions}
                    onChange={(opt) => setSelectedYear(opt?.value ?? "")}
                    placeholder="Pilih Tahun"
                    isSearchable
                    isClearable
                    isDisabled={!allYearOptions.length}
                  />
                </div>
              )}
            </>
          )}

          {/* TOMBOL AKTIFKAN */}
          <div className="w-full sm:w-auto">
            <button
              className="w-full sm:w-auto bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-900 transition shadow-sm"
              onClick={handleActivate}
            >
              Aktifkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;