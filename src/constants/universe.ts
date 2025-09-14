/**
 * Константы для размеров и параметров вселенной
 */

// Размеры вселенной
export const UNIVERSE_WIDTH = 20000
export const UNIVERSE_HEIGHT = 20000
export const DEFAULT_PLANETS_COUNT = 5000
export const MAX_RANDOM_MASS = 1000

// Параметры камеры/viewport
export const DEFAULT_ZOOM = 1
export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 5
export const ZOOM_STEP = 0.1

// Стиль границ вселенной
export const UNIVERSE_BORDER_COLOR = 0x444444
export const UNIVERSE_BORDER_WIDTH = 9

// Оптимизация физических расчетов
export const MAX_INTERACTION_DISTANCE = 1500 // Максимальное расстояние для гравитационного взаимодействия
export const MIN_FORCE_THRESHOLD = 0.01 // Минимальная сила, ниже которой взаимодействие игнорируется
export const SPATIAL_GRID_SIZE = 500 // Размер ячейки для пространственного разбиения
export const MAX_OBJECTS_PER_CELL = 50 // Максимальное количество объектов в ячейке для детального расчета
