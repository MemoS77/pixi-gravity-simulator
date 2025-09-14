import { Sprite } from 'pixi.js'

export type PlanetInfo = {
  mass: number
  density: number
  position: { x: number; y: number }
  speed: { x: number; y: number }
  rotationSpeed: number
  sprite?: Sprite
}
