'use client'

import { useEffect, useState } from "react";
import StatCards, { StatCard } from "../Dashboard/StatCards";
import Topbar from "../Dashboard/Topbar"
import { fetchBooks } from "../apii/api";
import { Book } from "@/app/Types/types";
import BookTable from "./BookTable";



const BookData = () => {
    const [stats, setStats] = useState<StatCard[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    useEffect(() => {
        const loadData = async () => {
          try {
            const booksData = await fetchBooks();
            setBooks(booksData)
            const availableBooks = books.filter((book) => book.availability).length;
            const borrowedBooks = books.length - availableBooks;
            
    
            setStats([
              { title: "Total Books", value: books.length, pilltext: "10.5%", trend: "Up", period: "17th August 2024" },
              { title: "Borrowed Books", value: borrowedBooks, pilltext: "5.2%", trend: "down", period: "17th August 2024" },
              { title: "Available Books", value: availableBooks, pilltext: "3.3%", trend: "Up", period: "17th August 2024" },
            ]);
          } catch (error) {
            console.error("Error fetching books data:", error);
          }
        };
    
        loadData();
      }, [books]);
    
    return <>
       <div className="bg-white rounded-lg pb-4 shadow">
            <Topbar />
            <div className="px-4 grid gap-3 grid-cols-12">
                <StatCards stats={stats} />
                <BookTable books={books}/>
            </div>
        </div> 
    </>
    
}

export default BookData