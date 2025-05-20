import { useState } from 'react'
import { CloudArrowUpIcon, XMarkIcon, ArrowPathIcon, ChartBarIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline'

interface BreedAnalysis {
  breed: string
  temperament: {
    score: number
    traits: string[]
  }
  health: {
    score: number
    concerns: string[]
    lifespan: string
  }
  training: {
    score: number
    difficulty: string
    tips: string[]
  }
  exercise: {
    score: number
    requirements: string[]
    activities: string[]
  }
  grooming: {
    score: number
    needs: string[]
    frequency: string
  }
}

function AdvancedAnalysis() {
  const [selectedBreed, setSelectedBreed] = useState<string>('')
  const [analysis, setAnalysis] = useState<BreedAnalysis | null>(null)
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

  const analyzeBreed = () => {
    if (!selectedBreed) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const mockAnalysis: BreedAnalysis = {
        breed: selectedBreed,
        temperament: {
          score: Math.floor(Math.random() * 100),
          traits: [
            'Friendly and outgoing',
            'Intelligent and eager to please',
            'Good with children',
            'Adaptable to different environments'
          ]
        },
        health: {
          score: Math.floor(Math.random() * 100),
          concerns: [
            'Hip dysplasia',
            'Elbow dysplasia',
            'Progressive retinal atrophy',
            'Exercise-induced collapse'
          ],
          lifespan: '10-12 years'
        },
        training: {
          score: Math.floor(Math.random() * 100),
          difficulty: 'Moderate',
          tips: [
            'Start training early',
            'Use positive reinforcement',
            'Be consistent with commands',
            'Socialize with other dogs'
          ]
        },
        exercise: {
          score: Math.floor(Math.random() * 100),
          requirements: [
            'Daily walks',
            'Regular play sessions',
            'Mental stimulation',
            'Training exercises'
          ],
          activities: [
            'Fetch',
            'Swimming',
            'Agility training',
            'Obedience training'
          ]
        },
        grooming: {
          score: Math.floor(Math.random() * 100),
          needs: [
            'Regular brushing',
            'Bath every 2-3 months',
            'Nail trimming',
            'Ear cleaning'
          ],
          frequency: 'Weekly'
        }
      }
      setAnalysis(mockAnalysis)
      setLoading(false)
    }, 1500)
  }

  const resetAnalysis = () => {
    setSelectedBreed('')
    setAnalysis(null)
  }

  const renderScoreBar = (score: number) => {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
    return (
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Advanced Breed Analysis 🔬
        </h1>
        <p className="text-xl text-gray-600">
          Get detailed insights about your favorite dog breed!
        </p>
      </div>

      {/* Breed Selection */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Breed to Analyze</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {availableBreeds.map((breed) => (
            <button
              key={breed}
              onClick={() => setSelectedBreed(breed)}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                selectedBreed === breed
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
            onClick={analyzeBreed}
            disabled={!selectedBreed || loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Analyzing...
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
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Analysis Results for {analysis.breed}
            </h2>
            <button
              onClick={resetAnalysis}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Temperament */}
            <div className="bg-purple-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <HeartIcon className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-xl font-semibold text-purple-700">Temperament</h3>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className="text-sm font-medium text-gray-800">{analysis.temperament.score}%</span>
                </div>
                {renderScoreBar(analysis.temperament.score)}
              </div>
              <ul className="space-y-2">
                {analysis.temperament.traits.map((trait, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{trait}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Health */}
            <div className="bg-pink-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="h-6 w-6 text-pink-600 mr-2" />
                <h3 className="text-xl font-semibold text-pink-700">Health</h3>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className="text-sm font-medium text-gray-800">{analysis.health.score}%</span>
                </div>
                {renderScoreBar(analysis.health.score)}
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-800">Lifespan: {analysis.health.lifespan}</span>
              </div>
              <ul className="space-y-2">
                {analysis.health.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-700">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Training */}
            <div className="bg-purple-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <StarIcon className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-xl font-semibold text-purple-700">Training</h3>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className="text-sm font-medium text-gray-800">{analysis.training.score}%</span>
                </div>
                {renderScoreBar(analysis.training.score)}
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-800">Difficulty: {analysis.training.difficulty}</span>
              </div>
              <ul className="space-y-2">
                {analysis.training.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exercise & Grooming */}
            <div className="bg-pink-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="h-6 w-6 text-pink-600 mr-2" />
                <h3 className="text-xl font-semibold text-pink-700">Exercise & Grooming</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-medium text-pink-700 mb-2">Exercise</h4>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className="text-sm font-medium text-gray-800">{analysis.exercise.score}%</span>
                    </div>
                    {renderScoreBar(analysis.exercise.score)}
                  </div>
                  <ul className="space-y-2">
                    {analysis.exercise.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-pink-500 mr-2">•</span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-pink-700 mb-2">Grooming</h4>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className="text-sm font-medium text-gray-800">{analysis.grooming.score}%</span>
                    </div>
                    {renderScoreBar(analysis.grooming.score)}
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-800">Frequency: {analysis.grooming.frequency}</span>
                  </div>
                  <ul className="space-y-2">
                    {analysis.grooming.needs.map((need, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-pink-500 mr-2">•</span>
                        <span className="text-gray-700">{need}</span>
                      </li>
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