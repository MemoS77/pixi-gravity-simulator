import { UNIVERSE_WIDTH, UNIVERSE_HEIGHT } from '../constants/universe'

/**
 * Применяет граничные условия к планете (отражение от границ вселенной)
 * 
 * @param position - текущая позиция объекта
 * @param speed - текущая скорость объекта
 * @returns объект с новой позицией и скоростью
 */
export const applyBoundaryConditions = (
  position: { x: number; y: number },
  speed: { x: number; y: number }
) => {
  let newSpeedX = speed.x
  let newSpeedY = speed.y
  let newPositionX = position.x
  let newPositionY = position.y

  // Отражение от границ вселенной с затуханием
  if (newPositionX < 0 || newPositionX > UNIVERSE_WIDTH) {
    newSpeedX *= -0.8 // Небольшое затухание при отражении
  }
  if (newPositionY < 0 || newPositionY > UNIVERSE_HEIGHT) {
    newSpeedY *= -0.8
  }

  // Ограничиваем позицию в пределах вселенной
  newPositionX = Math.max(0, Math.min(UNIVERSE_WIDTH, newPositionX))
  newPositionY = Math.max(0, Math.min(UNIVERSE_HEIGHT, newPositionY))

  return {
    position: { x: newPositionX, y: newPositionY },
    speed: { x: newSpeedX, y: newSpeedY }
  }
}
