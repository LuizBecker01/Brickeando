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
  onSelect?: (productId: string) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
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
    </article>
  );
}
