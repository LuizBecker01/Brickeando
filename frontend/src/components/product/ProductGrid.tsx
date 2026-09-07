import type { Product } from "../../types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onSelectProduct?: (productId: string) => void;
}

export function ProductGrid({ products, onSelectProduct }: ProductGridProps) {
  return (
    <section className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={onSelectProduct}
        />
      ))}
    </section>
  );
}
