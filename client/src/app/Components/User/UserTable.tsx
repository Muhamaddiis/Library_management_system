import { FiMoreHorizontal } from 'react-icons/fi';
import UserActions from './UserActions';
import { User } from '@/app/Types/types';
import Topbar from '../Dashboard/Topbar';
import router from 'next/navigation';

interface UserTableProps {
  users: User[];
  onDelete: (id: number) => void;
}

const UserTable = ({ users, onDelete }: UserTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Topbar />
      <div className="flex justify-between items-center p-4">
        users
        <button
          className="text-sm text-black hover:underline bg-violet-600 p-2 rounded"
          onClick={() => router.push('/addUser')}
        >
          + Add
        </button>
      </div>
      <table className="w-full table-auto">
        <thead>
          <tr className="text-sm font-normal text-stone-500">
            <th className="text-start p-1.5">ID</th>
            <th className="text-start p-1.5">Name</th>
            <th className="text-start p-1.5">Email</th>
            <th className="text-start p-1.5">Role</th>
            <th className="text-start p-1.5">Status</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="text-sm hover:bg-stone-100">
              <td className="p-1.5">{user.id}</td>
              <td className="p-1.5">{user.username}</td>
              <td className="p-1.5">{user.email}</td>
              <td className="p-1.5">{user.role}</td>
              <td className="p-1.5">
                <UserActions userId={user.id} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;