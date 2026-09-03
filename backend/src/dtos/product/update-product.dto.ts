export interface UpdateProductDto {
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string | null;
  status?: "DISPONIVEL" | "RESERVADO" | "VENDIDO";
  categoryIds?: string[];
}
