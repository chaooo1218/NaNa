import type { RestaurantMenu, RestaurantMenuItem, RestaurantMenuViewModel } from "@/types/menu"

export function formatPrice(price: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(price)
}

const formatMenuItem = (item: RestaurantMenuItem) => ({
  id: item.id,
  name: item.name,
  priceLabel: formatPrice(item.price),
  description: item.description,
  availabilityLabel: item.availability === "soldOut" ? "暫停供應" : null,
  isAvailable: item.availability === "available",
  badges: [item.isRecommended ? "推薦" : null, item.isPopular ? "熱門" : null].filter(
    (badge): badge is string => badge !== null,
  ),
})

export function toRestaurantMenuViewModel(restaurantName: string, menu: RestaurantMenu): RestaurantMenuViewModel {
  return {
    restaurantName,
    restaurantSlug: menu.restaurantSlug,
    detailHref: `/restaurants/${menu.restaurantSlug}`,
    categories: menu.categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        items: category.items.filter((item) => item.availability !== "hidden").map(formatMenuItem),
      }))
      .filter((category) => category.items.length > 0),
    onlineOrderNotice: "線上點餐仍在建置中；目前提供測試菜單預覽，不提供下單或付款。",
  }
}
