import { useEffect, useState } from "react";
import { ChatWindow } from "../components/chat/ChatWindow";
import type { Product } from "../types/product";
import { api } from "../services/api";
import { mockProducts } from "../data/mockProducts";
import { normalizeProduct } from "../utils/product";

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
  currentUserId?: string;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductDetailPage({
  productId,
  currentUserId,
  onEdit,
  onDelete,
}: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOwnerMenuOpen, setIsOwnerMenuOpen] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProductById(productId);

        const normalizedProduct = normalizeProduct(response);
        setProduct(normalizedProduct);
        setSelectedImage(normalizedProduct.imageUrl ?? null);
      } catch {
        const foundDemoProduct =
          mockProducts.find((item) => item.id === productId) ?? mockProducts[0];
        setProduct(foundDemoProduct ?? null);
        setSelectedImage(foundDemoProduct?.imageUrl ?? null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (isLoading) {
    return <p>Carregando detalhe do produto...</p>;
  }

  if (!product) {
    return <p>Produto não encontrado.</p>;
  }

  const isOwner = Boolean(currentUserId && product.seller.id === currentUserId);
  const productImages = product.images?.length
    ? product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  const mainImage = selectedImage ?? productImages[0];

  return (
    <div>
      <div className="detail-layout">
        <div className="detail-gallery">
          <img
            src={mainImage ?? "https://placehold.co/600x400?text=Produto"}
            alt={product.title}
            className="detail-image"
          />
          {productImages.length > 1 ? (
            <div
              className="detail-thumbnails"
              aria-label="Outras fotos do anúncio"
            >
              {productImages.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={
                    image === mainImage
                      ? "detail-thumbnail is-selected"
                      : "detail-thumbnail"
                  }
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Ver foto ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${product.title} - foto ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="detail-meta">
          <span className="detail-status">{formatStatus(product.status)}</span>
          <h1 className="detail-title">{product.title}</h1>
          <p className="detail-price">R$ {Number(product.price).toFixed(2)}</p>
          <p className="detail-description">{product.description}</p>
          <p>
            <strong>Vendedor:</strong> {product.seller.name}
          </p>
          <p>
            <strong>Localização:</strong>{" "}
            {product.locationName ?? "Não informada"}
          </p>
          <p>
            <strong>Condição:</strong> {product.condition.replace("_", " ")}
          </p>
          <p>
            <strong>Categorias:</strong>{" "}
            {product.categories.map((category) => category.name).join(", ") ||
              "Sem categoria"}
          </p>

          {isOwner ? (
            <div className="owner-actions">
              <button
                type="button"
                className="owner-menu-button"
                aria-label="Mais opções do anúncio"
                aria-expanded={isOwnerMenuOpen}
                onClick={() => setIsOwnerMenuOpen((current) => !current)}
              >
                <span aria-hidden="true">...</span>
              </button>
              {isOwnerMenuOpen ? (
                <div className="owner-menu">
                  <button type="button" onClick={() => onEdit?.(product)}>
                    Editar anúncio
                  </button>
                  <button
                    type="button"
                    className="owner-menu-danger"
                    onClick={() => onDelete?.(product.id)}
                  >
                    Excluir anúncio
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>

      <div className="chat-panel">
        <ChatWindow
          productId={product.id}
          sellerId={product.seller.id}
          sellerName={product.seller.name}
        />
      </div>
    </div>
  );
}
