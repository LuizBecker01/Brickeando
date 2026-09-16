import { FormEvent, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
}

interface ChatWindowProps {
  productId: string;
  sellerId: string;
  sellerName?: string;
}

export function ChatWindow({
  productId,
  sellerId,
  sellerName,
}: ChatWindowProps) {
  const { user } = useAuth();
  const buyerName = user?.name ?? "Você";
  const buyerId = user?.id ?? "buyer-demo";
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: `${productId}-seller-demo`,
      content: "Olá! Fique à vontade para perguntar sobre o anúncio.",
      senderId: sellerId,
      senderName: sellerName ?? "Vendedor",
    },
    {
      id: `${productId}-buyer-demo`,
      content:
        "Olá! Estou interessado neste produto e queria saber mais detalhes.",
      senderId: buyerId,
      senderName: buyerName,
    },
  ]);
  const [draft, setDraft] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();

    if (!content) return;

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        content,
        senderId: buyerId,
        senderName: buyerName,
      },
    ]);
    setDraft("");
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 16px" }}>
        Chat com {sellerName ?? "vendedor"}
      </h3>
      <p className="chat-demo-note">Demonstração da conversa do anúncio.</p>

      <div className="chat-list">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === buyerId;

          return (
            <div
              key={message.id}
              className={`chat-bubble ${isCurrentUser ? "is-current" : "is-other"}`}
            >
              <strong>{message.senderName}</strong>
              <p style={{ margin: "6px 0 0" }}>{message.content}</p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Mensagem para ${sellerName ?? "o vendedor"}`}
        />
        <button type="submit" className="primary-button">
          Enviar
        </button>
      </form>
    </div>
  );
}
