import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import type { Product, ProductFormData } from "../../types/product";
import { api } from "../../services/api";

const getInitialForm = (product?: Product | null): ProductFormData => ({
  title: product?.title ?? "",
  description: product?.description ?? "",
  price: product?.price ?? 0,
  status: product?.status ?? "DISPONIVEL",
  imageUrl: product?.imageUrl ?? "",
});

interface ProductFormProps {
  onSuccess?: (product: Product) => void;
  initialProduct?: Product | null;
  onCancel?: () => void;
}

export function ProductForm({ onSuccess, initialProduct, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(() => getInitialForm(initialProduct));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(getInitialForm(initialProduct));
  }, [initialProduct]);

  const readImageFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((current) => ({ ...current, imageUrl: result }));
    };

    reader.onerror = () => {
      setError("Não foi possível anexar a imagem selecionada.");
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const rawSession = localStorage.getItem("brickeando_session");
      const session = rawSession ? JSON.parse(rawSession) : null;
      const sellerId = session?.user?.id;

      if (!sellerId) {
        throw new Error("Você precisa estar logado para anunciar um produto.");
      }

      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl || undefined,
        status: form.status,
        sellerId,
      };

      const createdOrUpdatedProduct = initialProduct
        ? await api.updateProduct(initialProduct.id, {
            title: payload.title,
            description: payload.description,
            price: payload.price,
            imageUrl: payload.imageUrl ?? null,
            status: payload.status,
          })
        : await api.createProduct(payload);

      const normalizedProduct: Product = {
        id: createdOrUpdatedProduct.id,
        title: createdOrUpdatedProduct.title,
        description: createdOrUpdatedProduct.description,
        price: Number(createdOrUpdatedProduct.price),
        status: createdOrUpdatedProduct.status,
        imageUrl:
          createdOrUpdatedProduct.imageUrl ??
          createdOrUpdatedProduct.images?.[0]?.url ??
          "https://placehold.co/900x700?text=Brickeando",
        seller: {
          id: createdOrUpdatedProduct.seller?.id ?? sellerId,
          name: createdOrUpdatedProduct.seller?.name ?? "Vendedor",
        },
        categories: Array.isArray(createdOrUpdatedProduct.categories)
          ? createdOrUpdatedProduct.categories.map((item) => ({
              id: item.category?.id ?? item.id ?? "",
              name: item.category?.name ?? item.name ?? "Categoria",
            }))
          : [],
      };

      onSuccess?.(normalizedProduct);
      setForm(getInitialForm());
      onCancel?.();
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
          <span>Imagem do anúncio</span>
          <input type="file" accept="image/*" onChange={readImageFile} />
        </label>

        <label className="form-field" style={{ gridColumn: "1 / -1" }}>
          <span>Ou use uma URL da imagem</span>
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

      <div className="product-form-actions">
        {onCancel ? (
          <button type="button" className="inventory-action secondary" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}

        <button type="submit" disabled={isSubmitting} className="primary-button">
          {isSubmitting ? (initialProduct ? "Salvando..." : "Publicando...") : initialProduct ? "Salvar alterações" : "Publicar anúncio"}
        </button>
      </div>
    </form>
  );
}
