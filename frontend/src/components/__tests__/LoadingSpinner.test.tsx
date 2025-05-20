import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders without text', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toBeInTheDocument()
  })

  it('renders with text', () => {
    const text = 'Loading...'
    render(<LoadingSpinner text={text} />)
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-4 w-4')

    rerender(<LoadingSpinner size="md" />)
    spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-8 w-8')

    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-12 w-12')
  })

  it('renders in fullscreen mode', () => {
    render(<LoadingSpinner fullScreen />)
    const container = screen.getByRole('img', { hidden: true }).parentElement?.parentElement
    expect(container).toHaveClass('fixed inset-0')
  })
}) 