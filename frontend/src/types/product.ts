export type ProductStatus = "DISPONIVEL" | "RESERVADO" | "VENDIDO";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: ProductStatus;
  condition: "NOVO" | "SEMINOVO" | "USADO" | "PARA_REPARO";
  seller: {
    id: string;
    name: string;
  };
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  categoryIds: string[];
  condition: "NOVO" | "SEMINOVO" | "USADO" | "PARA_REPARO";
}
