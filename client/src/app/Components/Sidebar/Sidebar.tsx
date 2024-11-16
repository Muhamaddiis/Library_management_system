import React from 'react'
import AccountToggle from './AccountToggle';
import Searchbar from './Searchbar';

const Sidebar = () => {
  return (
    <div>
        <div className="overflow-y-scroll sticky top-4 h-[calc(100vh-32px-48px)]">
            <AccountToggle/>
            <Searchbar />
        </div>
        {/* {Plan Toggle} */}
    </div>
  )
}

export default Sidebar