import { NextFunction, Request, Response } from "express";
import { chatService } from "../services/chat.service";

export const chatController = {
  async getUserConversations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId || userId !== req.params.userId) {
        res.status(403).json({ message: "Acesso negado." });
        return;
      }
      const conversations = await chatService.getConversationsByUser(userId);
      res.status(200).json(conversations);
    } catch (error) {
      next(error);
    }
  },

  async getConversationMessages(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const conversationId = req.params.conversationId;
      if (!req.user?.id) {
        res.status(401).json({ message: "Usuário não autenticado." });
        return;
      }
      const messages = await chatService.getMessagesByConversationId(
        conversationId,
        req.user.id,
      );
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  },

  async createConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const conversation = await chatService.createConversation({
        ...req.body,
        buyerId: req.user?.id,
      });
      res.status(201).json(conversation);
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const message = await chatService.sendMessage({
        ...req.body,
        senderId: req.user?.id,
      });
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  },
};
