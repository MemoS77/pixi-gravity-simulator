enum CosmicBody {
  Planet = 'Planet',
  Star = 'Star',
  NeutronStar = 'NeutronStar',
  BlackHole = 'BlackHole',
}

interface BodyInfo {
  density: number // условная шкала 1–100000
  color: string
}

export const CosmicBodies: Record<CosmicBody, BodyInfo> = {
  [CosmicBody.Planet]: { density: 0.3, color: '#dde' },
  [CosmicBody.Star]: { density: 1, color: 'yellow' },
  [CosmicBody.NeutronStar]: { density: 10, color: 'blue' },
  [CosmicBody.BlackHole]: { density: 100, color: 'black' },
}

interface Result {
  type: CosmicBody
  color: string
  density: number
}

/**
 * Классифицирует по массе (условно в земных массах).
 */
export function classifyBody(mass: number): Result {
  if (mass < 1000)
    return { type: CosmicBody.Planet, ...CosmicBodies[CosmicBody.Planet] }
  if (mass < 20000)
    return { type: CosmicBody.Star, ...CosmicBodies[CosmicBody.Star] }
  if (mass < 300000)
    return {
      type: CosmicBody.NeutronStar,
      ...CosmicBodies[CosmicBody.NeutronStar],
    }

  return { type: CosmicBody.BlackHole, ...CosmicBodies[CosmicBody.BlackHole] }
}
