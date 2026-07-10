import type { CrowdLevel, DataFreshness } from "@/types/live-status"
import type { RestaurantMenuCategory } from "@/types/menu"
import type { RestaurantCategory, RestaurantDetailContent, RestaurantStatus, SponsorLevel } from "@/types/restaurant"

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

export interface MockRestaurantDetailFixture extends RestaurantDetailContent {
  slug: string
  menu: RestaurantMenuCategory[] | null
}

const weekdayHours = [
  { dayLabel: "週一", openTime: "10:30", closeTime: "20:30", isClosed: false },
  { dayLabel: "週二", openTime: "10:30", closeTime: "20:30", isClosed: false },
  { dayLabel: "週三", openTime: "10:30", closeTime: "20:30", isClosed: false },
  { dayLabel: "週四", openTime: "10:30", closeTime: "20:30", isClosed: false },
  { dayLabel: "週五", openTime: "10:30", closeTime: "21:00", isClosed: false },
  { dayLabel: "週六", openTime: "11:00", closeTime: "21:00", isClosed: false },
  { dayLabel: "週日", openTime: null, closeTime: null, isClosed: true },
]

export const mockRestaurantDetailFixtures: MockRestaurantDetailFixture[] = [
  {
    slug: "green-tea",
    location: {
      areaLabel: "輔大 514 巷周邊",
      summary: "距離校門約 90 公尺，步行約 2 分鐘。店家地圖建置中，目前先提供距離與店家資訊。",
    },
    businessHours: weekdayHours,
    notices: [
      { title: "測試資料", content: "本頁店家資訊與菜單為測試資料，實際供應請以店家現場為準。" },
      { title: "尖峰提醒", content: "午間下課時段可能需要等候，建議先查看目前等待時間。" },
      { title: "取餐方式", content: "線上點餐功能仍在建置中，暫不提供正式下單。" },
    ],
    menu: [
      {
        id: "tea",
        name: "原茶與奶茶",
        items: [
          { id: "green-tea-jasmine", name: "茉香綠茶", price: 35, description: "清爽原茶，冰塊甜度可於現場確認。", availability: "available", isRecommended: true, isPopular: false },
          { id: "green-tea-milk", name: "珍珠奶茶", price: 55, description: "學生常點的經典組合。", availability: "available", isRecommended: false, isPopular: true },
          { id: "green-tea-oolong", name: "烏龍鮮奶茶", price: 65, description: "茶香較明顯，適合少糖。", availability: "soldOut", isRecommended: false, isPopular: false },
        ],
      },
      {
        id: "seasonal",
        name: "季節飲品",
        items: [
          { id: "green-tea-lemon", name: "檸檬青茶", price: 50, description: "酸甜清爽，適合午後。", availability: "available", isRecommended: false, isPopular: true },
          { id: "green-tea-cocoa", name: "可可歐蕾", price: 65, description: "溫熱飲品，適合晚間自習前。", availability: "available", isRecommended: true, isPopular: false },
        ],
      },
    ],
  },
  {
    slug: "ramen-ichi",
    location: {
      areaLabel: "輔大 514 巷中段",
      summary: "距離校園約 180 公尺，步行約 3 分鐘。店家地圖建置中，目前先提供距離與店家資訊。",
    },
    businessHours: [
      { dayLabel: "週一", openTime: null, closeTime: null, isClosed: true },
      { dayLabel: "週二", openTime: "11:30", closeTime: "21:00", isClosed: false },
      { dayLabel: "週三", openTime: "11:30", closeTime: "21:00", isClosed: false },
      { dayLabel: "週四", openTime: "11:30", closeTime: "21:00", isClosed: false },
      { dayLabel: "週五", openTime: "11:30", closeTime: "21:30", isClosed: false },
      { dayLabel: "週六", openTime: "11:30", closeTime: "21:30", isClosed: false },
      { dayLabel: "週日", openTime: "11:30", closeTime: "20:30", isClosed: false },
    ],
    notices: [
      { title: "測試菜單", content: "價格與供應狀態為測試資料，非正式點餐內容。" },
      { title: "候位資訊", content: "等待時間僅供現場決策參考，不代表保留座位。" },
      { title: "過敏提醒", content: "湯頭與配料資訊請於現場向店家確認。" },
    ],
    menu: [
      {
        id: "ramen",
        name: "拉麵",
        items: [
          { id: "ramen-tonkotsu", name: "豚骨拉麵", price: 160, description: "濃郁豚骨湯頭與叉燒。", availability: "available", isRecommended: true, isPopular: true },
          { id: "ramen-miso", name: "味噌拉麵", price: 170, description: "味噌湯頭，適合想吃重口味時。", availability: "available", isRecommended: false, isPopular: true },
          { id: "ramen-spicy", name: "辛味拉麵", price: 180, description: "微辣湯頭，辣度請現場確認。", availability: "soldOut", isRecommended: false, isPopular: false },
        ],
      },
      {
        id: "sides",
        name: "小食",
        items: [
          { id: "ramen-gyoza", name: "煎餃", price: 60, description: "六入，適合搭配主餐。", availability: "available", isRecommended: false, isPopular: true },
          { id: "ramen-rice", name: "叉燒飯", price: 55, description: "小份叉燒飯。", availability: "available", isRecommended: true, isPopular: false },
        ],
      },
    ],
  },
  {
    slug: "morning-light",
    location: {
      areaLabel: "輔大 514 巷入口",
      summary: "距離校園約 240 公尺，步行約 4 分鐘。店家地圖建置中，目前先提供距離與店家資訊。",
    },
    businessHours: [
      { dayLabel: "週一", openTime: "07:00", closeTime: "14:30", isClosed: false },
      { dayLabel: "週二", openTime: "07:00", closeTime: "14:30", isClosed: false },
      { dayLabel: "週三", openTime: "07:00", closeTime: "14:30", isClosed: false },
      { dayLabel: "週四", openTime: "07:00", closeTime: "14:30", isClosed: false },
      { dayLabel: "週五", openTime: "07:00", closeTime: "14:30", isClosed: false },
      { dayLabel: "週六", openTime: "08:00", closeTime: "15:00", isClosed: false },
      { dayLabel: "週日", openTime: null, closeTime: null, isClosed: true },
    ],
    notices: [
      { title: "測試資料", content: "本頁菜單與供應狀態為測試資料，請以店家現場公告為準。" },
      { title: "早餐尖峰", content: "上午上課前較容易忙碌，建議預留等候時間。" },
      { title: "線上點餐", content: "線上點餐尚未開放，請勿將此頁視為正式下單頁。" },
    ],
    menu: [
      {
        id: "breakfast",
        name: "早餐加盟",
        items: [
          { id: "morning-egg-toast", name: "起司蛋吐司", price: 50, description: "簡單早餐，適合快速外帶。", availability: "available", isRecommended: true, isPopular: true },
          { id: "morning-chicken-burger", name: "雞腿堡", price: 85, description: "煎雞腿搭配生菜與醬料。", availability: "available", isRecommended: false, isPopular: true },
          { id: "morning-salad", name: "生菜沙拉", price: 75, description: "當日供應依現場食材調整。", availability: "hidden", isRecommended: false, isPopular: false },
        ],
      },
      {
        id: "coffee",
        name: "咖啡與飲品",
        items: [
          { id: "morning-black-coffee", name: "美式咖啡", price: 45, description: "熱飲或冰飲請現場確認。", availability: "available", isRecommended: false, isPopular: true },
          { id: "morning-milk-tea", name: "鮮奶茶", price: 55, description: "搭配早餐的經典飲品。", availability: "available", isRecommended: true, isPopular: false },
        ],
      },
    ],
  },
  {
    slug: "bento-house",
    location: { areaLabel: "514 巷後段", summary: "距離校園約 320 公尺，步行約 5 分鐘。店家地圖建置中。" },
    businessHours: weekdayHours,
    notices: [
      { title: "測試資料", content: "本頁資訊為測試資料。" },
      { title: "尖峰提醒", content: "午餐時段可能等待較久。" },
      { title: "資料延遲", content: "目前狀態可能稍有延遲。" },
    ],
    menu: null,
  },
  {
    slug: "night-skewer",
    location: { areaLabel: "514 巷夜間店家區", summary: "距離校園約 540 公尺，步行約 8 分鐘。店家地圖建置中。" },
    businessHours: [
      { dayLabel: "週一", openTime: "17:30", closeTime: "23:30", isClosed: false },
      { dayLabel: "週二", openTime: "17:30", closeTime: "23:30", isClosed: false },
      { dayLabel: "週三", openTime: "17:30", closeTime: "23:30", isClosed: false },
      { dayLabel: "週四", openTime: "17:30", closeTime: "23:30", isClosed: false },
      { dayLabel: "週五", openTime: "17:30", closeTime: "00:00", isClosed: false },
      { dayLabel: "週六", openTime: "17:30", closeTime: "00:00", isClosed: false },
      { dayLabel: "週日", openTime: null, closeTime: null, isClosed: true },
    ],
    notices: [
      { title: "測試資料", content: "本頁資訊為測試資料。" },
      { title: "晚間尖峰", content: "尖峰時段等待資訊可能延遲。" },
      { title: "供應提醒", content: "品項供應請以現場為準。" },
    ],
    menu: null,
  },
  {
    slug: "wood-pizza",
    location: { areaLabel: "輔大 514 巷附近", summary: "距離校園約 410 公尺，步行約 6 分鐘。店家地圖建置中。" },
    businessHours: [
      { dayLabel: "週一", openTime: null, closeTime: null, isClosed: true },
      { dayLabel: "週二", openTime: "16:00", closeTime: "21:30", isClosed: false },
      { dayLabel: "週三", openTime: "16:00", closeTime: "21:30", isClosed: false },
      { dayLabel: "週四", openTime: "16:00", closeTime: "21:30", isClosed: false },
      { dayLabel: "週五", openTime: "16:00", closeTime: "22:00", isClosed: false },
      { dayLabel: "週六", openTime: "12:00", closeTime: "22:00", isClosed: false },
      { dayLabel: "週日", openTime: "12:00", closeTime: "21:30", isClosed: false },
    ],
    notices: [
      { title: "測試資料", content: "本頁資訊為測試資料。" },
      { title: "營業狀態", content: "目前休息中，請查看營業時間。" },
      { title: "菜單建置", content: "菜單預覽尚未開放。" },
    ],
    menu: null,
  },
]
