import React from 'react'

const Plan = () => {
  return (
      <div className="flex flex-col sticky top-[calc(100vh_-_48px_-_16px)] h-12 border-t px-2 border-stone-300 justify-end text-xs">
          <div className="flex items-center justify-between">
              <div>
                <p className='font-bold'>Enterprise</p>
                <p className='text-stone-500'>Pay As You Go</p>
              </div>
              <button className="px-2 py-1.5 font-medium bg-stone-200 hover:bg-stone-300 rounded transition-colors">Support</button>
          </div>
      </div>
  )
}

export default Plan