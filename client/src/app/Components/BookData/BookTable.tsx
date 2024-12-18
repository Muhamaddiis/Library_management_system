import { Book } from '@/app/Types/types';
import React, { useState } from 'react'
import { FiArrowUpRight, FiDollarSign, FiMoreHorizontal, FiPlus } from 'react-icons/fi'
import BookForm from './BookForm';
import { fetchBooks } from '../apii/api';



const BooksTable = ({ books }: { books: Book[] }) => {
    const [isFormVisible, setFormVisible] = useState(false);
    const [bookList, setBookList] = useState<Book[]>(books);
  
    const handleAddBook = (newBook: Book) => {
      setBookList([...bookList, newBook]);
        fetchBooks();
    };
  
    return (
      <div className="col-span-12 rounded border border-stone-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 font-medium">
            <FiDollarSign /> Books
          </h3>
          <button
            onClick={() => setFormVisible((prev) => !prev)}
            className="text-sm hover:underline flex justify-center items-center gap-1 bg-purple-400 rounded p-2"
          >
            <FiPlus /> {isFormVisible ? "Close" : "Add"}
          </button>
        </div>
  
        {isFormVisible && (
          <BookForm
            onAddBook={handleAddBook}
            onClose={() => setFormVisible(false)}
          />
        )}
      <table className="w-full table-auto">
        <TableHead />
        <tbody>
          {books.map((book, index) => (
            <TableRow
              key={index}
              title={book.title}
              author={book.author}
              genre={book.genre}
              description={book.description}
              availability={book.availability}
              image={book.image}
              order={index + 1}
        />
        ))}
        </tbody>
      </table>
    </div>
  )
}

const TableHead = () => {
  return (
    <thead>
      <tr className="text-sm font-normal text-stone-500">
        <th className="text-start p-1.5">BookId</th>
        <th className="text-start p-1.5">Title</th>
        <th className="text-start p-1.5">Author</th>
        <th className="text-start p-1.5">Genre</th>
        <th className="text-start p-1.5">Description</th>
        <th className="text-start p-1.5">Availability</th>
        <th className="text-start p-1.5">Image</th>
        <th className="w-8"></th>
      </tr>
    </thead>
  );

}

const TableRow = ({
  title,
  author,
  genre,
  description,
  availability,
  image,
  order
}: {
    title: string;
    author: string;
    genre: string;
    description: string;
    availability: boolean;
    image: string;
    order: number;
}) => {
  return (
    <tr className={order % 2 ? "bg-stone-100 text-sm" : "text-sm"}>
      <td className="p-1.5">
        <a
          href="#"
          className="text-violet-600 underline flex items-center gap-1"
        > {order} <FiArrowUpRight />
        </a>
      </td>
      <td className="p=1.5">{title}</td>
      <td className="p=1.5">{author}</td>
      <td className="p=1.5">{genre}</td>
      <td className="p=1.5 h-8">
        {description.length > 50 ? (
            <span title={description}>
                {description.slice(0, 50)}...
            </span>
            ) : (
            description
            )}
      </td>
      <td className="p=1.5">
        <span
            className={`px-2 py-1 text-xs font-medium rounded ${
                availability ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
            >
            {availability ? "Available" : "Unavailable"}
        </span>
      </td>
      <td className="p=1.5">
        <img src={image} alt="bookImg" className='w-8'/>
      </td>
      <td className="w-8">
        <button className="hover:bg-stone-200 transition-colors grid place-content-center rounded text-sm size-8">
          <FiMoreHorizontal />
        </button>
      </td>
    </tr>
  );
}



export default BooksTable