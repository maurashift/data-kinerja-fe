"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { FiHome } from "react-icons/fi";
import { useBrandingContext } from "@/src/providers/BrandingProvider";
import { LoadingClip } from "@/src/components/global/Loading/loading"; 
import JenisDataTable from "../../pemda/jenis-data/_components/JenisDataTable"; 
import AddDataModal from "./_components/AddDataModal"; 

// --- Types ---
type JenisData = {
  id: number;
  jenis_data: string;
};

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

export default function PageJenisData() {
  const { branding } = useBrandingContext();
  
  // State untuk Data
  const [jenisDataList, setJenisDataList] = useState<JenisData[]>([]);
  const [dataKinerjaMap, setDataKinerjaMap] = useState<Record<number, DataKinerjaItem[]>>({});
  
  // State UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);

  // 1. Fungsi Fetch Data (Parallel Fetch)
  const fetchData = useCallback(async () => {
    if (!branding?.api_perencanaan) return;

    setIsLoading(true);
    setError(null);

    try {
      // Kita jalankan dua request sekaligus agar efisien
      const [resJenis, resKinerja] = await Promise.all([
        // 1. Fetch Master Jenis Data (Agar yang kosong tetap muncul)
        fetch(`${branding.api_perencanaan}/api/v1/jenisdata`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }),
        // 2. Fetch Data Kinerja (Isi tabel yang nested)
        fetch(`${branding.api_perencanaan}/api/v1/datakinerjapemda/list`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        })
      ]);

      if (!resJenis.ok) throw new Error("Gagal mengambil Master Jenis Data.");
      // Note: Jika datakinerja kosong/error mungkin kita tetap mau tampilkan jenis data, 
      // tapi untuk strict error handling kita throw error juga.
      if (!resKinerja.ok) throw new Error("Gagal mengambil Data Kinerja.");

      const jsonJenis = await resJenis.json();
      const jsonKinerja = await resKinerja.json();

      // --- A. SET JENIS DATA LIST (Header Accordion) ---
      const listJenisRaw = Array.isArray(jsonJenis.data) ? jsonJenis.data : [];
      const listJenis = listJenisRaw.map((item: any) => ({
        id: item.id,
        jenis_data: item.jenis_data,
      }));
      setJenisDataList(listJenis);

      // --- B. MAPPING DATA KINERJA (Isi Tabel) ---
      // Data dari datakinerjapemda/list strukturnya nested: [{ id, jenis_data, data_kinerja: [] }]
      // id di sini adalah ID Jenis Data.
      const rawKinerja = Array.isArray(jsonKinerja.data) ? jsonKinerja.data : [];
      const map: Record<number, DataKinerjaItem[]> = {};

      rawKinerja.forEach((group: any) => {
        if (group.data_kinerja && Array.isArray(group.data_kinerja)) {
            // Mapping array data_kinerja ke ID Jenis Datanya (group.id)
            const children = group.data_kinerja.map((child: any) => ({
                ...child,
                jenis_data_id: group.id // Pastikan child punya ref ke parent
            }));
            map[group.id] = children;
        }
      });

      setDataKinerjaMap(map);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  }, [branding?.api_perencanaan]);

  // Panggil fetch data saat API URL siap
  useEffect(() => {
    if (branding?.api_perencanaan) {
      fetchData();
    }
  }, [branding?.api_perencanaan, fetchData]);

  // --- RENDER ---

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-b-lg shadow-md border border-gray-300 border-t-0">
        
        {/* Breadcrumb */}
        <div className="flex items-center mb-4 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-blue-600 flex items-center gap-1">
            <FiHome size={16} />
          </Link>
          <span className="mx-2">/</span>
          <Link href="/pemda" className="hover:text-blue-600 hover:underline">
            Pemda
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-gray-800">
            Jenis Kelompok Data
          </span>
        </div>

        {/* Header Halaman */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 uppercase">
                DATA KINERJA
                </h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">
                PEMERINTAH DAERAH
                </p>
            </div>
            
            {/* Tombol Tambah Jenis Kelompok Data */}
            <button
                onClick={() => setIsModalAddOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-colors shadow-sm"
            >
                <Plus size={20} />
                Tambah Jenis Data Pemda
            </button>
        </div>

        {/* Loading / Error / Table */}
        {isLoading ? (
            <div className="flex justify-center items-center h-64 border rounded-xl m-4 shadow-sm bg-gray-50">
                <LoadingClip />
            </div>
        ) : error ? (
            <div className="p-8 text-center border rounded-xl bg-red-50 text-red-800 m-4">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
                <button 
                    onClick={fetchData} 
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Coba Lagi
                </button>
            </div>
        ) : (
            <div className="bg-white p-2 rounded-xl">
                <JenisDataTable 
                    jenisDataList={jenisDataList}
                    dataKinerjaMap={dataKinerjaMap}
                    onReloadAction={fetchData}
                    kodeOpd={null} 
                />
            </div>
        )}
      </div>

      <AddDataModal 
        isOpen={isModalAddOpen} 
        onClose={() => setIsModalAddOpen(false)} 
        onSuccess={() => {
            fetchData();
            setIsModalAddOpen(false);
        }}
      />
    </div>
  );
}