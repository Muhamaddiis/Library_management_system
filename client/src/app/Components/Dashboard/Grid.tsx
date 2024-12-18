"use client"

import React, { useEffect, useState } from 'react'
import {StatCard, StatCards} from './StatCards'
import ActivityGraph from './ActivityGraph'
import {UsageRadar} from './UsageRadar'
import RecentTransactions from './RecentTransactions'
import { fetchBooks, fetchBorrowings, fetchFines, fetchUsers } from "../apii/api"

const Grid = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [fines, setFines] = useState<{ fine_amount?: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [books, users, finesData, borrowings] = await Promise.all([
          fetchBooks(),
          fetchUsers(),
          fetchFines(),
          fetchBorrowings(),
        ]);
  
        setFines(finesData);
        const totalFines = fines.reduce((sum: number, fine: { fine_amount?: number }) => sum + (fine.fine_amount || 0), 0);


        setStats([
          { title: "Users", value: users.length, pilltext: "2.75%", trend: "Up", period: "17th August 2024" },
          { title: "Books", value: books.length, pilltext: "60.75%", trend: "Up", period: "17th August 2024" },
          { title: "Fines", value: `$${totalFines.toFixed(2)}`, pilltext: "2.75%", trend: "down", period: "17th August 2024" },
          { title: "Borrowings", value: borrowings.length, pilltext: "1.01%", trend: "down", period: "17th August 2024" },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadData();
  }, []);
  return (
    <div className="px-4 grid gap-3 grid-cols-12">
      <StatCards stats={stats} />
          <ActivityGraph/>
          <UsageRadar />
          <RecentTransactions fines={fines}/>
    </div>
  )
}

export default Grid