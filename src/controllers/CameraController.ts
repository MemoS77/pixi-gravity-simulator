export interface CameraCallbacks {
  onZoomChange: (zoom: number) => void
  onCameraMove: (deltaX: number, deltaY: number) => void
  getCurrentZoom: () => number
  getCurrentCamera: () => { x: number; y: number }
}

export class CameraController {
  private callbacks: CameraCallbacks
  private element: HTMLElement
  private isDragging = false
  private lastPointerPosition = { x: 0, y: 0 }
  private pointers = new Map<number, { x: number; y: number }>()
  private lastPinchDistance = 0

  constructor(element: HTMLElement, callbacks: CameraCallbacks) {
    this.element = element
    this.callbacks = callbacks
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // Отключаем контекстное меню
    this.element.addEventListener('contextmenu', (e) => e.preventDefault())

    // События мыши
    this.element.addEventListener('wheel', this.handleWheel.bind(this))
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.element.addEventListener('mouseleave', this.handleMouseUp.bind(this))

    // События касаний
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false })
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault()
    
    // Более плавный зум (меньший шаг)
    const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05
    const currentZoom = this.callbacks.getCurrentZoom()
    const newZoom = currentZoom * zoomFactor
    
    // Получаем позицию курсора относительно canvas
    const rect = this.element.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    // Получаем текущую позицию камеры
    const currentCamera = this.callbacks.getCurrentCamera()
    
    // Вычисляем мировые координаты точки под курсором до зума
    const worldX = (mouseX / currentZoom) + currentCamera.x
    const worldY = (mouseY / currentZoom) + currentCamera.y
    
    // Применяем новый зум
    this.callbacks.onZoomChange(newZoom)
    
    // Вычисляем новые мировые координаты той же точки после зума
    const newWorldX = (mouseX / newZoom) + currentCamera.x
    const newWorldY = (mouseY / newZoom) + currentCamera.y
    
    // Сдвигаем камеру так, чтобы точка под курсором осталась на месте
    const deltaX = worldX - newWorldX
    const deltaY = worldY - newWorldY
    
    this.callbacks.onCameraMove(deltaX, deltaY)
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Левая кнопка мыши
      this.isDragging = true
      this.lastPointerPosition = { x: event.clientX, y: event.clientY }
      this.element.style.cursor = 'grabbing'
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const deltaX = (event.clientX - this.lastPointerPosition.x) / this.callbacks.getCurrentZoom()
      const deltaY = (event.clientY - this.lastPointerPosition.y) / this.callbacks.getCurrentZoom()
      
      this.callbacks.onCameraMove(-deltaX, -deltaY)
      
      this.lastPointerPosition = { x: event.clientX, y: event.clientY }
    }
  }

  private handleMouseUp(): void {
    this.isDragging = false
    this.element.style.cursor = 'grab'
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault()
    
    // Обновляем карту указателей
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i]
      this.pointers.set(touch.identifier, { x: touch.clientX, y: touch.clientY })
    }

    if (event.touches.length === 1) {
      // Одно касание - начинаем перетаскивание
      const touch = event.touches[0]
      this.isDragging = true
      this.lastPointerPosition = { x: touch.clientX, y: touch.clientY }
    } else if (event.touches.length === 2) {
      // Два касания - начинаем масштабирование
      this.isDragging = false
      this.lastPinchDistance = this.getPinchDistance(event.touches)
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault()

    if (event.touches.length === 1 && this.isDragging) {
      // Перетаскивание одним пальцем
      const touch = event.touches[0]
      const deltaX = (touch.clientX - this.lastPointerPosition.x) / this.callbacks.getCurrentZoom()
      const deltaY = (touch.clientY - this.lastPointerPosition.y) / this.callbacks.getCurrentZoom()
      
      this.callbacks.onCameraMove(-deltaX, -deltaY)
      
      this.lastPointerPosition = { x: touch.clientX, y: touch.clientY }
    } else if (event.touches.length === 2) {
      // Масштабирование двумя пальцами
      const currentDistance = this.getPinchDistance(event.touches)
      
      if (this.lastPinchDistance > 0) {
        const zoomFactor = currentDistance / this.lastPinchDistance
        const currentZoom = this.callbacks.getCurrentZoom()
        const newZoom = currentZoom * zoomFactor
        
        // Получаем центр между двумя пальцами
        const rect = this.element.getBoundingClientRect()
        const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left
        const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top
        
        // Получаем текущую позицию камеры
        const currentCamera = this.callbacks.getCurrentCamera()
        
        // Вычисляем мировые координаты центра жеста до зума
        const worldX = (centerX / currentZoom) + currentCamera.x
        const worldY = (centerY / currentZoom) + currentCamera.y
        
        // Применяем новый зум
        this.callbacks.onZoomChange(newZoom)
        
        // Вычисляем новые мировые координаты того же центра после зума
        const newWorldX = (centerX / newZoom) + currentCamera.x
        const newWorldY = (centerY / newZoom) + currentCamera.y
        
        // Сдвигаем камеру так, чтобы центр жеста остался на месте
        const deltaX = worldX - newWorldX
        const deltaY = worldY - newWorldY
        
        this.callbacks.onCameraMove(deltaX, deltaY)
      }
      
      this.lastPinchDistance = currentDistance
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault()
    
    // Удаляем завершенные касания из карты
    const activeIds = new Set(Array.from(event.touches).map(touch => touch.identifier))
    for (const [id] of this.pointers) {
      if (!activeIds.has(id)) {
        this.pointers.delete(id)
      }
    }

    if (event.touches.length === 0) {
      // Все касания завершены
      this.isDragging = false
      this.lastPinchDistance = 0
    } else if (event.touches.length === 1) {
      // Остался один палец - переключаемся на перетаскивание
      const touch = event.touches[0]
      this.isDragging = true
      this.lastPointerPosition = { x: touch.clientX, y: touch.clientY }
      this.lastPinchDistance = 0
    }
  }

  private getPinchDistance(touches: TouchList): number {
    if (touches.length < 2) return 0
    
    const touch1 = touches[0]
    const touch2 = touches[1]
    
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    
    return Math.sqrt(dx * dx + dy * dy)
  }

  public destroy(): void {
    // Удаляем все обработчики событий
    this.element.removeEventListener('contextmenu', (e) => e.preventDefault())
    this.element.removeEventListener('wheel', this.handleWheel.bind(this))
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this))
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this))
    this.element.removeEventListener('mouseleave', this.handleMouseUp.bind(this))
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener('touchcancel', this.handleTouchEnd.bind(this))
    
    this.pointers.clear()
  }
}
