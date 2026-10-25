import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { failed: boolean }

/**
 * Catches a page that fails to load, for example a chapter file when the connection drops, or an
 * old page left open across a deploy whose files are gone. Reloading fetches the current version.
 */
export class PageErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section role="alert" className="surface-raised space-y-3 p-5">
        <h1 className="text-2xl font-semibold">Sidan kunde inte laddas</h1>
        <p className="text-ink-2">
          Kontrollera din internetanslutning och försök igen. Sidan kan också ha uppdaterats sedan du
          öppnade den.
        </p>
        <button type="button" onClick={() => window.location.reload()} className="mb-btn mb-btn--primary">
          Ladda om sidan
        </button>
      </section>
    )
  }
}
