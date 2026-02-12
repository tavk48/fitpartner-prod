'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Match {
  id: string
  otherPerson: {
    id: string
    name: string | null
    email: string
  }
  status: string
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages(selectedMatch)
    }
  }, [selectedMatch])

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches/manage')
      const data = await res.json()
      const activeMatches = data.matches.filter((m: Match) => m.status === 'accepted')
      setMatches(activeMatches)
    } catch (error) {
      console.error('Failed to fetch matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (matchId: string) => {
    try {
      const res = await fetch(`/api/messages?matchId=${matchId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedMatch) return

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch,
          content: newMessage,
        }),
      })

      if (res.ok) {
        setNewMessage('')
        fetchMessages(selectedMatch)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No active partners</h3>
          <p className="text-gray-600">Find and connect with accountability partners to start messaging!</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
      
      <div className="flex h-[600px] border border-gray-200 rounded-xl overflow-hidden bg-white">
        {/* Matches Sidebar */}
        <div className="w-64 border-r border-gray-200 overflow-y-auto">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match.id)}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 border-b border-gray-100 ${
                selectedMatch === match.id ? 'bg-brand-50 border-l-4 border-l-brand-600' : ''
              }`}
            >
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                <span className="text-brand-600 font-semibold">
                  {match.otherPerson.name?.charAt(0) || match.otherPerson.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">
                  {match.otherPerson.name || 'Partner'}
                </p>
                <p className="text-xs text-gray-500">{match.otherPerson.email}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedMatch ? (
            <>
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    Start the conversation with your accountability partner!
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.senderId === session?.user?.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-brand-600 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-brand-100' : 'text-gray-500'}`}>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 input"
                  />
                  <button type="submit" className="btn-primary px-6">
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a partner to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
