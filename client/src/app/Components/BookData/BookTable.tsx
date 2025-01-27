import { Book } from '@/app/Types/types';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiArrowUpRight, FiMoreHorizontal } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const BookTable = () => {
  const [books, setBooks] = React.useState<Book[]>([]);
  const router = useRouter();

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:8000/books');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const books = await response.json();
      console.log('Fetched books:', books); // Log the fetched books
      return books;
    } catch (error) {
      console.error('Error fetching books:', error);
      return []; // Return an empty array in case of error
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const books = await fetchBooks();
      setBooks(books);
    };

    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await fetch(`http://localhost:8000/books/${id}`, { method: 'DELETE' });
        setBooks(books.filter((book) => book.ID !== id)); // Update UI
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };


  return (
    <div className="col-span-12 rounded border border-stone-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-medium">
          <FiDollarSign /> Recent Fines
        </h3>
        <button
          className="text-sm text-black hover:underline bg-violet-600 p-2 rounded"
          onClick={() => router.push('/addbook')}
        >
          + Add
        </button>
      </div>
      <table className="w-full table-auto">
        <TableHead />
        <tbody>
          {books.map((book, idx) => (
            <TableRow
              key={idx}
              {...book}
              onDelete={() => handleDelete(book.ID)}
              onEdit={() => router.push(`/editbook/${book.ID}`)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// TableHead Component
const TableHead = () => {
  return (
    <thead>
      <tr className="text-sm font-normal text-stone-500">
        <th className="text-start p-1.5">Id</th>
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
};

// TableRow Component
interface TableRowProps {
  ID: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  availability: boolean;
  image: string;
  onDelete: () => void;
  onEdit: () => void;
}

const TableRow = ({
  ID,
  title,
  author,
  genre,
  description,
  availability,
  image,
  onDelete,
  onEdit,
}: TableRowProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <tr className={ID % 2 ? 'bg-stone-100 text-sm' : 'text-sm'}>
      <td className="p-1.5">
        <a
          href="#"
          className="text-violet-600 underline flex items-center gap-1"
        >
          {ID} <FiArrowUpRight />
        </a>
      </td>
      <td className="p-1.5">{ID}</td>
      <td className="p-1.5">{title}</td>
      <td className="p-1.5">{author}</td>
      <td className="p-1.5">{genre}</td>
      <td className="p-1.5">
        {description.length > 50 ? (
          <span title={description}>{description.slice(0, 50)}...</span>
        ) : (
          description
        )}
      </td>
      <td className="p-1.5">
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {availability ? 'Available' : 'Unavailable'}
        </span>
      </td>
      <td className="p-1.5">
        <Image src={image} alt={title} width={50} height={50} />
      </td>
      <td className="relative w-8">
        <button
          className="hover:bg-stone-200 transition-colors grid place-content-center rounded text-sm size-8"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <FiMoreHorizontal />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 bg-white border border-stone-300 rounded shadow-md w-40 z-10">
            <button
              className="w-full text-left px-4 py-2 hover:bg-stone-100 transition-colors"
              onClick={onEdit}
            >
              Edit
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-stone-100 text-red-600 transition-colors"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default BookTable;