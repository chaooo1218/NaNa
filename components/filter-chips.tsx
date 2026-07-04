"use client"

import { filterChips } from "@/lib/restaurants"
import { cn } from "@/lib/utils"

export function FilterChips({
  active,
  onToggle,
}: {
  active: string[]
  onToggle: (chip: string) => void
}) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-center gap-2 pb-1">
        {filterChips.map((chip) => {
          const isActive = active.includes(chip)
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onToggle(chip)}
              aria-pressed={isActive}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 active:scale-95",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:text-foreground",
              )}
            >
              {chip}
            </button>
          )
        })}
      </div>
    </div>
  )
}
