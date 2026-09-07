import type { KeyboardEvent } from "react";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
  onSelect?: (productId: string) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const openProduct = () => onSelect?.(product.id);
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProduct();
    }
  };

  return (
    <article
      className="product-card"
      onClick={openProduct}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Abrir anúncio: ${product.title}`}
    >
      <img
        src={product.imageUrl ?? "https://placehold.co/600x400?text=Produto"}
        alt={product.title}
        className="product-card-image"
      />

      <h3 className="product-card-title">{product.title}</h3>
    </article>
  );
}
