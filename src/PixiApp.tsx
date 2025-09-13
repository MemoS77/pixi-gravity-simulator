import { Application, extend } from '@pixi/react'
import { Container, Sprite } from 'pixi.js'
import { PlanetInfo } from './types'
import GravitySimulation from './GravitySimulation'

extend({
  Container,
  Sprite,
})

interface PixiAppProps {
  gravityConst: number
  initialPlanets?: PlanetInfo[] | null
}

const PixiApp: React.FC<PixiAppProps> = ({ gravityConst, initialPlanets }) => {
  return (
    <Application background={'#000'} resizeTo={window}>
      <GravitySimulation 
        gravityConst={gravityConst} 
        initialPlanets={initialPlanets}
      />
    </Application>
  )
}

export default PixiApp
