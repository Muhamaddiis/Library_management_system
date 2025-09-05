'use client'


import React, { useEffect, useState } from 'react'
import BookOverview from '../Components/BookOverview'
import BookList from '../Components/BookList'
import { TestBook, Book } from '../Types/types'
import { normalizeBook } from '@/lib/normalizeBook'

const Home = () => {
  const [books, setBooks] = useState<TestBook[]>([]);
  const [loading, setLoading] = useState(true)
  const [featuredBook, setFeaturedBook] = useState<TestBook | null>(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:8000/books")
        const data: Book[] = await res.json()
        const normalized = data.map(normalizeBook)
        setBooks(normalized)
        if (normalized.length > 0) {
          const randomBook = normalized[Math.floor(Math.random() * normalized.length)]
          setFeaturedBook(randomBook)
        }
      } catch (err){
        console.error("Failed to load books", err)
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  },[])

  if (loading) return <p className="text-white text-center mt-20">Loading...</p>
  if(!featuredBook || !books.length) return <p className="text-white text-center mt-20">No books found.</p>

  return (
    <>
    <BookOverview {...featuredBook} />
    <BookList
      title='Popular Books'
      books={books}
      containerClassName='mt-28'
    />
  </>)
}

export default Home