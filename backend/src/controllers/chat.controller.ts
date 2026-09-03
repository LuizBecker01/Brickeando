import { NextFunction, Request, Response } from "express";
import { chatService } from "../services/chat.service";

export const chatController = {
  async getUserConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const conversations = await chatService.getConversationsByUser(userId);
      res.status(200).json(conversations);
    } catch (error) {
      next(error);
    }
  },

  async getConversationMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = req.params.conversationId;
      const messages = await chatService.getMessagesByConversationId(conversationId);
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  },

  async createConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await chatService.createConversation(req.body);
      res.status(201).json(conversation);
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await chatService.sendMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  },
};
