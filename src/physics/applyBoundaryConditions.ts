/**
 * Применяет граничные условия к планете (отражение от краев экрана)
 * 
 * @param position - текущая позиция объекта
 * @param speed - текущая скорость объекта
 * @param screenWidth - ширина экрана
 * @param screenHeight - высота экрана
 * @returns объект с новой позицией и скоростью
 */
export const applyBoundaryConditions = (
  position: { x: number; y: number },
  speed: { x: number; y: number },
  screenWidth: number,
  screenHeight: number
) => {
  let newSpeedX = speed.x
  let newSpeedY = speed.y
  let newPositionX = position.x
  let newPositionY = position.y

  // Отражение от границ экрана с затуханием
  if (newPositionX < 0 || newPositionX > screenWidth) {
    newSpeedX *= -0.8 // Небольшое затухание при отражении
  }
  if (newPositionY < 0 || newPositionY > screenHeight) {
    newSpeedY *= -0.8
  }

  // Ограничиваем позицию в пределах экрана
  newPositionX = Math.max(0, Math.min(screenWidth, newPositionX))
  newPositionY = Math.max(0, Math.min(screenHeight, newPositionY))

  return {
    position: { x: newPositionX, y: newPositionY },
    speed: { x: newSpeedX, y: newSpeedY }
  }
}
