"use client"

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sideBarLinks } from '@/constants';

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="h-full w-full flex flex-col justify-between bg-white shadow-md py-8">
            <div className="flex flex-col space-y-2">
                {sideBarLinks
                    .filter(link => link.position === "top")
                    .map(link => (
                        <Link
                            key={link.id}
                            href={link.route}
                            className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
                                pathname === link.route
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            <Image
                                src={link.icon}
                                alt={link.label}
                                width={32}
                                height={32}
                            />
                            <span>{link.label}</span>
                        </Link>
                    ))
                }
            </div>

            <div className="flex flex-col space-y-2">
                {sideBarLinks
                    .filter(link => link.position === "bot")
                    .map(link => (
                        <Link
                            key={link.id}
                            href={link.route}
                            className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
                                pathname === link.route
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            <Image
                                src={link.icon}
                                alt={link.label}
                                width={20}
                                height={20}
                            />
                            <span>{link.label}</span>
                        </Link>
                    ))
                }
            </div>
        </aside>
    );
};

export default Sidebar;