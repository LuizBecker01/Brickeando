export interface CreateConversationDto {
  productId: string;
  buyerId: string;
  sellerId: string;
}

export interface CreateMessageDto {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  productId?: string | null;
}
