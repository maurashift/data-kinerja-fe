'use client';

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Select from "react-select";
import { ButtonGreen, ButtonRed } from "../../../components/common/button/button";
import { LoadingClip, LoadingButtonClip } from '../../../components/global/Loading/loading';
import { AlertNotification } from '../../../components/common/alert/alert';
import { useRouter, useParams } from "next/navigation";
import { TbEye, TbEyeClosed } from "react-icons/tb";
// import getToken dihapus

interface OptionType {
  value: number;
  label: string;
}
interface OptionTypeString {
  value: string;
  label: string;
}
interface OptionTypeBoolean {
  value: boolean;
  label: string;
}

interface FormValue {
  nip: OptionTypeString | null;
  email: string;
  password?: string;
  is_active: OptionTypeBoolean | null;
  role: OptionType | null;
}

const activeOptions: OptionTypeBoolean[] = [
  { label: "Aktif", value: true },
  { label: "Tidak Aktif", value: false },
];

/* ========================= FORM CREATE USER ========================= */
export const FormUser = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValue>({
    defaultValues: {
      nip: null,
      email: "",
      password: "",
      is_active: null,
      role: null,
    },
  });

  const [Nip, setNip] = useState<OptionTypeString | null>(null);
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [Aktif, setAktif] = useState<OptionTypeBoolean | null>(null);
  const [Roles, setRoles] = useState<OptionType | null>(null);
  const [Opd, setOpd] = useState<OptionTypeString | null>(null);
  const [PegawaiOption, setPegawaiOption] = useState<OptionTypeString[]>([]);
  const [OpdOption, setOpdOption] = useState<OptionTypeString[]>([]);
  const [RolesOption, setRolesOption] = useState<OptionType[]>([]);
  const [IsLoading, setIsLoading] = useState<boolean>(false);
  const [Proses, setProses] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  // const token = getToken(); // Dihapus

  // URL API Hardcoded
  const API_URL = "https://testapi.kertaskerja.cc";

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/role/findall`, {
        method: "GET",
        headers: {
          // Authorization dihapus
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("cant fetch data role");
      const data = await response.json();
      const role = data.data.map((item: any) => ({
        value: item.id,
        label: item.role,
      }));
      setRolesOption(role);
    } catch (err) {
      console.log("gagal mendapatkan data roles", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOpd = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/opd/findall`, {
        method: "GET",
        headers: {
          // Authorization dihapus
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("cant fetch data opd");
      const data = await response.json();
      const opd = data.data.map((item: any) => ({
        value: item.kode_opd,
        label: item.nama_opd,
      }));
      setOpdOption(opd);
    } catch (err) {
      console.log("gagal mendapatkan data opd", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPegawai = async (kode_opd: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/pegawai/findall?kode_opd=${kode_opd}`,
        {
          method: "GET",
          headers: {
            // Authorization dihapus
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("cant fetch data pegawai");
      const data = await response.json();
      if (data.code === 200) {
        const pegawai = data.data.map((item: any) => ({
          value: item.nip,
          label: item.nama_pegawai,
        }));
        setPegawaiOption(pegawai);
      } else {
        console.log(data.data);
      }
    } catch (err) {
      console.log("gagal mendapatkan data pegawai", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormValue> = async (data) => {
    const formData = {
      nip: data.nip?.value,
      email: data.email,
      password: data.password,
      is_active: data.is_active?.value,
      role: [
        {
          role_id: Roles?.value,
        },
      ],
    };

    try {
      setProses(true);
      const response = await fetch(`${API_URL}/user/create`, {
        method: "POST",
        headers: {
          // Authorization dihapus
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (resData.code === 201 || resData.code === 200) {
        AlertNotification(
          "Berhasil",
          "Berhasil menambahkan data user",
          "success",
          1000,
          true
        );
        router.push("/DataMaster/masteruser");
      } else if (resData.code === 400) {
        AlertNotification("Gagal", `${resData.data}`, "error", 3000, true);
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
      AlertNotification(
        "Gagal",
        "cek koneksi internet/terdapat kesalahan pada database server",
        "error",
        2000,
        true
      );
    } finally {
      setProses(false);
    }
  };

  return (
    <div className="border p-5 rounded-xl shadow-xl">
      <h1 className="uppercase font-bold">Form Tambah User :</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mx-5 py-5">
        {/* OPD */}
        <div className="flex flex-col py-3">
          <label className="uppercase text-xs font-bold text-gray-700 my-2">
            Perangkat Daerah
          </label>
          <Select
            placeholder="Pilih OPD"
            value={Opd}
            options={OpdOption}
            isLoading={IsLoading}
            isSearchable
            isClearable
            onMenuOpen={() => {
              if (OpdOption.length === 0) fetchOpd();
            }}
            onMenuClose={() => setOpdOption([])}
            onChange={(option) => {
              setOpd(option as OptionTypeString | null);
              if (option && (option as OptionTypeString).value) {
                fetchPegawai((option as OptionTypeString).value);
              } else {
                setPegawaiOption([]);
              }
            }}
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                borderRadius: "8px",
                textAlign: "start",
              }),
            }}
          />
        </div>

        {/* Pegawai (NIP) */}
        <div className="flex flex-col py-3">
          <label
            className="uppercase text-xs font-bold text-gray-700 my-2"
            htmlFor="nip"
          >
            Pegawai
          </label>
          <Controller
            name="nip"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder={!Opd ? "Pilih OPD terlebih dahulu" : "Pilih Pegawai"}
                value={Nip}
                options={PegawaiOption}
                isLoading={IsLoading}
                isSearchable
                isClearable
                isDisabled={!Opd}
                onMenuOpen={() => {
                  if (Opd?.value) fetchPegawai(Opd.value);
                }}
                onMenuClose={() => setPegawaiOption([])}
                onChange={(option) => {
                  field.onChange(option);
                  setNip(option as OptionTypeString | null);
                }}
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    borderRadius: "8px",
                    textAlign: "start",
                  }),
                }}
              />
            )}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col py-3">
          <label
            className="uppercase text-xs font-bold text-gray-700 my-2"
            htmlFor="email"
          >
            Email :
          </label>
          <Controller
            name="email"
            control={control}
            rules={{ required: "Email harus terisi" }}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  className="border px-4 py-2 rounded-lg"
                  id="email"
                  type="text"
                  placeholder="masukkan Email"
                  value={field.value || Email}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setEmail(e.target.value);
                  }}
                />
                {errors.email ? (
                  <h1 className="text-red-500">{errors.email.message}</h1>
                ) : (
                  <h1 className="text-slate-300 text-xs">*Email Harus Terisi</h1>
                )}
              </>
            )}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col py-3">
          <label
            className="uppercase text-xs font-bold text-gray-700 my-2"
            htmlFor="password"
          >
            Password:
          </label>
          <Controller
            name="password"
            control={control}
            rules={{ required: "Password harus terisi" }}
            render={({ field }) => (
              <>
                <div className="flex items-center relative">
                  <input
                    {...field}
                    className="border px-4 py-2 rounded-lg flex-1"
                    minLength={8}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan Password"
                    value={field.value || Password}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setPassword(e.target.value);
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-sm"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <TbEye /> : <TbEyeClosed />}
                  </button>
                </div>
                {errors.password ? (
                  <h1 className="text-red-500">{errors.password.message}</h1>
                ) : (
                  <h1 className="text-slate-300 text-xs">
                    *Password Harus Terisi
                  </h1>
                )}
              </>
            )}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col py-3">
          <label
            className="uppercase text-xs font-bold text-gray-700 my-2"
            htmlFor="is_active"
          >
            Status
          </label>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Pilih Status"
                value={Aktif}
                options={activeOptions}
                isLoading={IsLoading}
                isSearchable
                isClearable
                onChange={(option) => {
                  field.onChange(option);
                  setAktif(option as OptionTypeBoolean | null);
                }}
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    borderRadius: "8px",
                    textAlign: "start",
                  }),
                }}
              />
            )}
          />
        </div>

        {/* Roles */}
        <div className="flex flex-col py-3">
          <label
            className="uppercase text-xs font-bold text-gray-700 my-2"
            htmlFor="role"
          >
            Roles
          </label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Pilih Roles"
                value={Roles}
                options={RolesOption}
                isLoading={IsLoading}
                isSearchable
                isClearable
                onMenuOpen={() => {
                  if (RolesOption.length === 0) fetchRoles();
                }}
                onChange={(option) => {
                  field.onChange(option);
                  setRoles(option as OptionType | null);
                }}
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    borderRadius: "8px",
                    textAlign: "start",
                  }),
                }}
              />
            )}
          />
        </div>

        <div className="flex gap-2 my-4">
            <ButtonGreen type="submit" disabled={Proses}>
            {Proses ? (
                <span className="flex items-center gap-1">
                <LoadingButtonClip />
                Menyimpan...
                </span>
            ) : (
                "Simpan"
            )}
            </ButtonGreen>
            {/* Perbaikan tombol kembali */}
            <ButtonRed type="button" onClick={() => router.push("/DataMaster/masteruser")}>
            Kembali
            </ButtonRed>
        </div>
      </form>
    </div>
  );
};

/* ========================= FORM EDIT USER ========================= */
export const FormEditUser = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValue>({
    defaultValues: {
      nip: null,
      email: "",
      password: "",
      is_active: null,
      role: null,
    },
  });

  const [Nip, setNip] = useState<OptionTypeString | null>(null);
  const [Email, setEmail] = useState<string>("");
  const [Aktif, setAktif] = useState<OptionTypeBoolean | null>(null);
  const [Roles, setRoles] = useState<OptionType | null>(null);
  const [RolesOption, setRolesOption] = useState<OptionType[]>([]);
  const [IsLoading, setIsLoading] = useState<boolean>(false);
  const [Proses, setProses] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [idNull, setIdNull] = useState<boolean | null>(null);

  const { id } = useParams();
  const router = useRouter();
  // const token = getToken(); // Dihapus
  const API_URL = "https://testapi.kertaskerja.cc"; // Hardcoded

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/role/findall`, {
        method: "GET",
        headers: {
          // Authorization dihapus
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("cant fetch data role");
      const data = await response.json();
      const role = data.data.map((item: any) => ({
        value: item.id,
        label: item.role,
      }));
      setRolesOption(role);
    } catch (err) {
      console.log("gagal mendapatkan data roles", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/user/detail/${id}`, {
          headers: {
            // Authorization dihapus
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("terdapat kesalahan di koneksi backend");
        }
        const result = await response.json();
        const data = result.data;

        if (result.code === 400) {
          setIdNull(true);
        } else if (result.code === 200) {
          const nipOpt: OptionTypeString | null = data.nip
            ? { value: data.nip, label: data.nip }
            : null;
          const roleOpt: OptionType | null =
            data.role && data.role[0]
              ? { value: data.role[0].id, label: data.role[0].role }
              : null;
          const aktifOpt: OptionTypeBoolean | null =
            activeOptions.find((opt) => opt.value === data.is_active) || null;

          reset({
            nip: nipOpt,
            email: data.email || "",
            password: "",
            is_active: aktifOpt,
            role: roleOpt,
          });

          setNip(nipOpt);
          setRoles(roleOpt);
          setAktif(aktifOpt);
          setEmail(data.email || "");
        }
      } catch (err) {
        setError("gagal mengambil data sesuai id");
        console.error(err, "gagal mengambil data sesuai id");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    // Dependency token dihapus
  }, [API_URL, id, reset]);

  const onSubmit: SubmitHandler<FormValue> = async (data) => {
    const formData = {
      nip: data.nip?.value,
      email: data.email,
      is_active: data.is_active?.value ?? Aktif?.value,
      role: [
        {
          role_id: Roles?.value,
        },
      ],
    };

    try {
      setProses(true);
      const response = await fetch(`${API_URL}/user/update/${id}`, {
        method: "PUT",
        headers: {
          // Authorization dihapus
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.code === 200 || result.code === 201) {
        AlertNotification(
          "Berhasil",
          "Berhasil mengubah data user",
          "success",
          1000,
          true
        );
        router.push("/DataMaster/masteruser");
      } else if (result.code === 400) {
        AlertNotification("Gagal", `${result.data}`, "error", 2000, true);
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
      AlertNotification(
        "Gagal",
        "cek koneksi internet/terdapat kesalahan pada database server",
        "error",
        2000,
        true
      );
    } finally {
      setProses(false);
    }
  };

  if (loading) {
    return (
      <div className="border p-5 rounded-xl shadow-xl">
        <h1 className="uppercase font-bold">Form Edit User :</h1>
        <LoadingClip className="mx-5 py-5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border p-5 rounded-xl shadow-xl">
        <h1 className="uppercase font-bold">Form Edit User :</h1>
        <h1 className="text-red-500 mx-5 py-5">{error}</h1>
      </div>
    );
  }

  if (idNull) {
    return (
      <div className="border p-5 rounded-xl shadow-xl">
        <h1 className="uppercase font-bold">Form Edit User :</h1>
        <h1 className="text-red-500 mx-5 py-5">id tidak ditemukan</h1>
      </div>
    );
  }

  return (
    <div className="border p-5 rounded-xl shadow-xl">
      <h1 className="uppercase font-bold">Form Edit User :</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mx-5 py-5">
        <h1 className="border border-slate-200 bg-slate-200 rounded-lg p-3">
          NIP User ini : {Nip?.value}
        </h1>

        {/* Email */}
        <div className="flex flex-col py-3">
          <label
            className="uppercase text-xs font-bold text-gray-700 my-2"
            htmlFor="email"
          >
            Email :
          </label>
          <Controller
            name="email"
            control={control}
            rules={{ required: "Email harus terisi" }}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  className="border px-4 py-2 rounded-lg"
                  id="email"
                  type="text"
                  placeholder="masukkan Email"
                  value={field.value || Email}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setEmail(e.target.value);
                  }}
                />
                {errors.email ? (
                  <h1 className="text-red-500">{errors.email.message}</h1>
                ) : (
                  <h1 className="text-slate-300 text-xs">*Email Harus Terisi</h1>
                )}
              </>
            )}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col py-3">
          <label
            className="uppercase text-xs font-bold text-gray-700 my-2"
            htmlFor="is_active"
          >
            Status
          </label>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Pilih Status"
                value={Aktif}
                options={activeOptions}
                isLoading={IsLoading}
                isSearchable
                isClearable
                onMenuOpen={() => {
                  if (RolesOption.length === 0) fetchRoles();
                }}
                onChange={(option) => {
                  field.onChange(option);
                  setAktif(option as OptionTypeBoolean | null);
                }}
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    borderRadius: "8px",
                    textAlign: "start",
                  }),
                }}
              />
            )}
          />
        </div>

        {/* Roles */}
        <div className="flex flex-col py-3">
          <label
            className="uppercase text-xs font-bold text-gray-700 my-2"
            htmlFor="role"
          >
            Roles
          </label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Pilih Roles"
                value={Roles}
                options={RolesOption}
                isLoading={IsLoading}
                isSearchable
                isClearable
                onMenuOpen={() => {
                  if (RolesOption.length === 0) fetchRoles();
                }}
                onChange={(option) => {
                  field.onChange(option);
                  setRoles(option as OptionType | null);
                }}
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    borderRadius: "8px",
                    textAlign: "start",
                  }),
                }}
              />
            )}
          />
        </div>

        <div className="flex gap-2 my-4">
            <ButtonGreen type="submit" disabled={Proses}>
            {Proses ? (
                <span className="flex items-center gap-1">
                <LoadingButtonClip />
                Menyimpan...
                </span>
            ) : (
                "Simpan"
            )}
            </ButtonGreen>
            {/* Perbaikan tombol kembali */}
            <ButtonRed type="button" onClick={() => router.push("/DataMaster/masteruser")}>
            Kembali
            </ButtonRed>
        </div>
      </form>
    </div>
  );
};