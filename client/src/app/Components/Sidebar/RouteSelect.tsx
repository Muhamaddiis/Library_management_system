import React from 'react'
import { IconType } from 'react-icons'
import { FiBook, FiHome, FiPaperclip, FiUsers } from 'react-icons/fi'

export const RouteSelect = () => {
  return (
    <div className="space-y-1">
        <Route selected={true} Icon={FiHome} Title="Dashboard" />
        <Route selected={false} Icon={FiUsers} Title="Users" />
        <Route selected={false} Icon={FiPaperclip} Title="Invoices" />
        <Route selected={false} Icon={FiBook} Title="Books" />
    </div>
  )
}

const Route = ({
    selected,
    Icon,
    Title,
}: {
    selected: boolean;
    Icon: IconType;
    Title: string;
   }
) => {
    return (
        <button className={`flex items-center justify-start w-full rounded text-sm gap-2 px-2 py-1.5 
            transition-[box-shadow,_background-color,_color]
            ${selected
                ? "bg-white text-stone-950 shadow"
                : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"     
            }`}
            
        >
            <Icon className={`${selected ? "text-violet-500" : ""}`} />
            <span>{Title}</span>
        </button>
    )
}