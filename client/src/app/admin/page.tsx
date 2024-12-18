import React from 'react'
import Sidebar from '../Components/Sidebar/Sidebar'
import Dashboard from '../Components/Dashboard/Dashboard'

const page = () => {
  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
        <Sidebar />
        <Dashboard />
    </main>
  )
}

export default page