import { useParams } from 'react-router-dom'
import { OgPreviewShell } from '../og-preview/OgPreviewShell'
import { BeatListen } from '../og-preview/stages/BeatListen'
import { BeatPlan } from '../og-preview/stages/BeatPlan'
import { BeatQuiz } from '../og-preview/stages/BeatQuiz'
import { BeatTagline } from '../og-preview/stages/BeatTagline'

const stages = {
  listen: () => <BeatListen />,
  quiz: () => <BeatQuiz />,
  plan: () => <BeatPlan />,
  tagline: () => <BeatTagline />,
  empty: () => null,
} as const

export function OgPreviewStage() {
  const { stage = 'listen' } = useParams<{ stage: string }>()
  const key = stage in stages ? (stage as keyof typeof stages) : 'listen'
  const Body = stages[key]

  return (
    <OgPreviewShell stage={key}>
      <Body />
    </OgPreviewShell>
  )
}
