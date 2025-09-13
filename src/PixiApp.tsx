import { Application, extend, useApplication, useTick } from '@pixi/react'
import { Assets, Container, Sprite, Texture } from 'pixi.js'
import { useEffect, useRef, useState } from 'react'

extend({
  Container,
  Sprite,
})

interface BunnySpriteProps {
  rotationSpeed: number
}

const BunnySprite: React.FC<BunnySpriteProps> = ({ rotationSpeed }) => {
  const { app } = useApplication()

  const spriteRef = useRef<Sprite>(null)
  const [texture, setTexture] = useState(Texture.EMPTY)

  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load('/assets/bunny.png').then((result) => {
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
      x={app.screen.width / 2}
      y={app.screen.height / 2}
    />
  )
}

interface PixiAppProps {
  rotationSpeed: number
}

const PixiApp: React.FC<PixiAppProps> = ({ rotationSpeed }) => {
  return (
    <Application background={'#1099bb'} resizeTo={window}>
      <BunnySprite rotationSpeed={rotationSpeed} />
    </Application>
  )
}

export default PixiApp
