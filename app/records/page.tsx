'use client'

import { useEffect, useState } from 'react'
import { supabase, type Record } from '@/lib/supabase'

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  async function fetchRecords() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('date_imported', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records')
    } finally {
      setLoading(false)
    }
  }

  async function markAsLaunched(id: string) {
    try {
      const { error } = await supabase
        .from('records')
        .update({ status: 'launched' })
        .eq('id', id)

      if (error) throw error
      
      // Update local state
      setRecords(records.map(r => 
        r.id === id ? { ...r, status: 'launched' as const } : r
      ))
    } catch (err) {
      alert('Failed to update status: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Records</h1>
          <div className="text-zinc-400">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Records</h1>
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Records</h1>
          <button 
            onClick={fetchRecords}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-lg">No records yet</p>
            <p className="text-zinc-500 mt-2">Records will appear here when lists are processed</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-400 text-sm">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">County</th>
                  <th className="px-6 py-4 font-medium">State</th>
                  <th className="px-6 py-4 font-medium">Records</th>
                  <th className="px-6 py-4 font-medium">Date Imported</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{record.name}</td>
                    <td className="px-6 py-4 text-zinc-300">{record.county}</td>
                    <td className="px-6 py-4 text-zinc-300">{record.state}</td>
                    <td className="px-6 py-4 text-zinc-300">{record.record_count.toLocaleString()}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(record.date_imported).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'launched' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {record.status === 'launched' ? 'Launched' : 'Ready'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {record.status === 'ready' ? (
                        <button
                          onClick={() => markAsLaunched(record.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Mark Launched
                        </button>
                      ) : (
                        <span className="text-zinc-500 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-zinc-500 text-sm">
          {records.length} record{records.length !== 1 ? 's' : ''} total
        </div>
      </div>
    </div>
  )
}
