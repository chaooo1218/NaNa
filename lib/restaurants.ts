export type CrowdLevel = "low" | "normal" | "high" | "packed"
export type StoreStatus = CrowdLevel | "closed"

export type Restaurant = {
  id: string
  name: string
  category: string
  image: string
  distanceM: number
  walkMin: number
  crowd: CrowdLevel
  currentPeople: number
  capacity: number
  waitLabel: string
  open: boolean
  updatedLabel: string
  logoText: string
  featured?: boolean
  advertised?: boolean
  tags: string[]
  // normalized map position in percentages (for the demo map)
  map: { x: number; y: number }
}

export const CROWD_META: Record<
  StoreStatus,
  { label: string; token: string; dot: string; statusClass: string; score: number }
> = {
  low: {
    label: "人少",
    token: "text-crowd-low",
    dot: "bg-crowd-low",
    statusClass: "status-low",
    score: 1,
  },
  normal: {
    label: "普通",
    token: "text-crowd-normal",
    dot: "bg-crowd-normal",
    statusClass: "status-normal",
    score: 2,
  },
  high: {
    label: "忙碌",
    token: "text-crowd-high",
    dot: "bg-crowd-high",
    statusClass: "status-high",
    score: 3,
  },
  packed: {
    label: "尖峰",
    token: "text-crowd-packed",
    dot: "bg-crowd-packed",
    statusClass: "status-packed",
    score: 4,
  },
  closed: {
    label: "休息中",
    token: "text-muted-foreground",
    dot: "bg-muted-foreground",
    statusClass: "status-closed",
    score: 5,
  },
}

export const restaurants: Restaurant[] = [
  {
    id: "ramen-ichi",
    name: "一風堂拉麵 中原店",
    category: "拉麵",
    image: "/restaurants/ramen.png",
    distanceM: 180,
    walkMin: 3,
    crowd: "low",
    currentPeople: 20,
    capacity: 35,
    waitLabel: "免排隊",
    open: true,
    updatedLabel: "5 秒前更新",
    logoText: "一風",
    featured: true,
    advertised: true,
    tags: ["拉麵", "晚餐", "人少", "推薦店家", "線上點餐"],
    map: { x: 32, y: 38 },
  },
  {
    id: "morning-light",
    name: "晨光早午餐",
    category: "早午餐",
    image: "/restaurants/breakfast.png",
    distanceM: 240,
    walkMin: 4,
    crowd: "normal",
    currentPeople: 24,
    capacity: 38,
    waitLabel: "約 5 分鐘",
    open: true,
    updatedLabel: "12 秒前更新",
    logoText: "晨光",
    tags: ["早午餐", "營業中", "普通", "線上點餐"],
    map: { x: 58, y: 26 },
  },
  {
    id: "bento-house",
    name: "巷口便當",
    category: "便當",
    image: "/restaurants/bento.png",
    distanceM: 320,
    walkMin: 5,
    crowd: "high",
    currentPeople: 31,
    capacity: 40,
    waitLabel: "約 15 分鐘",
    open: true,
    updatedLabel: "8 秒前更新",
    logoText: "巷口",
    tags: ["便當", "日式", "營業中", "忙碌", "線上點餐"],
    map: { x: 46, y: 58 },
  },
  {
    id: "green-tea",
    name: "青茶研究所",
    category: "飲料",
    image: "/restaurants/drinks.png",
    distanceM: 90,
    walkMin: 2,
    crowd: "low",
    currentPeople: 8,
    capacity: 25,
    waitLabel: "約 3 分鐘",
    open: true,
    updatedLabel: "3 秒前更新",
    logoText: "青茶",
    advertised: true,
    tags: ["飲料", "人少", "10 分鐘內", "營業中", "線上點餐"],
    map: { x: 24, y: 64 },
  },
  {
    id: "midnight-izakaya",
    name: "深夜食堂",
    category: "居酒屋",
    image: "/restaurants/izakaya.png",
    distanceM: 540,
    walkMin: 8,
    crowd: "packed",
    currentPeople: 46,
    capacity: 48,
    waitLabel: "約 25 分鐘",
    open: true,
    updatedLabel: "20 秒前更新",
    logoText: "深夜",
    tags: ["晚餐", "日式", "尖峰", "線上點餐"],
    map: { x: 70, y: 52 },
  },
  {
    id: "wood-pizza",
    name: "木窯披薩",
    category: "披薩",
    image: "/restaurants/pizza.png",
    distanceM: 410,
    walkMin: 6,
    crowd: "normal",
    currentPeople: 0,
    capacity: 32,
    waitLabel: "未營業",
    open: false,
    updatedLabel: "1 分鐘前更新",
    logoText: "木窯",
    tags: ["晚餐", "推薦店家", "休息中"],
    map: { x: 60, y: 74 },
  },
]

export const filterChips = [
  "人少",
  "10 分鐘內",
  "營業中",
  "早午餐",
  "飲料",
  "便當",
  "日式",
  "晚餐",
  "推薦店家",
  "線上點餐",
] as const
