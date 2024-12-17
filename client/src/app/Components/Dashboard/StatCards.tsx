

import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi';






export const StatCards = ({ books, users, fines, borrowings }: { books: any[]; users: any[]; fines: any[]; borrowings: any[]; }) => {
    const totalFines = fines.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0);
  return (
      <>
          <Card title="Users" value={users.length} pilltext="2.75%" trend="Up"  period="17th August 2024"/>
          <Card title="books" value={books.length} pilltext='60.75%' trend="Up"  period="17th August 2024"/>
          <Card title='Fines' value={`$${totalFines.toFixed(2)}`} pilltext='2.75%' trend="down"  period="17th August 2024"/>
          <Card title='Borrowings' value={borrowings.length} pilltext='1.01%' trend="down"  period="17th August 2024"/>
      </>
  )
}

export const Card = ({
    title,
    value,
    pilltext,
    trend,
    period,
}: {
    title: string;
    value: number | string;
    pilltext: string;
    trend: "Up" | "down";
    period: string
}) => {
    return (
        <div className="p-4 col-span-3 rounded border border-stone-300">
            <div className="flex mb-8 items-start justify-between">
                <div>
                    <h3 className="text-sm text-stone-500 mb-2">{title}</h3>
                    <p className="text-3xl font-semibold">{value}</p>
                </div>
                <span className={`text-xs flex items-center gap-1 font-medium px-2 py-1 rounded 
                    ${trend === "Up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                    {trend === "Up"? <FiTrendingUp/> : <FiTrendingDown/>} {pilltext}
                    </span>
            </div>
            <a className="text-xs text-stone-500">{period}</a>
        </div>
    )
}

