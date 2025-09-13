import { useState } from 'react'
import Controls from './Controls'
import PixiApp from './PixiApp'

export default function App() {
  const [gravityConst, setGravityConst] = useState<number>(100)

  const handleControlValueChange = (value: number) => {
    setGravityConst(value)
  }

  return (
    <>
      <Controls onValueChange={handleControlValueChange} />
      <PixiApp gravityConst={gravityConst} />
    </>
  )
}
