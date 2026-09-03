export type ProductStatus = "DISPONIVEL" | "RESERVADO" | "VENDIDO";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  status: ProductStatus;
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
  status: ProductStatus;
  imageUrl: string;
}
