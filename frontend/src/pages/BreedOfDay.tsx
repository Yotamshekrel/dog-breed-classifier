import { useState, useEffect } from 'react'
import { StarIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface BreedOfDay {
  name: string
  image: string
  description: string
  characteristics: string[]
  funFacts: string[]
  history: string
  popularity: number
  temperament: string[]
  care: {
    exercise: string[]
    grooming: string[]
    health: string[]
  }
}

function BreedOfDay() {
  const [breed, setBreed] = useState<BreedOfDay | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use mock data
    const mockBreed: BreedOfDay = {
      name: 'Golden Retriever',
      image: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_1024.jpg',
      description: 'The Golden Retriever is one of America\'s most popular dog breeds. They\'re known for their friendly, tolerant attitudes and are great family pets.',
      characteristics: [
        'Intelligent and eager to please',
        'Friendly and gentle with everyone',
        'Excellent with children',
        'Great for first-time dog owners',
        'Adaptable to various living situations'
      ],
      funFacts: [
        'Golden Retrievers were originally bred in Scotland in the mid-19th century',
        'They\'re excellent swimmers and love water',
        'Golden Retrievers are often used as therapy dogs',
        'They have a soft mouth, making them great for retrieving games',
        'The breed is known for its beautiful golden coat that comes in various shades'
      ],
      history: 'The Golden Retriever was developed in Scotland in the mid-19th century by Lord Tweedmouth. He wanted to create a dog that would be excellent at retrieving game from both land and water. The breed was created by crossing a Yellow Retriever with the now-extinct Tweed Water Spaniel, and later adding Bloodhound and Irish Setter to the mix.',
      popularity: 3, // Out of 5
      temperament: [
        'Friendly and outgoing',
        'Intelligent and eager to please',
        'Gentle and patient',
        'Confident and trustworthy',
        'Great with children and other pets'
      ],
      care: {
        exercise: [
          'Daily walks and play sessions',
          'Regular opportunities to swim',
          'Mental stimulation through training',
          'Interactive games and toys'
        ],
        grooming: [
          'Weekly brushing to prevent matting',
          'Regular bathing when needed',
          'Nail trimming',
          'Ear cleaning',
          'Dental care'
        ],
        health: [
          'Regular veterinary check-ups',
          'Watch for hip and elbow dysplasia',
          'Monitor for heart conditions',
          'Keep up with vaccinations',
          'Maintain healthy weight'
        ]
      }
    }

    // Simulate API call
    setTimeout(() => {
      setBreed(mockBreed)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!breed) return null

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Breed of the Day 🐕
        </h1>
        <p className="text-xl text-gray-600">
          Discover a new dog breed every day!
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        {/* Header Image */}
        <div className="relative h-96">
          <img
            src={breed.image}
            alt={breed.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{breed.name}</h2>
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < breed.popularity ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Description */}
          <p className="text-gray-700 text-lg mb-8">{breed.description}</p>

          {/* Characteristics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-purple-700 mb-4 flex items-center">
                <SparklesIcon className="h-6 w-6 mr-2" />
                Characteristics
              </h3>
              <ul className="space-y-3">
                {breed.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{char}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-pink-700 mb-4 flex items-center">
                <HeartIcon className="h-6 w-6 mr-2" />
                Temperament
              </h3>
              <ul className="space-y-3">
                {breed.temperament.map((temp, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-700">{temp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* History */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">History</h3>
            <p className="text-gray-700 leading-relaxed">{breed.history}</p>
          </div>

          {/* Fun Facts */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Fun Facts</h3>
            <ul className="space-y-3">
              {breed.funFacts.map((fact, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-600 mr-2">✨</span>
                  <span className="text-gray-700">{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Care Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="text-lg font-semibold text-purple-700 mb-4">Exercise</h4>
              <ul className="space-y-2">
                {breed.care.exercise.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="text-lg font-semibold text-pink-700 mb-4">Grooming</h4>
              <ul className="space-y-2">
                {breed.care.grooming.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="text-lg font-semibold text-purple-700 mb-4">Health</h4>
              <ul className="space-y-2">
                {breed.care.health.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreedOfDay 