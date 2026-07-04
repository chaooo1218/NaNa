"use client"

import { useMemo, useState } from "react"
import { MapPin } from "lucide-react"
import { HomeHeader } from "@/components/home-header"
import { FilterChips } from "@/components/filter-chips"
import { RestaurantCard } from "@/components/restaurant-card"
import { StoreMap } from "@/components/store-map"
import { restaurants } from "@/lib/restaurants"

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [activeChips, setActiveChips] = useState<string[]>([])

  const toggleChip = (chip: string) =>
    setActiveChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    )

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const q = query.trim()
      const matchQuery =
        !q || r.name.includes(q) || r.category.includes(q) || r.tags.some((t) => t.includes(q))
      const matchChips =
        activeChips.length === 0 || activeChips.every((c) => r.tags.includes(c))
      return matchQuery && matchChips
    })
  }, [query, activeChips])

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-background">
      <HomeHeader
        query={query}
        setQuery={setQuery}
        focused={focused}
        onFocus={() => setFocused(true)}
        onClose={() => {
          setFocused(false)
          setQuery("")
        }}
      />

      <main className="px-5 pb-16">
        {focused && (
          <section className="animate-reveal-up pt-1" aria-label="支援店家地圖">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">附近支援店家</h2>
              <span className="text-xs text-muted-foreground">
                {restaurants.length} 間即時更新中
              </span>
            </div>
            <StoreMap />
          </section>
        )}

        <section className="sticky top-[132px] z-20 -mx-5 bg-background/85 px-5 py-3 backdrop-blur-xl">
          <FilterChips active={activeChips} onToggle={toggleChip} />
        </section>

        <section aria-label="店家列表" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-foreground text-balance">
              {focused ? "搜尋結果" : "現在最適合去"}
            </h2>
            <span className="text-xs text-muted-foreground">
              共 {filtered.length} 間店家
            </span>
          </div>

          {filtered.length > 0 ? (
            filtered.map((r) => <RestaurantCard key={r.id} r={r} />)
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border py-14 text-center">
              <MapPin className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">找不到符合的店家</p>
              <p className="text-xs text-muted-foreground">試著調整搜尋或篩選條件</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
