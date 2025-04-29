'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation' // ✅ Use usePathname instead of useRouter
import React from 'react'
import { IconType } from 'react-icons'
import { FiBook, FiHome, FiPaperclip, FiUsers } from 'react-icons/fi'

export const RouteSelect = () => {
    const pathname = usePathname(); // ✅ Get current route path

    return (
        <div className="space-y-1">
            <Route page='/admin' selected={pathname === '/admin'} Icon={FiHome} Title="Dashboard"/>
            <Route page='/users' selected={pathname === '/users'} Icon={FiUsers} Title="Users"/>
            <Route page='/fines' selected={pathname === '/fines'} Icon={FiPaperclip} Title="Fines"/>
            <Route page='/books' selected={pathname === '/books'} Icon={FiBook} Title="Books"/>
        </div>  
    )
}

const Route = ({
    page,
    selected,
    Icon,
    Title,
}: {
    page: string
    selected: boolean;
    Icon: IconType;
    Title: string;
}) => {
    return (
        <Link href={page}>
            <button
                className={`flex items-center justify-start w-full rounded text-sm gap-2 px-2 py-1.5 
                transition-[box-shadow,_background-color,_color]
                ${selected
                    ? "bg-white text-stone-950 shadow"
                    : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
                }`}
            >
                <Icon className={`${selected ? "text-violet-500" : ""}`} />
                <span>{Title}</span>
            </button>
        </Link>
    )
}
