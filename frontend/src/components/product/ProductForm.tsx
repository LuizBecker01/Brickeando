import { FormEvent, useState } from "react";
import type { Product, ProductFormData } from "../../types/product";
import { api } from "../../services/api";

const initialForm: ProductFormData = {
  title: "",
  description: "",
  price: 0,
  status: "DISPONIVEL",
  imageUrl: "",
};

const statusLabels: Record<Product["status"], string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
};

interface ProductFormProps {
  onSuccess?: (product: Product) => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl || undefined,
        status: form.status,
        sellerId: "2e8a3e0d-78d0-4f67-a61a-6000b7d5e4e5",
      };

      const createdProduct = await api.createProduct(payload);

      const normalizedProduct: Product = {
        id: createdProduct.id,
        title: createdProduct.title,
        description: createdProduct.description,
        price: Number(createdProduct.price),
        status: createdProduct.status,
        imageUrl: createdProduct.imageUrl ?? createdProduct.images?.[0]?.url ?? "https://placehold.co/900x700?text=Brickeando",
        seller: {
          id: createdProduct.seller?.id ?? "",
          name: createdProduct.seller?.name ?? "Vendedor",
        },
        categories: Array.isArray(createdProduct.categories)
          ? createdProduct.categories.map((item) => ({
              id: item.category?.id ?? item.id ?? "",
              name: item.category?.name ?? item.name ?? "Categoria",
            }))
          : [],
      };

      onSuccess?.(normalizedProduct);
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao cadastrar produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div className="form-grid">
        <label className="form-field">
          <span>Título</span>
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Ex: Mesa de jantar em madeira"
          />
        </label>

        <label className="form-field">
          <span>Preço</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
          />
        </label>

        <label className="form-field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as ProductFormData["status"] })}
          >
            <option value="DISPONIVEL">Disponível</option>
            <option value="RESERVADO">Reservado</option>
            <option value="VENDIDO">Vendido</option>
          </select>
        </label>

        <label className="form-field" style={{ gridColumn: "1 / -1" }}>
          <span>URL da imagem</span>
          <input
            value={form.imageUrl}
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
            placeholder="https://..."
          />
        </label>

        <label className="form-field" style={{ gridColumn: "1 / -1" }}>
          <span>Descrição</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Descreva o item com detalhes relevantes para quem vai comprar."
          />
        </label>
      </div>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <button type="submit" disabled={isSubmitting} className="primary-button">
        {isSubmitting ? "Publicando..." : "Publicar anúncio"}
      </button>
    </form>
  );
}
