
export interface TargetData {
  satuan: string;
  tahun: number;
  // Menggunakan union type karena API mungkin mengembalikan string atau number
  target: string | number; 
}

export interface DataKinerja {
  id: number;
  nama_data: string;
  rumus_perhitungan: string;
  sumber_data: string;
  instansi_produsen_data: string;
  keterangan: string;
  tahun: number;
  // Array of objects berdasarkan interface TargetData di atas
  target: TargetData[]; 
}
export interface OptionType {
    label: string;
    value: number;
}
export interface OptionTypeString {
    label: string;
    value: string;
}