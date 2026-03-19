'use client'

import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function VinLookupPage() {
  const { t } = useLanguage()
  const [vin, setVin] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [makes, setMakes] = useState([])
  const [models, setModels] = useState([])
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [years] = useState(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 30 }, (_, i) => current - i)
  })

  // Fetch makes on mount
  useState(() => {
    fetch(`${API_URL}/api/v1/vehicles/makes`)
      .then(r => r.json())
      .then(d => { if (d.success) setMakes(d.data) })
      .catch(() => {})
  }, [])

  const lookupByVIN = async () => {
    if (vin.length !== 17) {
      setError('VIN must be 17 characters')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${API_URL}/api/v1/vehicles/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin })
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.message || 'Vehicle not found')
      }
    } catch (err) {
      setError('Failed to lookup VIN')
    } finally {
      setLoading(false)
    }
  }

  const lookupBySelection = async () => {
    if (!selectedMake || !selectedModel || !selectedYear) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const params = new URLSearchParams({ make: selectedMake, model: selectedModel, year: selectedYear })
      const res = await fetch(`${API_URL}/api/v1/vehicles/fitment?${params}`)
      const data = await res.json()
      if (data.success) {
        setResult({ vehicles: data.data, make: selectedMake, model: selectedModel, year: selectedYear })
      }
    } catch (err) {
      setError('Failed to lookup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8">{t('vinLookup') || 'Vehicle Parts Lookup'}</h1>

        {/* VIN Input */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Enter VIN</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={vin}
              onChange={e => setVin(e.target.value.toUpperCase())}
              placeholder="17-character VIN"
              maxLength={17}
              className="flex-1 border rounded-lg px-4 py-3 font-mono text-lg tracking-wider"
            />
            <button
              onClick={lookupByVIN}
              disabled={loading || vin.length !== 17}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Looking up...' : 'Lookup'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-3">{error}</p>}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500">or select vehicle</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Vehicle Selection */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Select Your Vehicle</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Make</label>
              <select
                value={selectedMake}
                onChange={e => { setSelectedMake(e.target.value); setSelectedModel(''); setModels([]) }}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select Make</option>
                {makes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select Model</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={lookupBySelection}
            disabled={loading || !selectedMake || !selectedModel || !selectedYear}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            Find Compatible Parts
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Compatible Parts for {result.year || result.years?.[0]} {result.make} {result.model}
            </h2>
            <a href={`/products?make=${result.make}&model=${result.model}&year=${result.year || result.years?.[0]}`}
               className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              View All Compatible Parts →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
