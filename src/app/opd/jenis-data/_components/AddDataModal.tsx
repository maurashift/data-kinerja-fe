"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler, useWatch } from "react-hook-form";
import Select from "react-select";
import { getCookie } from "../../../../lib/cookie";
// Mengembalikan Import Context
import { useBrandingContext } from "@/src/providers/BrandingProvider";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // authToken dihapus
};

interface OptionType {
  value: number; // untuk periode: pakai start year (mis. 2020); untuk tahun: pakai tahun (mis. 2022)
  label: string; // "2020–2025" / "Tahun 2022"
}

type CategoryValue = "periode" | "tahun";

interface FormValue {
  jenis_data: string;
  periode: OptionType | null; // dipakai saat mode 'periode'
  tahun: OptionType | null; // dipakai saat mode 'tahun'
}

// util: parse cookie Select(JSON)
const safeParseOption = (
  v: string | null | undefined,
): { value?: string; label?: string } | null => {
  if (!v) return null;
  try {
    const o = JSON.parse(v);
    if (o && typeof o.value === "string" && typeof o.label === "string")
      return o;
  } catch {}
  return null;
};

// util: tarik YY-YY dari label (support - / –)
const parseRange = (label: string) => {
  const m = label.match(/(\d{4}).*?(\d{4})/);
  return {
    start: m ? parseInt(m[1], 10) : NaN,
    end: m ? parseInt(m[2], 10) : NaN,
  };
};

const AddDataModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValue>({
    defaultValues: { jenis_data: "", periode: null, tahun: null },
  });

  // Menggunakan Branding Context
  const { branding } = useBrandingContext();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checked, setChecked] = useState(false);

  // Mode dari COOKIE header:
  const [mode, setMode] = useState<CategoryValue>("periode");

  // Opsi periode
  const periodOptions: OptionType[] = [
    { label: "2031–2035", value: 2031 },
    { label: "2026–2030", value: 2026 },
    { label: "2020–2025", value: 2020 },
  ];

  // Build semua tahun dari range min–max periode yang ada (dipakai saat mode 'tahun')
  const allYearOptions: OptionType[] = useMemo(() => {
    if (!periodOptions.length) return [];
    let minStart = Infinity;
    let maxEnd = -Infinity;
    for (const p of periodOptions) {
      const { start, end } = parseRange(p.label);
      if (!Number.isNaN(start) && start < minStart) minStart = start;
      if (!Number.isNaN(end) && end > maxEnd) maxEnd = end;
    }
    const arr: OptionType[] = [];
    for (let y = maxEnd; y >= minStart; y--)
      arr.push({ value: y, label: `Tahun ${y}` });
    return arr;
  }, [periodOptions]);

  // Prefill berdasar cookie saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;

    const catCookie = safeParseOption(getCookie("selectedCategory"));
    const periodeCookie = safeParseOption(getCookie("selectedPeriode"));
    const yearCookie = getCookie("selectedYear") || "";

    const catVal =
      catCookie?.value === "tahun" || catCookie?.value === "periode"
        ? (catCookie.value as CategoryValue)
        : yearCookie
        ? "tahun"
        : "periode";

    setMode(catVal);

    // Set default dari cookie
    if (periodeCookie?.label) {
      const opt: OptionType = {
        value: Number(periodeCookie.value ?? 0),
        label: periodeCookie.label!,
      };
      setValue("periode", opt, {
        shouldDirty: false,
        shouldValidate: true,
      });

      // kalau ada yearCookie & masih in-range, isi juga field tahun
      const { start, end } = parseRange(opt.label);
      const yNum = Number(yearCookie);
      if (
        !Number.isNaN(start) &&
        !Number.isNaN(end) &&
        yNum >= start &&
        yNum <= end
      ) {
        setValue(
          "tahun",
          { value: yNum, label: `Tahun ${yNum}` },
          { shouldDirty: false, shouldValidate: true },
        );
      } else {
        setValue("tahun", null, {
          shouldDirty: false,
          shouldValidate: true,
        });
      }
    } else {
      // tidak ada cookie periode
      setValue("periode", null, {
        shouldDirty: false,
        shouldValidate: true,
      });
      // Tahun tetap bisa terisi kalau mode 'tahun' & ada cookie tahun
      const yNum = Number(yearCookie);
      setValue(
        "tahun",
        yearCookie && !Number.isNaN(yNum)
          ? { value: yNum, label: `Tahun ${yNum}` }
          : null,
        { shouldDirty: false, shouldValidate: true },
      );
    }

    setChecked(true);
  }, [isOpen, setValue]);

  // Jika user mengganti periode, kosongkan tahun agar aman
  const selectedPeriode = useWatch({ control, name: "periode" });
  useEffect(() => {
    setValue("tahun", null, { shouldDirty: false, shouldValidate: true });
  }, [selectedPeriode, setValue]);

  // SUBMIT
  const onSubmit: SubmitHandler<FormValue> = async (data) => {
    // Validasi sesuai mode:
    if (!data.jenis_data) return;
    if (mode === "periode" && !data.periode) return;
    if (mode === "tahun" && !data.tahun) return;

    if (!branding?.api_perencanaan) {
        alert("Konfigurasi API belum benar (api_perencanaan kosong).");
        return;
    }

    // Ambil OPD dari cookie header (selectedDinas)
    const dinasCookie = safeParseOption(getCookie("selectedDinas"));
    if (!dinasCookie?.value) {
      alert("Pilih Dinas/OPD di header terlebih dahulu.");
      return;
    }

    const kode_opd = dinasCookie.value;
    const nama_opd = dinasCookie.label ?? "";

    setIsSubmitting(true);

    // Payload utama
    const payload = {
      jenis_data: data.jenis_data,
      kode_opd,
      nama_opd,
    };

    try {
      // Menggunakan branding.api_perencanaan
      const response = await fetch(
        `${branding.api_perencanaan}/api/v1/jenisdataopd`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Token dihapus
          },
          body: JSON.stringify(payload),
        },
      );
      console.log("Response OPD:", response);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gagal menyimpan data: ${errText || response.status}`);
      }

      const result = await response.json();
      if (result.code !) {
        throw new Error(result.status || "Gagal menyimpan data");
      }

      alert("Data berhasil disimpan!");
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      alert(`Gagal menyimpan data: ${error?.message ?? "unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={handleClose}
    >
      <div
        className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b">
          <h3 className="text-xl font-bold text-center text-gray-800">
            TAMBAH JENIS KELOMPOK DATA
          </h3>
        </div>

        <div className="p-8">
          {/* INFO MODE */}
          {checked && (
            <div className="mb-5 text-sm text-gray-600">
              Mode input mengikuti header:{" "}
              <span className="font-semibold uppercase">
                {mode === "periode" ? "PERIODE" : "TAHUN"}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6">
              {/* Jenis Data */}
              <div>
                <label
                  htmlFor="jenis_data"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  JENIS KELOMPOK DATA
                </label>
                <Controller
                  name="jenis_data"
                  control={control}
                  rules={{ required: "Jenis data tidak boleh kosong" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="jenis_data"
                      type="text"
                      placeholder="Masukkan Nama Data"
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 transition ${
                        errors.jenis_data
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                  )}
                />
                {errors.jenis_data && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.jenis_data.message}
                  </p>
                )}
              </div>

              {/* === PERIODE/TAHUN (SATU FIELD SAJA SESUAI MODE) === */}
              {mode === "periode" ? (
                <div>
                  <label
                    htmlFor="periode"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    PERIODE/TAHUN
                  </label>
                  <Controller
                    name="periode"
                    control={control}
                    rules={{ required: "Periode tidak boleh kosong" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        inputId="periode"
                        options={periodOptions}
                        placeholder="Pilih Periode"
                        isClearable
                      />
                    )}
                  />
                  {errors.periode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.periode.message}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="tahun"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    PERIODE/TAHUN
                  </label>
                  <Controller
                    name="tahun"
                    control={control}
                    rules={{ required: "Tahun tidak boleh kosong" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        inputId="tahun"
                        options={allYearOptions}
                        placeholder="Pilih Tahun"
                        isClearable
                      />
                    )}
                  />
                  {errors.tahun && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.tahun.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-bold py-3 px-8 rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full font-bold py-3 px-8 rounded-lg text-white bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 transition-opacity"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDataModal;