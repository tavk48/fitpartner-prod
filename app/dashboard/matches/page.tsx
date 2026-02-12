'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Match {
  id: string
  otherPerson: {
    id: string
    name: string | null
    email: string
    fitnessGoals: string | null
    workoutTypes: string | null
    availability: string | null
  }
  status: string
  compatibilityScore: number
  createdAt: string
}

export default function MatchesPage() {
  const { data: session } = useSession()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches/manage')
      const data = await res.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error('Failed to fetch matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMatchAction = async (matchId: string, action: 'accept' | 'decline') => {
    setActionLoading(matchId)
    try {
      const res = await fetch('/api/matches/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action }),
      })

      if (res.ok) {
        fetchMatches()
      }
    } catch (error) {
      console.error('Failed to update match:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  const pendingMatches = matches.filter(m => m.status === 'pending')
  const acceptedMatches = matches.filter(m => m.status === 'accepted')

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Matches</h1>

      {/* Pending Requests Section */}
      {pendingMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {pendingMatches.map((match) => (
              <div key={match.id} className="card flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-brand-600 font-semibold text-lg">
                      {match.otherPerson.name?.charAt(0) || match.otherPerson.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {match.otherPerson.name || match.otherPerson.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {match.otherPerson.fitnessGoals} • {match.otherPerson.workoutTypes}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMatchAction(match.id, 'accept')}
                    disabled={actionLoading === match.id}
                    className="btn-primary"
                  >
                    {actionLoading === match.id ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleMatchAction(match.id, 'decline')}
                    disabled={actionLoading === match.id}
                    className="btn-secondary"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Partners Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Active Partners ({acceptedMatches.length})
        </h2>
        
        {acceptedMatches.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No active partners yet</h3>
            <p className="text-gray-600 mb-4">
              Find accountability partners to start your fitness journey together
            </p>
            <a href="/dashboard/find" className="btn-primary inline-block">
              Find a Partner
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {acceptedMatches.map((match) => (
              <div key={match.id} className="card">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-brand-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {match.otherPerson.name?.charAt(0) || match.otherPerson.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {match.otherPerson.name || match.otherPerson.email}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {match.compatibilityScore || 75}% Compatibility
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium text-gray-700 w-24">Goals:</span>
                    <span>{match.otherPerson.fitnessGoals || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium text-gray-700 w-24">Workouts:</span>
                    <span>{match.otherPerson.workoutTypes || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium text-gray-700 w-24">Time:</span>
                    <span>{match.otherPerson.availability || 'Not specified'}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Partners since {new Date(match.createdAt).toLocaleDateString()}
                </div>

                <a href="/dashboard/messages" className="w-full btn-primary text-center block">
                  Send Message
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
