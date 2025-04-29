import React from 'react'
import { TestBook } from '../Types/types'
import BookCard from './BookCard'

interface Props {
    title: string
    books: TestBook[]
    containerClassName: string
}

const BookList = ({title, books, containerClassName}: Props) => {
  return (
    <section className={containerClassName}>
          <h2 className='text-4xl text-zinc-400'>{title}</h2>
          <ul className=' mt-10 flex flex-wrap gap-5 max-xs:justify-between xs:gap-10'>
            {books.map((book, index) => (
              <BookCard key={index} {...book} />
            ))}
          </ul>
    </section>
  )
}

export default BookList