import { FileText, Download } from 'lucide-react';
import ContentContainer from '../../components/global/ContentContainer/contentContainer';

const DashboardPage = () => {
  return (
    <ContentContainer>
      <div className="pb-4">
        {/* Teks statis karena fitur login dinonaktifkan */}
        <p className="text-gray-700 text-lg font-medium">Selamat Datang, Admin Pemda!</p>
      </div>
      
      <hr className="border-gray-200" />
      
      <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              {/* Menggunakan warna biru custom dari ButtonSky (#1679AB) */}
              <FileText color="#1679AB" size={24} />
              <div className="flex flex-col">
                <p className="text-gray-800 font-medium">Panduan Website</p>
                <span className="text-gray-500 text-sm">Dokumentasi manual penggunaan aplikasi</span>
              </div>
          </div>
          
          <a
              href="https://drive.google.com/drive/u/1/folders/1B7V2IOXVOGd9pp8HMrf8N2VhWp3lMnCe" // Ganti dengan link file PDF asli Anda nanti
              download
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-semibold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md"
          >
              <Download size={18} />
              <span>Download Manual</span>
          </a>
      </div>
    </ContentContainer>
  );
};

export default DashboardPage;