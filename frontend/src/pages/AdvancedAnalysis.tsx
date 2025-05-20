import { useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

interface BreedAnalysis {
  temperament: {
    score: number
    traits: string[]
  }
  health: {
    score: number
    considerations: string[]
  }
  training: {
    score: number
    tips: string[]
  }
  exercise: {
    score: number
    requirements: string[]
  }
  grooming: {
    score: number
    requirements: string[]
  }
}

function AdvancedAnalysis() {
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<BreedAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock breed data - in a real app, this would come from an API
  const availableBreeds = [
    'Labrador Retriever',
    'German Shepherd',
    'Golden Retriever',
    'French Bulldog',
    'Beagle',
    'Poodle',
    'Bulldog',
    'Rottweiler',
    'Dachshund',
    'Yorkshire Terrier'
  ]

  const analyzeBreed = async () => {
    if (!selectedBreed) return

    setLoading(true)
    setError(null)
    try {
      const result = await apiService.getBreedAnalysis(selectedBreed)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze breed')
    } finally {
      setLoading(false)
    }
  }

  const resetAnalysis = () => {
    setSelectedBreed(null)
    setAnalysis(null)
    setError(null)
  }

  const renderScoreBar = (score: number) => {
    const percentage = score * 100
    return (
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
          <div
            style={{ width: `${percentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Advanced Breed Analysis 🔍
        </h1>
        <p className="text-xl text-gray-600">
          Get detailed insights about any dog breed
        </p>
      </div>

      {/* Breed Selection */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Select a Breed
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {availableBreeds.map((breed) => (
            <button
              key={breed}
              onClick={() => setSelectedBreed(breed)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedBreed === breed
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {breed}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={analyzeBreed}
          disabled={!selectedBreed || loading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Analyzing...</span>
            </>
          ) : (
            'Analyze Breed'
          )}
        </button>
        <button
          onClick={resetAnalysis}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-lg font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Reset
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Temperament */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Temperament</h3>
              {renderScoreBar(analysis.temperament.score)}
              <ul className="mt-4 space-y-2">
                {analysis.temperament.traits.map((trait, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{trait}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Health */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Health</h3>
              {renderScoreBar(analysis.health.score)}
              <ul className="mt-4 space-y-2">
                {analysis.health.considerations.map((consideration, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{consideration}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Training */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Training</h3>
              {renderScoreBar(analysis.training.score)}
              <ul className="mt-4 space-y-2">
                {analysis.training.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exercise */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Exercise</h3>
              {renderScoreBar(analysis.exercise.score)}
              <ul className="mt-4 space-y-2">
                {analysis.exercise.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Grooming */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Grooming</h3>
              {renderScoreBar(analysis.grooming.score)}
              <ul className="mt-4 space-y-2">
                {analysis.grooming.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedAnalysis 