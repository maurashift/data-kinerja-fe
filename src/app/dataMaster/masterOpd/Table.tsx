'use client'

import { useState, useEffect } from "react";
import { LoadingClip } from "../../../components/global/Loading/loading";
// import getToken dihapus

// --- FIX: Interface yang benar untuk struktur data Lembaga ---
interface Lembaga {
    id: string;
    nama_lembaga: string;
    is_active: boolean;
}

// --- FIX: Interface yang benar untuk struktur data OPD dari API ---
interface Opd {
    id: string | number; 
    kode_opd: string;
    nama_opd: string;
    singkatan: string;
    alamat: string;
    telepon: string;
    fax: string;
    email: string;
    website: string;
    nama_kepala_opd: string;
    nip_kepala_opd: string;
    pangkat_kepala: string;
    id_lembaga: Lembaga;
}

// --- A generic type for API responses to avoid 'any' ---
interface ApiResponse<T> {
    data: T;
    code?: number;
    message?: string;
}

const Table = () => {
    const [opd, setOpd] = useState<Opd[]>([]);
    const [error, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [dataNull, setDataNull] = useState<boolean>(false);
    // Token const dihapus

    useEffect(() => {
        const fetchOpd = async () => {
            setLoading(true);
            setError(false);
            setDataNull(false);
            try {
                const response = await fetch(`https://periode-service-test.zeabur.app/list_opd`, {
                    headers: {
                        // Authorization dihapus
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const result: ApiResponse<Opd[]> = await response.json();

                if (result.data && result.data.length > 0) {
                    setOpd(result.data);
                } else {
                    setDataNull(true);
                    setOpd([]);
                }
            } catch (err) {
                setError(true);
                console.error("Error fetching OPD data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOpd();
        // Dependency array kosong, fetch hanya sekali saat mount
    }, []);

    if (loading) {
        return (
            <div className="border p-5 rounded-xl shadow-xl">
                <LoadingClip className="mx-5 py-5" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="border p-5 rounded-xl shadow-xl">
                <h1 className="text-red-500 mx-5 py-5 text-center">Gagal memuat data. Periksa koneksi internet atau server.</h1>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-auto m-2 rounded-t-xl border">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#99CEF5] text-white text-sm">
                            <th className="border-r border-b px-4 py-3">No</th>
                            <th className="border-r border-b px-4 py-3">Kode Perangkat Daerah</th>
                            <th className="border-r border-b px-4 py-3">Nama Perangkat Daerah</th>
                            <th className="border-r border-b px-4 py-3">Nama Kepala</th>
                            <th className="border-r border-b px-4 py-3">NIP Kepala</th>
                            <th className="border-r border-b px-4 py-3">Pangkat Kepala</th>
                            <th className="border-b px-4 py-3">Lembaga</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataNull ? (
                            <tr>
                                <td className="px-6 py-4 text-center" colSpan={7}>
                                    Data Kosong / Belum Ditambahkan
                                </td>
                            </tr>
                        ) : (
                            opd.map((data, index) => (
                                // Menggunakan id, jika id kosong/duplikat gunakan index sebagai cadangan
                                 <tr key={data.id || index} className="border-t text-sm">
                                    <td className="border-r border-b px-4 py-2 text-center">{index + 1}</td>
                                    <td className="border-r border-b px-4 py-2">{data.kode_opd || "-"}</td>
                                    <td className="border-r border-b px-4 py-2">{data.nama_opd || "-"}</td>
                                    <td className="border-r border-b px-4 py-2">{data.nama_kepala_opd || "-"}</td>
                                    <td className="border-r border-b px-4 py-2">{data.nip_kepala_opd || "-"}</td>
                                    <td className="border-r border-b px-4 py-2">{data.pangkat_kepala || "-"}</td>
                                    <td className="border-r border-b px-4 py-2">{data.id_lembaga?.nama_lembaga || "-"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Table;