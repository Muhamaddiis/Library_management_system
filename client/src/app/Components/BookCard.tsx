import React from 'react'
import { TestBook } from '../Types/types'
import Link from 'next/link'
import Image from 'next/image'
import BookCover from './BookCover'

const BookCard = ({id, title, genre, color, coverUrl, isLoanedBook = false }: TestBook) => {
  return (
      <li className={`${isLoanedBook && "w-full xs:w-52"}`}>
          <Link href={`/book/${id}`} className={`${isLoanedBook && "w-full flex flex-col items-center"}`}>
              <BookCover color={color} coverImage={coverUrl} />
              <div className={`mt-4 ${!isLoanedBook && "xs:max-40 max-w-28"}`}>
                  <p className=' mt-2 line-clamp-1 text-base font-semibold text-white xs:text-xl'>{title}</p>
                  <p className='mt-1 line-clamp-1 text-sm italic text-zinc-400 xs:text-base'>{genre}</p>
              </div>
              {isLoanedBook && (
                  <div className="mt-3 w-full">
                      <div className="flex flex-row items-center gap-1 max-xs:justify-center">
                          <Image src='/icons/calendar.svg' width={18} height={18} alt='calender' className='object-contain' />
                          <p className='text-amber-100'>11 days left to return</p>
                      </div>
                  </div>
              )}
          </Link>
    </li>
  )
}

export default BookCard