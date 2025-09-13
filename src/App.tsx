import { useState } from 'react'
import Controls from './Controls'
import PixiApp from './PixiApp'
import { PlanetInfo } from './types'

export default function App() {
  const [gravityConst, setGravityConst] = useState<number>(10000)
  const [planets, setPlanets] = useState<PlanetInfo[] | null>(null)

  const handleGravityChange = (newGravity: number) => {
    setGravityConst(newGravity)
  }

  const handlePlanetsGenerate = (newPlanets: PlanetInfo[]) => {
    setPlanets(newPlanets)
  }

  return (
    <>
      <Controls
        gravityConst={gravityConst}
        onGravityChange={handleGravityChange}
        onPlanetsGenerate={handlePlanetsGenerate}
        defaultPlanetCount={100}
      />
      <PixiApp gravityConst={gravityConst} initialPlanets={planets} />
    </>
  )
}
