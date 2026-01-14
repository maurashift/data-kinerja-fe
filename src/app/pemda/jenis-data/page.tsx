"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { FiHome } from "react-icons/fi";
import { useBrandingContext } from "@/src/providers/BrandingProvider";
import { LoadingClip } from "@/src/components/global/Loading/loading";
// Pastikan Anda menggunakan komponen tabel yang benar (bisa jadi perlu duplikasi jika logika di dalamnya hardcoded ke OPD)
import JenisDataTable from "./_components/JenisDataTable"; 
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

  // 1. Fungsi Fetch Data (Jenis Data & Data Kinerja PEMDA)
  const fetchData = useCallback(async () => {
    // Pastikan URL API tersedia
    if (!branding?.api_perencanaan) return;

    setIsLoading(true);
    setError(null);

    try {
      // A. Fetch Jenis Data Pemda
      // Asumsi endpoint: /api/v1/jenisdatapemda/list (tanpa kode OPD)
      const resJenis = await fetch(
        `${branding.api_perencanaan}/api/v1/jenisdata`, 
        {
            headers: { "Content-Type": "application/json" },
            cache: "no-store" 
        }
      );
      
      // B. Fetch Data Kinerja Pemda
      // Asumsi endpoint: /api/v1/datakinerjapemda/list
      const resKinerja = await fetch(
        `${branding.api_perencanaan}/api/v1/datakinerjapemda/list`, 
        {
            headers: { "Content-Type": "application/json" },
            cache: "no-store"
        }
      );

      if (!resJenis.ok || !resKinerja.ok) {
        throw new Error("Gagal mengambil data Pemda dari server.");
      }

      const jsonJenis = await resJenis.json();
      const jsonKinerja = await resKinerja.json();

      // Simpan list jenis data
      const listJenis = Array.isArray(jsonJenis.data) ? jsonJenis.data : [];
      setJenisDataList(listJenis);

      // Mapping Data Kinerja berdasarkan jenis_data_id
      const rawKinerja = Array.isArray(jsonKinerja.data) ? jsonKinerja.data : [];
      const map: Record<number, DataKinerjaItem[]> = {};

      rawKinerja.forEach((item: DataKinerjaItem) => {
        const jId = item.jenis_data_id;
        if (jId) {
          if (!map[jId]) map[jId] = [];
          map[jId].push(item);
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
                {/* CATATAN PENTING:
                    Komponen JenisDataTable dan AddDataModal yang kita buat sebelumnya
                    secara default mengarah ke endpoint OPD (...opd).
                    
                    Agar halaman ini bekerja sempurna, Anda perlu:
                    1. Mengirimkan props 'type="pemda"' ke komponen tersebut, ATAU
                    2. Membuat duplikat komponen khusus Pemda (misal: JenisDataPemdaTable.tsx)
                       yang endpoint fetch/delete-nya mengarah ke '...pemda'
                */}
                <JenisDataTable 
                    jenisDataList={jenisDataList}
                    dataKinerjaMap={dataKinerjaMap}
                    onReloadAction={fetchData}
                    //kodeOpd={null} // Pemda tidak butuh kode OPD spesifik
                />
            </div>
        )}
      </div>

      {/* Modal Tambah Jenis Kelompok Data */}
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