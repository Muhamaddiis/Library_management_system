import React from 'react'
import { TestBook } from '../Types/types'
import Image from 'next/image'
import BookCover from './BookCover'

const BookOverview = ({title, author, genre, rating, total_copies,available_copies,description,color,coverUrl}: TestBook) => {
  return (
      <section className='flex flex-col-reverse items-center gap-12 sm:gap-32 xl:flex-row xl:gap-8;'>
          <div className='flex flex-1 flex-col gap-5'>
              <h1 className='text-5xl font-semibold text-white md:text-7xl'>
                  {title}
              </h1>
              <div className=" mt-7 flex flex-row flex-wrap gap-4 text-xl text-zinc-100">
                  <p>By <span className='font-semibold text-amber-200'>{author}</span></p>
                  <p>Category {" "} <span>{genre}</span></p>
                  <div className='flex flex-row gap-1'>
                      <Image src='/icons/star.svg' width={20} height={20} alt='star' loading='lazy' />
                      <p>{rating}</p>
                  </div>
              </div>
              <div className='flex flex-row flex-wrap gap-4 mt-1'>
                  <p className='text-xl text-zinc-100'>Total Books <span className='ml-2 font-semibold text-amber-200'>{ total_copies }</span></p>
                  <p className='text-xl text-zinc-100'>Available Books <span className='ml-2 font-semibold text-amber-200'>{ available_copies }</span></p>
              </div>
              <p className='mt-2 text-justify text-xl text-zinc-300'>{description}</p>
              <button className='mt-4 min-h-14 w-fit bg-amber-200 text-dark-100 hover:bg-amber-200/90 max-md:w-full px-6 flex items-center justify-center gap-2 rounded-md'>
                  <Image src='/icons/book.svg' width={20} height={20} alt='book' loading='lazy' />  
                  <p>Borrow</p>
              </button>
          </div>
          <div className='relative flex flex-1 justify-center'>
              <div className='relative'>
                  <BookCover variant='wide' className="z-10" coverColor={color} coverImage={coverUrl} />
                  <div className='absolute top-10 left-16 w-full h-full bg-dark-100 opacity-40 rotate-12 max-sm:hidden'>
                  <BookCover variant='wide' coverColor={color} coverImage={coverUrl} />
                  </div>
              </div>
          </div>
      </section>
  )
}

export default BookOverview