'use client'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const AddBookPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    availability: true,
    image: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/'); // Redirect to the home page after adding the book
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Add Book</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full mt-2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Genre</label>
                <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full mt-2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full mt-2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows={4}
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full mt-2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <select
                name="availability"
                value={formData.availability.toString()}
                onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value === "true" })
                }
                className="w-full mt-2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
                </select>
            </div>
            <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold shadow-lg transition-all"
            >
                Add Book
            </button>
            </form>
            <button
            onClick={() => router.push("/books")}
            className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold shadow-lg transition-all"
            >
            Back
            </button>
        </div>
        </div>

    
  );
};

export default AddBookPage;