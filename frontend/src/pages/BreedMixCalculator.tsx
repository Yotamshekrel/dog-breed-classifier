import { useState } from 'react'
import apiService, { BreedMix } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function BreedMixCalculator() {
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([])
  const [percentages, setPercentages] = useState<Record<string, number>>({})
  const [mixResult, setMixResult] = useState<BreedMix | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBreedSelect = (breed: string) => {
    if (selectedBreeds.includes(breed)) {
      setSelectedBreeds(selectedBreeds.filter((b) => b !== breed))
      const newPercentages = { ...percentages }
      delete newPercentages[breed]
      setPercentages(newPercentages)
    } else {
      setSelectedBreeds([...selectedBreeds, breed])
      const newPercentages = { ...percentages }
      newPercentages[breed] = 100 / (selectedBreeds.length + 1)
      setPercentages(newPercentages)
    }
  }

  const handlePercentageChange = (breed: string, value: number) => {
    setPercentages((prev) => ({
      ...prev,
      [breed]: value
    }))
  }

  const handleCalculate = async () => {
    if (!selectedBreeds.length) {
      setError('Please select at least one breed');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const breedMixInput = selectedBreeds.map(breed => ({
        name: breed,
        percentage: percentages[breed] || 100 / selectedBreeds.length
      }));
      const result = await apiService.calculateMix(breedMixInput);
      setMixResult(result);
    } catch (err) {
      setError('Failed to calculate breed mix. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetCalculator = () => {
    setSelectedBreeds([])
    setPercentages({})
    setMixResult(null)
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Breed Mix Calculator 🧬
        </h1>
        <p className="text-xl text-gray-600">
          Calculate the characteristics of mixed breed combinations
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
                selectedBreeds.includes(breed)
                  ? 'bg-purple-600 text-white'
                  : 'bg-white hover:bg-purple-50 text-gray-700'
              }`}
            >
              {breed}
            </button>
          ))}
        </div>
      </div>

      {/* Percentage Sliders */}
      {selectedBreeds.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Set Breed Percentages
          </h2>
          <div className="space-y-4">
            {selectedBreeds.map((breed) => (
              <div key={breed}>
                <div className="flex justify-between mb-2">
                  <label className="text-gray-700">{breed}</label>
                  <span className="text-gray-700">{percentages[breed]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percentages[breed]}
                  onChange={(e) => handlePercentageChange(breed, Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={handleCalculate}
          disabled={selectedBreeds.length < 2 || loading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Calculating...</span>
            </>
          ) : (
            'Calculate Mix'
          )}
        </button>
        <button
          onClick={resetCalculator}
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

      {/* Mix Results */}
      {mixResult && !loading && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Mix Results
            </h2>

            {/* Breed Composition */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Breed Composition
              </h3>
              <div className="space-y-2">
                {mixResult.breeds.map((breed, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{breed.name}</span>
                    <span className="text-gray-700">{breed.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Characteristics */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Characteristics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Size</h4>
                  <p className="text-gray-800">{mixResult.characteristics.size}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Exercise</h4>
                  <p className="text-gray-800">{mixResult.characteristics.exercise}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Grooming</h4>
                  <p className="text-gray-800">{mixResult.characteristics.grooming}</p>
                </div>
              </div>
            </div>

            {/* Temperament */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Temperament
              </h3>
              <div className="flex flex-wrap gap-2">
                {mixResult.characteristics.temperament.map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Health */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Health Considerations
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {mixResult.health.considerations.map((consideration, index) => (
                  <li key={index}>{consideration}</li>
                ))}
              </ul>
            </div>

            {/* Care */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Care Requirements
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Training</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {mixResult.care.training.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Exercise</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {mixResult.care.exercise.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Grooming</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {mixResult.care.grooming.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
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

export default BreedMixCalculator 