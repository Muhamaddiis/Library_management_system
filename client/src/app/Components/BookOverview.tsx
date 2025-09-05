import React, { useState } from 'react'
import { TestBook } from '../Types/types'
import Image from 'next/image'
import BookCover from './BookCover'

type BorrowStatus = 'idle' | 'loading' | 'success' | 'error';

const BookOverview = ({ title, author, genre, rating, total_copies, available_copies, description, color, coverUrl, id }: TestBook & {id: string}) => {
    const [expanded, setExpanded] = useState(false);
    const [borrowStatus, setBorrowStatus] = useState<BorrowStatus>('idle');
    const [availableCount, setAvailableCount] = useState(available_copies);
    const handleBorrow = async () => {
        setBorrowStatus('loading');
        try {
            const response = await fetch(`http://localhost:8000/borrow/${id}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            setBorrowStatus('success');
            setAvailableCount(prev => prev - 1); // Update local count
            // You might want to show a success message here
        } catch (error) {
            console.error('Borrow failed:', error);
            setBorrowStatus('error');
            // You might want to show an error message here
        }
    };
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
              <p
                className={`mt-2 text-xl text-zinc-300 text-justify ${
                    !expanded ? 'line-clamp-6' : ''
                }`}
                >
                {description}
                </p>

                {description.length > 300 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-amber-200 underline text-left w-fit"
                >
                    {expanded ? 'Show less' : '...read more'}
                </button>
                )}

              {/* <button className='mt-4 min-h-14 w-fit bg-amber-200 text-dark-100 hover:bg-amber-200/90 max-md:w-full px-6 flex items-center justify-center gap-2 rounded-md'>
                  <Image src='/icons/book.svg' width={20} height={20} alt='book' loading='lazy' />  
                  <p>Borrow</p>
              </button> */}
              <button 
                onClick={handleBorrow}
                disabled={availableCount <= 0 || borrowStatus === 'loading'}
                className={`mt-4 min-h-14 w-fit bg-amber-200 text-dark-100 hover:bg-amber-200/90 max-md:w-full px-6 flex items-center justify-center gap-2 rounded-md ${
                    availableCount <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                    borrowStatus === 'loading' ? 'animate-pulse' : ''
                }`}
            >
                <Image src='/icons/book.svg' width={20} height={20} alt='book' loading='lazy' />  
                {availableCount <= 0 ? (
                    'Not Available'
                ) : borrowStatus === 'loading' ? (
                    'Processing...'
                ) : (
                    'Borrow'
                )}
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