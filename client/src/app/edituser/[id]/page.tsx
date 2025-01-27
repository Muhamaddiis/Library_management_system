'use client'; // Mark this as a Client Component

import { User } from '@/app/Types/types';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface EditUserPageProps {
  params: Promise<{ id: string }>; // `params` is now a Promise
}

const EditUserPage = ({ params }: EditUserPageProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<User>({
    id: 0,
    username: '',
    email: '',
    role: 'user', // Default role
  });

  // Unwrap the `params` Promise using `React.use()`
  const { id } = React.use(params);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/users/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const user = await response.json();
        setFormData(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8000/updateUser/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/users'); // Redirect to the users page after updating
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-violet-600">Edit User</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              placeholder="Enter username"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              placeholder="Enter email"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-3 px-6 rounded-lg hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            Update User
          </button>
        </form>
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push('/users')}
        className="mt-6 w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Back
      </button>
    </div>
  );
};

export default EditUserPage;