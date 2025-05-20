import { useState } from 'react'
import { ArrowPathIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface Breed {
  name: string
  image: string
  description: string
  characteristics: string[]
  temperament: string[]
  funFacts: string[]
}

function RandomBreed() {
  const [breed, setBreed] = useState<Breed | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock breed data - in a real app, this would come from an API
  const availableBreeds: Breed[] = [
    {
      name: 'Labrador Retriever',
      image: 'https://images.dog.ceo/breeds/labrador/n02099712_6901.jpg',
      description: 'The Labrador Retriever is one of America\'s most popular dog breeds. They\'re known for their friendly, outgoing nature and make excellent family pets.',
      characteristics: [
        'Intelligent and eager to please',
        'Friendly and outgoing',
        'Great with children',
        'Excellent swimmers',
        'Adaptable to various living situations'
      ],
      temperament: [
        'Friendly and outgoing',
        'Intelligent and trainable',
        'Energetic and playful',
        'Good with other pets',
        'Loyal and devoted'
      ],
      funFacts: [
        'Labradors were originally bred to help fishermen in Newfoundland',
        'They have a water-resistant double coat',
        'Labradors are excellent service dogs',
        'They come in three colors: black, yellow, and chocolate',
        'Labradors are known for their "soft mouth"'
      ]
    },
    {
      name: 'German Shepherd',
      image: 'https://images.dog.ceo/breeds/germanshepherd/n02106662_1031.jpg',
      description: 'The German Shepherd is a highly intelligent and versatile working dog. They\'re known for their loyalty, courage, and ability to learn commands quickly.',
      characteristics: [
        'Highly intelligent',
        'Loyal and protective',
        'Excellent working dogs',
        'Strong and athletic',
        'Versatile in various roles'
      ],
      temperament: [
        'Loyal and protective',
        'Intelligent and trainable',
        'Confident and courageous',
        'Alert and watchful',
        'Good with family when properly socialized'
      ],
      funFacts: [
        'German Shepherds were originally bred for herding sheep',
        'They\'re one of the most popular police and military dogs',
        'German Shepherds have a double coat',
        'They\'re known for their distinctive "saddle" marking',
        'German Shepherds are excellent at learning new tasks'
      ]
    },
    {
      name: 'French Bulldog',
      image: 'https://images.dog.ceo/breeds/bulldog-french/n02108915_5733.jpg',
      description: 'The French Bulldog is a small, muscular dog with a flat, wrinkled face and bat-like ears. They\'re known for their affectionate nature and adaptability.',
      characteristics: [
        'Compact and muscular',
        'Adaptable to city living',
        'Low exercise needs',
        'Minimal grooming required',
        'Good for apartment living'
      ],
      temperament: [
        'Affectionate and playful',
        'Alert and intelligent',
        'Good with children',
        'Adaptable to different environments',
        'Loyal to their family'
      ],
      funFacts: [
        'French Bulldogs were originally bred as companion dogs',
        'They\'re known for their "bat ears"',
        'Frenchies are excellent apartment dogs',
        'They have a short, easy-to-maintain coat',
        'French Bulldogs are popular in urban areas'
      ]
    }
  ]

  const getRandomBreed = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableBreeds.length)
      setBreed(availableBreeds[randomIndex])
      setLoading(false)
    }, 1000)
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

      <div className="flex justify-center mb-8">
        <button
          onClick={getRandomBreed}
          disabled={loading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Loading...
            </>
          ) : (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Get Random Breed
            </>
          )}
        </button>
      </div>

      {breed && (
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
              <h2 className="text-3xl font-bold text-white">{breed.name}</h2>
            </div>
          </div>

          <div className="p-8">
            {/* Description */}
            <p className="text-gray-700 text-lg mb-8">{breed.description}</p>

            {/* Characteristics and Temperament */}
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

            {/* Fun Facts */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
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
          </div>
        </div>
      )}
    </div>
  )
}

export default RandomBreed 