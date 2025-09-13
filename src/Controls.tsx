import React, { useState } from 'react'
import './Controls.css'

interface ControlsProps {
  onValueChange: (value: number) => void
}

const Controls: React.FC<ControlsProps> = ({ onValueChange }) => {
  const [inputValue, setInputValue] = useState<number>(1)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0
    setInputValue(value)
    onValueChange(value)
  }

  return (
    <div className="controls-panel">
      <div className="control-group">
        <label htmlFor="numeric-input">Gravity const:</label>
        <input
          id="numeric-input"
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          step="0.1"
          min="0"
          max="10"
          className="numeric-input"
        />
      </div>
    </div>
  )
}

export default Controls
