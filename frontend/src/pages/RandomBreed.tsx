import { useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

// Use the correct type for breed
import type { BreedAnalysis } from '../services/api'

function RandomBreed() {
  const [breed, setBreed] = useState<BreedAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRandomBreed = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiService.getRandomBreed()
      setBreed(result)
    } catch (err) {
      setError('Failed to fetch random breed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Random Breed 🎲
        </h1>
        <p className="text-xl text-gray-600">
          Discover a random dog breed and learn more about it!
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={getRandomBreed}
          disabled={loading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Loading...</span>
            </>
          ) : (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Get Random Breed
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Breed Information */}
      {breed && !loading && (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative h-64 md:h-full rounded-xl overflow-hidden">
              {/* Only render image if available */}
              {('imageUrl' in breed && (breed as any).imageUrl) ? (
                <img
                  src={(breed as any).imageUrl}
                  alt={breed.name}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  {breed.name}
                </h2>
                <p className="text-gray-600">{breed.description}</p>
              </div>

              {/* Temperament */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Temperament</h3>
                <div className="flex flex-wrap gap-2">
                  {breed.temperament && breed.temperament.map((trait: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Characteristics */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Characteristics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Size</h4>
                    <p className="text-gray-800">{breed.characteristics.size}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Lifespan</h4>
                    <p className="text-gray-800">{breed.characteristics.lifespan}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RandomBreed 