import { useTick } from '@pixi/react'
import { useState } from 'react'
import { PlanetInfo } from './types'
import Planet from './Planet'
import { mockedPlanets } from './mock'

interface GravitySimulationProps {
  gravityConst: number
}

const GravitySimulation: React.FC<GravitySimulationProps> = ({
  gravityConst,
}) => {
  const [planets] = useState<PlanetInfo[]>(mockedPlanets)

  useTick((ticker) => {
    planets.forEach((planet) => {
      planet.position.x += planet.speed.x * ticker.deltaTime
      planet.position.y += planet.speed.y * ticker.deltaTime
    })
  })

  return (
    <>
      {planets.map((planet, index) => (
        <Planet
          key={index}
          radius={planet.mass * planet.density}
          position={planet.position}
          rotationSpeed={planet.rotationSpeed}
        />
      ))}
    </>
  )
}

export default GravitySimulation
