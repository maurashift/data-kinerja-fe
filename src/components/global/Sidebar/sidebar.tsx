'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { 
    Home, 
    Landmark, 
    Users, 
    PanelLeftClose, 
    PanelRightClose, 
    DatabaseIcon, 
    Building2, 
    ChevronDown 
} from 'lucide-react';

type NavItem = {
    href: string;
    icon: React.ElementType;
    label: string;
    subItems?: NavItem[];
    action?: () => void;
};

// Menu Navigasi
const navItems: NavItem[] = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    {
        href: '/dataMaster',
        icon: DatabaseIcon,
        label: 'Data Master',
        subItems: [
            { href: '/dataMaster/masterOpd', icon: Building2, label: 'Master OPD' },
            { href: '/dataMaster/masterUser', icon: Building2, label: 'Master User' },
            { href: '/dataMaster/masterPeriode', icon: Building2, label: 'Master Periode' }
        ]
    },
    { href: '/pemda/jenis-data', icon: Landmark, label: 'Pemda' },
    { href: '/opd/jenis-data', icon: Users, label: 'OPD' },
];

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void; }) => {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const handleMenuClick = (href: string) => {
        setOpenMenus(prevState => ({ ...prevState, [href]: !prevState[href] }));
    };

    const renderNavItems = () => {
        return navItems.map((item) => {
            const isParentActive = item.subItems 
                ? pathname.startsWith(item.href) 
                : pathname === item.href;
            
            if (item.subItems) {
                return (
                    <li key={item.label}>
                        <button
                            onClick={() => handleMenuClick(item.href)}
                            className={`w-full flex items-center justify-between gap-3 p-3 my-1 rounded-md transition-colors ${
                                isParentActive ? 'bg-sidebar-active-bg text-sidebar-active-text font-bold' : 'hover:bg-white/20'
                            } ${!isOpen && 'justify-center'}`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                <span className={!isOpen ? 'hidden' : 'block'}>{item.label}</span>
                            </div>
                            {isOpen && (
                                <ChevronDown size={16} className={`transition-transform ${openMenus[item.href] ? 'rotate-180' : ''}`} />
                            )}
                        </button>
                        {isOpen && openMenus[item.href] && (
                            <ul className="pl-6 mt-1">
                                {item.subItems.map((subItem) => {
                                    const isSubItemActive = pathname.startsWith(subItem.href);
                                    return (
                                        <li key={subItem.label}>
                                            <Link
                                                href={subItem.href}
                                                className={`flex items-center gap-3 p-2 my-1 rounded-md transition-colors text-sm ${
                                                    isSubItemActive ? 'bg-sidebar-active-bg text-sidebar-active-text font-semibold' : 'hover:bg-white/20'
                                                }`}
                                            >
                                                <span>{subItem.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </li>
                );
            }

            const commonClasses = `flex items-center gap-3 p-3 my-1 rounded-md transition-colors ${
                isParentActive ? 'bg-sidebar-active-bg text-sidebar-active-text font-bold' : 'hover:bg-white/20'
            } ${!isOpen && 'justify-center'}`;

            return (
                <li key={item.label}>
                    <Link href={item.href} className={commonClasses}>
                        <item.icon size={20} />
                        <span className={!isOpen ? 'hidden' : 'block'}>{item.label}</span>
                    </Link>
                </li>
            );
        });
    };

    return (
        <aside
            // PERUBAHAN DI SINI:
            // 1. min-h-screen diganti h-screen (tinggi fix seukuran layar)
            // 2. md:static diganti md:sticky md:top-0 (agar menempel saat discroll)
            // 3. overflow-y-auto (agar sidebar bisa discroll sendiri jika menu panjang)
            className={`
                bg-sidebar-bg text-sidebar-text flex flex-col transition-all duration-300
                h-screen overflow-y-auto
                ${isOpen ? 'w-64' : 'w-20'}
                fixed md:sticky md:top-0 z-40 
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
        >
            <div className="flex-1 p-4">
                <div className="flex items-center justify-center mb-8 relative h-14">
                    {isOpen && (
                        <Image
                            src="/favicon.ico" 
                            alt="Logo"
                            width={55}
                            height={55}
                            className="transition-opacity duration-300"
                        />
                    )}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-gray-400 hover:text-white absolute right-0 -mr-2"
                    >
                        {isOpen ? <PanelLeftClose /> : <PanelRightClose />}
                    </button>
                </div>

                {isOpen && (
                    <div className="text-center mb-8">
                        <h1 className="font-bold text-[15px] leading-tight">KINERJA PEMBANGUNAN</h1>
                        <p className="text-[15px]">Development</p>
                    </div>
                )}
                
                <nav>
                    <ul>
                        {renderNavItems()}
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;