import type { Product } from "../../types/product";

const formatStatus = (status: Product["status"]) => {
  const labels: Record<Product["status"], string> = {
    DISPONIVEL: "Disponível",
    RESERVADO: "Reservado",
    VENDIDO: "Vendido",
  };

  return labels[status] ?? status;
};

interface ProductCardProps {
  product: Product;
  currentUserId?: string;
  onSelect?: (productId: string) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductCard({ product, currentUserId, onSelect, onEdit, onDelete }: ProductCardProps) {
  const isOwner = currentUserId && product.seller.id === currentUserId;

  return (
    <article className="product-card" onClick={() => onSelect?.(product.id)}>
      <img
        src={product.imageUrl ?? "https://placehold.co/600x400?text=Produto"}
        alt={product.title}
        className="product-card-image"
      />

      <div className="product-card-header">
        <h3 className="product-card-title">{product.title}</h3>
        <span className="product-status">{formatStatus(product.status)}</span>
      </div>

      <p className="product-card-description">{product.description}</p>
      <div className="product-price">R$ {Number(product.price).toFixed(2)}</div>
      <p className="product-seller">Vendedor: {product.seller.name}</p>

      {isOwner ? (
        <div className="product-actions" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className="inventory-action secondary"
            onClick={() => onEdit?.(product)}
          >
            Editar
          </button>
          <button
            type="button"
            className="inventory-action danger"
            onClick={() => onDelete?.(product.id)}
          >
            Excluir
          </button>
        </div>
      ) : null}
    </article>
  );
}
