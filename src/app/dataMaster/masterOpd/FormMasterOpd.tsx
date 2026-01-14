'use client'

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
// Menggunakan alias @/ agar path import lebih aman dan konsisten
import { ButtonGreen, ButtonRed } from "../../../components/common/button/button";
import { AlertNotification } from "../../../components/common/alert/alert";
import { LoadingClip } from "../../../components/global/Loading/loading";
import { useParams, useRouter } from "next/navigation";
import Select from "react-select";

// --- Types & Interfaces ---
interface OptionTypeString {
    value: string;
    label: string;
}

interface FormValue {
    id: string;
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
    id_lembaga: OptionTypeString;
}

interface Lembaga {
    id: string;
    nama_lembaga: string;
    is_active: boolean;
}

interface OpdDetail {
    kode_opd: string;
    nama_opd: string;
    nama_kepala_opd: string;
    nip_kepala_opd: string;
    pangkat_kepala: string;
    id_lembaga: {
        id: string;
        nama_lembaga: string;
    };
}

interface ApiResponse<T> {
    data: T;
    code?: number;
    message?: string;
}

// ==========================================
// COMPONENT: Form Tambah Master OPD
// ==========================================
export const FormMasterOpd = () => {
    // URL API Hardcoded
    const API_URL = "https://testapi.kertaskerja.cc";

    const { control, handleSubmit, formState: { errors } } = useForm<FormValue>();
    const [OpdOption, setOpdOption] = useState<OptionTypeString[]>([]);
    const [IsLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const onSubmit: SubmitHandler<FormValue> = async (data) => {
        const formData = {
            kode_opd: data.kode_opd,
            nama_opd: data.nama_opd,
            nama_kepala_opd: data.nama_kepala_opd,
            nip_kepala_opd: data.nip_kepala_opd,
            pangkat_kepala: data.pangkat_kepala,
            id_lembaga: data.id_lembaga?.value,
        };
        try {
            const response = await fetch(`${API_URL}/opd/create`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                AlertNotification(
                    "Berhasil",
                    "Berhasil menambahkan data master perangkat daerah",
                    "success",
                    1000,
                    true
                );
                router.push("/dataMaster/masterOpd");
            } else {
                AlertNotification(
                    "Gagal",
                    "terdapat kesalahan pada backend / database server",
                    "error",
                    2000,
                    true
                );
            }
        } catch (err) {
            console.error("Submit failed:", err);
            AlertNotification(
                "Gagal",
                "cek koneksi internet/terdapat kesalahan pada database server",
                "error",
                2000,
                true
            );
        }
    };

    const fetchLembaga = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/lembaga/findall`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error("cant fetch data opd");

            const result: ApiResponse<Lembaga[]> = await response.json();
            const opdOptions = result.data.map((item: Lembaga) => ({
                value: item.id,
                label: item.nama_lembaga,
            }));

            setOpdOption(opdOptions);
        } catch (err) {
            console.error("Failed to fetch lembaga:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="border p-5 rounded-xl shadow-xl">
            <h1 className="uppercase font-bold">Form Tambah OPD :</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mx-5 py-5">

                {/* KODE OPD */}
                <div className="flex flex-col py-3">
                    <label className="uppercase text-xs font-bold text-gray-700 my-2" htmlFor="kode_opd">
                        Kode Perangkat Daerah :
                    </label>
                    <Controller
                        name="kode_opd"
                        control={control}
                        rules={{ required: "Kode Perangkat Daerah harus diisi" }}
                        render={({ field }) => (
                            <>
                                <input {...field} className="border px-4 py-2 rounded-lg" id="kode_opd" />
                                {errors.kode_opd ?
                                    <p className="text-red-500 text-xs">{errors.kode_opd.message}</p> :
                                    <p className="text-slate-300 text-xs">*Kode Perangkat Daerah Harus Diisi</p>
                                }
                            </>
                        )}
                    />
                </div>

                {/* NAMA OPD */}
                <div className="flex flex-col py-3">
                    <label className="uppercase text-xs font-bold text-gray-700 my-2">
                        Nama Perangkat Daerah :
                    </label>
                    <Controller
                        name="nama_opd"
                        control={control}
                        rules={{ required: "Nama Perangkat Daerah harus terisi" }}
                        render={({ field }) => (
                            <>
                                <input {...field} className="border px-4 py-2 rounded-lg" />
                                {errors.nama_opd ?
                                    <p className="text-red-500 text-xs">{errors.nama_opd.message}</p> :
                                    <p className="text-slate-300 text-xs">*Nama OPD Harus Terisi</p>
                                }
                            </>
                        )}
                    />
                </div>

                {/* SELECT LEMBAGA */}
                <div className="flex flex-col py-3">
                    <label className="uppercase text-xs font-bold text-gray-700 my-2">
                        Lembaga :
                    </label>
                    <Controller
                        name="id_lembaga"
                        control={control}
                        rules={{ required: "Lembaga Harus Terisi" }}
                        render={({ field }) => (
                            <>
                                <Select
                                    {...field}
                                    placeholder="Pilih Lembaga"
                                    options={OpdOption}
                                    isLoading={IsLoading}
                                    onMenuOpen={() => {
                                        if (OpdOption.length === 0) fetchLembaga();
                                    }}
                                />
                                {errors.id_lembaga ?
                                    <p className="text-red-500 text-xs">{errors.id_lembaga.message}</p> :
                                    <p className="text-slate-300 text-xs">*Lembaga Harus Terisi</p>
                                }
                            </>
                        )}
                    />
                </div>

                <div className="flex gap-2 my-4">
                    <ButtonGreen type="submit">Simpan</ButtonGreen>
                    {/* PERBAIKAN: Menggunakan onClick dengan router.push alih-alih prop halaman_url */}
                    <ButtonRed type="button" onClick={() => router.push("/dataMaster/masterOpd")}>
                        Kembali
                    </ButtonRed>
                </div>
            </form>
        </div>
    );
};

// ==========================================
// COMPONENT: Form Edit Master OPD
// ==========================================
export const FormEditMasterOpd = () => {
    // URL API Hardcoded
    const API_URL = "https://testapi.kertaskerja.cc";

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValue>();
    const { id } = useParams();
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [IsLoading, setIsLoading] = useState<boolean>(false);
    const [idNull, setIdNull] = useState<boolean>(false);
    const [OpdOption, setOpdOption] = useState<OptionTypeString[]>([]);

    const fetchLembaga = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/lembaga/findall`, {
                headers: { 'Content-Type': 'application/json' }
            });

            const result: ApiResponse<Lembaga[]> = await response.json();

            const mapped = result.data.map((i) => ({
                value: i.id,
                label: i.nama_lembaga
            }));

            setOpdOption(mapped);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/opd/detail/${id}`, {
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error("Fetch gagal");

                const result: ApiResponse<OpdDetail> = await response.json();

                if (!result?.data) {
                    setIdNull(true);
                    return;
                }

                reset({
                    kode_opd: result.data.kode_opd,
                    nama_opd: result.data.nama_opd,
                    nama_kepala_opd: result.data.nama_kepala_opd,
                    nip_kepala_opd: result.data.nip_kepala_opd,
                    pangkat_kepala: result.data.pangkat_kepala,
                    id_lembaga: {
                        value: result.data.id_lembaga.id,
                        label: result.data.id_lembaga.nama_lembaga
                    }
                });

            } catch (err) {
                console.error(err);
                setError("Gagal mendapatkan data OPD");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, reset, API_URL]);


    const onSubmit: SubmitHandler<FormValue> = async (data) => {
        const body = {
            kode_opd: data.kode_opd,
            nama_opd: data.nama_opd,
            nama_kepala_opd: data.nama_kepala_opd,
            nip_kepala_opd: data.nip_kepala_opd,
            pangkat_kepala: data.pangkat_kepala,
            id_lembaga: data.id_lembaga?.value,
        };

        try {
            const response = await fetch(`${API_URL}/opd/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                AlertNotification(
                    "Berhasil",
                    "Berhasil memperbarui data master perangkat daerah",
                    "success",
                    1000,
                    true
                );
                router.push("/dataMaster/masterOpd");
            } else {
                AlertNotification(
                    "Gagal",
                    "terdapat kesalahan pada backend / database server",
                    "error",
                    2000,
                    true
                );
            }
        } catch (err) {
            console.error(err);
            AlertNotification(
                "Gagal",
                "cek koneksi internet/terdapat kesalahan pada database server",
                "error",
                2000,
                true
            );
        }
    };

    if (loading) return <LoadingClip />;

    if (error) return <p className="text-red-500">{error}</p>;

    if (idNull) return <p className="text-red-500">ID tidak ditemukan</p>;

    return (
        <div className="border p-5 rounded-xl shadow-xl">
            <h1 className="uppercase font-bold">Form Edit OPD :</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mx-5 py-5">
                
                {/* KODE OPD */}
                <div className="flex flex-col py-3">
                    <label className="uppercase text-xs font-bold text-gray-700 my-2">
                        Kode Perangkat Daerah :
                    </label>
                    <Controller
                        name="kode_opd"
                        control={control}
                        rules={{ required: "Kode Perangkat Daerah harus diisi" }}
                        render={({ field }) => (
                            <>
                                <input {...field} className="border px-4 py-2 rounded-lg" />
                                {errors.kode_opd ?
                                    <p className="text-red-500 text-xs">{errors.kode_opd.message}</p> :
                                    <p className="text-slate-300 text-xs">*Kode Perangkat Daerah Harus Diisi</p>
                                }
                            </>
                        )}
                    />
                </div>

                {/* NAMA OPD */}
                <div className="flex flex-col py-3">
                    <label className="uppercase text-xs font-bold text-gray-700 my-2">
                        Nama Perangkat Daerah :
                    </label>
                    <Controller
                        name="nama_opd"
                        control={control}
                        rules={{ required: "Nama Perangkat Daerah harus terisi" }}
                        render={({ field }) => (
                            <>
                                <input {...field} className="border px-4 py-2 rounded-lg" />
                                {errors.nama_opd ?
                                    <p className="text-red-500 text-xs">{errors.nama_opd.message}</p> :
                                    <p className="text-slate-300 text-xs">*Nama OPD Harus Terisi</p>
                                }
                            </>
                        )}
                    />
                </div>

                {/* SELECT LEMBAGA */}
                <div className="flex flex-col py-3">
                    <label className="uppercase text-xs font-bold text-gray-700 my-2">
                        Lembaga :
                    </label>
                    <Controller
                        name="id_lembaga"
                        control={control}
                        rules={{ required: "Lembaga Harus Terisi" }}
                        render={({ field }) => (
                            <>
                                <Select
                                    {...field}
                                    placeholder="Pilih Lembaga"
                                    options={OpdOption}
                                    isLoading={IsLoading}
                                    onMenuOpen={() => {
                                        if (OpdOption.length === 0) fetchLembaga();
                                    }}
                                />
                                {errors.id_lembaga ?
                                    <p className="text-red-500 text-xs">{errors.id_lembaga.message}</p> :
                                    <p className="text-slate-300 text-xs">*Lembaga Harus Terisi</p>
                                }
                            </>
                        )}
                    />
                </div>

                <div className="flex gap-2 my-4">
                    <ButtonGreen type="submit">Update</ButtonGreen>
                    {/* PERBAIKAN: Menggunakan onClick dengan router.push */}
                    <ButtonRed type="button" onClick={() => router.push("/dataMaster/masterOpd")}>
                        Kembali
                    </ButtonRed>
                </div>
            </form>
        </div>
    );
};