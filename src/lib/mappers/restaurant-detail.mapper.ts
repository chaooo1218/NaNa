import { getCrowdLabel } from "@/components/restaurant/CrowdBadge"
import { formatFreshnessLabel, formatWaitTimeLabel } from "@/lib/mappers/restaurant.mapper"
import type {
  RestaurantDetail,
  RestaurantDetailContent,
  RestaurantDetailViewModel,
  RestaurantListItem,
} from "@/types/restaurant"

export function formatBusinessHours({ openTime, closeTime, isClosed }: RestaurantDetail["businessHours"][number]) {
  if (isClosed || openTime === null || closeTime === null) return "公休"
  return `${openTime}–${closeTime}`
}

export function formatDataFreshnessLabel(restaurant: RestaurantListItem) {
  return formatFreshnessLabel(restaurant)
}

export function toRestaurantDetail(
  restaurant: RestaurantListItem,
  description: string,
  content: RestaurantDetailContent,
): RestaurantDetail {
  return {
    ...restaurant,
    description,
    ...content,
  }
}

export function toRestaurantDetailViewModel(restaurant: RestaurantDetail): RestaurantDetailViewModel {
  const unavailable = restaurant.freshness === "unavailable"
  const isOpen = restaurant.status === "open"

  return {
    slug: restaurant.slug,
    name: restaurant.name,
    coverImage: restaurant.coverImage,
    openLabel: isOpen ? "營業中" : restaurant.status === "closed" ? "休息中" : "狀態未知",
    isOpen,
    crowdLevel: restaurant.crowdLevel,
    crowdLabel: getCrowdLabel(restaurant.crowdLevel),
    primarySignalLabel: !isOpen ? "休息中" : unavailable ? "暫無即時資料" : `${getCrowdLabel(restaurant.crowdLevel)}・${formatWaitTimeLabel(restaurant.estimatedWaitMinutes)}`,
    waitTimeLabel: formatWaitTimeLabel(restaurant.estimatedWaitMinutes),
    distanceLabel:
      restaurant.distanceMeters === null
        ? "距離尚未提供"
        : `${restaurant.distanceMeters}m・步行 ${restaurant.walkingMinutes ?? "-"} 分鐘`,
    categoryLabel: restaurant.categoryLabel,
    tags: restaurant.tags,
    freshnessLabel: formatDataFreshnessLabel(restaurant),
    description: restaurant.description,
    businessHours: restaurant.businessHours.map((item) => ({
      dayLabel: item.dayLabel,
      hoursLabel: formatBusinessHours(item),
    })),
    notices: restaurant.notices,
    location: restaurant.location,
    menuHref: `/restaurants/${restaurant.slug}/menu`,
    detailHref: `/restaurants/${restaurant.slug}`,
    onlineOrderLabel: isOpen ? "線上點餐建置中" : "查看營業時間",
    sponsorLabel: restaurant.isSponsored ? (restaurant.sponsorLevel === "premium" ? "贊助" : "推薦") : null,
  }
}
