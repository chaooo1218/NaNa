"use client"

import { ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function HomeHeader({
  query,
  setQuery,
  focused,
  onFocus,
  onClose,
}: {
  query: string
  setQuery: (v: string) => void
  focused: boolean
  onFocus: () => void
  onClose: () => void
}) {
  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
      <div className="px-5 pb-3 pt-4">
        {/* location row */}
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-foreground transition-colors active:bg-accent"
          >
            <MapPin className="size-4 text-primary" />
            中原大學附近
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>

          {focused ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-sm font-medium text-primary active:opacity-70"
            >
              取消
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">即時人流查詢</span>
          )}
        </div>

        {/* search row */}
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-12 flex-1 items-center gap-2.5 rounded-2xl border bg-card px-3.5 transition-all duration-200",
              focused
                ? "border-primary ring-4 ring-primary/10"
                : "border-border shadow-sm",
            )}
          >
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={onFocus}
              placeholder="搜尋店家、地區、學校周邊美食"
              className="h-full w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="清除搜尋"
                className="rounded-full p-1 text-muted-foreground active:bg-secondary"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {!focused && (
            <button
              type="button"
              aria-label="篩選"
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95"
            >
              <SlidersHorizontal className="size-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
