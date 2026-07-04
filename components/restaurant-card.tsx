import Image from "next/image"
import { Clock, MapPin, Sparkles } from "lucide-react"
import { CROWD_META, type Restaurant } from "@/lib/restaurants"
import { CrowdMeter } from "@/components/crowd-meter"
import { cn } from "@/lib/utils"

export function RestaurantCard({ r }: { r: Restaurant }) {
  const crowd = CROWD_META[r.crowd]
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-3xl border border-border/70 bg-card",
        "shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.12)]",
        "transition-all duration-300 active:scale-[0.99] hover:shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_36px_-14px_rgba(46,65,123,0.28)]",
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={r.image || "/placeholder.svg"}
          alt={r.name}
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        {r.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/95 px-2.5 py-1 text-[11px] font-medium text-primary-foreground backdrop-blur">
            <Sparkles className="size-3" />
            推薦店家
          </span>
        )}

        <span
          className={cn(
            "absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur",
            r.open ? "bg-card/90 text-foreground" : "bg-foreground/75 text-background",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              r.open ? "bg-crowd-low" : "bg-muted-foreground",
            )}
          />
          {r.open ? "營業中" : "休息中"}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-tight text-foreground">
              {r.name}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{r.category}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={cn("text-sm font-semibold", crowd.token)}>{crowd.label}</span>
            <CrowdMeter level={r.crowd} />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            {r.distanceM}m · 步行 {r.walkMin} 分
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 shrink-0" />
            等待 {r.waitLabel}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-crowd-low/70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-crowd-low" />
            </span>
            {r.updatedLabel}
          </span>
          <span className="text-xs font-medium text-primary">查看詳情</span>
        </div>
      </div>
    </article>
  )
}
