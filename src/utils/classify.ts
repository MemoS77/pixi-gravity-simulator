enum CosmicBody {
  Comet = 'Comet',
  Planet = 'Planet',
  GasGiant = 'GasGiant',
  BrownDwarf = 'BrownDwarf',
  Star = 'Star',
  WhiteDwarf = 'WhiteDwarf',
  NeutronStar = 'NeutronStar',
  BlackHole = 'BlackHole',
}

interface BodyInfo {
  density: number // условная шкала 1–100000
  color: string
}

const BODY_DATA: Record<CosmicBody, BodyInfo> = {
  [CosmicBody.Comet]: { density: 1, color: 'lightgray' },
  [CosmicBody.Planet]: { density: 2, color: 'gray' },
  [CosmicBody.GasGiant]: { density: 5, color: 'darkgray' },
  [CosmicBody.BrownDwarf]: { density: 10, color: 'brown' },
  [CosmicBody.Star]: { density: 50, color: 'yellow' },
  [CosmicBody.WhiteDwarf]: { density: 100, color: 'white' },
  [CosmicBody.NeutronStar]: { density: 1000, color: 'darkblue' },
  [CosmicBody.BlackHole]: { density: 100000, color: 'black' },
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
  if (mass < 10)
    return { type: CosmicBody.Comet, ...BODY_DATA[CosmicBody.Comet] }
  if (mass < 100)
    return { type: CosmicBody.Planet, ...BODY_DATA[CosmicBody.Planet] }
  if (mass < 1000)
    return { type: CosmicBody.GasGiant, ...BODY_DATA[CosmicBody.GasGiant] }
  if (mass < 10000)
    return { type: CosmicBody.BrownDwarf, ...BODY_DATA[CosmicBody.BrownDwarf] }
  if (mass < 100000)
    return { type: CosmicBody.Star, ...BODY_DATA[CosmicBody.Star] }
  if (mass < 1000000)
    return { type: CosmicBody.WhiteDwarf, ...BODY_DATA[CosmicBody.WhiteDwarf] }
  if (mass < 10000000)
    return {
      type: CosmicBody.NeutronStar,
      ...BODY_DATA[CosmicBody.NeutronStar],
    }
  return { type: CosmicBody.BlackHole, ...BODY_DATA[CosmicBody.BlackHole] }
}
