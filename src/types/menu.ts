export type MenuAvailabilityStatus = "available" | "soldOut" | "hidden"

export interface RestaurantMenuItem {
  id: string
  name: string
  price: number
  description: string
  availability: MenuAvailabilityStatus
  isRecommended: boolean
  isPopular: boolean
}

export interface RestaurantMenuCategory {
  id: string
  name: string
  items: RestaurantMenuItem[]
}

export interface RestaurantMenu {
  restaurantSlug: string
  categories: RestaurantMenuCategory[]
}

export interface RestaurantMenuItemViewModel {
  id: string
  name: string
  priceLabel: string
  description: string
  availabilityLabel: string | null
  isAvailable: boolean
  badges: string[]
}

export interface RestaurantMenuViewModel {
  restaurantName: string
  restaurantSlug: string
  detailHref: string
  categories: Array<{
    id: string
    name: string
    items: RestaurantMenuItemViewModel[]
  }>
  onlineOrderNotice: string
}
