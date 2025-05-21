import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { CloudArrowUpIcon, XMarkIcon, InformationCircleIcon, ShareIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import apiService from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

// Get API URL from environment variable with fallback for local development
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Configure axios defaults
axios.defaults.withCredentials = true

// Create axios instance with specific configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 75000, // Increased to 75 seconds
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: true
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    return Promise.reject(error)
  }
)

interface BreedResult {
  breed: string
  confidence: number
}

interface BreedInfo {
  personality: string[]
  tips: string[]
  characteristics: string[]
}

// Fun dog facts to display while loading
const DOG_FACTS = [
  "Dogs' noses are as unique as human fingerprints! 🐾",
  "A dog's sense of smell is 40 times greater than humans! 👃",
  "Dogs can understand over 150 words! 🗣️",
  "Puppies are born blind and deaf! 🐕",
  "Dogs dream just like humans do! 💭",
  "A dog's nose print is unique, just like a human's fingerprint! 🔍",
  "Dogs can learn new words at the same rate as a 2-year-old child! 📚",
  "The Basenji is the only breed of dog that doesn't bark! 🤫",
]

// Fun messages for results
const RESULT_MESSAGES = [
  "Pawsome! Here's what we found! 🐾",
  "Tail-wagging results coming up! 🐕",
  "Sniffed out these breeds! 🔍",
  "Barking brilliant results! 🐶",
  "Here's the dog-tective report! 🕵️‍♂️",
]

// Mock breed information database (in real app, this would come from an API)
const BREED_INFO: Record<string, BreedInfo> = {
  "default": {
    personality: [
      "Friendly and sociable",
      "Loyal to their family",
      "Good with children"
    ],
    tips: [
      "Regular exercise is important",
      "Consistent training works best",
      "Socialize early and often"
    ],
    characteristics: [
      "Adaptable to different environments",
      "Moderate grooming needs",
      "Good for first-time owners"
    ]
  }
}

interface BreedOfTheDay {
  name: string
  description: string
  imageUrl: string
  funFact: string
}

