import { useState } from 'react'
import { CloudArrowUpIcon, XMarkIcon, ArrowPathIcon, CalculatorIcon } from '@heroicons/react/24/outline'

interface BreedMix {
  breeds: string[]
  percentages: number[]
  characteristics: string[]
  temperament: string[]
  health: string[]
  care: string[]
}

function BreedMixCalculator() {
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([])
  const [percentages, setPercentages] = useState<number[]>([])
  const [mixResult, setMixResult] = useState<BreedMix | null>(null)
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
      const index = selectedBreeds.indexOf(breed)
      setSelectedBreeds(selectedBreeds.filter(b => b !== breed))
      setPercentages(percentages.filter((_, i) => i !== index))
    } else if (selectedBreeds.length < 3) {
      setSelectedBreeds([...selectedBreeds, breed])
      setPercentages([...percentages, 0])
    }
  }

  const handlePercentageChange = (index: number, value: number) => {
    const newPercentages = [...percentages]
    newPercentages[index] = value
    setPercentages(newPercentages)
  }

  const calculateMix = () => {
    if (selectedBreeds.length === 0) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const mockMix: BreedMix = {
        breeds: selectedBreeds,
        percentages: percentages,
        characteristics: [
          'Medium to large size',
          'Athletic build',
          'Intelligent and trainable',
          'Good with families'
        ],
        temperament: [
          'Friendly and outgoing',
          'Loyal and protective',
          'Energetic and playful',
          'Adaptable to different environments'
        ],
        health: [
          'May inherit health traits from parent breeds',
          'Regular veterinary check-ups recommended',
          'Watch for breed-specific conditions',
          'Maintain healthy weight and exercise routine'
        ],
        care: [
          'Regular exercise and mental stimulation',
          'Balanced diet appropriate for size and activity level',
          'Consistent training and socialization',
          'Regular grooming based on coat type'
        ]
      }
      setMixResult(mockMix)
      setLoading(false)
    }, 1500)
  }

  const resetCalculator = () => {
    setSelectedBreeds([])
    setPercentages([])
    setMixResult(null)
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Breed Mix Calculator 🧬
        </h1>
        <p className="text-xl text-gray-600">
          Calculate the characteristics of your mixed breed dog!
        </p>
      </div>

      {/* Breed Selection and Percentage Input */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Up to 3 Breeds</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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

        {/* Percentage Inputs */}
        {selectedBreeds.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Set Breed Percentages</h3>
            <div className="space-y-4">
              {selectedBreeds.map((breed, index) => (
                <div key={breed} className="flex items-center space-x-4">
                  <span className="w-48 text-gray-700">{breed}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentages[index]}
                    onChange={(e) => handlePercentageChange(index, parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-16 text-right text-gray-700">{percentages[index]}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={calculateMix}
            disabled={selectedBreeds.length === 0 || loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Calculating...
              </>
            ) : (
              <>
                <CalculatorIcon className="h-5 w-5 mr-2" />
                Calculate Mix
              </>
            )}
          </button>
          <button
            onClick={resetCalculator}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-lg font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Mix Results */}
      {mixResult && (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Mix Results
            </h2>
            <button
              onClick={resetCalculator}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Breed Composition */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Breed Composition</h3>
            <div className="space-y-4">
              {mixResult.breeds.map((breed, index) => (
                <div key={breed} className="flex items-center">
                  <span className="w-48 text-gray-700">{breed}</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                      style={{ width: `${mixResult.percentages[index]}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-gray-700">{mixResult.percentages[index]}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Characteristics */}
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-purple-700 mb-4">Characteristics</h3>
              <ul className="space-y-3">
                {mixResult.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{char}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Temperament */}
            <div className="bg-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-pink-700 mb-4">Temperament</h3>
              <ul className="space-y-3">
                {mixResult.temperament.map((temp, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-700">{temp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Health */}
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-purple-700 mb-4">Health Considerations</h3>
              <ul className="space-y-3">
                {mixResult.health.map((health, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{health}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Care */}
            <div className="bg-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-pink-700 mb-4">Care Requirements</h3>
              <ul className="space-y-3">
                {mixResult.care.map((care, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-700">{care}</span>
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

export default BreedMixCalculator 