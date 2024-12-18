import React from 'react'
import { FiArrowUpRight, FiDollarSign, FiMoreHorizontal } from 'react-icons/fi'

export interface Fine {
  user_id: string;
  book_id: string;
  fine_amount: number;
  fine_date: string;
}

const RecentTransactions = ({ fines }: { fines: Fine[] }) => {
  console.log(fines);
  
  return (
    <div className="col-span-12 rounded border border-stone-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-medium">
          <FiDollarSign /> Recent Fines
        </h3>
        <button className="text-sm text-violet-500 hover:underline">See All</button>
      </div>
      <table className="w-full table-auto">
        <TableHead />
        <tbody>
          {fines.map((fine, index) => (
            <TableRow
              key={index}
              cusId={fine.user_id}
              bookId={fine.book_id}
              date={formatDate(fine.fine_date)}
              price={`$${fine.fine_amount.toFixed(2)}`}
              order={index + 1}
        />
        ))}
        </tbody>
      </table>
    </div>
  )
}

const TableHead = () => {
  return (
    <thead>
      <tr className="text-sm font-normal text-stone-500">
        <th className="text-start p-1.5">CustomerId</th>
        <th className="text-start p-1.5">BookId</th>
        <th className="text-start p-1.5">Date</th>
        <th className="text-start p-1.5">Price</th>
        <th className="w-8"></th>
      </tr>
    </thead>
  );

}

const TableRow = ({
  cusId,
  bookId,
  date,
  price,
  order
}: {
    cusId: string;
    bookId: string;
    date: string;
    price: string;
    order: number;
}) => {
  return (
    <tr className={order % 2 ? "bg-stone-100 text-sm" : "text-sm"}>
      <td className="p-1.5">
        <a
          href="#"
          className="text-violet-600 underline flex items-center gap-1"
        > {cusId} <FiArrowUpRight />
        </a>
      </td>
      <td className="p=1.5">{bookId}</td>
      <td className="p=1.5">{date}</td>
      <td className="p=1.5">{price}</td>
      <td className="w-8">
        <button className="hover:bg-stone-200 transition-colors grid place-content-center rounded text-sm size-8">
          <FiMoreHorizontal />
        </button>
      </td>
    </tr>
  );
}

const formatDate = (date: string) => {
  if (!date) return "N/A";
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

export default RecentTransactions