import type { Product } from "../../types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  currentUserId?: string;
  onSelectProduct?: (productId: string) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

export function ProductGrid({ products, currentUserId, onSelectProduct, onEditProduct, onDeleteProduct }: ProductGridProps) {
  return (
    <section className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currentUserId={currentUserId}
          onSelect={onSelectProduct}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
        />
      ))}
    </section>
  );
}
