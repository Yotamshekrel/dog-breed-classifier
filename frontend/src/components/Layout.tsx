import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ScaleIcon,
  ChartBarIcon,
  CalculatorIcon,
  AcademicCapIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dog Detective', href: '/', icon: MagnifyingGlassIcon },
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Breed Comparison', href: '/compare', icon: ScaleIcon },
    { name: 'Advanced Analysis', href: '/analyze', icon: ChartBarIcon },
    { name: 'Breed Mix Calculator', href: '/mix', icon: CalculatorIcon },
    { name: 'Training Tips', href: '/training', icon: AcademicCapIcon },
    { name: 'Breed of the Day', href: '/breed-of-day', icon: SparklesIcon },
    { name: 'Random Breed', href: '/random', icon: ArrowPathIcon },
    { name: 'Guess the Breed', href: '/guess', icon: QuestionMarkCircleIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🐕</span>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Doggy Detective
              </h1>
            </div>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                      }`}
                    >
                      <item.icon className="h-6 w-6" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t">
            <p className="text-sm text-gray-500">
              Made with ❤️ for dog lovers
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🐕</span>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Doggy Detective
              </h1>
            </div>
            <div className="w-6" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Page content */}
        <main className="pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout 