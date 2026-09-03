import { Router } from "express";
import { chatController } from "../controllers/chat.controller";

export const chatRoutes = Router();

chatRoutes.get("/chat/conversations/:userId", chatController.getUserConversations);
chatRoutes.get("/chat/conversations/:conversationId/messages", chatController.getConversationMessages);
chatRoutes.post("/chat/conversations", chatController.createConversation);
chatRoutes.post("/chat/messages", chatController.sendMessage);
