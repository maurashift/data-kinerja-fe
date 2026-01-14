'use client'

import { useEffect, useState } from "react";
import { LoadingClip } from '../../../components/global/Loading/loading';
// Import getToken dihapus

// --- TYPES sesuai API ---
interface User {
  id?: number;              // ada di beberapa API, kalau nggak ada fallback ke nip/email
  nip: string;
  email: string;
  nama_pegawai: string;
  status?: string;          // dari API: "Aktif"
  roles?: string | any[];   // bisa string ("level_2") atau array
}

interface ApiResponse<T> {
  data: T;
  status?: number;
  message?: string;
}

const Table = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const token = getToken(); // Dihapus

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://periode-service-test.zeabur.app/list_user?kode_opd=1.01.2.22.0.00.01.0000",
          {
            headers: {
              // Authorization dihapus
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch user data");

        const result: ApiResponse<User[]> = await res.json();
        setUsers(result.data ?? []);
      } catch (e: any) {
        setError(e?.message || "Unknown error");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    // Dependency array kosong, fetch hanya sekali saat mount
  }, []);

  if (loading) {
    return (
      <div className="border p-5 rounded-xl shadow-xl m-3">
        <LoadingClip className="mx-5 py-5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border p-5 rounded-xl shadow-xl m-3">
        <h1 className="text-red-500 mx-5 py-5 text-center">
          Gagal memuat data: {error}
        </h1>
      </div>
    );
  }

  return (
    <div className="overflow-auto m-2 rounded-t-xl border">
      <table className="w-full">
        <thead>
          <tr className="bg-emerald-500 text-white text-sm">
            <th className="border-r border-b px-4 py-3">No</th>
            <th className="border-r border-b px-4 py-3">Nama</th>
            <th className="border-r border-b px-4 py-3">User</th>
            <th className="border-r border-b px-4 py-3">Email</th>
            <th className="border-r border-b px-4 py-3">Status</th>
            <th className="border-b px-4 py-3">Roles</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td className="px-6 py-4 text-center" colSpan={6}>
                Data Kosong
              </td>
            </tr>
          ) : (
            users.map((user, index) => {
              // gunakan key unik
              const rowKey =
                user.id ??
                user.nip ??
                user.email ??
                `row-${index}`;

              return (
                <tr key={rowKey} className="border-t text-sm">
                  <td className="border-r border-b px-4 py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border-r border-b px-4 py-2">
                    {user.nama_pegawai || "-"}
                  </td>
                  <td className="border-r border-b px-4 py-2">
                    {user.nip || "-"}
                  </td>
                  <td className="border-r border-b px-4 py-2">
                    {user.email || "-"}
                  </td>
                  <td className="border-r border-b px-4 py-2 text-center">
                    {user.status ?? "-"}
                  </td>
                  <td className="border-b px-4 py-2 text-center">
                    {typeof user.roles === "string"
                      ? user.roles
                      : Array.isArray(user.roles)
                      ? user.roles.map((r: any, i: number, arr: any[]) => (
                          <span key={`role-${i}`} className="inline-block">
                            {typeof r === "string" ? r : r?.role ?? "-"}
                            {i < arr.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : "-"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;