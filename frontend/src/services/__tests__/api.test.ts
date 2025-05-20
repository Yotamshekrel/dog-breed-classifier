import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiService from '../api'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('classifies image successfully', async () => {
    const mockResponse = {
      data: [
        { breed: 'Labrador', confidence: 0.95 },
        { breed: 'Golden Retriever', confidence: 0.05 }
      ]
    }
    mockedAxios.post.mockResolvedValueOnce(mockResponse)

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const result = await apiService.classifyImage(file)

    expect(result).toEqual(mockResponse.data)
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/classify', expect.any(FormData))
  })

  it('handles classification error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'))

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    await expect(apiService.classifyImage(file)).rejects.toThrow('API Error')
  })

  it('gets breed analysis successfully', async () => {
    const mockResponse = {
      data: {
        temperament: 'Friendly',
        health: { score: 8, concerns: ['Hip dysplasia'] },
        training: { score: 9, tips: ['Positive reinforcement'] },
        exercise: { score: 7, requirements: 'Daily walks'] },
        grooming: { score: 6, needs: ['Weekly brushing'] }
      }
    }
    mockedAxios.get.mockResolvedValueOnce(mockResponse)

    const result = await apiService.getBreedAnalysis('Labrador')

    expect(result).toEqual(mockResponse.data)
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/breeds/Labrador/analysis')
  })

  it('handles breed analysis error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'))

    await expect(apiService.getBreedAnalysis('Labrador')).rejects.toThrow('API Error')
  })
}) 