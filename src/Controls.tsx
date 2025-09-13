import React, { useState } from 'react'
import { PlanetInfo } from './types'

interface ControlsProps {
  gravityConst: number
  defaultPlanetCount: number
  onGravityChange: (value: number) => void
  onPlanetsGenerate: (planets: PlanetInfo[]) => void
}

const MAX_PLANET_COUNT = 10000

const Controls: React.FC<ControlsProps> = ({
  gravityConst,
  defaultPlanetCount,
  onGravityChange,
  onPlanetsGenerate,
}) => {
  const [gravityValue, setGravityValue] = useState<number>(gravityConst)
  const [planetCount, setPlanetCount] = useState<number>(defaultPlanetCount)

  const handleGravityInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseFloat(event.target.value) || 0
    setGravityValue(value)
  }

  const handlePlanetCountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(event.target.value) || 1
    setPlanetCount(Math.min(MAX_PLANET_COUNT, value))
  }

  const handleApplyChanges = () => {
    onGravityChange(gravityValue)
  }

  const handleGeneratePlanets = async () => {
    // Динамический импорт функции генерации
    const { generateRandomPlanets } = await import(
      './utils/generateRandomPlanets'
    )
    const newPlanets = generateRandomPlanets(planetCount)
    onPlanetsGenerate(newPlanets)
  }

  return (
    <div className="fixed top-5 right-5 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg p-4 shadow-lg z-50 min-w-[250px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="gravity-input"
            className="text-sm font-medium text-gray-700"
          >
            Gravity Constant:
          </label>
          <input
            id="gravity-input"
            type="number"
            value={gravityValue}
            onChange={handleGravityInputChange}
            step="10"
            min="0"
            max="50000"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleApplyChanges}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Apply
          </button>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="planet-count"
              className="text-sm font-medium text-gray-700"
            >
              Planet Count:
            </label>
            <input
              id="planet-count"
              type="number"
              value={planetCount}
              onChange={handlePlanetCountChange}
              step="10"
              min="10"
              max={MAX_PLANET_COUNT}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <button
            onClick={handleGeneratePlanets}
            className="px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Generate planets
          </button>
        </div>
      </div>
    </div>
  )
}

export default Controls
