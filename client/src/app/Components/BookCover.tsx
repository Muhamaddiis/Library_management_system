import React from 'react'
import Image from 'next/image';
import BookCoverSvg from './BookCoverSvg';

const variantStyles: Record<BookCoverVarient, string> = {
    extrasmall: 'w-[28.95px] h-10',
    small: 'w-[55px] h-[76px]',
    medium: ' w-[144px] h-[199px]',
    regular: 'xs:w-[174px] w-[114px] xs:h-[239px] h-[169px]',
    wide: 'xs:w-[296px] w-[256px] xs:h-[404px] h-[354px]'
}
type BookCoverVarient = 'extrasmall' | 'small' | 'medium' | 'regular' | 'wide'
interface Props {
  variant?: BookCoverVarient;
  className?: string;
  color: string;
  coverImage: string;
}


const BookCover = ({variant='regular', className,color="#012b48", coverImage='https://placehold.co/400x600.png'}: Props) => {
  return (
    <div className={`relative transition-all duration-100 ${variantStyles[variant]}${className ? ` ${className}` : ''}`}> 
        <BookCoverSvg color={color} />
        
        <div className='absolute z-10' style={{left: '12%', width: '87.5%', height: '88%'}}>
            <Image src={coverImage} alt='bookCover' fill className='rounded-sm object-fill' objectFit='cover' />
        </div>
    </div>
  )
}

export default BookCover