import { prisma } from "../config/prisma";

export const productRepository = {
  findAll: () => {
    return prisma.product.findMany({
      where: { status: "available" },
      include: { seller: { select: { id: true, name: true } } },
    });
  },

  findById: (id: string) => {
    return prisma.product.findUnique({
      where: { id },
      include: { seller: { select: { id: true, name: true } } },
    });
  },

  create: (data: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    sellerId: string;
  }) => {
    return prisma.product.create({ data });
  },
};
