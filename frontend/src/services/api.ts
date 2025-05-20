import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data)
      return Promise.reject(new Error(error.response.data.detail || 'An error occurred'))
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request)
      return Promise.reject(new Error('Network error - no response received'))
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message)
      return Promise.reject(new Error('Error setting up request'))
    }
  }
)

// Types
export interface BreedResult {
  breed: string
  confidence: number
}

export interface BreedAnalysis {
  temperament: {
    score: number
    traits: string[]
  }
  health: {
    score: number
    considerations: string[]
  }
  training: {
    score: number
    tips: string[]
  }
  exercise: {
    score: number
    requirements: string[]
  }
  grooming: {
    score: number
    requirements: string[]
  }
}

export interface BreedComparison {
  breed1: string
  breed2: string
  similarities: string[]
  differences: string[]
  compatibilityScore: number
}

export interface BreedMix {
  breeds: Array<{
    name: string
    percentage: number
  }>
  characteristics: string[]
  temperament: string[]
  health: string[]
  care: string[]
}

export interface TrainingTip {
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  steps: string[]
  proTips: string[]
  commonMistakes: string[]
}

// API functions
export const apiService = {
  // Image Classification
  classifyImage: async (file: File): Promise<BreedResult[]> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<BreedResult[]>('/classify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Breed Analysis
  getBreedAnalysis: async (breed: string): Promise<BreedAnalysis> => {
    const response = await api.get<BreedAnalysis>(`/analyze/${breed}`)
    return response.data
  },

  // Breed Comparison
  compareBreeds: async (breed1: string, breed2: string): Promise<BreedComparison> => {
    const response = await api.get<BreedComparison>(`/compare/${breed1}/${breed2}`)
    return response.data
  },

  // Breed Mix Calculator
  calculateBreedMix: async (breeds: Array<{ name: string; percentage: number }>): Promise<BreedMix> => {
    const response = await api.post<BreedMix>('/mix', { breeds })
    return response.data
  },

  // Training Tips
  getTrainingTips: async (breed: string): Promise<TrainingTip[]> => {
    const response = await api.get<TrainingTip[]>(`/training/${breed}`)
    return response.data
  },

  // Breed of Day
  getBreedOfDay: async (): Promise<BreedResult> => {
    const response = await api.get<BreedResult>('/breed-of-day')
    return response.data
  },

  // Random Breed
  getRandomBreed: async (): Promise<BreedResult> => {
    const response = await api.get<BreedResult>('/random-breed')
    return response.data
  },

  // Guess Breed Game
  getBreedForGuessing: async (): Promise<{
    image: string
    hints: string[]
  }> => {
    const response = await api.get<{ image: string; hints: string[] }>('/guess-breed')
    return response.data
  },

  checkBreedGuess: async (guess: string): Promise<{
    correct: boolean
    actualBreed?: string
  }> => {
    const response = await api.post<{ correct: boolean; actualBreed?: string }>('/check-guess', { guess })
    return response.data
  },
}

export default apiService 