"use client"

import { Navigation } from "lucide-react"
import { CROWD_META, restaurants } from "@/lib/restaurants"
import { cn } from "@/lib/utils"

export function StoreMap() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-border/70 bg-[oklch(0.97_0.01_255)] shadow-inner">
      {/* stylised streets */}
      <div className="absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute left-0 right-0 top-[30%] h-3 -rotate-6 bg-card/90" />
        <div className="absolute left-0 right-0 top-[62%] h-4 rotate-3 bg-card/90" />
        <div className="absolute bottom-0 left-[26%] top-0 w-3 rotate-6 bg-card/90" />
        <div className="absolute bottom-0 left-[64%] top-0 w-4 -rotate-3 bg-card/90" />
        <div className="absolute left-[8%] top-[8%] size-16 rounded-xl bg-primary/5" />
        <div className="absolute right-[10%] top-[16%] size-20 rounded-xl bg-primary/5" />
        <div className="absolute bottom-[12%] left-[38%] size-24 rounded-xl bg-primary/5" />
      </div>

      {/* current location */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: "50%", top: "48%" }}
      >
        <span className="relative flex size-5 items-center justify-center">
          <span className="absolute inline-flex size-10 animate-ping rounded-full bg-primary/20" />
          <span className="relative size-4 rounded-full border-2 border-card bg-primary shadow" />
        </span>
      </div>

      {/* store pins */}
      {restaurants.map((r, i) => (
        <button
          key={r.id}
          type="button"
          className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-300 hover:z-10 hover:-translate-y-[110%]"
          style={{
            left: `${r.map.x}%`,
            top: `${r.map.y}%`,
            animation: `pin-in 0.5s ${0.06 * i}s both`,
          }}
          aria-label={`${r.name}，目前${CROWD_META[r.crowd].label}`}
        >
          <span className="flex flex-col items-center">
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-lg",
              )}
            >
              <span className={cn("size-3 rounded-full", CROWD_META[r.crowd].dot)} />
            </span>
            <span className="-mt-0.5 size-0 border-x-[5px] border-t-[7px] border-x-transparent border-t-primary" />
          </span>
        </button>
      ))}

      {/* legend + recenter */}
      <div className="absolute left-3 top-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-card/85 px-3 py-2 text-[11px] font-medium backdrop-blur">
        {(["low", "normal", "high", "packed"] as const).map((lvl) => (
          <span key={lvl} className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className={cn("size-2 rounded-full", CROWD_META[lvl].dot)} />
            {CROWD_META[lvl].label}
          </span>
        ))}
      </div>

      <button
        type="button"
        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-2 text-xs font-medium text-primary shadow backdrop-blur transition-transform active:scale-95"
      >
        <Navigation className="size-3.5" />
        回到目前位置
      </button>
    </div>
  )
}
