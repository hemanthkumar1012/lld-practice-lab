'use client'

import { cn } from '@/lib/utils'
import { LayoutDashboard, Library, History } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/problems', label: 'Problem Library', icon: Library, exact: false },
  { href: '/history', label: 'Attempt History', icon: History, exact: false },
]

export function SidebarNav({
  variant = 'sidebar',
}: {
  variant?: 'sidebar' | 'top'
}) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        variant === 'sidebar'
          ? 'flex flex-col gap-1'
          : 'flex items-center gap-1 overflow-x-auto',
      )}
      aria-label="Primary"
    >
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
              variant === 'sidebar' ? 'px-2.5 py-2' : 'px-3 py-1.5',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
