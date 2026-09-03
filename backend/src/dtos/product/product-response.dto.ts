export type ProductStatus = "DISPONIVEL" | "RESERVADO" | "VENDIDO";

export interface ProductSellerDto {
  id: string;
  name: string;
  email: string;
}

export interface ProductCategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImageDto {
  id: string;
  url: string;
  altText?: string | null;
}

export interface ProductResponseDto {
  id: string;
  title: string;
  description: string;
  price: number | string;
  imageUrl?: string | null;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
  seller: ProductSellerDto;
  categories: ProductCategoryDto[];
  images: ProductImageDto[];
}
