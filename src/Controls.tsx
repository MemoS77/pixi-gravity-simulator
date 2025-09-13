import React, { useState } from 'react'

interface ControlsProps {
  onValueChange: (value: number) => void
}

const Controls: React.FC<ControlsProps> = ({ onValueChange }) => {
  const [inputValue, setInputValue] = useState<number>(100)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0
    setInputValue(value)
    onValueChange(value)
  }

  return (
    <div className="fixed top-5 left-5 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg p-4 shadow-lg z-50 min-w-[200px] opacity-70 hover:opacity-100 transition-all">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="numeric-input"
          className="text-sm font-medium text-gray-700"
        >
          Gravity const:
        </label>
        <input
          id="numeric-input"
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          step="10"
          min="0"
          max="500"
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
        />
      </div>
    </div>
  )
}

export default Controls
