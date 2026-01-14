'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { ButtonSky } from '../../../components/common/button/button'; // Pastikan path import benar
import Table from './Table'; // Import tabel yang sudah Anda buat

export default function MasterUserPage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">DAFTAR USER</h1>
        
        {/* Tombol Tambah yang mengarah ke halaman create */}
        {/* Kita asumsikan nanti Anda buat halaman tambahnya di /dataMaster/masterUser/tambah */}
        <ButtonSky onClick={() => router.push('/dataMaster/masterUser/tambah')}>
           + Tambah User
        </ButtonSky>
      </div>

      {/* Render Tabel Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
         <Table />
      </div>
    </div>
  );
}