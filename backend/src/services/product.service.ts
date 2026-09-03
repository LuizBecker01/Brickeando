import { ProductStatus } from "@prisma/client";
import { CreateProductDto } from "../dtos/product/create-product.dto";
import { UpdateProductDto } from "../dtos/product/update-product.dto";
import { AppError } from "../errors/app-error";
import { HttpStatus } from "../errors/http-status";
import { productRepository } from "../repositories/product.repository";

const normalizeStatus = (status?: string): ProductStatus | undefined => {
  if (!status) {
    return undefined;
  }

  const normalized = status.trim().toUpperCase();
  const statusMap: Record<string, ProductStatus> = {
    DISPONIVEL: "DISPONIVEL",
    RESERVADO: "RESERVADO",
    VENDIDO: "VENDIDO",
    AVAILABLE: "DISPONIVEL",
    RESERVED: "RESERVADO",
    SOLD: "VENDIDO",
  };

  if (statusMap[normalized]) {
    return statusMap[normalized];
  }

  throw new AppError(
    "Status inválido. Valores aceitos: DISPONIVEL, RESERVADO ou VENDIDO.",
    HttpStatus.BAD_REQUEST,
  );
};

const validateCreateProductInput = (payload: CreateProductDto): void => {
  if (!payload.title || payload.title.trim().length < 3) {
    throw new AppError(
      "O título do produto deve conter pelo menos 3 caracteres.",
      HttpStatus.BAD_REQUEST,
    );
  }

  if (!payload.description || payload.description.trim().length < 10) {
    throw new AppError(
      "A descrição deve conter pelo menos 10 caracteres.",
      HttpStatus.BAD_REQUEST,
    );
  }

  if (!payload.sellerId || payload.sellerId.trim().length === 0) {
    throw new AppError("O identificador do vendedor é obrigatório.", HttpStatus.BAD_REQUEST);
  }

  if (payload.price === undefined || Number(payload.price) <= 0) {
    throw new AppError("O preço deve ser maior que zero.", HttpStatus.BAD_REQUEST);
  }

  if (payload.categoryIds && payload.categoryIds.length > 0) {
    const uniqueIds = new Set(payload.categoryIds);

    if (uniqueIds.size !== payload.categoryIds.length) {
      throw new AppError("As categorias não podem se repetir.", HttpStatus.BAD_REQUEST);
    }
  }
};

const validateUpdateProductInput = (payload: UpdateProductDto): void => {
  const hasAnyField =
    payload.title !== undefined ||
    payload.description !== undefined ||
    payload.price !== undefined ||
    payload.imageUrl !== undefined ||
    payload.status !== undefined ||
    payload.categoryIds !== undefined;

  if (!hasAnyField) {
    throw new AppError("Informe ao menos um campo para atualização.", HttpStatus.BAD_REQUEST);
  }

  if (payload.title !== undefined && payload.title.trim().length < 3) {
    throw new AppError(
      "O título do produto deve conter pelo menos 3 caracteres.",
      HttpStatus.BAD_REQUEST,
    );
  }

  if (payload.description !== undefined && payload.description.trim().length < 10) {
    throw new AppError(
      "A descrição deve conter pelo menos 10 caracteres.",
      HttpStatus.BAD_REQUEST,
    );
  }

  if (payload.price !== undefined && Number(payload.price) <= 0) {
    throw new AppError("O preço deve ser maior que zero.", HttpStatus.BAD_REQUEST);
  }

  if (payload.categoryIds && payload.categoryIds.length > 0) {
    const uniqueIds = new Set(payload.categoryIds);

    if (uniqueIds.size !== payload.categoryIds.length) {
      throw new AppError("As categorias não podem se repetir.", HttpStatus.BAD_REQUEST);
    }
  }
};

export const productService = {
  async listProducts(status?: string) {
    const normalizedStatus = normalizeStatus(status);
    return productRepository.findAll(normalizedStatus);
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError("Produto não encontrado.", HttpStatus.NOT_FOUND);
    }

    return product;
  },

  async createProduct(payload: CreateProductDto) {
    validateCreateProductInput(payload);

    return productRepository.create({
      ...payload,
      status: normalizeStatus(payload.status),
    });
  },

  async updateProduct(id: string, payload: UpdateProductDto, currentUserId?: string) {
    validateUpdateProductInput(payload);

    const existingProduct = await productRepository.findById(id);

    if (!existingProduct) {
      throw new AppError("Produto não encontrado.", HttpStatus.NOT_FOUND);
    }

    if (currentUserId && existingProduct.sellerId !== currentUserId) {
      throw new AppError("Você só pode editar seus próprios produtos.", HttpStatus.FORBIDDEN);
    }

    return productRepository.update(id, {
      ...payload,
      status: payload.status ? normalizeStatus(payload.status) : undefined,
    });
  },

  async deleteProduct(id: string, currentUserId?: string) {
    const existingProduct = await productRepository.findById(id);

    if (!existingProduct) {
      throw new AppError("Produto não encontrado.", HttpStatus.NOT_FOUND);
    }

    if (currentUserId && existingProduct.sellerId !== currentUserId) {
      throw new AppError("Você só pode excluir seus próprios produtos.", HttpStatus.FORBIDDEN);
    }

    return productRepository.delete(id);
  },
};
