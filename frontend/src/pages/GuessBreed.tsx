import { useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

interface BreedGuess {
  breed: string
  confidence: number
  characteristics: string[]
  funFacts: string[]
}

function GuessBreed() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [guess, setGuess] = useState<BreedGuess | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setGuess(null)
      setError(null)
    }
  }

  const handleGuess = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)
    try {
      const result = await apiService.guessBreed(selectedFile)
      setGuess(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to guess breed')
    } finally {
      setLoading(false)
    }
  }

  const resetGuess = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setGuess(null)
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Guess the Breed 🎯
        </h1>
        <p className="text-xl text-gray-600">
          Upload a dog photo and let our AI guess the breed
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <label className="relative cursor-pointer bg-white rounded-lg shadow-md px-4 py-2 hover:bg-gray-50">
              <span className="text-gray-700">Choose a photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto max-h-64 rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={handleGuess}
          disabled={!selectedFile || loading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Guessing...</span>
            </>
          ) : (
            'Guess Breed'
          )}
        </button>
        <button
          onClick={resetGuess}
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

      {/* Guess Results */}
      {guess && !loading && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {guess.breed}
              </h2>
              <div className="inline-block px-4 py-2 bg-purple-100 rounded-full">
                <span className="text-purple-700 font-medium">
                  {Math.round(guess.confidence * 100)}% Confidence
                </span>
              </div>
            </div>

            {/* Characteristics */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Characteristics
              </h3>
              <ul className="space-y-2">
                {guess.characteristics.map((characteristic, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{characteristic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fun Facts */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Fun Facts
              </h3>
              <ul className="space-y-2">
                {guess.funFacts.map((fact, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{fact}</span>
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

export default GuessBreed 