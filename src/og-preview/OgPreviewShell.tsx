import type { ReactNode } from 'react'
import { OgPreviewBand } from './OgPreviewBand'
import './og-preview.css'

type Props = {
  children: ReactNode
  /** Used by the recorder to tag which beat body is mounted. */
  stage?: string
}

export function OgPreviewShell({ children, stage }: Props) {
  return (
    <div className="og-preview-root" data-mode="light" data-og-stage={stage ?? ''}>
      <OgPreviewBand />
      <div className="og-preview-body" data-og-body="true">
        {children}
      </div>
    </div>
  )
}
