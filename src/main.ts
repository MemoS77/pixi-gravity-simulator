import './style.css'
import { App } from './app/App'
import { CameraController } from './controllers/CameraController'

;(async () => {
  const app = new App()
  await app.init({ background: '#111', resizeTo: window })
  document.getElementById('pixi-container')!.appendChild(app.canvas)
  await app.run()
  
  // Устанавливаем начальные параметры камеры
  app.setZoom(0.5)
  app.setCamera(1000, 1000)
  
  // Настраиваем контроллер камеры
  const cameraController = new CameraController(app.canvas, {
    onZoomChange: (zoom: number) => app.setZoom(zoom),
    onCameraMove: (deltaX: number, deltaY: number) => app.moveCamera(deltaX, deltaY),
    getCurrentZoom: () => app.getZoom(),
    getCurrentCamera: () => app.getCamera()
  })
  
  // Устанавливаем курсор для canvas
  app.canvas.style.cursor = 'grab'
  
  // Очистка при закрытии страницы
  window.addEventListener('beforeunload', () => {
    cameraController.destroy()
  })
})()
