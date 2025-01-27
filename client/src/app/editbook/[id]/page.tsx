'use client'; // Mark this as a Client Component

import { useRouter } from 'next/navigation';
import React from 'react';
import { useState, useEffect } from 'react';

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  availability: boolean;
  image: string;
}

interface EditBookPageProps {
  params: Promise<{ id: string }>; // `params` is now a Promise
}

const EditBookPage = ({ params }: EditBookPageProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Book>({
    id: 0,
    title: '',
    author: '',
    genre: '',
    description: '',
    availability: true,
    image: '',
  });

  // Unwrap the `params` Promise using `React.use()`
  const { id } = React.use(params);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:8000/books/${id}`);
        const book = await response.json();
        setFormData(book);
      } catch (error) {
        console.log(error)
        console.error('Error fetching book:', error);
      }
    };

    if (id) {
      fetchBook();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8000/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/books'); // Redirect to the home page after updating the book
      }
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-violet-600">
            Edit Book
        </h1>
        <div className="bg-white shadow-md rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                Title
                </label>
                <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                placeholder="Enter book title"
                required
                />
            </div>

            {/* Author */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                Author
                </label>
                <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                placeholder="Enter author name"
                required
                />
            </div>

            {/* Genre */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                Genre
                </label>
                <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                placeholder="Enter genre"
                required
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                Description
                </label>
                <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                rows={4}
                placeholder="Enter book description"
                required
                />
            </div>

            {/* Image URL */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                Image URL
                </label>
                <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                placeholder="Enter image URL"
                required
                />
            </div>

            {/* Availability */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                Availability
                </label>
                <select
                name="availability"
                value={formData.availability.toString()}
                onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value === 'true' })
                }
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
                </select>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full bg-violet-600 text-white py-3 px-6 rounded-lg hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
                Update Book
            </button>
            </form>
        </div>

        {/* Back Button */}
        <button
            onClick={() => router.push('/books')}
            className="mt-6 w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
            Back
        </button>
        </div>

  );
};

export default EditBookPage;