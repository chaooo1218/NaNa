"use client"

import { useState, type PointerEvent } from "react"
import { Navigation } from "lucide-react"
import { CROWD_META, restaurants } from "@/lib/restaurants"
import { cn } from "@/lib/utils"

type DragState = {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
} | null

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export function StoreMap({
  currentLocationLabel,
}: {
  currentLocationLabel: string
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState<DragState>(null)

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return

    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    })
  }

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return

    setOffset({
      x: clamp(drag.originX + event.clientX - drag.startX, -92, 92),
      y: clamp(drag.originY + event.clientY - drag.startY, -70, 70),
    })
  }

  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return
    setDrag(null)
  }

  return (
    <div
      className={cn(
        "relative h-64 w-full overflow-hidden rounded-3xl border border-border/70 bg-[oklch(0.97_0.01_255)] shadow-inner",
        drag ? "cursor-grabbing" : "cursor-grab",
      )}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      role="application"
      aria-label="可拖曳的附近店家地圖"
    >
      <div
        className="absolute inset-[-72px] touch-none select-none transition-transform duration-150 ease-out"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transitionDuration: drag ? "0ms" : "150ms",
        }}
      >
        <div className="absolute inset-0 opacity-70" aria-hidden>
          <div className="absolute left-[-4%] right-[-4%] top-[30%] h-3 -rotate-6 bg-card/90" />
          <div className="absolute left-[-4%] right-[-4%] top-[62%] h-4 rotate-3 bg-card/90" />
          <div className="absolute bottom-[-4%] left-[26%] top-[-4%] w-3 rotate-6 bg-card/90" />
          <div className="absolute bottom-[-4%] left-[64%] top-[-4%] w-4 -rotate-3 bg-card/90" />
          <div className="absolute left-[8%] top-[8%] size-16 rounded-xl bg-primary/5" />
          <div className="absolute right-[10%] top-[16%] size-20 rounded-xl bg-primary/5" />
          <div className="absolute bottom-[12%] left-[38%] size-24 rounded-xl bg-primary/5" />
        </div>

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: "50%", top: "48%" }}
        >
          <span className="relative flex size-5 items-center justify-center">
            <span className="absolute inline-flex size-10 animate-ping rounded-full bg-primary/20" />
            <span className="relative size-4 rounded-full border-2 border-card bg-primary shadow" />
          </span>
        </div>

        {restaurants.map((r, i) => {
          const status = r.open ? r.crowd : "closed"
          const meta = CROWD_META[status]

          return (
            <button
              key={r.id}
              type="button"
              className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-300 hover:z-10 hover:-translate-y-[110%]"
              style={{
                left: `${r.map.x}%`,
                top: `${r.map.y}%`,
                animation: `pin-in 0.5s ${0.06 * i}s both`,
              }}
              aria-label={`${r.name}，目前狀態：${meta.label}${r.advertised ? "，廣告店家" : ""}`}
            >
              <span className="flex flex-col items-center">
                <span
                  className={cn(
                    "map-pin-core",
                    r.advertised
                      ? "ad-map-pin"
                      : "border-card bg-primary text-primary-foreground shadow-lg",
                  )}
                >
                  <span className={cn("size-3 rounded-full", meta.dot)} />
                </span>
                <span
                  className={cn(
                    "-mt-0.5 size-0 border-x-[5px] border-t-[7px] border-x-transparent",
                    r.advertised ? "border-t-white/55" : "border-t-primary",
                  )}
                />
              </span>
            </button>
          )
        })}
      </div>

      <div className="pointer-events-none absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-2xl bg-card/90 px-3 py-2 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
        目前位置：{currentLocationLabel}
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 flex max-w-[190px] flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-card/85 px-3 py-2 text-[11px] font-medium backdrop-blur">
        {(["low", "normal", "high", "packed", "closed"] as const).map((lvl) => (
          <span key={lvl} className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className={cn("size-2 rounded-full", CROWD_META[lvl].dot)} />
            {CROWD_META[lvl].label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full bg-white/70 shadow-[0_0_8px_rgb(94_234_212_/_0.5)]" />
          廣告
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOffset({ x: 0, y: 0 })}
        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-2 text-xs font-medium text-primary shadow backdrop-blur transition-transform active:scale-95"
      >
        <Navigation className="size-3.5" />
        回到目前位置
      </button>
    </div>
  )
}
