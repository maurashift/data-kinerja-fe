'use client';

import React from "react";
import { ClipLoader, BeatLoader, SyncLoader } from "react-spinners";

type BaseProps = {
  loading?: boolean;
  color?: string;       // default warna
  size?: number;        // biar fleksibel
  className?: string;   // kalau mau dikasih util kelas Tailwind
};

export const LoadingClip: React.FC<BaseProps> = ({
  loading = true,
  color = "#1f2937",
  size = 50,
  className = "",
}) => (
  <div className={`px-5 py-3 flex flex-col items-center justify-center z-50 ${className}`}>
    <ClipLoader color={color} loading={loading} size={size} />
    <h1 className="text-gray-800 mt-5 text-2xl uppercase font-semibold">Loading</h1>
  </div>
);

export const LoadingBeat: React.FC<BaseProps> = ({
  loading = true,
  color = "#1f2937",
  size = 20,
  className = "",
}) => (
  <div className={`px-5 py-3 flex flex-col items-center justify-center z-50 ${className}`}>
    <BeatLoader color={color} loading={loading} size={size} />
    <h1 className="text-gray-800 mt-5 text-2xl uppercase font-semibold">Loading</h1>
  </div>
);

export const LoadingSync: React.FC<BaseProps> = ({
  loading = true,
  color = "#1f2937",
  size = 10,
  className = "",
}) => (
  <div className={`px-5 py-3 flex flex-col items-center justify-center z-50 ${className}`}>
    <SyncLoader color={color} loading={loading} size={size} />
    <h1 className="text-gray-800 mt-5 text-2xl uppercase font-semibold">Loading</h1>
  </div>
);

// Loader kecil untuk tombol (putih by default) - Cocok untuk ButtonGreen/ButtonRed
export const LoadingButtonClip: React.FC<BaseProps> = ({
  loading = true,
  color = "#ffffff",
  size = 15,
  className = "",
}) => (
  <div className={`mr-2 flex items-center justify-center z-50 ${className}`}>
    <ClipLoader color={color} loading={loading} size={size} />
  </div>
);

// Versi yang bisa pilih warna lewat props (default ikut currentColor)
export const LoadingButtonClip2: React.FC<BaseProps> = ({
  loading = true,
  color = "currentColor",
  size = 15,
  className = "",
}) => (
  <div className={`mr-2 flex items-center justify-center z-50 ${className}`}>
    <ClipLoader color={color} loading={loading} size={size} />
  </div>
);