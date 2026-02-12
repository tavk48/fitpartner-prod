'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [formData, setFormData] = useState({
    name: '',
    fitnessGoals: '',
    workoutTypes: '',
    availability: '',
    location: '',
    bio: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      if (data.user) {
        setFormData({
          name: data.user.name || '',
          fitnessGoals: data.user.fitnessGoals || '',
          workoutTypes: data.user.workoutTypes || '',
          availability: data.user.availability || '',
          location: data.user.location || '',
          bio: data.user.bio || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setMessage('Profile updated successfully!')
        update()
      } else {
        setMessage('Failed to update profile')
      }
    } catch (error) {
      setMessage('Something went wrong')
    } finally {
      setSaving(false)
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>

      <div className="card max-w-2xl">
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('success') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="flex items-center space-x-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {formData.name?.charAt(0) || session?.user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {formData.name || 'Your Profile'}
            </h2>
            <p className="text-gray-600">{session?.user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              className="mt-1 input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fitness Goals</label>
              <select
                className="mt-1 input"
                value={formData.fitnessGoals}
                onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value })}
              >
                <option value="">Select your goal</option>
                <option value="lose-weight">Lose Weight</option>
                <option value="build-muscle">Build Muscle</option>
                <option value="improve-endurance">Improve Endurance</option>
                <option value="maintain">Maintain Fitness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Workout Types</label>
              <select
                className="mt-1 input"
                value={formData.workoutTypes}
                onChange={(e) => setFormData({ ...formData, workoutTypes: e.target.value })}
              >
                <option value="">Preferred workout</option>
                <option value="cardio">Cardio</option>
                <option value="strength">Strength Training</option>
                <option value="hiit">HIIT</option>
                <option value="yoga">Yoga</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Availability</label>
              <select
                className="mt-1 input"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              >
                <option value="">When can you workout?</option>
                <option value="morning">Morning (5-9am)</option>
                <option value="midday">Midday (11am-2pm)</option>
                <option value="evening">Evening (5-8pm)</option>
                <option value="night">Night (8pm+)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                placeholder="City, State"
                className="mt-1 input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              rows={4}
              className="mt-1 input"
              placeholder="Tell potential partners about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8 py-3"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
