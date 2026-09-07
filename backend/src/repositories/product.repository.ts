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
  async findAll(filters?: {
    status?: ProductStatus;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
  }) {
    const products = await prisma.product.findMany({
      where: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.categoryId
          ? { categories: { some: { categoryId: filters.categoryId } } }
          : {}),
        ...(filters?.minPrice !== undefined || filters?.maxPrice !== undefined
          ? {
              price: {
                ...(filters.minPrice !== undefined
                  ? { gte: filters.minPrice }
                  : {}),
                ...(filters.maxPrice !== undefined
                  ? { lte: filters.maxPrice }
                  : {}),
              },
            }
          : {}),
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });

    if (
      filters?.latitude === undefined ||
      filters.longitude === undefined ||
      filters.radiusKm === undefined
    ) {
      return products;
    }

    const earthRadiusKm = 6371;
    return products.filter((product) => {
      if (product.latitude === null || product.longitude === null) {
        return false;
      }

      const latitudeDelta =
        ((product.latitude - filters.latitude!) * Math.PI) / 180;
      const longitudeDelta =
        ((product.longitude - filters.longitude!) * Math.PI) / 180;
      const originLatitude = (filters.latitude! * Math.PI) / 180;
      const productLatitude = (product.latitude * Math.PI) / 180;
      const haversine =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.sin(longitudeDelta / 2) ** 2 *
          Math.cos(originLatitude) *
          Math.cos(productLatitude);
      const distanceKm =
        earthRadiusKm *
        2 *
        Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

      return distanceKm <= filters.radiusKm!;
    });
  },

  async findCategories() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
  },

  async create(data: CreateProductDto) {
    const categoryIds = data.categoryIds ?? [];
    const imageUrls = data.imageUrls ?? (data.imageUrl ? [data.imageUrl] : []);

    return prisma.product.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        price: new Prisma.Decimal(data.price),
        imageUrl: data.imageUrl ?? null,
        locationName: data.locationName ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        status: data.status ?? "DISPONIVEL",
        condition: data.condition ?? "USADO",
        ...(imageUrls.length > 0
          ? {
              images: { create: imageUrls.slice(0, 5).map((url) => ({ url })) },
            }
          : {}),
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
        ...(data.price !== undefined
          ? { price: new Prisma.Decimal(data.price) }
          : {}),
        ...(data.imageUrl !== undefined
          ? { imageUrl: data.imageUrl ?? null }
          : {}),
        ...(data.locationName !== undefined
          ? { locationName: data.locationName ?? null }
          : {}),
        ...(data.latitude !== undefined
          ? { latitude: data.latitude ?? null }
          : {}),
        ...(data.longitude !== undefined
          ? { longitude: data.longitude ?? null }
          : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.condition ? { condition: data.condition } : {}),
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

      if (data.imageUrls !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });

        if (data.imageUrls.length > 0) {
          await tx.productImage.createMany({
            data: data.imageUrls
              .slice(0, 5)
              .map((url) => ({ productId: id, url })),
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
