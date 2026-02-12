'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    fitnessGoals: '',
    workoutTypes: '',
    availability: '',
    location: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/login')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create account')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">Find your perfect fitness partner</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              className="mt-1 input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
