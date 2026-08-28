import { productRepository } from "../repositories/product.repository";

export const productService = {
  listAvailableProducts: async () => {
    return productRepository.findAll();
  },

  getProductDetails: async (id: string) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Produto não encontrado");
    }
    return product;
  },

  createProduct: async (data: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    sellerId: string;
  }) => {
    if (data.price <= 0) {
      throw new Error("Preço deve ser maior que zero");
    }
    return productRepository.create(data);
  },
};
