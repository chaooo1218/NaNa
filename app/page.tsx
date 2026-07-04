"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { MapPin } from "lucide-react"
import { HomeHeader } from "@/components/home-header"
import { FilterChips } from "@/components/filter-chips"
import { RestaurantCard } from "@/components/restaurant-card"
import { StoreMap } from "@/components/store-map"
import { restaurants } from "@/lib/restaurants"

type LocationState = {
  status: "idle" | "prompt" | "locating" | "allowed" | "denied" | "unavailable"
  label: string
}

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [activeChips, setActiveChips] = useState<string[]>([])
  const [location, setLocation] = useState<LocationState>({
    status: "idle",
    label: "尚未確認位置",
  })

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

  const openSearch = () => {
    setFocused(true)
    if (location.status === "idle") {
      setLocation({ status: "prompt", label: "尚未確認位置" })
    }
  }

  const requestPhoneLocation = () => {
    if (!navigator.geolocation) {
      setLocation({ status: "unavailable", label: "此裝置不支援定位" })
      return
    }

    setLocation({ status: "locating", label: "定位中" })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({
          status: "allowed",
          label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        })
      },
      () => {
        setLocation({ status: "denied", label: "未使用手機位置" })
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      },
    )
  }

  const skipPhoneLocation = () => {
    setLocation({ status: "denied", label: "未使用手機位置" })
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-background">
      <section className="nana-brand-banner" aria-label="NaNa 品牌橫幅">
        <div className="nana-wordmark" aria-label="NaNa">
          <span>N</span>
          <span>a</span>
          <span>N</span>
          <span>a</span>
        </div>
      </section>

      <HomeHeader
        query={query}
        setQuery={setQuery}
        focused={focused}
        onFocus={openSearch}
        onClose={() => {
          setFocused(false)
          setQuery("")
        }}
      />

      <main className="px-5 pb-10">
        {focused && (
          <section className="animate-reveal-up pt-1" aria-label="附近店家地圖">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">附近店家</h2>
              <span className="text-xs text-muted-foreground">
                {restaurants.length} 間店家同步中
              </span>
            </div>
            <div className="relative">
              {location.status === "prompt" && (
                <div className="absolute inset-x-3 top-3 z-20 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-lg backdrop-blur">
                  <p className="text-sm font-semibold text-foreground">是否使用本身手機位置？</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={requestPhoneLocation}
                      className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground active:scale-[0.98]"
                    >
                      使用手機位置
                    </button>
                    <button
                      type="button"
                      onClick={skipPhoneLocation}
                      className="flex-1 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground active:scale-[0.98]"
                    >
                      暫不使用
                    </button>
                  </div>
                </div>
              )}
              <StoreMap currentLocationLabel={location.label} />
            </div>
          </section>
        )}

        <section className="sticky top-[132px] z-20 -mx-5 bg-background/85 px-5 py-3 backdrop-blur-xl">
          <FilterChips active={activeChips} onToggle={toggleChip} />
        </section>

        <section aria-label="店家清單" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-foreground text-balance">
              {focused ? "搜尋結果" : "即時店家資訊"}
            </h2>
            <span className="text-xs text-muted-foreground">共 {filtered.length} 間</span>
          </div>

          {filtered.length > 0 ? (
            filtered.map((r) => <RestaurantCard key={r.id} r={r} />)
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border py-14 text-center">
              <MapPin className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">找不到符合條件的店家</p>
              <p className="text-xs text-muted-foreground">請調整搜尋關鍵字或篩選條件</p>
            </div>
          )}
        </section>
      </main>

      <footer className="company-footer">
        <Image
          src="/cai-xu-logo.png"
          alt="采旭資訊科技有限公司 Logo"
          width={118}
          height={98}
          className="h-auto w-24 object-contain"
          priority
        />
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">采旭資訊科技有限公司</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">連絡電話:0988944187</p>
        </div>
      </footer>
    </div>
  )
}
