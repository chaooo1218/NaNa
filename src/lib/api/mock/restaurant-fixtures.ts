import type { CrowdLevel, DataFreshness } from "@/types/live-status"
import type { RestaurantCategory, RestaurantStatus, SponsorLevel } from "@/types/restaurant"

export interface MockRestaurantFixture {
  id: string
  slug: string
  name: string
  category: RestaurantCategory
  categoryLabel: string
  description: string
  tags: string[]
  coverImage: string
  locationSummary: string
  distanceMeters: number | null
  walkingMinutes: number | null
  status: RestaurantStatus
  trafficCount: number | null
  waitingCount: number | null
  crowdLevel: CrowdLevel
  estimatedWaitMinutes: number | null
  occupancyEstimate: number | null
  occupancyConfidence: number | null
  freshness: DataFreshness
  observedAt: string | null
  receivedAt: string | null
  isSponsored: boolean
  sponsorLevel: SponsorLevel
  hasOnlineOrder: boolean
  onlineOrderUrl: string | null
  promotionLabel: string | null
  promotionDescription: string | null
  promotionValidUntil: string | null
  mockScenario: string
}

const nowIso = "2026-07-08T23:00:00+08:00"

export const mockRestaurantFixtures: MockRestaurantFixture[] = [
  {
    id: "green-tea",
    slug: "green-tea",
    name: "青沐手作飲",
    category: "drinks",
    categoryLabel: "飲料",
    description: "輔大 514 巷側門旁的手搖飲，主打無糖茶與鮮奶茶。",
    tags: ["飲料", "外帶", "線上點餐"],
    coverImage: "/restaurants/drinks.png",
    locationSummary: "輔大側門旁",
    distanceMeters: 90,
    walkingMinutes: 2,
    status: "open",
    trafficCount: 14,
    waitingCount: 1,
    crowdLevel: "low",
    estimatedWaitMinutes: 3,
    occupancyEstimate: null,
    occupancyConfidence: null,
    freshness: "fresh",
    observedAt: nowIso,
    receivedAt: nowIso,
    isSponsored: true,
    sponsorLevel: "premium",
    hasOnlineOrder: true,
    onlineOrderUrl: "#online-order-placeholder",
    promotionLabel: "贊助店家",
    promotionDescription: "下課尖峰前先點更快取餐。",
    promotionValidUntil: "2026-07-21T23:59:59+08:00",
    mockScenario: "fresh-sponsored-drinks",
  },
  {
    id: "ramen-ichi",
    slug: "ramen-ichi",
    name: "一番拉麵 514",
    category: "ramen",
    categoryLabel: "拉麵",
    description: "輔仁大學 514 巷內的濃厚豚骨拉麵。",
    tags: ["拉麵", "日式", "線上點餐"],
    coverImage: "/restaurants/ramen.png",
    locationSummary: "輔大 514 巷前段",
    distanceMeters: 180,
    walkingMinutes: 3,
    status: "open",
    trafficCount: 18,
    waitingCount: 0,
    crowdLevel: "low",
    estimatedWaitMinutes: 0,
    occupancyEstimate: null,
    occupancyConfidence: null,
    freshness: "fresh",
    observedAt: nowIso,
    receivedAt: nowIso,
    isSponsored: true,
    sponsorLevel: "standard",
    hasOnlineOrder: true,
    onlineOrderUrl: "#online-order-placeholder",
    promotionLabel: "推薦店家",
    promotionDescription: "午餐尖峰前通常較好入座。",
    promotionValidUntil: "2026-07-14T23:59:59+08:00",
    mockScenario: "fresh-low-crowd",
  },
  {
    id: "morning-light",
    slug: "morning-light",
    name: "晨光早午餐",
    category: "breakfast",
    categoryLabel: "早午餐",
    description: "514 巷口附近的學生早餐與蛋餅店。",
    tags: ["早午餐", "蛋餅", "線上點餐"],
    coverImage: "/restaurants/breakfast.png",
    locationSummary: "輔大 514 巷口",
    distanceMeters: 240,
    walkingMinutes: 4,
    status: "open",
    trafficCount: 32,
    waitingCount: 2,
    crowdLevel: "moderate",
    estimatedWaitMinutes: 5,
    occupancyEstimate: null,
    occupancyConfidence: null,
    freshness: "fresh",
    observedAt: nowIso,
    receivedAt: nowIso,
    isSponsored: false,
    sponsorLevel: "none",
    hasOnlineOrder: true,
    onlineOrderUrl: "#online-order-placeholder",
    promotionLabel: null,
    promotionDescription: null,
    promotionValidUntil: null,
    mockScenario: "fresh-moderate-crowd",
  },
  {
    id: "bento-house",
    slug: "bento-house",
    name: "巷弄便當家",
    category: "bento",
    categoryLabel: "便當",
    description: "輔大學生常買的排骨飯與每日主菜便當。",
    tags: ["便當", "午餐", "線上點餐"],
    coverImage: "/restaurants/bento.png",
    locationSummary: "514 巷中段",
    distanceMeters: 320,
    walkingMinutes: 5,
    status: "open",
    trafficCount: 76,
    waitingCount: 5,
    crowdLevel: "busy",
    estimatedWaitMinutes: 15,
    occupancyEstimate: null,
    occupancyConfidence: null,
    freshness: "delayed",
    observedAt: "2026-07-08T22:57:00+08:00",
    receivedAt: "2026-07-08T23:00:00+08:00",
    isSponsored: false,
    sponsorLevel: "none",
    hasOnlineOrder: true,
    onlineOrderUrl: "#online-order-placeholder",
    promotionLabel: null,
    promotionDescription: null,
    promotionValidUntil: null,
    mockScenario: "delayed-busy-crowd",
  },
  {
    id: "night-skewer",
    slug: "night-skewer",
    name: "夜間串燒",
    category: "izakaya",
    categoryLabel: "晚餐",
    description: "輔大 514 巷晚餐與宵夜串燒店。",
    tags: ["晚餐", "串燒", "線上點餐"],
    coverImage: "/restaurants/izakaya.png",
    locationSummary: "514 巷後段",
    distanceMeters: 540,
    walkingMinutes: 8,
    status: "open",
    trafficCount: 108,
    waitingCount: 9,
    crowdLevel: "peak",
    estimatedWaitMinutes: 25,
    occupancyEstimate: null,
    occupancyConfidence: null,
    freshness: "stale",
    observedAt: "2026-07-08T22:50:00+08:00",
    receivedAt: "2026-07-08T22:52:00+08:00",
    isSponsored: false,
    sponsorLevel: "none",
    hasOnlineOrder: true,
    onlineOrderUrl: "#online-order-placeholder",
    promotionLabel: null,
    promotionDescription: null,
    promotionValidUntil: null,
    mockScenario: "stale-peak-crowd",
  },
  {
    id: "wood-pizza",
    slug: "wood-pizza",
    name: "木盒披薩",
    category: "pizza",
    categoryLabel: "晚餐",
    description: "校園商圈小份量披薩，晚間營業。",
    tags: ["披薩", "晚餐", "休息中"],
    coverImage: "/restaurants/pizza.png",
    locationSummary: "輔大 514 巷旁",
    distanceMeters: 410,
    walkingMinutes: 6,
    status: "closed",
    trafficCount: null,
    waitingCount: null,
    crowdLevel: "closed",
    estimatedWaitMinutes: null,
    occupancyEstimate: null,
    occupancyConfidence: null,
    freshness: "unavailable",
    observedAt: null,
    receivedAt: null,
    isSponsored: false,
    sponsorLevel: "none",
    hasOnlineOrder: false,
    onlineOrderUrl: null,
    promotionLabel: null,
    promotionDescription: null,
    promotionValidUntil: null,
    mockScenario: "closed-unavailable",
  },
]
