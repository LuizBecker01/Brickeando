import { AppError } from "../errors/app-error";
import { HttpStatus } from "../errors/http-status";
import { chatRepository } from "../repositories/chat.repository";
import { CreateConversationDto, CreateMessageDto } from "../dtos/chat/create-message.dto";

export const chatService = {
  async getConversationsByUser(userId: string) {
    if (!userId) {
      throw new AppError("Identificador do usuário obrigatório.", HttpStatus.BAD_REQUEST);
    }

    return chatRepository.findConversationsByUser(userId);
  },

  async getMessagesByConversationId(conversationId: string) {
    const conversation = await chatRepository.findConversationById(conversationId);

    if (!conversation) {
      throw new AppError("Conversa não encontrada.", HttpStatus.NOT_FOUND);
    }

    return chatRepository.findMessagesByConversationId(conversationId);
  },

  async createConversation(data: CreateConversationDto) {
    if (!data.productId || !data.buyerId || !data.sellerId) {
      throw new AppError("Produto, comprador e vendedor são obrigatórios.", HttpStatus.BAD_REQUEST);
    }

    const existingConversation = await chatRepository.findConversationByProductAndUsers(data);
    if (existingConversation) {
      return existingConversation;
    }

    return chatRepository.createConversation(data);
  },

  async sendMessage(data: CreateMessageDto) {
    if (!data.conversationId || !data.senderId || !data.receiverId || !data.content?.trim()) {
      throw new AppError("Conversa, remetente, destinatário e conteúdo são obrigatórios.", HttpStatus.BAD_REQUEST);
    }

    const conversation = await chatRepository.findConversationById(data.conversationId);
    if (!conversation) {
      throw new AppError("Conversa não encontrada.", HttpStatus.NOT_FOUND);
    }

    const isParticipant = [conversation.buyerId, conversation.sellerId].includes(data.senderId);
    if (!isParticipant) {
      throw new AppError("O usuário não pertence a esta conversa.", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return chatRepository.createMessage(data);
  },
};
