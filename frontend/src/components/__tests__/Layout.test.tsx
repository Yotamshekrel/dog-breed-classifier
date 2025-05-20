import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../Layout'

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Layout', () => {
  it('renders the sidebar with all navigation links', () => {
    renderWithRouter(
      <Layout>
        <div>Test content</div>
      </Layout>
    )

    // Check for main navigation items
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Breed Comparison')).toBeInTheDocument()
    expect(screen.getByText('Advanced Analysis')).toBeInTheDocument()
    expect(screen.getByText('Breed Mix Calculator')).toBeInTheDocument()
    expect(screen.getByText('Training Tips')).toBeInTheDocument()
    expect(screen.getByText('Breed of Day')).toBeInTheDocument()
    expect(screen.getByText('Random Breed')).toBeInTheDocument()
    expect(screen.getByText('Guess Breed')).toBeInTheDocument()
  })

  it('renders children content', () => {
    renderWithRouter(
      <Layout>
        <div>Test content</div>
      </Layout>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('has correct navigation links', () => {
    renderWithRouter(
      <Layout>
        <div>Test content</div>
      </Layout>
    )

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/')
    expect(links[1]).toHaveAttribute('href', '/compare')
    expect(links[2]).toHaveAttribute('href', '/analyze')
    expect(links[3]).toHaveAttribute('href', '/mix')
    expect(links[4]).toHaveAttribute('href', '/training')
    expect(links[5]).toHaveAttribute('href', '/breed-of-day')
    expect(links[6]).toHaveAttribute('href', '/random')
    expect(links[7]).toHaveAttribute('href', '/guess')
  })
}) 