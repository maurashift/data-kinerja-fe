"use client";

import React, { useEffect, useState } from "react";
import {
  useForm,
  Controller,
  SubmitHandler,
  useFieldArray,
} from "react-hook-form";
import { useBrandingContext } from "@/src/providers/BrandingProvider";

interface DataKinerja {
  id: number;
  jenis_data_id: number;
  nama_data: string;
  rumus_perhitungan: string;
  sumber_data: string;
  instansi_produsen_data: string;
  keterangan: string;
  target: {
    tahun: string;
    satuan: string;
    target: string;
  }[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  dataItem: DataKinerja | null;
  // authToken dihapus
  jenisDataId?: string | null;
}

type TargetRow = {
  tahun: string;
  satuan: string;
  target: string;
};

interface FormValue {
  nama_data: string;
  rumus_perhitungan: string;
  sumber_data: string;
  instansi_produsen_data: string;
  keterangan: string;
  targets: TargetRow[];
}

const EditDataTableModal = ({
  isOpen,
  onClose,
  onSuccess,
  dataItem,
}: ModalProps) => {
  const { branding } = useBrandingContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValue>({
    defaultValues: {
      nama_data: "",
      rumus_perhitungan: "",
      sumber_data: "",
      instansi_produsen_data: "",
      keterangan: "",
      targets: [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "targets",
  });

  useEffect(() => {
    if (isOpen && dataItem) {
      reset({
        nama_data: dataItem.nama_data || "",
        rumus_perhitungan: dataItem.rumus_perhitungan || "",
        sumber_data: dataItem.sumber_data || "",
        instansi_produsen_data: dataItem.instansi_produsen_data || "",
        keterangan: dataItem.keterangan || "",
        targets:
          dataItem.target?.map((t) => ({
            tahun: t.tahun,
            satuan: t.satuan,
            target: t.target,
          })) || [],
      });
    }
  }, [isOpen, dataItem, reset]);

  const onSubmit: SubmitHandler<FormValue> = async (data) => {
    if (!dataItem) {
      alert("Data tidak ditemukan.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      jenis_data_id: dataItem.jenis_data_id,
      nama_data: data.nama_data,
      rumus_perhitungan: data.rumus_perhitungan,
      sumber_data: data.sumber_data,
      instansi_produsen_data: data.instansi_produsen_data,
      keterangan: data.keterangan,
      target: data.targets.map((t) => ({
        tahun: t.tahun,
        satuan: t.satuan,
        target: t.target,
      })),
    };

    try {
      const res = await fetch(
        `${branding.api_perencanaan}/api/v1/datakinerjaopd/${dataItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Authorization / Token dihapus
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal update data");
      }

      alert("Data berhasil diperbarui!");
      await onSuccess();
      handleClose();
    } catch (e: any) {
      console.error("Update error:", e);
      alert(e.message || "Gagal memperbarui data");
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
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4 bg-black/50">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b">
          <h3 className="text-xl font-bold text-center">EDIT DATA KINERJA</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4">
          <InputField
            control={control}
            name="nama_data"
            label="Nama Data"
            error={errors.nama_data?.message}
          />
          <InputField
            control={control}
            name="rumus_perhitungan"
            label="Definisi Operasional"
            isTextarea
            error={errors.rumus_perhitungan?.message}
          />
          <InputField
            control={control}
            name="sumber_data"
            label="Sumber Data"
            error={errors.sumber_data?.message}
          />
          <InputField
            control={control}
            name="instansi_produsen_data"
            label="Instansi Produsen Data"
            error={errors.instansi_produsen_data?.message}
          />

          <div>
            <label className="block text-sm font-bold mb-2">
              Jumlah per Tahun
            </label>
            <div className="border rounded overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 font-bold">
                  <tr>
                    <th className="border p-2 w-32 text-center">Tahun</th>
                    <th className="border p-2 text-center">Jumlah</th>
                    <th className="border p-2 text-center">Satuan</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="border p-2 text-center">
                        <input
                          className="w-full bg-gray-100 p-2 rounded text-center cursor-not-allowed"
                          value={row.tahun}
                          readOnly
                        />
                      </td>
                      <td className="border p-2">
                        <Controller
                          control={control}
                          name={`targets.${idx}.target`}
                          rules={{ required: "Jumlah wajib diisi" }}
                          render={({ field }) => (
                            <input
                              {...field}
                              value={field.value || ""}
                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          )}
                        />
                      </td>
                      <td className="border p-2">
                        <Controller
                          control={control}
                          name={`targets.${idx}.satuan`}
                          rules={{ required: "Satuan wajib diisi" }}
                          render={({ field }) => (
                            <input
                              {...field}
                              value={field.value || ""}
                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <InputField
            control={control}
            name="keterangan"
            label="Keterangan / Narasi"
            isTextarea
            error={errors.keterangan?.message}
          />

          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded text-white font-bold bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded text-white font-bold bg-red-500 hover:bg-red-600 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ control, name, label, error, isTextarea = false }: any) => (
  <div>
    <label className="block text-sm font-bold mb-2">{label}</label>
    <Controller
      name={name}
      control={control}
      rules={{ required: `${label} tidak boleh kosong` }}
      render={({ field }) =>
        isTextarea ? (
          <textarea
            {...field}
            value={field.value || ""}
            className={`w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
        ) : (
          <input
            {...field}
            value={field.value || ""}
            className={`w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
        )
      }
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default EditDataTableModal;