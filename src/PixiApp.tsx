import { Application, extend } from '@pixi/react'
import { Container, Sprite } from 'pixi.js'
import GravitySimulation from './GravitySimulation'

extend({
  Container,
  Sprite,
})

interface PixiAppProps {
  gravityConst: number
}

const PixiApp: React.FC<PixiAppProps> = ({ gravityConst }) => {
  return (
    <Application background={'#000'} resizeTo={window}>
      <GravitySimulation gravityConst={gravityConst} />
    </Application>
  )
}

export default PixiApp
