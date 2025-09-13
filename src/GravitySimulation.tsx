import { useTick } from '@pixi/react'
import React, { useState } from 'react'
import { PlanetInfo } from './types'
import Planet from './Planet'

import {
  calculateRadius,
  calculateGravitationalForce,
  checkCollisions,
  applyBoundaryConditions,
} from './physics'

interface GravitySimulationProps {
  gravityConst: number
  initialPlanets?: PlanetInfo[] | null
}

const GravitySimulation: React.FC<GravitySimulationProps> = ({
  gravityConst,
  initialPlanets,
}) => {
  const [planets, setPlanets] = useState<PlanetInfo[]>(initialPlanets || [])

  // Обновляем планеты при изменении initialPlanets
  React.useEffect(() => {
    if (initialPlanets) {
      setPlanets(initialPlanets)
    }
  }, [initialPlanets])

  useTick((ticker) => {
    const deltaTime = ticker.deltaTime * 0.016 // Нормализуем время для стабильности

    // ШАГ 1: Рассчитываем все гравитационные силы
    const forces = planets.map(() => ({ fx: 0, fy: 0 }))

    // Вычисляем гравитационные силы между всеми парами планет
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const force = calculateGravitationalForce(
          planets[i],
          planets[j],
          gravityConst,
        )

        // Применяем силу к первой планете (притяжение ко второй)
        forces[i].fx += force.fx
        forces[i].fy += force.fy

        // Применяем противоположную силу ко второй планете (третий закон Ньютона)
        forces[j].fx -= force.fx
        forces[j].fy -= force.fy
      }
    }

    // ШАГ 2: Рассчитываем ускорения для всех планет
    const accelerations = forces.map((force, index) => ({
      ax: force.fx / planets[index].mass,
      ay: force.fy / planets[index].mass,
    }))

    // ШАГ 3 и 4: Создаем новые объекты планет с обновленными свойствами
    const updatedPlanets = planets.map((planet, index) => {
      const { ax, ay } = accelerations[index]

      // Обновляем скорость: v = v0 + at
      let newSpeedX = planet.speed.x + ax * deltaTime
      let newSpeedY = planet.speed.y + ay * deltaTime

      // Обновляем позицию: x = x0 + vt
      let newPositionX = planet.position.x + newSpeedX * deltaTime
      let newPositionY = planet.position.y + newSpeedY * deltaTime

      // Применяем граничные условия
      const boundaryResult = applyBoundaryConditions(
        { x: newPositionX, y: newPositionY },
        { x: newSpeedX, y: newSpeedY },
        window.innerWidth,
        window.innerHeight,
      )

      newPositionX = boundaryResult.position.x
      newPositionY = boundaryResult.position.y
      newSpeedX = boundaryResult.speed.x
      newSpeedY = boundaryResult.speed.y

      // Возвращаем новый объект планеты
      return {
        ...planet,
        speed: { x: newSpeedX, y: newSpeedY },
        position: { x: newPositionX, y: newPositionY },
      }
    })

    // ШАГ 5: Проверяем коллизии и поглощения
    const planetsAfterCollisions = checkCollisions(updatedPlanets)

    // Обновляем состояние с новыми объектами
    setPlanets(planetsAfterCollisions)
  })

  return (
    <>
      {planets.map((planet, index) => (
        <Planet
          key={index}
          radius={calculateRadius(planet.mass, planet.density)}
          position={planet.position}
          rotationSpeed={planet.rotationSpeed}
        />
      ))}
    </>
  )
}

export default GravitySimulation
