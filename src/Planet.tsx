import { useTick } from '@pixi/react'
import { Assets, Sprite, Texture } from 'pixi.js'
import { useEffect, useRef, useState } from 'react'

type PlanetProps = {
  radius: number
  position: { x: number; y: number }
  rotationSpeed: number
}

export default function Planet({
  radius,
  position,
  rotationSpeed,
}: PlanetProps) {
  const spriteRef = useRef<Sprite>(null)
  const [texture, setTexture] = useState(Texture.EMPTY)

  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load('/assets/planet_0.png').then((result) => {
        setTexture(result)
      })
    }
  }, [texture])

  useTick((ticker) => {
    if (!spriteRef.current) return
    spriteRef.current.rotation += rotationSpeed * ticker.deltaTime
  })

  return (
    <pixiSprite
      ref={spriteRef}
      texture={texture}
      anchor={0.5}
      x={position.x}
      y={position.y}
      width={radius * 2}
      height={radius * 2}
    />
  )
}
