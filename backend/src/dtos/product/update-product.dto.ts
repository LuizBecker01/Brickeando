export interface UpdateProductDto {
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string | null;
  imageUrls?: string[];
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: "DISPONIVEL" | "RESERVADO" | "VENDIDO";
  condition?: "NOVO" | "SEMINOVO" | "USADO" | "PARA_REPARO";
  categoryIds?: string[];
}
