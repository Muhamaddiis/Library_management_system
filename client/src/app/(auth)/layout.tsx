import React, { ReactNode } from 'react'
import Image from 'next/image'

const layout = ({children}: {children: ReactNode}) => {
  return (
      <main className='relative flex flex-col-reverse text-light-100 sm:flex-row'>
          <section className="my-auto flex h-full min-h-screen flex-1 items-center bg-pattern bg-cover bg-top bg-dark-100 px-5 py-10">
              <div className='gradient-vertical mx-auto flex max-w-xl flex-col gap-6 rounded-lg p-10'>
                  <div className='flex flex-row gap-3'>
                    <Image src='/icons/logo.svg' alt='logo' width={37} height={37} />
                    <h1 className='text-2xl font-semibold text-white'>BookTok</h1>
                  </div>
                  <div>
                      {children}
                  </div>
              </div>
          </section>
      </main>
  )
}

export default layout