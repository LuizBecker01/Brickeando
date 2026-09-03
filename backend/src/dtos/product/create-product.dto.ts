export interface CreateProductDto {
  title: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  status?: "DISPONIVEL" | "RESERVADO" | "VENDIDO";
  sellerId: string;
  categoryIds?: string[];
}
