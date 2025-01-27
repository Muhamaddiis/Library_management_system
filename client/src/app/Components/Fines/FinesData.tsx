'use client'
import React, { useState, useEffect } from 'react';
import StatCards, { StatCard } from '../Dashboard/StatCards';
import Topbar from '../Dashboard/Topbar';
import FinesTable from './Finetable';
import { Fine } from '@/app/Types/types';

// Mock fetchfines function - replace this with your actual fetch function
const fetchfines = async () => {
  // Simulate fetching fines from an API
  const response = await fetch('http://localhost:8000/fines');
  const fines = await response.json();
  return fines;
};

const FinesData = () => {
  const [stats, setStats] = useState<StatCard[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const fines = await fetchfines();
        const unpaid = fines.filter(fine => fine.status === "Unpaid").length;
        const paidFines = fines.filter((fine: Fine) => fine.status === 'Paid');
        const totalPaidEarnings = paidFines.reduce((total: number, fine: Fine) => total + fine.fine_amount, 0);
        const totalFines = fines.reduce((sum: number, fine: { fine_amount?: number }) => sum + (fine.fine_amount || 0), 0);

      setStats([
        { title: "fines", value: fines.length, pilltext: "2.75%", trend: "Up", period: "17th August 2024" },
        { title: "Unpaid", value: unpaid, pilltext: "60.75%", trend: "Up", period: "17th August 2024" },
        { title: "Total Earnings ksh", value: `$${totalPaidEarnings.toFixed(2)}`, pilltext: "2.75%", trend: "down", period: "17th August 2024" },
        { title: "Total ksh", value: `$${totalFines.toFixed(2)}`, pilltext: "2.75%", trend: "down", period: "17th August 2024" },
      ]);
    };

    loadData();
  }, []);

  return (
    <div>
      <Topbar />
      <div className="px-4 grid gap-3 grid-cols-12">
        <StatCards stats={stats} />
        <FinesTable />
      </div>
    </div>
  );
};

export default FinesData;