import { FormEvent, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../../contexts/AuthContext";
import { api, type ChatMessage } from "../../services/api";

interface ChatWindowProps {
  productId: string;
  sellerId: string;
  sellerName?: string;
}

const socketUrl =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, "") ??
  "http://localhost:777";

export function ChatWindow({ productId, sellerId, sellerName }: ChatWindowProps) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.id === sellerId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const loadConversation = async () => {
      try {
        const conversation = await api.createConversation(sellerId, productId);
        if (!isMounted) return;

        setConversationId(conversation.id);
        setMessages(conversation.messages ?? []);

        const socketInstance = io(socketUrl, {
          transports: ["websocket"],
          auth: { token: localStorage.getItem("@Brickeando:token") },
        });
        socketInstance.emit("join_conversation", conversation.id);
        socketInstance.on("new_message", (message: ChatMessage) => {
          setMessages((current) =>
            current.some((item) => item.id === message.id)
              ? current
              : [...current, message],
          );
        });
        socketInstance.on("message_error", (message: string) => {
          setError(message);
        });
        setSocket(socketInstance);
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar o chat.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadConversation();

    return () => {
      isMounted = false;
      setSocket((current) => {
        current?.disconnect();
        return null;
      });
    };
  }, [productId, sellerId, user]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();

    if (!content || !socket || !conversationId || !user) return;

    socket.emit("send_message", {
      conversationId,
      senderId: user.id,
      receiverId: sellerId,
      content,
      productId,
    });
    setDraft("");
  };

  if (user?.id === sellerId) {
    return <p>Este é o seu anúncio. O chat fica disponível para compradores.</p>;
  }

  return (
    <div>
      <h3 style={{ margin: "0 0 16px" }}>Chat com {sellerName ?? "vendedor"}</h3>

      {isLoading ? <p>Carregando conversa...</p> : null}
      {error ? <p className="auth-error">{error}</p> : null}

      {!isLoading ? (
        <>
          <div className="chat-list">
            {messages.length === 0 ? <p>Nenhuma mensagem ainda.</p> : null}
            {messages.map((message) => {
              const isCurrentUser = message.sender.id === user?.id;

              return (
                <div
                  key={message.id}
                  className={`chat-bubble ${isCurrentUser ? "is-current" : "is-other"}`}
                >
                  <strong>{message.sender.name ?? "Usuário"}</strong>
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
              disabled={!socket}
            />
            <button type="submit" className="primary-button" disabled={!socket}>
              Enviar
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
}

