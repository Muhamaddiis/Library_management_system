"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '../Components/Sidebar/Sidebar';
import Dashboard from '../Components/Dashboard/Dashboard';
import { useRouter } from 'next/navigation';
import { getUserFromToken } from '@/lib/auth';

const Page = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const user = await getUserFromToken();
      

      if (!user) {
        router.push("/sign-in"); // Not logged in
      } else if (user.role !== "admin") {
        router.push("/"); // Not admin
      } else {
        setLoading(false); // OK, show dashboard
      }
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return <div className="p-4">Loading...</div>; // You can make a better spinner later
  }

  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <Sidebar />
      <Dashboard />
    </main>
  );
};

export default Page;
