import { Info, ShoppingBag, Sparkles, Star, Store } from "lucide-react"
import { CROWD_META, type Restaurant } from "@/lib/restaurants"
import { cn } from "@/lib/utils"

const actions = [
  { label: "線上點餐", icon: ShoppingBag },
  { label: "今日新品", icon: Sparkles },
  { label: "本日推薦", icon: Star },
  { label: "店家資訊", icon: Info },
]

export function RestaurantCard({ r }: { r: Restaurant }) {
  const status = r.open ? r.crowd : "closed"
  const crowd = CROWD_META[status]

  return (
    <article className={cn("card mx-auto", crowd.statusClass)} aria-label={r.name}>
      <section className="info-section">
        <div className="background-design" aria-hidden>
          <div className="circle" />
          <div className="circle" />
          <div className="circle" />
        </div>

        <div className="left-side">
          <div className="weather">
            <div>
              <Store aria-hidden="true" />
            </div>
            <div>{crowd.label}</div>
          </div>
          <div className="temperature">{r.currentPeople} 人</div>
          <div className="range">上限 {r.capacity} 人</div>
        </div>

        <div className="right-side">
          <div>
            <div className="hour">{r.waitLabel}</div>
            <div className="date">
              {r.open ? "營業中" : "休息中"} / {r.updatedLabel}
            </div>
          </div>
          <div className="city" aria-label={`${r.name} Logo`}>
            {r.logoText}
          </div>
        </div>
      </section>

      <section className="days-section" aria-label={`${r.name} 快速操作`}>
        {actions.map(({ label, icon: Icon }) => (
          <button key={label} type="button">
            <span className="day">{label}</span>
            <span className="icon-weather-day">
              <Icon aria-hidden="true" />
            </span>
          </button>
        ))}
      </section>
    </article>
  )
}
