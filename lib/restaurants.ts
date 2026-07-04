export type CrowdLevel = "low" | "normal" | "high" | "packed"

export type Restaurant = {
  id: string
  name: string
  category: string
  image: string
  distanceM: number
  walkMin: number
  crowd: CrowdLevel
  waitLabel: string
  open: boolean
  updatedLabel: string
  featured?: boolean
  tags: string[]
  // normalized map position in percentages (for the demo map)
  map: { x: number; y: number }
}

export const CROWD_META: Record<
  CrowdLevel,
  { label: string; token: string; dot: string }
> = {
  low: { label: "人少", token: "text-crowd-low", dot: "bg-crowd-low" },
  normal: { label: "普通", token: "text-crowd-normal", dot: "bg-crowd-normal" },
  high: { label: "偏多", token: "text-crowd-high", dot: "bg-crowd-high" },
  packed: { label: "擁擠", token: "text-crowd-packed", dot: "bg-crowd-packed" },
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
    waitLabel: "免排隊",
    open: true,
    updatedLabel: "5 秒前更新",
    featured: true,
    tags: ["晚餐", "宵夜", "現在人少", "推薦店家"],
    map: { x: 32, y: 38 },
  },
  {
    id: "morning-light",
    name: "晨光晨間廚房",
    category: "早餐",
    image: "/restaurants/breakfast.png",
    distanceM: 240,
    walkMin: 4,
    crowd: "normal",
    waitLabel: "約 5–10 分鐘",
    open: true,
    updatedLabel: "12 秒前更新",
    tags: ["早餐", "營業中"],
    map: { x: 58, y: 26 },
  },
  {
    id: "bento-house",
    name: "老地方招牌便當",
    category: "便當",
    image: "/restaurants/bento.png",
    distanceM: 320,
    walkMin: 5,
    crowd: "high",
    waitLabel: "約 10–15 分鐘",
    open: true,
    updatedLabel: "8 秒前更新",
    tags: ["便當", "晚餐", "營業中"],
    map: { x: 46, y: 58 },
  },
  {
    id: "green-tea",
    name: "綠意手搖飲",
    category: "飲料",
    image: "/restaurants/drinks.png",
    distanceM: 90,
    walkMin: 2,
    crowd: "low",
    waitLabel: "約 3 分鐘",
    open: true,
    updatedLabel: "3 秒前更新",
    tags: ["飲料", "現在人少", "10 分鐘內", "營業中"],
    map: { x: 24, y: 64 },
  },
  {
    id: "midnight-izakaya",
    name: "深夜食堂 居酒屋",
    category: "居酒屋",
    image: "/restaurants/izakaya.png",
    distanceM: 540,
    walkMin: 8,
    crowd: "packed",
    waitLabel: "約 25 分鐘",
    open: true,
    updatedLabel: "20 秒前更新",
    tags: ["宵夜", "晚餐"],
    map: { x: 70, y: 52 },
  },
  {
    id: "wood-pizza",
    name: "窯烤手作披薩",
    category: "披薩",
    image: "/restaurants/pizza.png",
    distanceM: 410,
    walkMin: 6,
    crowd: "normal",
    waitLabel: "約 8 分鐘",
    open: false,
    updatedLabel: "1 分鐘前更新",
    tags: ["晚餐", "推薦店家"],
    map: { x: 60, y: 74 },
  },
]

export const filterChips = [
  "現在人少",
  "10 分鐘內",
  "營業中",
  "早餐",
  "飲料",
  "便當",
  "晚餐",
  "宵夜",
  "推薦店家",
] as const
