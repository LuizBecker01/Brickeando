import { FormEvent, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
  };
  receiver: {
    id: string;
    name: string;
  };
}

interface ChatWindowProps {
  productId: string;
  sellerId: string;
}

const BASE_URL = "http://localhost:777";

export function ChatWindow({ productId, sellerId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(
    [
      {
        id: "initial",
        content: "Olá! Estou interessado neste produto e queria saber mais detalhes.",
        sender: { id: "buyer-1", name: "Você" },
        receiver: { id: sellerId, name: "Vendedor" },
      },
    ]
  );
  const [draft, setDraft] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(BASE_URL, { transports: ["websocket"] });
    setSocket(socketInstance);

    socketInstance.emit("join_conversation", productId);

    socketInstance.on("new_message", (message: Message) => {
      setMessages((current) => [...current, message]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [productId, sellerId]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.trim()) {
      return;
    }

    const nextMessage: Message = {
      id: crypto.randomUUID(),
      content: draft.trim(),
      sender: { id: "buyer-1", name: "Você" },
      receiver: { id: sellerId, name: "Vendedor" },
    };

    setMessages((current) => [...current, nextMessage]);
    socket?.emit("send_message", {
      conversationId: productId,
      senderId: "buyer-1",
      receiverId: sellerId,
      content: draft.trim(),
      productId,
    });
    setDraft("");
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 16px" }}>Chat da negociação</h3>

      <div className="chat-list">
        {messages.map((message) => {
          const isCurrentUser = message.sender.id === "buyer-1";

          return (
            <div
              key={message.id}
              className={`chat-bubble ${isCurrentUser ? "is-current" : "is-other"}`}
            >
              <strong>{message.sender.name}</strong>
              <p style={{ margin: "6px 0 0" }}>{message.content}</p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Digite sua mensagem"
        />
        <button type="submit" className="primary-button">
          Enviar
        </button>
      </form>
    </div>
  );
}
