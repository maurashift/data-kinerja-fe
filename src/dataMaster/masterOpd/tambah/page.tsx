'use client'

import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
// Import form dari folder parent (naik satu level)
import { FormMasterOpd } from "../../../app/dataMaster/masterOpd/FormMasterOpd"; 

const TambahOpdPage = () => {
    return(
        <div className="space-y-6">
            {/* Breadcrumbs Navigasi */}
            <div className="flex items-center text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                    <Home size={16} />
                </Link>
                
                <ChevronRight size={16} className="mx-2" />
                
                <span className="hover:text-blue-600 cursor-default">Data Master</span>
                
                <ChevronRight size={16} className="mx-2" />
                
                <Link href="/dataMaster/masterOpd" className="hover:text-blue-600 transition-colors">
                    Master OPD
                </Link>
                
                <ChevronRight size={16} className="mx-2" />
                
                <span className="font-semibold text-blue-600">Tambah</span>
            </div>

            {/* Container Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <FormMasterOpd />
            </div>
        </div>
    )
}

export default TambahOpdPage;