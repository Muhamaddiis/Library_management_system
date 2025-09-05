import React from 'react'
import { Profile } from '../Types/types'

const meCard = ({user}: Profile) => {
  return (
    <div className="absolute h-[566px] w-[100%] rounded-sm bg-gradient-to-b from-[#232839] to-[#12141D] items-center">
        <div className="absolute w-[59px] h-[88px] left-[254px] top-[-17px] bg-[#464F6F] rounded-b-[100px] z-[2]">
            <div className="absolute w-[40px] h-[10px] left-1/2 top-[59px] -translate-x-1/2 bg-[#1E2230] rounded-[40px]"></div>
        </div>
      <div>{ user.username }</div>
    </div>

  )
}

export default meCard