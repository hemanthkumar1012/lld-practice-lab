import { SidebarNav } from '@/components/sidebar-nav'
import { Boxes } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
        <Boxes className="size-4.5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight">
          LLD Practice Lab
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          design · reason · review
        </span>
      </span>
    </Link>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <div className="px-1">
          <Brand />
        </div>
        <div className="mt-8 flex-1">
          <p className="px-2.5 pb-2 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Practice
          </p>
          <SidebarNav />
        </div>
        <div className="rounded-lg border border-sidebar-border bg-background/40 p-3">
          <p className="text-xs font-medium">MVP preview</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Feedback shown is illustrative. Supabase persistence and AI
            evaluation connect next.
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <SidebarNav variant="top" />
      </header>

      <div className="flex min-w-0 flex-col">{children}</div>
    </div>
  )
}

/** Consistent page header used across routes. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  )
}
