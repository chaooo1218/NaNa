import { CROWD_META, type CrowdLevel } from "@/lib/restaurants"
import { cn } from "@/lib/utils"

const LEVEL_INDEX: Record<CrowdLevel, number> = {
  low: 1,
  normal: 2,
  high: 3,
  packed: 4,
}

export function CrowdBadge({
  level,
  className,
}: {
  level: CrowdLevel
  className?: string
}) {
  const meta = CROWD_META[level]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium",
        meta.token,
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}

export function CrowdMeter({ level }: { level: CrowdLevel }) {
  const active = LEVEL_INDEX[level]
  const meta = CROWD_META[level]
  return (
    <div className="flex items-center gap-1" aria-label={`目前人流：${meta.label}`}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-5 rounded-full transition-colors",
            i <= active ? meta.dot : "bg-muted",
          )}
        />
      ))}
    </div>
  )
}
