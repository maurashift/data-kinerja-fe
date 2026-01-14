"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getCookie } from "@/src/lib/cookie"; // Pastikan path import benar

// ===== Types =====
export type TargetItem = {
  tahun: string | number;
  satuan: string;
  target: string | number;
};

export type DataKinerja = {
  id: number;
  nama_data: string;
  rumus_perhitungan: string;
  sumber_data: string;
  instansi_produsen_data: string;
  keterangan: string;
  target: TargetItem[];
};

type DataTableProps = {
  dataList?: DataKinerja[];
  onUpdate: (item: DataKinerja) => void;
  onDelete: (id: number) => void;
};

// ===== Helpers =====
type RSOption = { value: string; label: string };

const safeParseOption = (v: string | null | undefined): RSOption | null => {
  if (!v) return null;
  try {
    const o = JSON.parse(v);
    if (o && typeof o.value === "string" && typeof o.label === "string") {
      return o;
    }
  } catch {}
  return null;
};

const parseRange = (label: string) => {
  // dukung "2020-2024" atau "2020–2024"
  const m = label.match(/(\d{4}).*?(\d{4})/);
  return {
    start: m ? parseInt(m[1], 10) : NaN,
    end: m ? parseInt(m[2], 10) : NaN,
  };
};

const DataTable = ({ dataList = [], onUpdate, onDelete }: DataTableProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [keterangan, setKeterangan] = useState("");

  // header cookies
  const [checked, setChecked] = useState(false);
  const [mode, setMode] = useState<"periode" | "tahun" | null>(null);
  const [periodeLabel, setPeriodeLabel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedDinas, setSelectedDinas] = useState<RSOption | null>(null);

  // Baca cookies dari header dan tentukan mode + tahun yang ditampilkan
  useEffect(() => {
    const catRaw = safeParseOption(getCookie("selectedCategory"));
    const periodeRaw = safeParseOption(getCookie("selectedPeriode"));
    // Menggunakan selectedDinas agar konsisten dengan Header
    const dinasRaw = safeParseOption(getCookie("selectedDinas")); 
    const year = (getCookie("selectedYear") || "").trim();

    const cat = catRaw && catRaw.value ? (catRaw as RSOption) : null;
    const periode = periodeRaw && periodeRaw.value ? (periodeRaw as RSOption) : null;
    const dinas = dinasRaw && dinasRaw.value ? (dinasRaw as RSOption) : null;

    // tentukan mode: utamakan cookie kategori; fallback: ada selectedYear → 'tahun' else 'periode'
    const m =
      cat && (cat.value === "periode" || cat.value === "tahun")
        ? (cat.value as "periode" | "tahun")
        : year
        ? "tahun"
        : "periode";

    setMode(m);
    setPeriodeLabel(periode?.label ?? null);
    setSelectedYear(year || null);
    setSelectedDinas(dinas ?? null);
    setChecked(true);
  }, []);

  // Buat daftar tahun yang akan ditampilkan sebagai kolom
  const years: string[] = useMemo(() => {
    if (mode === "tahun") {
      return selectedYear ? [selectedYear] : [];
    }
    if (mode === "periode") {
      if (!periodeLabel) return [];
      const { start, end } = parseRange(periodeLabel);
      if (Number.isNaN(start) || Number.isNaN(end) || start > end) return [];
      const arr: string[] = [];
      for (let y = start; y <= end; y++) arr.push(String(y));
      return arr;
    }
    return [];
  }, [mode, periodeLabel, selectedYear]);

  const handleOpenModal = (ket: string) => {
    setKeterangan(ket || "");
    setOpenModal(true);
  };

  // anti-flicker: tunggu cek cookie dulu
  if (!checked) return null;

  // guard: cuma tampil kalau OPD + Periode/Tahun bener2 keisi dan years > 0
  const hasDinas = !!(selectedDinas && selectedDinas.value);
  const hasPeriode =
    mode === "periode" && !!periodeLabel && periodeLabel.trim() !== "";
  const hasYear =
    mode === "tahun" && !!selectedYear && selectedYear.trim() !== "";

  const filterActive = hasDinas && (hasPeriode || hasYear) && years.length > 0;

  if (!filterActive) {
    return (
      <div className="border p-5 rounded-xl shadow-lg bg-white">
        <p className="text-center text-red-600 font-semibold">
          Pilih <span className="underline">Dinas/OPD</span> dan{" "}
          <span className="underline">Periode/Tahun</span> di header, lalu
          klik <span className="underline">Aktifkan</span> terlebih dahulu.
        </p>
      </div>
    );
  }

  // hitung kolspan baris "Tidak ada data"
  const FIXED_COLS = 8; 
  const emptyRowColSpan = FIXED_COLS + years.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#10B981] text-white uppercase rounded-t-xl">
          <tr>
            <th rowSpan={2} className="p-2 border border-gray-300 text-center">
              No
            </th>
            <th rowSpan={2} className="p-2 border border-gray-300 text-center">
              Nama Data
            </th>
            <th rowSpan={2} className="p-2 border border-gray-300 text-center">
              Definisi Operasional
            </th>
            <th rowSpan={2} className="p-2 border border-gray-300 text-center">
              Sumber Data
            </th>
            <th rowSpan={2} className="p-2 border border-gray-300 text-center">
              Instansi Produsen Data
            </th>
            <th
              colSpan={years.length}
              className="p-2 border border-gray-300 text-center"
            >
              Jumlah{" "}
              {mode === "periode" && periodeLabel
                ? `(${periodeLabel.replace("–", "-")})`
                : ""}
              {mode === "tahun" && selectedYear ? `(${selectedYear})` : ""}
            </th>
            <th rowSpan={2} className="p-2 border border-gray-300 text-center">
              Satuan
            </th>
            <th rowSpan={2} className="p-2 border border-gray-300 text-center">
              Keterangan/Narasi
            </th>
            <th rowSpan={2} className="p-2 border border-gray-300 text-center">
              Aksi
            </th>
          </tr>
          <tr>
            {years.map((y) => (
              <th key={y} className="p-2 border border-gray-300 text-center">
                {y}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {dataList.length > 0 ? (
            dataList.map((row, index) => {
              // mapping tahun → nilai jumlah
              const tahunMap: Record<string, string> = {};
              row.target?.forEach((t) => {
                if (t?.tahun) tahunMap[String(t.tahun)] = String(t.target);
              });

              // ambil satuan: prioritaskan satuan yang match tahun yang tampil; fallback ke target[0]
              const firstDisplayedYear = years[0];
              const satuanByYear =
                row.target?.find((t) => String(t.tahun) === firstDisplayedYear)
                  ?.satuan ??
                row.target?.[0]?.satuan ??
                "-";

              return (
                <tr key={row.id} className="bg-white hover:bg-gray-50">
                  <td className="p-2 border border-gray-300 text-center">
                    {index + 1}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {row.nama_data}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {row.rumus_perhitungan}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {row.sumber_data}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {row.instansi_produsen_data}
                  </td>

                  {years.map((y) => (
                    <td
                      key={y}
                      className="p-2 border border-gray-300 text-center"
                    >
                      {tahunMap[y] ?? "-"}
                    </td>
                  ))}

                  <td className="p-2 border border-gray-300 text-center">
                    {satuanByYear}
                  </td>
                  <td className="p-2 border border-gray-300 text-center">
                    <button
                      onClick={() => handleOpenModal(row.keterangan)}
                      className="px-3 py-1 text-white rounded bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition text-xs"
                    >
                      Tampilkan
                    </button>
                  </td>
                  <td className="p-2 border border-gray-300 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => onUpdate(row)}
                        className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-md w-full max-w-[100px] text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-200 shadow-md w-full max-w-[100px] text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="bg-white">
              <td
                colSpan={emptyRowColSpan}
                className="p-3 text-center text-gray-500 border border-gray-300"
              >
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Keterangan/Narasi */}
      {openModal && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setOpenModal(false)}
        >
          <div
            className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                KETERANGAN / NARASI DATA
              </h3>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {keterangan ? (
                <p className="text-gray-700 whitespace-pre-line">
                  {keterangan}
                </p>
              ) : (
                <p className="text-gray-400 italic">
                  Belum ada keterangan/narasi
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;