import type { ProductApiResponse } from "../services/api";
import type { Product } from "../types/product";

const fallbackImage = "https://placehold.co/900x700?text=Brickeando";

export const normalizeProduct = (
  product: ProductApiResponse,
  sellerIdFallback = "",
): Product => ({
  id: product.id,
  title: product.title,
  description: product.description,
  price: Number(product.price),
  status: product.status,
  condition: product.condition,
  locationName: product.locationName,
  latitude: product.latitude,
  longitude: product.longitude,
  imageUrl: product.imageUrl ?? product.images?.[0]?.url ?? fallbackImage,
  seller: {
    id: product.seller?.id ?? sellerIdFallback,
    name: product.seller?.name ?? "Vendedor",
  },
  categories: Array.isArray(product.categories)
    ? product.categories.map((item) => ({
        id: item.category?.id ?? item.id ?? "",
        name: item.category?.name ?? item.name ?? "Categoria",
      }))
    : [],
});
