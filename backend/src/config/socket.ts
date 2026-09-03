import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { Express } from "express";
import { chatService } from "../services/chat.service";

export const configureSocket = (app: Express) => {
  const httpServer = createServer(app);
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on(
      "send_message",
      async (payload: {
        conversationId: string;
        senderId: string;
        receiverId: string;
        content: string;
        productId?: string;
      }) => {
        try {
          const message = await chatService.sendMessage({
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            receiverId: payload.receiverId,
            content: payload.content,
            productId: payload.productId ?? null,
          });

          io.to(`conversation:${payload.conversationId}`).emit("new_message", message);
        } catch (error) {
          socket.emit("message_error", error instanceof Error ? error.message : "Erro ao enviar mensagem.");
        }
      },
    );
  });

  return httpServer;
};
