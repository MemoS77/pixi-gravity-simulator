import { Graphics } from 'pixi.js'

export type PlanetInfo = {
  id: number
  mass: number
  density: number
  position: { x: number; y: number }
  speed: { x: number; y: number }
  color: string
  graphics?: Graphics
  radius: number
  needUpdate: boolean
}
