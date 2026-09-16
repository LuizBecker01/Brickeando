import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const chatRoutes = Router();

chatRoutes.get(
  "/chat/conversations/:userId",
  authMiddleware,
  chatController.getUserConversations,
);
chatRoutes.get(
  "/chat/conversations/:conversationId/messages",
  authMiddleware,
  chatController.getConversationMessages,
);
chatRoutes.post(
  "/chat/conversations",
  authMiddleware,
  chatController.createConversation,
);
chatRoutes.post("/chat/messages", authMiddleware, chatController.sendMessage);
