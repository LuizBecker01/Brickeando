import { prisma } from "../config/prisma";
import { CreateConversationDto, CreateMessageDto } from "../dtos/chat/create-message.dto";

export const chatRepository = {
  async findConversationByProductAndUsers(data: CreateConversationDto) {
    return prisma.conversation.findFirst({
      where: {
        productId: data.productId,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
      },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  },

  async createConversation(data: CreateConversationDto) {
    return prisma.conversation.create({
      data: {
        productId: data.productId,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
      },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  },

  async findConversationById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  },

  async findConversationsByUser(userId: string) {
    return prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  async findMessagesByConversationId(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async createMessage(data: CreateMessageDto) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        productId: data.productId ?? null,
        content: data.content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });
  },
};
