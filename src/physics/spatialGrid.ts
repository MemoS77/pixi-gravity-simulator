import { PlanetInfo } from '../types'
import { SPATIAL_GRID_SIZE, UNIVERSE_WIDTH, UNIVERSE_HEIGHT } from '../constants/universe'

export interface GridCell {
  objects: PlanetInfo[]
  x: number
  y: number
}

/**
 * Класс для пространственного разбиения объектов на сетку
 * Позволяет быстро находить соседние объекты без проверки всех пар
 */
export class SpatialGrid {
  private grid: Map<string, GridCell> = new Map()
  private cellSize: number
  private cols: number
  private rows: number

  constructor(cellSize: number = SPATIAL_GRID_SIZE) {
    this.cellSize = cellSize
    this.cols = Math.ceil(UNIVERSE_WIDTH / cellSize)
    this.rows = Math.ceil(UNIVERSE_HEIGHT / cellSize)
  }

  /**
   * Очищает сетку и заполняет её объектами
   */
  update(objects: PlanetInfo[]): void {
    this.grid.clear()

    for (const obj of objects) {
      const cellX = Math.floor(obj.position.x / this.cellSize)
      const cellY = Math.floor(obj.position.y / this.cellSize)
      const key = `${cellX},${cellY}`

      if (!this.grid.has(key)) {
        this.grid.set(key, {
          objects: [],
          x: cellX,
          y: cellY
        })
      }

      this.grid.get(key)!.objects.push(obj)
    }
  }

  /**
   * Получает все объекты в ячейке и соседних ячейках
   */
  getNearbyObjects(obj: PlanetInfo): PlanetInfo[] {
    const cellX = Math.floor(obj.position.x / this.cellSize)
    const cellY = Math.floor(obj.position.y / this.cellSize)
    const nearby: PlanetInfo[] = []

    // Проверяем текущую ячейку и 8 соседних
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cellX + dx},${cellY + dy}`
        const cell = this.grid.get(key)

        if (cell) {
          nearby.push(...cell.objects)
        }
      }
    }

    return nearby
  }

  /**
   * Получает все пары объектов, которые могут взаимодействовать
   * Значительно сокращает количество проверок с O(n²) до O(n*k), где k - среднее количество соседей
   */
  getInteractionPairs(): Array<[PlanetInfo, PlanetInfo]> {
    const pairs: Array<[PlanetInfo, PlanetInfo]> = []
    const processed = new Set<PlanetInfo>()

    for (const cell of this.grid.values()) {
      for (let i = 0; i < cell.objects.length; i++) {
        const obj1 = cell.objects[i]
        if (processed.has(obj1)) continue

        // Взаимодействие внутри ячейки
        for (let j = i + 1; j < cell.objects.length; j++) {
          const obj2 = cell.objects[j]
          pairs.push([obj1, obj2])
        }

        // Взаимодействие с соседними ячейками
        const nearby = this.getNearbyObjects(obj1)
        for (const obj2 of nearby) {
          if (obj2 !== obj1 && !processed.has(obj2)) {
            pairs.push([obj1, obj2])
          }
        }

        processed.add(obj1)
      }
    }

    return pairs
  }

  /**
   * Получает статистику сетки для отладки
   */
  getStats(): { totalCells: number; occupiedCells: number; avgObjectsPerCell: number; maxObjectsPerCell: number } {
    const occupiedCells = this.grid.size
    let totalObjects = 0
    let maxObjects = 0

    for (const cell of this.grid.values()) {
      totalObjects += cell.objects.length
      maxObjects = Math.max(maxObjects, cell.objects.length)
    }

    return {
      totalCells: this.cols * this.rows,
      occupiedCells,
      avgObjectsPerCell: occupiedCells > 0 ? totalObjects / occupiedCells : 0,
      maxObjectsPerCell: maxObjects
    }
  }
}
