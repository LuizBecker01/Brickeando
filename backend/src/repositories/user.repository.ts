import { prisma } from "../config/prisma";
import { CreateUserDto } from "../dtos/user/create-user.dto";

export const userRepository = {
  async findByEmail(email?: string | null) {
    if (!email) return null;
    return prisma.user.findUnique({ where: { email } });
  },

  async findByCpf(cpf: string) {
    return prisma.user.findUnique({ where: { cpf } });
  },

  async findByProviderId(providerId: string) {
    return prisma.user.findFirst({
      where: { providerId },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        provider: true,
      },
    });
  },

  async create(data: CreateUserDto & { passwordHash?: string | null; provider?: "LOCAL" | "GOOGLE"; providerId?: string | null }) {
    return prisma.user.create({
      data: {
        name: data.name?.trim() || null,
        email: data.email?.trim().toLowerCase() || null,
        cpf: data.cpf,
        passwordHash: data.passwordHash ?? null,
        provider: data.provider ?? "LOCAL",
        providerId: data.providerId ?? null,
        phone: data.phone ?? null,
        avatarUrl: data.avatarUrl ?? null,
        bio: data.bio ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        provider: true,
      },
    });
  },

  async updateProvider(id: string, data: { provider: "LOCAL" | "GOOGLE"; providerId?: string | null; avatarUrl?: string | null; name?: string }) {
    return prisma.user.update({
      where: { id },
      data: {
        provider: data.provider,
        providerId: data.providerId ?? null,
        avatarUrl: data.avatarUrl ?? undefined,
        name: data.name ?? undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        provider: true,
      },
    });
  },

  async upsertGoogleUser(data: { email: string; name: string; avatarUrl?: string | null; providerId: string }) {
    return prisma.user.upsert({
      where: { email: data.email },
      create: {
        name: data.name.trim(),
        email: data.email,
        cpf: `google-${data.providerId}`,
        avatarUrl: data.avatarUrl ?? null,
        provider: "GOOGLE",
        providerId: data.providerId,
      },
      update: {
        name: data.name.trim(),
        avatarUrl: data.avatarUrl ?? undefined,
        provider: "GOOGLE",
        providerId: data.providerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        provider: true,
      },
    });
  },
};
