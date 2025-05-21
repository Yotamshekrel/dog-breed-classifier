import { useState, useRef } from 'react'
import { PhotoIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

interface BreedGuess {
  breed: string
  confidence: number
  description: string
  characteristics: string[]
}

function GuessBreed() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [guess, setGuess] = useState<BreedGuess | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setGuess(null)
      setError(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGuess = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      const result = await apiService.guessBreed(formData)
      setGuess(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to guess breed')
    } finally {
      setLoading(false)
    }
  }

  const resetGuess = () => {
    setSelectedFile(null)
    setPreview(null)
    setGuess(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Guess the Breed 🐕
        </h1>
        <p className="text-xl text-gray-600">
          Upload a photo of a dog and let our AI guess its breed!
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <label
                htmlFor="photo-upload"
                className="relative block w-full h-64 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors cursor-pointer"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-600">
                      Click to upload a photo
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGuess}
              disabled={!selectedFile || loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Analyzing...</span>
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
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Guess Results */}
      {guess && !loading && (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
            Results
          </h2>

          <div className="space-y-6">
            {/* Breed and Confidence */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Breed</h3>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {guess.breed}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-semibold text-gray-800">Confidence</h3>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {guess.confidence}%
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600">{guess.description}</p>
            </div>

            {/* Characteristics */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Characteristics</h3>
              <ul className="space-y-2">
                {guess.characteristics.map((characteristic, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-600">{characteristic}</span>
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