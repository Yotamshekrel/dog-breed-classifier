import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiService from '../api'
import axios from 'axios'

vi.mock('axios')

describe('apiService', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('classifyImage makes a POST request with FormData', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const mockResponse = {
      data: [
        { breed: 'Labrador', confidence: 0.95 },
        { breed: 'Golden Retriever', confidence: 0.05 },
      ],
    }

    mockAxios.post.mockResolvedValueOnce(mockResponse)

    const result = await apiService.classifyImage(mockFile)

    expect(mockAxios.post).toHaveBeenCalledWith(
      '/classify',
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    )
    expect(result).toEqual(mockResponse.data)
  })

  it('getBreedAnalysis makes a GET request', async () => {
    const mockResponse = {
      data: {
        temperament: {
          score: 0.8,
          traits: ['Friendly', 'Intelligent'],
        },
        health: {
          score: 0.7,
          considerations: ['Hip dysplasia'],
        },
      },
    }

    mockAxios.get.mockResolvedValueOnce(mockResponse)

    const result = await apiService.getBreedAnalysis('Labrador')

    expect(mockAxios.get).toHaveBeenCalledWith('/analyze/Labrador')
    expect(result).toEqual(mockResponse.data)
  })

  it('compareBreeds makes a GET request', async () => {
    const mockResponse = {
      data: {
        breed1: 'Labrador',
        breed2: 'Golden Retriever',
        similarities: ['Friendly', 'Intelligent'],
        differences: ['Coat type'],
        compatibilityScore: 0.85,
      },
    }

    mockAxios.get.mockResolvedValueOnce(mockResponse)

    const result = await apiService.compareBreeds('Labrador', 'Golden Retriever')

    expect(mockAxios.get).toHaveBeenCalledWith('/compare/Labrador/Golden Retriever')
    expect(result).toEqual(mockResponse.data)
  })

  it('handles API errors correctly', async () => {
    const errorMessage = 'API Error'
    mockAxios.get.mockRejectedValueOnce(new Error(errorMessage))

    await expect(apiService.getBreedAnalysis('Labrador')).rejects.toThrow(errorMessage)
  })

  it('handles network errors correctly', async () => {
    mockAxios.get.mockRejectedValueOnce({ request: {} })

    await expect(apiService.getBreedAnalysis('Labrador')).rejects.toThrow(
      'Network error - no response received'
    )
  })
}) 