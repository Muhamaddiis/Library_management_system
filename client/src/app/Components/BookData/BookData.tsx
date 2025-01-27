'use client'
import React, { useState, useEffect } from 'react';
import StatCards, { StatCard } from '../Dashboard/StatCards';
import Topbar from '../Dashboard/Topbar';
import BookTable from './BookTable';

// Mock fetchBooks function - replace this with your actual fetch function
const fetchBooks = async () => {
  // Simulate fetching books from an API
  const response = await fetch('http://localhost:8000/books');
  const books = await response.json();
  return books;
};

const BookData = () => {
  const [stats, setStats] = useState<StatCard[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const books = await fetchBooks();
      const borrowed = books.filter(book => book.availability === false).length;

      setStats([
        { title: "Books", value: books.length, pilltext: "2.75%", trend: "Up", period: "17th August 2024" },
        { title: "Borrowed", value: borrowed, pilltext: "60.75%", trend: "Up", period: "17th August 2024" },
        { title: "Fines", value: "$100.00", pilltext: "2.75%", trend: "down", period: "17th August 2024" },
      ]);
    };

    loadData();
  }, []);

  return (
    <div>
      <Topbar />
      <div className="px-4 grid gap-3 grid-cols-12">
        <StatCards stats={stats} />
        <BookTable />
      </div>
    </div>
  );
};

export default BookData;