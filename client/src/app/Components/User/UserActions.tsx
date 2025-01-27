'use client'; // Mark this as a Client Component

import { useRouter } from 'next/navigation'; // Correct import
import { useState } from 'react';
import { FiMoreHorizontal, FiEdit, FiTrash } from 'react-icons/fi';

interface UserActionsProps {
  userId: number;
  onDelete: (id: number) => void;
  onEdit?: (id: number) => void; // Optional prop for edit action
}

const UserActions = ({ userId, onDelete, onEdit }: UserActionsProps) => {
  const router = useRouter(); // Initialize the router
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
    

  return (
    <div className="relative">
      <button
        className="hover:bg-stone-200 transition-colors grid place-content-center rounded text-sm size-8"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <FiMoreHorizontal />
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-stone-300 rounded shadow-md w-40 z-10">
          <button
            className="w-full text-left px-4 py-2 hover:bg-stone-100 transition-colors flex items-center gap-2"
            onClick={() => {
              if (onEdit) {
                onEdit(userId); // Call the onEdit function if provided
              } else {
                router.push(`/edituser/${userId}`); // Navigate to the edit page
              }
              setIsDropdownOpen(false);
            }}
          >
            <FiEdit /> Edit
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-stone-100 text-red-600 transition-colors flex items-center gap-2"
            onClick={() => {
              onDelete(userId);
              setIsDropdownOpen(false);
            }}
          >
            <FiTrash /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default UserActions;