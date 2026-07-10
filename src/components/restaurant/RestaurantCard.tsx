import { Clock, MapPin, ShoppingBag } from "lucide-react"
import { CrowdBadge } from "@/components/restaurant/CrowdBadge"
import { motionStyle } from "@/lib/animation/motion"
import type { RestaurantCardViewModel } from "@/lib/mappers/restaurant.mapper"
import { cn } from "@/lib/utils/cn"

export function RestaurantCard({ restaurant }: { restaurant: RestaurantCardViewModel }) {
  const visibleTags = restaurant.tags.slice(0, 2)

  return (
    <article
      className="restaurant-card group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_28px_-18px_rgba(16,24,40,0.22)] transition-[box-shadow,transform] active:scale-[0.995] motion-reduce:transition-none sm:hover:-translate-y-0.5 sm:hover:shadow-[0_3px_10px_rgba(16,24,40,0.06),0_16px_34px_-18px_rgba(16,24,40,0.26)]"
      style={motionStyle(180)}
    >
      <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 p-3">
        <div className="relative h-full min-h-[122px] overflow-hidden rounded-xl bg-muted">
          <img
            src={restaurant.coverImage}
            alt={`${restaurant.name} 餐點照片`}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01] motion-reduce:transition-none"
            loading="lazy"
          />
          {restaurant.sponsorLabel !== null && (
            <span
              className={cn(
                "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                restaurant.sponsorLabel === "贊助"
                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  : "bg-white/90 text-primary ring-1 ring-border",
              )}
            >
              {restaurant.sponsorLabel}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[17px] font-bold leading-tight text-foreground">{restaurant.name}</h3>
              <p className="mt-1 text-sm font-semibold text-foreground/90">{restaurant.primarySignalLabel}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold",
                restaurant.isOpen ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
              )}
            >
              {restaurant.openLabel}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {restaurant.distanceLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5 shrink-0" aria-hidden="true" />
              {restaurant.waitTimeLabel}
            </span>
          </div>

          <div className="mt-2">
            <CrowdBadge level={restaurant.crowdLevel} compact />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{restaurant.categoryLabel}</span>
            {visibleTags.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
            <span className="min-w-0 truncate text-[11px] text-muted-foreground">{restaurant.freshnessLabel}</span>
            {restaurant.hasOnlineOrder && restaurant.isOpen ? (
              <a
                href={restaurant.onlineOrderUrl ?? "#online-order-placeholder"}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-[0.995]"
              >
                <ShoppingBag className="size-3.5" aria-hidden="true" />
                線上點餐
              </a>
            ) : (
              <a href="#restaurant-detail-placeholder" className="shrink-0 text-xs font-semibold text-primary">
                {restaurant.isOpen ? "查看詳情" : "查看營業時間"}
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
