import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import BreedComparison from './pages/BreedComparison'
import AdvancedAnalysis from './pages/AdvancedAnalysis'
import BreedMixCalculator from './pages/BreedMixCalculator'
import TrainingTips from './pages/TrainingTips'
import BreedOfDay from './pages/BreedOfDay'
import RandomBreed from './pages/RandomBreed'
import GuessBreed from './pages/GuessBreed'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compare" element={<BreedComparison />} />
            <Route path="/analyze" element={<AdvancedAnalysis />} />
            <Route path="/mix" element={<BreedMixCalculator />} />
            <Route path="/training" element={<TrainingTips />} />
            <Route path="/breed-of-day" element={<BreedOfDay />} />
            <Route path="/random" element={<RandomBreed />} />
            <Route path="/guess" element={<GuessBreed />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App 