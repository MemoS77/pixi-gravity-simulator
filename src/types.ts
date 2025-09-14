import { Graphics } from 'pixi.js'

export type PlanetInfo = {
  mass: number
  density: number
  position: { x: number; y: number }
  speed: { x: number; y: number }
  color: string
  graphics?: Graphics
  radius: number
  needUpdate: boolean
}
