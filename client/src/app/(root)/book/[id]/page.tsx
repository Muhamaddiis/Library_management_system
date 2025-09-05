"use client"
import BookOverview from '@/app/Components/BookOverview';
import { Book, TestBook } from '@/app/Types/types';
import { normalizeBook } from '@/lib/normalizeBook';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const BookDetail = () => {
    const params = useParams();
    const { id } = params as { id: string };
    console.log(id); // This will log the book ID from the URL
    const [book, setBook] = useState<TestBook | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBook = async () => {
          try {
            const res = await fetch(`http://localhost:8000/books/${id}`, {
              credentials: 'include', // if using cookies
            });
            const data: Book = await res.json();
              const normalized = normalizeBook(data)
            setBook(normalized);
          } catch (err) {
            console.error("Failed to load book", err);
          } finally {
            setLoading(false);
          }
        };
    
        if (id) fetchBook();
      }, [id]);
      if (loading) return <p>Loading...</p>;
      if (!book) return <p>Book not found.</p>;
  return (
      <BookOverview
          {...book}
          id={id}
      />
  )
}

export default BookDetail