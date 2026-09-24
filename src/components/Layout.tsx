import { Outlet } from 'react-router-dom'
import { Disclaimer } from './Disclaimer'
import { Nav } from './Nav'
import { StatusStrip } from './StatusStrip'

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <StatusStrip />
      <Nav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-paper-muted px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-3">
          <Disclaimer compact />
          <p className="text-xs text-ink/50">
            Fristående övning till medborgarskapsprovet, baserad på UHR:s Sverige i fokus.
          </p>
        </div>
      </footer>
    </div>
  )
}
