import './style.css'
import { App } from './app/App'
import { CameraController } from './controllers/CameraController'
import { StatsPanel } from './ui/StatsPanel'

;(async () => {
  // Создаем панель статистики
  const statsPanel = new StatsPanel()
  
  // Создаем приложение с колбэком для обновления статистики
  const app = new App((data) => {
    statsPanel.updateStats(data)
  })
  
  await app.init({ background: '#111', resizeTo: window })
  document.getElementById('pixi-container')!.appendChild(app.canvas)
  await app.run()

  // Настраиваем контроллер камеры
  const cameraController = new CameraController(app.canvas, {
    onZoomChange: (zoom: number) => app.setZoom(zoom),
    onCameraMove: (deltaX: number, deltaY: number) =>
      app.moveCamera(deltaX, deltaY),
    getCurrentZoom: () => app.getZoom(),
    getCurrentCamera: () => app.getCamera(),
  })

  // Устанавливаем курсор для canvas
  app.canvas.style.cursor = 'grab'

  // Очистка при закрытии страницы
  window.addEventListener('beforeunload', () => {
    cameraController.destroy()
    statsPanel.destroy()
  })
})()
