import React from 'react'
import Sidebar from '../../Components/Sidebar/Sidebar'
import BookData from '../../Components/BookData/BookData'


const page = () => {
  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
        <Sidebar />
        
        <BookData />
    </main>
  )
}

export default page