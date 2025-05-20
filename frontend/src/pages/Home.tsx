import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { CloudArrowUpIcon, XMarkIcon, InformationCircleIcon, ShareIcon } from '@heroicons/react/24/outline'

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

  return (
    <div className="relative max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <span className="text-4xl">🐕</span>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Doggy Detective
          </h1>
          <span className="text-4xl">🔍</span>
        </div>
        <p className="text-xl text-gray-600 mb-12">
          Upload a photo and I'll sniff out the breed! Woof! 🐾
        </p>
        
        {/* Platform Explanation */}
        <div className="mb-12 text-left bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            Welcome to Doggy Detective! 🐕
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>What is Doggy Detective?</strong> It's an AI-powered tool that helps you identify your dog's breed 
              using advanced machine learning technology. Simply upload a clear photo of your dog, and our system will 
              analyze it to determine the most likely breeds.
            </p>
            <p>
              <strong>How does it work?</strong> We use a sophisticated MobileNetV2 neural network trained on thousands 
              of dog images to identify breed characteristics. The system analyzes your dog's features and provides 
              confidence scores for the most likely breeds.
            </p>
            <p>
              <strong>How to use:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Upload a photo" or drag and drop an image</li>
              <li>Make sure the photo is clear and shows your dog's face</li>
              <li>Click "What breed am I?" to start the analysis</li>
              <li>View the results and learn more about each breed</li>
            </ol>
          </div>
        </div>

        {/* Upload Area or New Photo Button */}
        {showUpload ? (
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="mt-4 flex justify-center px-6 pt-5 pb-6 border-3 border-dashed border-purple-300 rounded-2xl cursor-pointer hover:border-purple-400 transition-all transform hover:scale-105 bg-white/50 backdrop-blur-sm"
          >
            <div className="space-y-2 text-center">
              <div className="flex justify-center">
                <CloudArrowUpIcon className="h-12 w-12 text-purple-500" />
              </div>
              <div className="flex text-sm">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                  <span>Upload a photo</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">Woof! I can handle PNG or JPG up to 10MB 🦴</p>
            </div>
          </div>
        ) : (
          <button
            onClick={resetUpload}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Try Another Photo 🐾
          </button>
        )}

        {/* Preview and Analysis Section */}
        {preview && (
          <div className="mt-8">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-96 rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-3 -right-3 text-4xl animate-bounce">
                🐕
              </div>
            </div>
            
            {/* Analysis Button - Positioned below the image */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transform transition-transform hover:scale-105"
              >
                {loading ? 'Sniffing... 🔍' : 'What breed am I? 🐾'}
              </button>
            </div>
          </div>
        )}

        {/* Loading State with Fun Facts */}
        {loading && (
          <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg animate-pulse">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            </div>
            <p className="text-gray-600 italic">{currentFact}</p>
          </div>
        )}

        {/* Error Message with Retry Button */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-600 mb-4">{error}</p>
            {showRetry && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again 🐾
              </button>
            )}
          </div>
        )}

        {/* Results with Share and Save Buttons */}
        {results.length > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {resultMessage}
              </h2>
              <div className="space-x-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-purple-600 hover:text-purple-700 focus:outline-none"
                  title="Share results"
                >
                  <ShareIcon className="h-5 w-5 mr-1" />
                  Share
                </button>
                <button
                  onClick={() => {
                    const report = generateReport()
                    const blob = new Blob([report], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'dog-breed-report.txt'
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-purple-600 hover:text-purple-700 focus:outline-none"
                  title="Save report"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save Report
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index} className="transform transition-all hover:scale-105">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🐾'}</span>
                      <div className="flex flex-col">
                        <span className="text-lg font-medium text-gray-800">{result.breed}</span>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(result.breed + ' dog breed')}&tbm=isch`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-700"
                        >
                          View Breed Photos 🔍
                        </a>
                      </div>
                      <button
                        onClick={() => setSelectedBreed(result.breed)}
                        className="ml-2 text-purple-600 hover:text-purple-700"
                        title="Learn more about this breed"
                      >
                        <InformationCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {result.confidence.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Deep Analysis Button */}
            {!showDeepAnalysis && (
              <button
                onClick={() => setShowDeepAnalysis(true)}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Show Deep Analysis 🔍
              </button>
            )}
          </div>
        )}

        {/* Deep Analysis Section */}
        {showDeepAnalysis && <DeepAnalysis />}

        {/* Breed Info Modal */}
        {selectedBreed && (
          <BreedInfoModal
            breed={selectedBreed}
            onClose={() => setSelectedBreed(null)}
          />
        )}
      </div>
    </div>
  )
}

export default Home 