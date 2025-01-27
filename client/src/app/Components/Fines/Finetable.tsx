'use client'
import { Fine } from '@/app/Types/types';
import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiArrowUpRight} from 'react-icons/fi';
import { GiPayMoney } from "react-icons/gi";

const FinesTable = () => {
  const [fines, setFines] = React.useState<Fine[]>([]);

  const fetchFines = async () => {
    try {
      const response = await fetch('http://localhost:8000/fines');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const fines = await response.json();
      console.log('Fetched fines:', fines); // Log the fetched fines
      return fines;
    } catch (error) {
      console.error('Error fetching fines:', error);
      return []; // Return an empty array in case of error
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const fines = await fetchFines();
      setFines(fines);
    };

    loadData();
  }, []);

  const payFine = async (fineId: number) => {
    try {
      console.log("Paying fine with id:", fineId);
  
      const response = await fetch(`http://localhost:8000/fines/${fineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Paid" }), // Include the status in the request body
      });
  
      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        throw new Error(errorData.error || "Failed to pay fine");
      }
  
      const updatedFine = await response.json(); // Parse the updated fine from the response
      setFines((prevFines) =>
        prevFines.map((fine) => 
          fine.id === fineId ? updatedFine : fine
        )
      );
  
      alert("Fine paid successfully! Thank you for your payment.");
    } catch (error) {
      console.error("Error paying fine:", error);
      alert(`An error occurred while processing the payment: ${error.message}`);
    }
  };
  


  return (
    <div className="col-span-12 rounded border border-stone-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-medium">
          <FiDollarSign /> Recent Fines
        </h3>
      </div>
      <table className="w-full table-auto">
        <TableHead />
        <tbody>
          {fines.map((fine, idx) => (
            <TableRow
              key={idx}
              {...fine}
              onPay={() => payFine(fine.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// TableHead Component
const TableHead = () => {
  return (
    <thead>
      <tr className="text-sm font-normal text-stone-500">
        <th className="text-start p-1.5">Id</th>
        <th className="text-start p-1.5">FineId</th>
        <th className="text-start p-1.5">User Id</th>
        <th className="text-start p-1.5">Book Id</th>
        <th className="text-start p-1.5">Amount</th>
        <th className="text-start p-1.5">Fine_date</th>
        <th className="text-start p-1.5">Status</th>
        <th className="text-start p-1.5">Pay</th>
        <th className="w-8"></th>
      </tr>
    </thead>
  );
};

// TableRow Component
interface TableRowProps {
    id: number;
    user_id: number;
    book_id: number;
    fine_amount: number;
    fine_date: string;
    status: "Paid" | "Unpaid";
    onPay: () => void;
}

const TableRow = ({
  id,
  user_id,
  book_id,
  fine_amount,
  fine_date,
  status,
  onPay
}: TableRowProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <tr className={id % 2 ? 'bg-stone-100 text-sm' : 'text-sm'}>
      <td className="p-1.5">
        <a
          href="#"
          className="text-violet-600 underline flex items-center gap-1"
        >
          {id} <FiArrowUpRight />
        </a>
      </td>
      <td className="p-1.5">{id}</td>
      <td className="p-1.5">{user_id}</td>
      <td className="p-1.5">{book_id}</td>
      <td className="p-1.5">{fine_amount}</td>
      <td className="p-1.5">{fine_date}</td>
      <td className="p-1.5">
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            status === "Paid" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {status === "Paid" ? 'Paid' : 'Unpaid'}
        </span>
      </td>
      <td className="relative w-8">
        <button
          className="hover:bg-stone-200 transition-colors grid place-content-center rounded text-sm size-8"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <GiPayMoney />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 bg-white border border-stone-300 rounded shadow-md w-40 z-10">
            <button
              className="w-full text-left px-4 py-2 hover:bg-stone-100 transition-colors"
              onClick={onPay}
            >
              Pay
            </button>
            {/* <button
              className="w-full text-left px-4 py-2 hover:bg-stone-100 text-red-600 transition-colors"
              onClick={onDelete}
            >
              Delete
            </button> */}
          </div>
        )}
      </td>
    </tr>
  );
};

export default FinesTable;