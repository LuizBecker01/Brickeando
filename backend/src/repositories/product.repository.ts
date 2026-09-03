import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { CreateProductDto } from "../dtos/product/create-product.dto";
import { UpdateProductDto } from "../dtos/product/update-product.dto";

const productInclude = {
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  categories: {
    include: {
      category: true,
    },
  },
  images: {
    select: {
      id: true,
      url: true,
      altText: true,
    },
  },
} as const;

export const productRepository = {
  async findAll(status?: ProductStatus) {
    return prisma.product.findMany({
      where: status ? { status } : undefined,
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
  },

  async create(data: CreateProductDto) {
    const categoryIds = data.categoryIds ?? [];

    return prisma.product.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        price: new Prisma.Decimal(data.price),
        imageUrl: data.imageUrl ?? null,
        status: data.status ?? "DISPONIVEL",
        seller: {
          connect: { id: data.sellerId },
        },
        ...(categoryIds.length > 0
          ? {
              categories: {
                create: categoryIds.map((categoryId) => ({
                  category: {
                    connect: { id: categoryId },
                  },
                })),
              },
            }
          : {}),
      },
      include: productInclude,
    });
  },

  async update(id: string, data: UpdateProductDto) {
    return prisma.$transaction(async (tx) => {
      const productUpdateData: Prisma.ProductUpdateInput = {
        ...(data.title !== undefined && data.title.trim().length > 0
          ? { title: data.title.trim() }
          : {}),
        ...(data.description !== undefined && data.description.trim().length > 0
          ? { description: data.description.trim() }
          : {}),
        ...(data.price !== undefined ? { price: new Prisma.Decimal(data.price) } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl ?? null } : {}),
        ...(data.status ? { status: data.status } : {}),
      };

      if (data.categoryIds !== undefined) {
        await tx.productCategory.deleteMany({
          where: { productId: id },
        });

        if (data.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: data.categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
            })),
          });
        }
      }

      return tx.product.update({
        where: { id },
        data: productUpdateData,
        include: productInclude,
      });
    });
  },

  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
      include: productInclude,
    });
  },
};
