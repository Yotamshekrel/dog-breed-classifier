import { useState } from 'react'
import { AcademicCapIcon, BookOpenIcon, LightBulbIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface TrainingTip {
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  steps: string[]
  tips: string[]
  commonMistakes: string[]
}

function TrainingTips() {
  const [selectedBreed, setSelectedBreed] = useState<string>('')
  const [selectedTip, setSelectedTip] = useState<TrainingTip | null>(null)

  // Mock breed data - in a real app, this would come from an API
  const availableBreeds = [
    'Labrador Retriever',
    'German Shepherd',
    'Golden Retriever',
    'French Bulldog',
    'Bulldog',
    'Poodle',
    'Beagle',
    'Rottweiler',
    'Dachshund',
    'Yorkshire Terrier'
  ]

  // Mock training tips - in a real app, this would come from an API
  const trainingTips: TrainingTip[] = [
    {
      title: 'Basic Obedience Training',
      description: 'Teach your dog essential commands like sit, stay, and come.',
      difficulty: 'Beginner',
      duration: '4-6 weeks',
      steps: [
        'Start with one command at a time',
        'Use positive reinforcement with treats',
        'Practice in short sessions (5-10 minutes)',
        'Gradually increase difficulty and distractions',
        'Be consistent with commands and rewards'
      ],
      tips: [
        'Choose a quiet environment for training',
        'Use high-value treats for motivation',
        'Keep training sessions fun and engaging',
        'End on a positive note',
        'Practice regularly throughout the day'
      ],
      commonMistakes: [
        'Training for too long',
        'Using inconsistent commands',
        'Getting frustrated or angry',
        'Not rewarding immediately',
        'Expecting too much too soon'
      ]
    },
    {
      title: 'Leash Training',
      description: 'Teach your dog to walk politely on a leash without pulling.',
      difficulty: 'Intermediate',
      duration: '2-4 weeks',
      steps: [
        'Start indoors with minimal distractions',
        'Use a properly fitted collar or harness',
        'Reward for walking beside you',
        'Stop when pulling occurs',
        'Gradually increase difficulty'
      ],
      tips: [
        'Use a front-clip harness for pullers',
        'Keep the leash loose',
        'Change direction frequently',
        'Reward good behavior consistently',
        'Practice in different environments'
      ],
      commonMistakes: [
        'Using a retractable leash',
        'Pulling back on the leash',
        'Walking too fast',
        'Not being consistent',
        'Starting in high-distraction areas'
      ]
    },
    {
      title: 'Advanced Trick Training',
      description: 'Teach your dog impressive tricks like roll over and play dead.',
      difficulty: 'Advanced',
      duration: '6-8 weeks',
      steps: [
        'Break down tricks into small steps',
        'Use clicker training for precision',
        'Shape behavior gradually',
        'Add verbal cues',
        'Practice in different locations'
      ],
      tips: [
        'Keep sessions short and fun',
        'Use high-value rewards',
        'Be patient and consistent',
        'Celebrate small successes',
        'End before your dog gets tired'
      ],
      commonMistakes: [
        'Moving too quickly',
        'Not breaking down complex tricks',
        'Using unclear signals',
        'Practicing when tired',
        'Getting frustrated with slow progress'
      ]
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Training Tips 🎓
        </h1>
        <p className="text-xl text-gray-600">
          Expert advice and training techniques for your furry friend!
        </p>
      </div>

      {/* Breed Selection */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Dog's Breed</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {availableBreeds.map((breed) => (
            <button
              key={breed}
              onClick={() => setSelectedBreed(breed)}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                selectedBreed === breed
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {breed}
            </button>
          ))}
        </div>
      </div>

      {/* Training Tips List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {trainingTips.map((tip, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg cursor-pointer transform transition-all hover:scale-105"
            onClick={() => setSelectedTip(tip)}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {index === 0 ? (
                  <AcademicCapIcon className="h-8 w-8 text-purple-600" />
                ) : index === 1 ? (
                  <BookOpenIcon className="h-8 w-8 text-pink-600" />
                ) : (
                  <SparklesIcon className="h-8 w-8 text-purple-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{tip.title}</h3>
                <p className="text-gray-600 mb-4">{tip.description}</p>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(tip.difficulty)}`}>
                    {tip.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">{tip.duration}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Tip Details */}
      {selectedTip && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                {selectedTip.title}
              </h2>
              <p className="text-gray-600">{selectedTip.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedTip.difficulty)}`}>
                {selectedTip.difficulty}
              </span>
              <span className="text-sm text-gray-500">{selectedTip.duration}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Steps */}
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-purple-700 mb-4">Training Steps</h3>
              <ol className="space-y-3">
                {selectedTip.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            <div className="bg-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-pink-700 mb-4">Pro Tips</h3>
              <ul className="space-y-3">
                {selectedTip.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <LightBulbIcon className="h-5 w-5 text-pink-600 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Common Mistakes to Avoid</h3>
              <ul className="space-y-3">
                {selectedTip.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">×</span>
                    <span className="text-gray-700">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingTips 