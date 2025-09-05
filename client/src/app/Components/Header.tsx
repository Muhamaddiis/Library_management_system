"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthProvider'

const Header = () => {
  const { isLoggedIn } = useAuth()

  return (
    <header className='my-10 flex justify-between gap-4'>
      <Link href="/">
        <Image src='/icons/logo.svg' width={40} height={40} alt='logo' />
      </Link>

      <ul className='flex flex-row items-center gap-8'>
        <li>
          <Link href="/library" className='text-base cursor-pointer bg-amber-200 text-dark-100 hover:bg-amber-200/90 p-2 rounded'>
            Library
          </Link>
        </li>

        {!isLoggedIn && (
          <>
            <li>
              <Link href="/sign-up" className='text-base cursor-pointer bg-amber-200 text-dark-100 hover:bg-amber-200/90 p-2 rounded'>
                Sign up
              </Link>
            </li>
            <li>
              <Link href="/sign-in" className='text-base cursor-pointer bg-amber-200 text-dark-100 hover:bg-amber-200/90 p-2 rounded'>
                Login
              </Link>
            </li>
          </>
        )}
      </ul>
    </header>
  );
};

export default Header;