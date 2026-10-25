import type { ChapterContent } from '../types'
import { arbetsmarknadOchPrivatekonomi } from './arbetsmarknad-och-privatekonomi'
import { enSekularStatOchEttMangreligiostLand } from './en-sekular-stat-och-ett-mangreligiost-land'
import { lagOchRatt } from './lag-och-ratt'
import { landetSverige } from './landet-sverige'
import { manskligaRattigheter } from './manskliga-rattigheter'
import { mediernasRoll } from './mediernas-roll'
import { politiskaValOchPartier } from './politiska-val-och-partier'
import { saHarStyrsSverige } from './sa-har-styrs-sverige'
import { sverigeOchOmvarlden } from './sverige-och-omvarlden'
import { sverigesDemokratiskaSystem } from './sveriges-demokratiska-system'
import { sverigesModernaHistoria } from './sveriges-moderna-historia'
import { traditionerOchHogtider } from './traditioner-och-hogtider'
import { valfardssamhallet } from './valfardssamhallet'

/**
 * Alla kapitel med frågor, i bokens ordning. Bara för tester och byggskript: appen laddar
 * kapitlen ett i taget via ./load.ts.
 */
export const allChapters: ChapterContent[] = [
  landetSverige,
  sverigesDemokratiskaSystem,
  saHarStyrsSverige,
  politiskaValOchPartier,
  lagOchRatt,
  mediernasRoll,
  manskligaRattigheter,
  arbetsmarknadOchPrivatekonomi,
  valfardssamhallet,
  sverigesModernaHistoria,
  sverigeOchOmvarlden,
  enSekularStatOchEttMangreligiostLand,
  traditionerOchHogtider,
]
