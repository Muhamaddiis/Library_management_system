import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
const Header = () => {
  return (
    <header className='my-10 flex justify-between gap-4'>
          <Link href="/">
              <Image src='/icons/logo.svg' width={40} height={40} alt='logo' />
          </Link>
        <ul className='flex flex-row items-center gap-8'>
            <li>
                <Link href="/library" className='text-base cursor-pointer capitalize'>Library</Link>
            </li>
        </ul>
    </header>
  )
}

export default Header