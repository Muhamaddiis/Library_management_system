import React from 'react'
import Sidebar from '../Components/Sidebar/Sidebar'
import FinesData from '../Components/Fines/FinesData'


const FinesPage = () => {
  return (
    <div className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <Sidebar />
      <FinesData />
    </div>
  )
}

export default FinesPage