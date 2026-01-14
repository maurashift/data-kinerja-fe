'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar/sidebar';
import Header from './Header/header'; // Pastikan path benar

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar tetap menerima props */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col h-full relative overflow-y-auto overflow-x-hidden">
                {/* PERBAIKAN: Header dipanggil TANPA props */}
                <Header />

                <main className="flex-1 p-6 bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}