import { cn } from "@/lib/utils/cn"
import type { CrowdLevel } from "@/types/live-status"

const crowdMeta: Record<CrowdLevel, { label: string; className: string; level: number }> = {
  empty: { label: "很空", className: "text-crowd-low", level: 0 },
  low: { label: "人少", className: "text-crowd-low", level: 1 },
  moderate: { label: "普通", className: "text-crowd-moderate", level: 2 },
  busy: { label: "忙碌", className: "text-crowd-busy", level: 3 },
  peak: { label: "尖峰", className: "text-crowd-peak", level: 4 },
  closed: { label: "休息中", className: "text-muted-foreground", level: 0 },
  unknown: { label: "未知", className: "text-muted-foreground", level: 0 },
}

const activeColor: Record<CrowdLevel, string> = {
  empty: "bg-crowd-low",
  low: "bg-crowd-low",
  moderate: "bg-crowd-moderate",
  busy: "bg-crowd-busy",
  peak: "bg-crowd-peak",
  closed: "bg-muted",
  unknown: "bg-muted",
}

export function getCrowdSortScore(level: CrowdLevel) {
  return crowdMeta[level].level
}

export function getCrowdLabel(level: CrowdLevel) {
  return crowdMeta[level].label
}

export function CrowdBadge({ level, compact = false }: { level: CrowdLevel; compact?: boolean }) {
  const meta = crowdMeta[level]

  return (
    <div className={cn("flex items-center gap-2", compact ? "justify-start" : "justify-end")}>
      <span className={cn("text-sm font-semibold", meta.className)}>{meta.label}</span>
      <div className="flex items-center gap-0.5" aria-label={`人流狀態：${meta.label}`}>
        {[1, 2, 3, 4].map((item) => (
          <span
            key={item}
            className={cn(
              "h-1.5 w-3 rounded-full transition-colors duration-200",
              item <= meta.level ? activeColor[level] : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  )
}
