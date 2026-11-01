import { describe, expect, it } from 'vitest'
import { WATCHED, pageText } from '../check-sources.mjs'

describe('source watchlist', () => {
  it('watches the sources behind the historical result and Swedish-test status', () => {
    expect(WATCHED).toContainEqual(
      expect.objectContaining({ id: 'uhr-resultat-samhallskunskap-2026-08' }),
    )
    expect(WATCHED).toContainEqual(
      expect.objectContaining({ id: 'mv-svenska-provet-kan-flyttas-fram' }),
    )
    expect(WATCHED).toContainEqual(expect.objectContaining({ id: 'riksdagen-kommunallag-2017-725' }))
    expect(WATCHED).toContainEqual(expect.objectContaining({ id: 'riksdagen-skarpta-regler-unga' }))
    expect(WATCHED).toContainEqual(expect.objectContaining({ id: 'iaf-nya-regler-arbetsloshetsforsakring' }))
  })

  it('keeps readable main content while removing navigation and scripts', () => {
    expect(pageText('<nav>Hoppa</nav><main><h1>Resultat</h1><p>28 av 40</p><script>ignore()</script></main>')).toBe(
      'Resultat\n28 av 40',
    )
  })
})
