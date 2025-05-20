import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../Home'
import apiService from '../../services/api'

vi.mock('../../services/api')

describe('Home', () => {
  const mockBreedResults = [
    { breed: 'Labrador', confidence: 0.95 },
    { breed: 'Golden Retriever', confidence: 0.05 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the upload section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Upload a Dog Image')).toBeInTheDocument()
    expect(screen.getByText('or drag and drop')).toBeInTheDocument()
  })

  it('handles file upload and displays results', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    vi.mocked(apiService.classifyImage).mockResolvedValueOnce(mockBreedResults)

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const fileInput = screen.getByLabelText(/upload/i)
    fireEvent.change(fileInput, { target: { files: [mockFile] } })

    await waitFor(() => {
      expect(screen.getByText('Labrador')).toBeInTheDocument()
      expect(screen.getByText('95%')).toBeInTheDocument()
    })
  })

  it('displays error message when upload fails', async () => {
    const errorMessage = 'Upload failed'
    vi.mocked(apiService.classifyImage).mockRejectedValueOnce(new Error(errorMessage))

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const fileInput = screen.getByLabelText(/upload/i)
    fireEvent.change(fileInput, { target: { files: [new File(['test'], 'test.jpg')] } })

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('shows loading state during upload', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    vi.mocked(apiService.classifyImage).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockBreedResults), 100))
    )

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const fileInput = screen.getByLabelText(/upload/i)
    fireEvent.change(fileInput, { target: { files: [mockFile] } })

    expect(screen.getByText('Analyzing...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Labrador')).toBeInTheDocument()
    })
  })
}) 