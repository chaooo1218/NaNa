import { useGSAP } from "@gsap/react"
import { ArrowDownUp, MapPin, Search, SlidersHorizontal, X } from "lucide-react"
import { useMemo, useRef, useState, type ReactNode } from "react"
import gsap from "gsap"
import { RestaurantCard } from "@/components/restaurant/RestaurantCard"
import { useRestaurantExplorerState } from "@/hooks/useRestaurantExplorerState"
import { motion, motionPreset, motionStyle, prefersReducedMotion } from "@/lib/animation/motion"
import { toRestaurantCardViewModel } from "@/lib/mappers/restaurant.mapper"
import { cn } from "@/lib/utils/cn"
import type { RestaurantCategory, RestaurantSortOption } from "@/types/restaurant"

gsap.registerPlugin(useGSAP)

const mealOptions: Array<{ value: RestaurantCategory; label: string }> = [
  { value: "drinks", label: "飲料" },
  { value: "bento", label: "便當" },
  { value: "ramen", label: "拉麵" },
  { value: "breakfast", label: "早午餐" },
  { value: "izakaya", label: "晚餐" },
]

const sortOptions: Array<{ value: RestaurantSortOption; label: string }> = [
  { value: "recommended", label: "推薦" },
  { value: "distance", label: "距離" },
  { value: "waitTime", label: "等待" },
  { value: "crowdLevel", label: "人流" },
]

export function RestaurantExplorerIsland() {
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLElement>(null)
  const [withinTenMinutes, setWithinTenMinutes] = useState(false)
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const explorer = useRestaurantExplorerState()

  const visibleRestaurants = useMemo(
    () =>
      explorer.restaurants.filter(
        (restaurant) =>
          !withinTenMinutes ||
          (restaurant.estimatedWaitMinutes !== null && restaurant.estimatedWaitMinutes <= 10),
      ),
    [explorer.restaurants, withinTenMinutes],
  )
  const cardViewModels = useMemo(() => visibleRestaurants.map(toRestaurantCardViewModel), [visibleRestaurants])

  const hasActiveFilters =
    explorer.keyword !== "" ||
    explorer.category !== null ||
    explorer.openNow !== null ||
    explorer.crowdLevel !== null ||
    explorer.hasOnlineOrder !== null ||
    explorer.isSponsored !== null ||
    explorer.sort !== "recommended" ||
    withinTenMinutes

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      gsap.fromTo(
        [".home-hero", ".search-shell", ".quick-filters", ".map-placeholder"],
        { autoAlpha: 0, y: motion.distance.enterY },
        {
          ...motionPreset.fadeIn,
          stagger: motion.stagger.compact,
        },
      )
      gsap.fromTo(".restaurant-card", motionPreset.cardEnterFrom, {
        autoAlpha: 1,
        y: 0,
        duration: motion.duration.slow,
        ease: motion.easing.standard,
        stagger: motion.stagger.list,
      })
    },
    { scope: rootRef },
  )

  useGSAP(
    () => {
      if (prefersReducedMotion() || listRef.current === null) return

      gsap.fromTo(
        listRef.current,
        { autoAlpha: 0.92, y: 4 },
        {
          ...motionPreset.listRefresh,
          overwrite: "auto",
        },
      )
    },
    { dependencies: [explorer.keyword, explorer.category, explorer.crowdLevel, explorer.sort, withinTenMinutes], scope: rootRef },
  )

  const resetAllFilters = () => {
    setWithinTenMinutes(false)
    explorer.resetFilters()
  }

  return (
    <div ref={rootRef} className="px-4 pb-8 sm:px-5">
      <section className="home-hero pt-3">
        <p className="text-xs font-semibold text-primary">輔仁大學 514 巷 即時人流</p>
        <h1 className="mt-1 text-[24px] font-bold leading-tight tracking-normal text-foreground">
          輔大 514 巷，現在去哪不用等？
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          查看附近店家的人流狀態、等待時間與線上點餐資訊。
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          測試資料・約 5 秒更新・非影像人流模組建置中
        </p>
      </section>

      <div className="search-shell mt-4 flex items-center gap-2.5">
        <div className="flex h-12 flex-1 items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 shadow-sm transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            value={explorer.keyword}
            onChange={(event) => explorer.setKeyword(event.target.value)}
            placeholder="搜尋店名、餐點或附近想吃的類型"
            className="h-full w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {explorer.keyword !== "" && (
            <button
              type="button"
              onClick={() => explorer.setKeyword("")}
              aria-label="清除搜尋"
              className="rounded-full p-1 text-muted-foreground active:bg-secondary"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="顯示更多篩選"
          onClick={() => setShowMoreFilters((value) => !value)}
          aria-pressed={showMoreFilters}
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm transition-transform active:scale-[0.995]"
        >
          <SlidersHorizontal className="size-5" aria-hidden="true" />
        </button>
      </div>

      <section className="quick-filters sticky top-[92px] z-20 -mx-4 mt-4 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5">
        <div className="flex items-center gap-2">
          <Chip active={explorer.crowdLevel === "low"} onClick={() => explorer.setCrowdLevel(toggleValue(explorer.crowdLevel, "low"))}>
            人少
          </Chip>
          <Chip active={withinTenMinutes} onClick={() => setWithinTenMinutes((value) => !value)}>
            10 分鐘內
          </Chip>
          <Chip active={explorer.openNow === true} onClick={() => explorer.setOpenNow(explorer.openNow === true ? null : true)}>
            營業中
          </Chip>
        </div>

        <div className="mt-2 -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max items-center gap-2 pb-1">
            {mealOptions.map((option) => (
              <Chip
                key={option.value}
                active={explorer.category === option.value}
                onClick={() => explorer.setCategory(explorer.category === option.value ? null : option.value)}
                muted
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        {showMoreFilters && (
          <div className="mt-2 flex items-center gap-2">
            <Chip
              active={explorer.hasOnlineOrder === true}
              onClick={() => explorer.setHasOnlineOrder(explorer.hasOnlineOrder === true ? null : true)}
              muted
            >
              線上點餐
            </Chip>
            <Chip
              active={explorer.sort === "recommended"}
              onClick={() => explorer.setSort("recommended")}
              muted
            >
              推薦
            </Chip>
            <Chip
              active={explorer.isSponsored === true}
              onClick={() => explorer.setIsSponsored(explorer.isSponsored === true ? null : true)}
              muted
            >
              贊助
            </Chip>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-all active:scale-[0.995]"
              >
                清除
              </button>
            )}
          </div>
        )}
      </section>

      <section className="map-placeholder mt-1" aria-label="地圖預留區">
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/60 p-4">
          <div className="absolute inset-0 opacity-45" aria-hidden="true">
            <div className="absolute inset-x-0 top-1/3 h-px bg-border" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-border" />
            <div className="absolute inset-y-0 left-1/3 w-px bg-border" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-border" />
          </div>
          <div className="relative">
            <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-border">
              建置中
            </span>
            <h2 className="mt-2 text-sm font-bold text-foreground">514 巷店家地圖建置中</h2>
            <p className="mt-1 max-w-[260px] text-xs leading-5 text-muted-foreground">
              目前先提供店家列表、人流狀態與線上點餐。未接入 Mapbox，也不顯示假精準定位。
            </p>
            <div className="mt-3 flex gap-2" aria-hidden="true">
              <span className="size-2 rounded-full bg-primary/45" />
              <span className="size-2 rounded-full bg-primary/25" />
              <span className="size-2 rounded-full bg-primary/20" />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4 mt-4 flex items-center gap-2" aria-label="排序">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <ArrowDownUp className="size-4" aria-hidden="true" />
        </span>
        <div className="grid flex-1 grid-cols-4 gap-1 rounded-2xl bg-secondary p-1">
          {sortOptions.map((option) => {
            const active = explorer.sort === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => explorer.setSort(option.value)}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-xl text-xs font-semibold transition-all active:scale-[0.995]",
                  active ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
                style={motionStyle()}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </section>

      {explorer.phase === "loading" && explorer.restaurants.length === 0 && (
        <div className="space-y-3" aria-label="餐廳資料載入中">
          <div className="h-40 rounded-2xl bg-muted" />
          <div className="h-40 rounded-2xl bg-muted" />
        </div>
      )}

      {explorer.phase === "error" && (
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-sm font-semibold text-foreground">暫時無法取得店家資料</p>
          <p className="mt-1 text-xs text-muted-foreground">請稍後再試，系統不會顯示內部錯誤內容。</p>
        </div>
      )}

      {explorer.hasStaleData && explorer.phase !== "error" && (
        <div
          className="mb-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground transition-opacity"
          style={motionStyle(180)}
        >
          資料可能延遲，畫面保留最後一次成功資料。
        </div>
      )}

      {(explorer.phase === "ready" || explorer.phase === "empty" || explorer.restaurants.length > 0) && (
        <section id="restaurants" ref={listRef} aria-label="餐廳列表" className="restaurant-list flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-foreground text-balance">附近店家</h2>
            <span className="text-xs text-muted-foreground">共 {cardViewModels.length} 間</span>
          </div>

          {cardViewModels.length > 0 ? (
            cardViewModels.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
              <MapPin className="size-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">沒有符合條件的店家</p>
              <p className="text-xs text-muted-foreground">請調整搜尋或篩選條件。</p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function Chip({
  active,
  muted = false,
  children,
  onClick,
}: {
  active: boolean
  muted?: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.995]",
        active
          ? "border-primary/35 bg-primary/10 text-primary shadow-sm"
          : muted
            ? "border-border bg-card text-foreground/75 hover:border-primary/30"
            : "border-border bg-card text-foreground hover:border-primary/30",
      )}
      style={motionStyle()}
    >
      {children}
    </button>
  )
}

const toggleValue = <T extends string>(current: T | null, next: T) => (current === next ? null : next)
