import { useState } from 'react'
import apiService, { BreedAnalysis } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function AdvancedAnalysis() {
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<BreedAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBreedSelect = async (breed: string) => {
    setSelectedBreed(breed)
    setLoading(true)
    setError(null)
    try {
      const result = await apiService.getBreedAnalysis(breed)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get breed analysis')
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
    const percentage = (score / 10) * 100
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-purple-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
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
          Get detailed insights about specific dog breeds
        </p>
      </div>

      {/* Breed Selection */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {['Labrador Retriever', 'German Shepherd', 'French Bulldog'].map((breed) => (
            <button
              key={breed}
              onClick={() => handleBreedSelect(breed)}
              className={`p-4 rounded-lg text-center transition-colors ${
                selectedBreed === breed
                  ? 'bg-purple-600 text-white'
                  : 'bg-white hover:bg-purple-50 text-gray-700'
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              {selectedBreed} Analysis
            </h2>

            {/* Health Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Health</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Common Health Issues</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.health.commonIssues.map((issue, index) => (
                      <li key={index} className="text-gray-600">{issue}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Health Considerations</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.health.considerations.map((consideration, index) => (
                      <li key={index} className="text-gray-600">{consideration}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Training Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Training</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Training Difficulty</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(analysis.training.difficulty / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-gray-600">{analysis.training.difficulty}/10</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Training Tips</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.training.tips.map((tip, index) => (
                      <li key={index} className="text-gray-600">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Exercise Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Exercise</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Daily Exercise Needs</h4>
                  <p className="text-gray-600">{analysis.exercise.dailyNeeds}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recommended Activities</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.exercise.activities.map((activity, index) => (
                      <li key={index} className="text-gray-600">{activity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Grooming Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Grooming</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Grooming Frequency</h4>
                  <p className="text-gray-600">{analysis.grooming.frequency}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Grooming Requirements</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.grooming.requirements.map((requirement, index) => (
                      <li key={index} className="text-gray-600">{requirement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedAnalysis 