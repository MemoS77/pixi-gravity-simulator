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

const BODY_DATA: Record<CosmicBody, BodyInfo> = {
  [CosmicBody.Planet]: { density: 0.2, color: '#dde' },
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
    return { type: CosmicBody.Planet, ...BODY_DATA[CosmicBody.Planet] }
  if (mass < 10000)
    return { type: CosmicBody.Star, ...BODY_DATA[CosmicBody.Star] }
  if (mass < 100000)
    return {
      type: CosmicBody.NeutronStar,
      ...BODY_DATA[CosmicBody.NeutronStar],
    }

  return { type: CosmicBody.BlackHole, ...BODY_DATA[CosmicBody.BlackHole] }
}
