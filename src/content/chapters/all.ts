import type { ChapterContent } from '../types.js'
import { arbetsmarknadOchPrivatekonomi } from './arbetsmarknad-och-privatekonomi.js'
import { enSekularStatOchEttMangreligiostLand } from './en-sekular-stat-och-ett-mangreligiost-land.js'
import { lagOchRatt } from './lag-och-ratt.js'
import { landetSverige } from './landet-sverige.js'
import { manskligaRattigheter } from './manskliga-rattigheter.js'
import { mediernasRoll } from './mediernas-roll.js'
import { politiskaValOchPartier } from './politiska-val-och-partier.js'
import { saHarStyrsSverige } from './sa-har-styrs-sverige.js'
import { sverigeOchOmvarlden } from './sverige-och-omvarlden.js'
import { sverigesDemokratiskaSystem } from './sveriges-demokratiska-system.js'
import { sverigesModernaHistoria } from './sveriges-moderna-historia.js'
import { traditionerOchHogtider } from './traditioner-och-hogtider.js'
import { valfardssamhallet } from './valfardssamhallet.js'

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
