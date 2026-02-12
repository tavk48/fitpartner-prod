'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  name: string | null
  email: string
  fitnessGoals: string | null
  workoutTypes: string | null
  availability: string | null
  location: string | null
  compatibilityScore: number
}

export default function FindPartnerPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/matches/find')
      const data = await res.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestMatch = async (userId: string) => {
    setRequesting(userId)
    try {
      const res = await fetch('/api/matches/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: userId }),
      })

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId))
      }
    } catch (error) {
      console.error('Failed to request match:', error)
    } finally {
      setRequesting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Find a Partner</h1>
      <p className="text-gray-600 mb-8">
        Discover accountability partners who match your fitness goals, schedule, and workout preferences.
      </p>

      {users.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No new matches available</h3>
          <p className="text-gray-600">Check back later for new potential partners!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="card">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name || 'Partner'}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800">
                    {user.compatibilityScore}% Match
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-gray-700 w-20">Goals:</span>
                  <span>{user.fitnessGoals || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-gray-700 w-20">Workouts:</span>
                  <span>{user.workoutTypes || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-gray-700 w-20">Time:</span>
                  <span>{user.availability || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-gray-700 w-20">Location:</span>
                  <span>{user.location || 'Not specified'}</span>
                </div>
              </div>

              <button
                onClick={() => requestMatch(user.id)}
                disabled={requesting === user.id}
                className="w-full btn-primary"
              >
                {requesting === user.id ? 'Sending...' : 'Request Match'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
