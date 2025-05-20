import { useState } from 'react'
import { CloudArrowUpIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface BreedComparison {
  breed1: string
  breed2: string
  similarities: string[]
  differences: string[]
  compatibility: number
}

function BreedComparison() {
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([])
  const [comparison, setComparison] = useState<BreedComparison | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock breed data - in a real app, this would come from an API
  const availableBreeds = [
    'Labrador Retriever',
    'German Shepherd',
    'Golden Retriever',
    'French Bulldog',
    'Bulldog',
    'Poodle',
    'Beagle',
    'Rottweiler',
    'Dachshund',
    'Yorkshire Terrier'
  ]

  const handleBreedSelect = (breed: string) => {
    if (selectedBreeds.includes(breed)) {
      setSelectedBreeds(selectedBreeds.filter(b => b !== breed))
    } else if (selectedBreeds.length < 2) {
      setSelectedBreeds([...selectedBreeds, breed])
    }
  }

  const compareBreeds = () => {
    if (selectedBreeds.length !== 2) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const mockComparison: BreedComparison = {
        breed1: selectedBreeds[0],
        breed2: selectedBreeds[1],
        similarities: [
          'Both breeds are known for their intelligence',
          'Both require regular exercise',
          'Both are good with families'
        ],
        differences: [
          `${selectedBreeds[0]} is generally larger than ${selectedBreeds[1]}`,
          `${selectedBreeds[0]} requires more grooming than ${selectedBreeds[1]}`,
          `${selectedBreeds[1]} is more suitable for apartment living`
        ],
        compatibility: Math.floor(Math.random() * 100)
      }
      setComparison(mockComparison)
      setLoading(false)
    }, 1500)
  }

  const resetComparison = () => {
    setSelectedBreeds([])
    setComparison(null)
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Breed Comparison 🐕‍🦺
        </h1>
        <p className="text-xl text-gray-600">
          Compare different dog breeds to find the perfect match for you!
        </p>
      </div>

      {/* Breed Selection */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Two Breeds to Compare</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {availableBreeds.map((breed) => (
            <button
              key={breed}
              onClick={() => handleBreedSelect(breed)}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                selectedBreeds.includes(breed)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {breed}
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={compareBreeds}
            disabled={selectedBreeds.length !== 2 || loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Comparing...
              </>
            ) : (
              'Compare Breeds'
            )}
          </button>
          <button
            onClick={resetComparison}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-lg font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Comparison Results
            </h2>
            <button
              onClick={resetComparison}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Similarities */}
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-purple-700 mb-4">Similarities</h3>
              <ul className="space-y-3">
                {comparison.similarities.map((similarity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    <span className="text-gray-700">{similarity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Differences */}
            <div className="bg-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-pink-700 mb-4">Differences</h3>
              <ul className="space-y-3">
                {comparison.differences.map((difference, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-700">{difference}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Compatibility Score */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Compatibility Score</h3>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {comparison.compatibility}%
                  </span>
                </div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent"
                  style={{
                    borderTopColor: '#9333ea',
                    borderRightColor: '#db2777',
                    transform: `rotate(${(comparison.compatibility / 100) * 360}deg)`,
                    transition: 'transform 1s ease-in-out'
                  }}
                />
              </div>
            </div>
            <p className="text-center mt-4 text-gray-600">
              {comparison.compatibility >= 80
                ? 'Excellent compatibility! These breeds would make great companions.'
                : comparison.compatibility >= 60
                ? 'Good compatibility! These breeds can work well together.'
                : 'Moderate compatibility. Consider their individual needs carefully.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BreedComparison 