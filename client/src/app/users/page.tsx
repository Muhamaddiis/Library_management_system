'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types/types';
import UserTable from '../Components/User/UserTable';
import Sidebar from '../Components/Sidebar/Sidebar';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/users');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user deletion
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`http://localhost:8000/users/${id}`, { method: 'DELETE' });
        setUsers(users.filter((user) => user.id !== id)); // Update UI
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
        <Sidebar />
        
        <UserTable users={users} handleDelete={handleDelete} />
    </main>
  );
};

export default UsersPage;