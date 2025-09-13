import { useState } from 'react'
import Controls from './Controls'
import PixiApp from './PixiApp'

export default function App() {
  const [gravityConst, setGravityConst] = useState<number>(10000)

  return (
    <>
      <Controls gravityConst={gravityConst} onValueChange={setGravityConst} />
      <PixiApp gravityConst={gravityConst} />
    </>
  )
}
