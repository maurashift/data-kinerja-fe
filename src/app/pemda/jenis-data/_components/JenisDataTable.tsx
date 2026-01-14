"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Trash2 } from "lucide-react";
import AddDataTableModal from "./AddDataTableModal";
import EditDataTableModal from "./EditDataTableModal";
import { getCookie } from "@/src/lib/cookie"; 
import { useBrandingContext } from "@/src/providers/BrandingProvider";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ===== Types =====
type JenisData = { id: number; jenis_data: string };

type Target = {
  tahun: string;
  satuan: string;
  target: string | number;
};

type DataKinerjaItem = {
  id: number;
  jenis_data_id?: number;
  nama_data: string;
  rumus_perhitungan: string;
  sumber_data: string;
  instansi_produsen_data: string;
  keterangan: string;
  target: Target[];
};

type JenisDataTableProps = {
  jenisDataList: JenisData[];
  dataKinerjaMap: Record<number, DataKinerjaItem[]>;
  onReloadAction: () => void;
  kodeOpd: string | null; // Opsional untuk Pemda, tapi tetap diterima agar konsisten
};

// ===== Helpers =====
const safeParseOption = (
  v: string | null | undefined,
): { value: string; label: string } | null => {
  if (!v) return null;
  try {
    const o = JSON.parse(v);
    if (o && typeof o.value === "string" && typeof o.label === "string")
      return o;
  } catch {}
  return null;
};

const parseRange = (label: string) => {
  const m = label.match(/(\d{4}).*?(\d{4})/);
  return {
    start: m ? parseInt(m[1], 10) : NaN,
    end: m ? parseInt(m[2], 10) : NaN,
  };
};

