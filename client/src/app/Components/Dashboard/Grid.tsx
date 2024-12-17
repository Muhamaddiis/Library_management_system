"use client"

import React, { useEffect, useState } from 'react'
import {StatCards} from './StatCards'
import ActivityGraph from './ActivityGraph'
import {UsageRadar} from './UsageRadar'
import RecentTransactions from './RecentTransactions'
import {fetchBooks, fetchBorrowings, fetchFines, fetchUsers} from "../apii/api"

const Grid = () => {
  const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [fines, setFines] = useState([]);
    const [borrowings, setborrowings] = useState([]);

    useEffect(() => {
        const loadData = async () => {
          try {
            const [booksData, usersData, fineData, borrowingsData] = await Promise.all([
              fetchBooks(),
              fetchUsers(),
              fetchFines(),
              fetchBorrowings(),
            ]);
    
            setBooks(booksData); 
            setUsers(usersData); 
            setFines(fineData);
            setborrowings(borrowingsData);
          } catch (error: unknown) {
              let message = 'Unknown Error'
              if(error instanceof Error) message = error.message
            console.error("Error fetching data:", message);
          }
        };
    
        loadData(); // Fetch data on component mount
      }, []);
  return (
    <div className="px-4 grid gap-3 grid-cols-12">
      <StatCards books={books} users={users} fines={fines} borrowings={borrowings} />
          <ActivityGraph/>
          <UsageRadar />
          <RecentTransactions fines={fines}/>
    </div>
  )
}

export default Grid