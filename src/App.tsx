import { useState } from 'react'
import Controls from './Controls'
import PixiApp from './PixiApp'

export default function App() {
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.1)

  const handleControlValueChange = (value: number) => {
    setRotationSpeed(value)
  }

  return (
    <>
      <Controls onValueChange={handleControlValueChange} />
      <PixiApp rotationSpeed={rotationSpeed} />
    </>
  )
}
