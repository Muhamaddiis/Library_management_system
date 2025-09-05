"use client"
import MeCard from '@/app/Components/MeCard';
import { BorrowedBook,  Profile } from '@/app/Types/types'
import { User } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const ProfilePage = () => {
const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8000/profile", {
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await res.json()
        setProfile(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) return <p>Loading...</p>
  if (!profile) return <p>Could not load profile.</p>

  return (
    <div>
      <MeCard user={User} />
      <h2>Welcome, {profile.user.username}</h2>
      <h3>Borrowed Books:</h3>
        <ul>
        {profile?.borrowedBooks?.length ? (
            profile.borrowedBooks.map((book: BorrowedBook) => (
            <li key={book.id}>
                {book.title} (Due: {new Date(book.due_date).toLocaleDateString()})
            </li>
            ))
        ) : (
            <li>No borrowed books.</li>
        )}
        </ul>
      <h3>Unpaid Fines:</h3>
      <ul>
        {profile?.borrowedBooks?.length ? (
            profile.fines.map((fine) => (
          <li key={fine.id}>{fine.book_title} - ${fine.amount}</li>
            ))
        ) : (
            <li>No borrowed books.</li>
        )}
      </ul>
    </div>
  )
}

export default ProfilePage
