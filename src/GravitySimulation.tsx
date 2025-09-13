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
  const [planets, setPlanets] = useState<PlanetInfo[]>(mockedPlanets)

  // Функция для расчета гравитационной силы между двумя телами
  const calculateGravitationalForce = (
    planet1: PlanetInfo,
    planet2: PlanetInfo,
  ) => {
    const dx = planet2.position.x - planet1.position.x
    const dy = planet2.position.y - planet1.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Избегаем деления на ноль и слишком близких расстояний
    if (distance < 10) return { fx: 0, fy: 0 }

    // F = G * (m1 * m2) / r^2
    const force =
      (gravityConst * planet1.mass * planet2.mass) / (distance * distance)

    // Нормализуем направление силы
    const fx = (force * dx) / distance
    const fy = (force * dy) / distance

    return { fx, fy }
  }

  useTick((ticker) => {
    const deltaTime = ticker.deltaTime * 0.016 // Нормализуем время для стабильности

    // ШАГ 1: Рассчитываем все гравитационные силы
    const forces = planets.map(() => ({ fx: 0, fy: 0 }))

    // Вычисляем гравитационные силы между всеми парами планет
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const force = calculateGravitationalForce(planets[i], planets[j])

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

      // Отражение от границ экрана (опционально)
      if (newPositionX < 0 || newPositionX > window.innerWidth) {
        newSpeedX *= -0.8 // Небольшое затухание при отражении
      }
      if (newPositionY < 0 || newPositionY > window.innerHeight) {
        newSpeedY *= -0.8
      }

      // Ограничиваем позицию в пределах экрана
      newPositionX = Math.max(0, Math.min(window.innerWidth, newPositionX))
      newPositionY = Math.max(0, Math.min(window.innerHeight, newPositionY))

      // Возвращаем новый объект планеты
      return {
        ...planet,
        speed: { x: newSpeedX, y: newSpeedY },
        position: { x: newPositionX, y: newPositionY },
      }
    })

    // Обновляем состояние с новыми объектами
    setPlanets(updatedPlanets)
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