function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BreedResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentFact, setCurrentFact] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [showUpload, setShowUpload] = useState(true)
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null)
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false)
  const [showRetry, setShowRetry] = useState(false)
  const [breedOfTheDay, setBreedOfTheDay] = useState<BreedOfTheDay | null>(null)

  // Helper function to generate report text
  const generateReport = () => {
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()
    const topBreed = results[0]
    
    return `Doggy Detective Report
Generated on: ${date} at ${time}

Top Breed Match:
${topBreed.breed} (${topBreed.confidence.toFixed(1)}% confidence)

All Breed Matches:
${results.map((r: BreedResult, i: number) => `${i + 1}. ${r.breed} (${r.confidence.toFixed(1)}%)`).join('\n')}

Thank you for using Doggy Detective! 🐕
`
  }

  // Rotate through dog facts during loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentFact(DOG_FACTS[Math.floor(Math.random() * DOG_FACTS.length)])
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [loading])

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    handleFile(droppedFile)
  }, [])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Oops! That doesn\'t look like an image. Try again! 🐾')
      return
    }

    setFile(file)
    setError(null)
    setResults([]) // Clear previous results
    setShowDeepAnalysis(false) // Hide deep analysis
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setShowUpload(false) // Hide upload box after successful file selection
  }

  const handleSubmit = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setShowRetry(false)
    setCurrentFact(DOG_FACTS[Math.floor(Math.random() * DOG_FACTS.length)])
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Sending request to:', `${API_URL}/api/classify`)
      const response = await api.post('/api/classify', formData)
      console.log('Received response:', response.data)
      
      // Validate response structure
      if (!response.data || !Array.isArray(response.data.results)) {
        console.error('Invalid response format:', response.data)
        throw new Error('Invalid response format from server')
      }
      
      // Validate results array
      if (response.data.results.length === 0) {
        throw new Error('No dog breeds detected')
      }
      
      // Validate each result object
      const validResults = response.data.results.every(
        (result: any) => 
          typeof result === 'object' &&
          typeof result.breed === 'string' &&
          typeof result.confidence === 'number'
      )
      
      if (!validResults) {
        console.error('Invalid result objects:', response.data.results)
        throw new Error('Invalid breed prediction format')
      }
      
      setResults(response.data.results)
      setResultMessage(RESULT_MESSAGES[Math.floor(Math.random() * RESULT_MESSAGES.length)])
    } catch (err: any) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      
      let errorMessage = 'Ruff! Something went wrong. '
      if (err.code === 'ECONNABORTED') {
        errorMessage += 'The request took too long. '
      } else if (err.response?.status === 413) {
        errorMessage += 'The image is too large. '
      } else if (err.response?.status === 415) {
        errorMessage += 'The file type is not supported. '
      } else {
        errorMessage += err.response?.data?.detail || err.message || 'Try again! '
      }
      
      setError(errorMessage + '🐾')
      setShowRetry(true)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    handleSubmit()
  }

  const resetUpload = () => {
    setFile(null)
    setPreview(null)
    setResults([])
    setError(null)
    setShowUpload(true)
    setShowDeepAnalysis(false)
  }

  const getBreedInfo = (breed: string): BreedInfo => {
    return BREED_INFO[breed.toLowerCase()] || BREED_INFO.default
  }

  const generateShareText = () => {
    const topBreed = results[0]
    return `🐕 Can't believe my dog is ${topBreed.confidence.toFixed(1)}% ${topBreed.breed}! Take a look at what Breed Detective discovered about my furry friend. Try it now and uncover your dog's breed! 🔍\n\nhttps://doggy-detective.com`
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Doggy Detective Results',
      text: generateShareText(),
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        // Use native share if available
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.text)
        alert('Results copied to clipboard! 📋')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const BreedInfoModal = ({ breed, onClose }: { breed: string, onClose: () => void }) => {
    const info = getBreedInfo(breed)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-purple-600">{breed}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg text-pink-600 mb-2">Personality Traits</h4>
              <ul className="list-disc list-inside space-y-1">
                {info.personality.map((trait, i) => (
                  <li key={i} className="text-gray-700">{trait}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg text-pink-600 mb-2">Care Tips</h4>
              <ul className="list-disc list-inside space-y-1">
                {info.tips.map((tip, i) => (
                  <li key={i} className="text-gray-700">{tip}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg text-pink-600 mb-2">Characteristics</h4>
              <ul className="list-disc list-inside space-y-1">
                {info.characteristics.map((char, i) => (
                  <li key={i} className="text-gray-700">{char}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const DeepAnalysis = () => {
    const topBreeds = results.slice(0, 3)
    const breedNames = topBreeds.map(r => r.breed).join(", ")
    
    return (
      <div className="mt-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            🔍 Deep Analysis Report
          </h2>
          <button
            onClick={() => setShowDeepAnalysis(false)}
            className="text-gray-500 hover:text-gray-700"
            title="Close analysis"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Based on our analysis, your furry friend shows characteristics primarily associated with {breedNames}. 
            This unique combination suggests a dog with a fascinating blend of traits and potential, likely combining 
            the best qualities of each breed.
          </p>
          
          <p>
            For optimal care and development, we recommend a balanced routine of physical exercise and mental stimulation. 
            Regular walks, interactive play sessions, and training exercises will help your dog thrive. Consider their 
            energy level and intelligence when planning activities, and remember that early socialization and consistent 
            training are key to raising a well-rounded companion.
          </p>
          
          <p>
            While these insights provide a helpful framework, every dog is unique. Pay attention to your dog's individual 
            personality and adjust your approach accordingly. With proper care, love, and attention, your furry friend 
            will flourish regardless of breed.
          </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const fetchBreedOfTheDay = async () => {
      try {
        const result = await apiService.getBreedOfTheDay()
        setBreedOfTheDay(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch breed of the day')
      }
    }

    fetchBreedOfTheDay()
  }, [])

  const features = [
    {
      title: 'Breed Comparison',
      description: 'Compare different dog breeds to find the perfect match for you.',
      icon: '🐕‍🦺',
      path: '/compare'
    },
    {
      title: 'Advanced Analysis',
      description: 'Get detailed analysis of specific breeds and their characteristics.',
      icon: '📊',
      path: '/analysis'
    },
    {
      title: 'Breed Mix Calculator',
      description: 'Calculate the characteristics of mixed breed dogs.',
      icon: '🧬',
      path: '/mix'
    },
    {
      title: 'Random Breed',
      description: 'Discover a random dog breed and learn more about it.',
      icon: '🎲',
      path: '/random'
    },
    {
      title: 'Guess the Breed',
      description: 'Upload a photo and let our AI guess the dog breed.',
      icon: '🔍',
      path: '/guess'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
          Find Your Perfect Dog Breed 🐾
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover, compare, and learn about different dog breeds to find your ideal companion.
          Our advanced tools help you make an informed decision.
        </p>
      </div>

      {/* Breed of the Day */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Breed of the Day
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : breedOfTheDay ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              <div className="relative h-64 md:h-full rounded-xl overflow-hidden">
                <img
                  src={breedOfTheDay.imageUrl}
                  alt={breedOfTheDay.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                    {breedOfTheDay.name}
                  </h3>
                  <p className="text-gray-600">{breedOfTheDay.description}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-purple-700 mb-2">Fun Fact</h4>
                  <p className="text-gray-700">{breedOfTheDay.funFact}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Link
            key={feature.title}
            to={feature.path}
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <span className="text-4xl">{feature.icon}</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors ml-auto" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home 