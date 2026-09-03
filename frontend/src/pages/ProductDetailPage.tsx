import { useEffect, useState } from "react";
import { ChatWindow } from "../components/chat/ChatWindow";
import type { Product } from "../types/product";
import { api } from "../services/api";
import { mockProducts } from "../data/mockProducts";

const formatStatus = (status: Product["status"]) => {
  const labels: Record<Product["status"], string> = {
    DISPONIVEL: "Disponível",
    RESERVADO: "Reservado",
    VENDIDO: "Vendido",
  };

  return labels[status] ?? status;
};

interface ProductDetailPageProps {
  productId: string;
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProductById(productId);

        const normalizedProduct: Product = {
          id: response.id,
          title: response.title,
          description: response.description,
          price: Number(response.price),
          status: response.status,
          imageUrl: response.imageUrl ?? response.images?.[0]?.url ?? "https://placehold.co/900x700?text=Brickeando",
          seller: {
            id: response.seller?.id ?? "",
            name: response.seller?.name ?? "Vendedor",
          },
          categories: Array.isArray(response.categories)
            ? response.categories.map((item) => ({
                id: item.category?.id ?? item.id ?? "",
                name: item.category?.name ?? item.name ?? "Categoria",
              }))
            : [],
        };

        setProduct(normalizedProduct);
      } catch {
        const foundDemoProduct = mockProducts.find((item) => item.id === productId) ?? mockProducts[0];
        setProduct(foundDemoProduct ?? null);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (isLoading) {
    return <p>Carregando detalhe do produto...</p>;
  }

  if (error) {
    return <p style={{ color: "crimson" }}>{error}</p>;
  }

  if (!product) {
    return <p>Produto não encontrado.</p>;
  }

  return (
    <div>
      <div className="detail-layout">
        <img
          src={product.imageUrl ?? "https://placehold.co/600x400?text=Produto"}
          alt={product.title}
          className="detail-image"
        />

        <aside className="detail-meta">
          <span className="detail-status">{formatStatus(product.status)}</span>
          <h1 className="detail-title">{product.title}</h1>
          <p className="detail-price">R$ {Number(product.price).toFixed(2)}</p>
          <p className="detail-description">{product.description}</p>
          <p><strong>Vendedor:</strong> {product.seller.name}</p>
          <p><strong>Categorias:</strong> {product.categories.map((category) => category.name).join(", ") || "Sem categoria"}</p>
        </aside>
      </div>

      <div className="chat-panel">
        <ChatWindow productId={product.id} sellerId={product.seller.id} />
      </div>
    </div>
  );
}