export default function JenisDataTable({
  jenisDataList,
  dataKinerjaMap,
  onReloadAction,
  kodeOpd,
}: JenisDataTableProps) {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<number | null>(null);

  // modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedJenisId, setSelectedJenisId] = useState<string | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState<DataKinerjaItem | null>(null);
  const [selectedJenisIdForEdit, setSelectedJenisIdForEdit] = useState<number | null>(null);
  const [openKetModal, setOpenKetModal] = useState(false);
  const [ketContent, setKetContent] = useState<string>("");

  // header cookies
  const [checked, setChecked] = useState(false);
  const [mode, setMode] = useState<"periode" | "tahun" | null>(null);
  const [periodeLabel, setPeriodeLabel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const { branding } = useBrandingContext();

  useEffect(() => {
    const cat = safeParseOption(getCookie("selectedCategory"));
    const periode = safeParseOption(getCookie("selectedPeriode"));
    const year = getCookie("selectedYear") || "";

    const m =
      cat && (cat.value === "periode" || cat.value === "tahun")
        ? (cat.value as "periode" | "tahun")
        : year
        ? "tahun"
        : "periode";

    setMode(m);
    setPeriodeLabel(periode?.label ?? null);
    setSelectedYear(year || null);
    setChecked(true);
  }, []);

  const years: string[] = useMemo(() => {
    if (!checked) return [];
    if (mode === "tahun") return selectedYear ? [selectedYear] : [];
    if (mode === "periode") {
      if (!periodeLabel) return [];
      const { start, end } = parseRange(periodeLabel);
      if (Number.isNaN(start) || Number.isNaN(end) || start > end) return [];
      const arr: string[] = [];
      for (let y = start; y <= end; y++) arr.push(String(y));
      return arr;
    }
    return [];
  }, [checked, mode, periodeLabel, selectedYear]);

  // ===== PDF GENERATION (PEMDA) =====
  const handleSavePDF = (currentJenisId: number, currentJenisName: string) => {
    const doc = new jsPDF("l", "mm", "a4"); // Landscape

    // Header Laporan
    doc.setFontSize(14);
    doc.text(`Data Kinerja Pemda - ${currentJenisName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode/Tahun: ${mode === "tahun" ? selectedYear : periodeLabel}`, 14, 22);

    // 1. Definisikan Kolom
    const tableHeaders = [
      "No",
      "Nama Data",
      "Definisi Operasional",
      "Sumber Data",
      "Instansi Produsen",
      ...years, // Kolom tahun dinamis
      "Satuan",
      "Keterangan", 
    ];

    // 2. Persiapkan Data Rows
    const rowsData = dataKinerjaMap[currentJenisId] ?? [];
    
    // Filter rows sesuai tahun yang aktif
    const visibleRows = years.length === 0 ? rowsData : rowsData.filter((row) => {
        if (!row.target || row.target.length === 0) return false;
        return row.target.some((t) => {
            const yearStr = String(t.tahun);
            return years.includes(yearStr) && t.target !== null && t.target !== undefined && String(t.target).trim() !== "";
        });
    });

    const tableBody = visibleRows.map((row, index) => {
      const tahunMap: Record<string, string> = {};
      row.target?.forEach((t) => {
        if (t?.tahun) tahunMap[String(t.tahun)] = String(t.target);
      });

      const satuan = row.target?.[0]?.satuan ?? "-";

      return [
        index + 1,
        row.nama_data,
        row.rumus_perhitungan,
        row.sumber_data,
        row.instansi_produsen_data,
        ...years.map((y) => tahunMap[y] ?? "-"),
        satuan,
        row.keterangan || "-" // Isi keterangan full
      ];
    });

    // 3. Generate Tabel dengan Styling
    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      startY: 28,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: "middle",
        halign: "center",
        lineWidth: 0.1, 
        lineColor: [200, 200, 200], 
      },
      headStyles: {
        fillColor: [16, 185, 129], // Hijau
        textColor: 255, 
        lineWidth: 0.1, 
        lineColor: [255, 255, 255], 
      },
      columnStyles: {
        1: { halign: "left" }, 
        2: { halign: "left" }, 
        [tableHeaders.length - 1]: { halign: "left", cellWidth: 35 },
      },
    });

    doc.save(`data-kinerja-pemda-${currentJenisName}.pdf`);
  };

  const toggleOpen = (id: number) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
  };

  // --- DELETE KINERJA (PEMDA) ---
  const handleDeleteKinerja = async (rowId: number, _jenisId: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    const base = branding?.api_perencanaan;
    if (!base) {
      alert("Base URL api_perencanaan belum diset.");
      return;
    }

    try {
      // Endpoint PEMDA: /datakinerjapemda/{id}
      const url = `${base}/api/v1/datakinerjapemda/${rowId}`;
      console.log("DELETE PEMDA ROW:", url);

      const res = await fetch(url, {
        method: "DELETE",
        headers: { accept: "application/json" },
      });

      if (!res.ok) {
        console.error("Delete failed:", res.status);
        alert(`❌ Gagal menghapus data (HTTP ${res.status})`);
        return;
      }

      alert("✅ Data berhasil dihapus!");
      await onReloadAction();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("❌ Terjadi kesalahan saat menghapus data.");
    }
  };

  // --- DELETE JENIS DATA (PEMDA) ---
  const handleDeleteJenisData = async (jenisId: number) => {
    if (!confirm("⚠️ PERINGATAN: Yakin ingin menghapus JENIS KELOMPOK DATA PEMDA ini?\nSemua data di dalamnya akan hilang.")) return;

    const base = branding?.api_perencanaan;
    if (!base) {
      alert("Base URL belum diset.");
      return;
    }

    try {
      // Endpoint PEMDA: /jenisdatapemda/{id}
      const url = `${base}/api/v1/jenisdatapemda/${jenisId}`;
      console.log("DELETE PEMDA JENIS DATA:", url);

      const res = await fetch(url, {
        method: "DELETE",
        headers: { accept: "application/json" },
      });

      if (!res.ok) {
        console.error("Delete Jenis Data failed:", res.status);
        let msg = `HTTP ${res.status}`;
        try {
            const j = await res.json();
            if(j.message) msg = j.message;
        } catch {}
        alert(`❌ Gagal menghapus Jenis Data: ${msg}`);
        return;
      }

      alert("✅ Jenis Kelompok Data Pemda berhasil dihapus!");
      setOpenId(null);
      await onReloadAction();
    } catch (error) {
      console.error("Gagal menghapus jenis data:", error);
      alert("❌ Terjadi kesalahan sistem.");
    }
  };

  if (!checked) return null;

  return (
    <div className="space-y-3">
      {jenisDataList?.length ? (
        jenisDataList.map((item, idx) => {
          const isOpen = openId === item.id;
          const rows = dataKinerjaMap[item.id] ?? [];

          const visibleRows =
            years.length === 0
              ? rows
              : rows.filter((row) => {
                  if (!row.target || row.target.length === 0) return false;
                  return row.target.some((t) => {
                    const yearStr = String(t.tahun);
                    const inRange = years.includes(yearStr);
                    const val = t.target;
                    const hasValue =
                      val !== null &&
                      val !== undefined &&
                      !(typeof val === "string" && val.trim() === "");
                    return inRange && hasValue;
                  });
                });

          return (
            <div key={item.id} className="border rounded-xl overflow-hidden">
              {/* Header Accordion */}
              <button
                onClick={() => toggleOpen(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition
                  ${
                    isOpen
                      ? "bg-emerald-500 text-white"
                      : "bg-white hover:bg-emerald-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold w-6 text-center">
                    {idx + 1}
                  </span>
                  <span className="font-semibold">
                    Jenis Data — {item.jenis_data}
                  </span>
                </div>
                <ChevronDown
                  className={`transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  size={18}
                />
              </button>

              {/* Konten Detail */}
              {isOpen && (
                <div className="p-4 border-t bg-white">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <p className="text-sm text-gray-700">
                      Data Kinerja Pemda untuk jenis:{" "}
                      <span className="font-semibold">{item.jenis_data}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSavePDF(item.id, item.jenis_data)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition"
                      >
                        💾 Simpan PDF
                      </button>

                      <button
                        onClick={() => {
                          setSelectedJenisId(String(item.id));
                          setOpenAddModal(true);
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition"
                      >
                        + Tambah Data Kinerja
                      </button>
                    </div>
                  </div>

                  {visibleRows.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 border border-dashed rounded-lg">
                      Tidak ada data kinerja untuk tahun/periode yang dipilih.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table
                        id="table-jenis-data"
                        className="w-full text-sm text-left border-collapse"
                      >
                        <thead className="bg-[#10B981] text-white uppercase">
                          <tr>
                            <th rowSpan={2} className="p-2 border text-center">No</th>
                            <th rowSpan={2} className="p-2 border text-center">Nama Data</th>
                            <th rowSpan={2} className="p-2 border text-center">Definisi Operasional</th>
                            <th rowSpan={2} className="p-2 border text-center">Sumber Data</th>
                            <th rowSpan={2} className="p-2 border text-center">Instansi Produsen Data</th>
                            <th colSpan={years.length} className="p-2 border text-center">Jumlah</th>
                            <th rowSpan={2} className="p-2 border text-center">Satuan</th>
                            <th rowSpan={2} className="p-2 border text-center">Keterangan</th>
                            <th rowSpan={2} className="p-2 border text-center">Aksi</th>
                          </tr>
                          <tr>
                            {years.map((y) => (
                              <th key={y} className="p-2 border text-center">{y}</th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {visibleRows.map((row, index) => {
                            const tahunMap: Record<string, string> = {};
                            row.target?.forEach((t) => {
                              if (t?.tahun)
                                tahunMap[String(t.tahun)] = String(t.target);
                            });

                            const firstDisplayedYear = years[0];
                            const satuanByYear =
                              row.target?.find(
                                (t) => String(t.tahun) === firstDisplayedYear,
                              )?.satuan ??
                              row.target?.[0]?.satuan ??
                              "-";

                            return (
                              <tr key={row.id} className="bg-white hover:bg-gray-50">
                                <td className="p-2 border text-center">{index + 1}</td>
                                <td className="p-2 border">{row.nama_data}</td>
                                <td className="p-2 border">{row.rumus_perhitungan}</td>
                                <td className="p-2 border">{row.sumber_data}</td>
                                <td className="p-2 border">{row.instansi_produsen_data}</td>

                                {years.map((y) => (
                                  <td key={y} className="p-2 border text-center">
                                    {tahunMap[y] ?? "-"}
                                  </td>
                                ))}

                                <td className="p-2 border text-center">{satuanByYear}</td>
                                <td className="p-2 border text-center">
                                  <button
                                    onClick={() => {
                                      setKetContent(row.keterangan || "");
                                      setOpenKetModal(true);
                                    }}
                                    className="px-3 py-1 text-white rounded bg-purple-500 hover:bg-purple-600 text-xs"
                                  >
                                    Lihat
                                  </button>
                                </td>
                                <td className="p-2 border text-center">
                                  <div className="flex flex-col items-center gap-2">
                                    <button
                                      onClick={() => {
                                        const prepared: DataKinerjaItem = {
                                          ...row,
                                          jenis_data_id: row.jenis_data_id ?? item.id,
                                        };
                                        setSelectedEditItem(prepared);
                                        setSelectedJenisIdForEdit(item.id);
                                        setOpenEditModal(true);
                                      }}
                                      className="px-3 py-1 text-white rounded bg-green-500 hover:bg-green-600 w-full max-w-[80px] text-xs"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteKinerja(row.id, item.id)}
                                      className="px-3 py-1 text-white rounded bg-red-500 hover:bg-red-600 w-full max-w-[80px] text-xs"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* BUTTON HAPUS JENIS KELOMPOK DATA (PEMDA) */}
                  <div className="mt-6 pt-4 border-t flex justify-end">
                    <button
                      onClick={() => handleDeleteJenisData(item.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 border border-red-300 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Hapus Jenis Kelompok Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="border rounded-xl p-8 text-center text-gray-500 bg-white">
          <p className="text-lg">Belum ada data.</p>
          <p className="text-sm mt-1">Silakan tambah Jenis Kelompok Data baru.</p>
        </div>
      )}

      {/* Modal TAMBAH DATA KINERJA */}
      {openAddModal && selectedJenisId && (
        <AddDataTableModal
          isOpen={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onSuccess={async () => {
            await onReloadAction();
            setOpenAddModal(false);
          }}
          jenisDataId={selectedJenisId}
          // kodeOpd opsional di Pemda
        />
      )}

      {/* Modal EDIT DATA KINERJA */}
      {openEditModal && selectedEditItem && (
        <EditDataTableModal
          isOpen={openEditModal}
          onClose={() => setOpenEditModal(false)}
          onSuccess={async () => {
            await onReloadAction();
          }}
          dataItem={selectedEditItem as any}
          jenisDataId={
            selectedJenisIdForEdit != null
              ? String(selectedJenisIdForEdit)
              : undefined
          }
        />
      )}

      {/* Modal KETERANGAN / NARASI */}
      {openKetModal && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setOpenKetModal(false)}
        >
          <div
            className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                KETERANGAN / NARASI
              </h3>
              <button
                onClick={() => setOpenKetModal(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {ketContent ? (
                <p className="text-gray-700 whitespace-pre-line">
                  {ketContent}
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
}