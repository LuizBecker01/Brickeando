import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import type { Product, ProductFormData } from "../../types/product";
import { api } from "../../services/api";

const getInitialForm = (product?: Product | null): ProductFormData => ({
  title: product?.title ?? "",
  description: product?.description ?? "",
  price: product?.price ?? 0,
  condition: product?.condition ?? "USADO",
  imageUrl: product?.imageUrl ?? "",
  locationName: product?.locationName ?? "",
  latitude: product?.latitude ?? null,
  longitude: product?.longitude ?? null,
  categoryIds: product?.categories.map((category) => category.id) ?? [],
});

const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
  | string
  | undefined;

interface ProductFormProps {
  onSuccess?: (product: Product) => void;
  initialProduct?: Product | null;
  onCancel?: () => void;
}

export function ProductForm({
  onSuccess,
  initialProduct,
  onCancel,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(() =>
    getInitialForm(initialProduct),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(() =>
    initialProduct?.imageUrl ? [initialProduct.imageUrl] : [],
  );
  const { isLoaded: isMapsLoaded } = useJsApiLoader({
    id: "brickeando-google-maps",
    googleMapsApiKey: mapsApiKey ?? "",
    libraries: ["places"],
  });

  useEffect(() => {
    setForm(getInitialForm(initialProduct));
    setImagePreviews(initialProduct?.imageUrl ? [initialProduct.imageUrl] : []);
  }, [initialProduct]);

  useEffect(() => {
    api
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (initialProduct?.locationName) {
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((current) => ({ ...current, latitude, longitude }));

        if (!isMapsLoaded || !window.google?.maps) {
          return;
        }

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            if (status === "OK" && results?.[0]) {
              const address = results[0].formatted_address;
              setForm((current) => ({ ...current, locationName: address }));
            }
          },
        );
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, [initialProduct, isMapsLoaded]);

  const readImageFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(
      0,
      5 - imagePreviews.length,
    );
    if (files.length === 0) {
      return;
    }

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve(typeof reader.result === "string" ? reader.result : "");
            reader.onerror = () =>
              reject(
                new Error("Não foi possível anexar as imagens selecionadas."),
              );
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((previews) => {
        const nextPreviews = [...imagePreviews, ...previews].slice(0, 5);
        setImagePreviews(nextPreviews);
        setForm((current) => ({ ...current, imageUrl: nextPreviews[0] ?? "" }));
      })
      .catch((fileError: unknown) => {
        setError(
          fileError instanceof Error
            ? fileError.message
            : "Não foi possível anexar as imagens selecionadas.",
        );
      });
    event.currentTarget.value = "";
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
        condition: form.condition,
        imageUrl: form.imageUrl || undefined,
        imageUrls: imagePreviews,
        sellerId,
        locationName: form.locationName || null,
        latitude: form.latitude,
        longitude: form.longitude,
        categoryIds: form.categoryIds,
      };

      const createdOrUpdatedProduct = initialProduct
        ? await api.updateProduct(initialProduct.id, {
            title: payload.title,
            description: payload.description,
            price: payload.price,
            condition: payload.condition,
            imageUrl: payload.imageUrl ?? null,
            imageUrls: payload.imageUrls,
            locationName: payload.locationName,
            latitude: payload.latitude,
            longitude: payload.longitude,
            categoryIds: payload.categoryIds,
          })
        : await api.createProduct(payload);

      const normalizedProduct: Product = {
        id: createdOrUpdatedProduct.id,
        title: createdOrUpdatedProduct.title,
        description: createdOrUpdatedProduct.description,
        price: Number(createdOrUpdatedProduct.price),
        status: createdOrUpdatedProduct.status,
        condition: createdOrUpdatedProduct.condition,
        locationName: createdOrUpdatedProduct.locationName,
        latitude: createdOrUpdatedProduct.latitude,
        longitude: createdOrUpdatedProduct.longitude,
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
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Erro ao cadastrar produto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="listing-editor">
      <form className="listing-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>Título</span>
            <input
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
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
              onChange={(event) =>
                setForm({ ...form, price: Number(event.target.value) })
              }
            />
          </label>

          <label className="form-field">
            <span>Condição</span>
            <select
              value={form.condition}
              onChange={(event) =>
                setForm({
                  ...form,
                  condition: event.target.value as ProductFormData["condition"],
                })
              }
            >
              <option value="NOVO">Novo</option>
              <option value="SEMINOVO">Seminovo</option>
              <option value="USADO">Usado</option>
              <option value="PARA_REPARO">Para reparo</option>
            </select>
          </label>

          <label className="form-field">
            <span>Categoria</span>
            <select
              value={form.categoryIds[0] ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  categoryIds: event.target.value ? [event.target.value] : [],
                })
              }
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field" style={{ gridColumn: "1 / -1" }}>
            <span>Fotos · {imagePreviews.length}/5</span>
            <label className="photo-dropzone">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={readImageFiles}
              />
              <span className="photo-add-icon">+</span>
              <strong>Adicione fotos</strong>
              <small>ou arraste e solte</small>
            </label>
            {imagePreviews.length > 0 ? (
              <div className="photo-thumbnails">
                {imagePreviews.map((preview, index) => (
                  <img
                    key={`${preview.slice(0, 20)}-${index}`}
                    src={preview}
                    alt={`Foto ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </label>

          <label className="form-field" style={{ gridColumn: "1 / -1" }}>
            <span>Descrição</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Descreva o item com detalhes relevantes para quem vai comprar."
            />
          </label>
        </div>

        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

        <div className="product-form-actions">
          {onCancel ? (
            <button
              type="button"
              className="inventory-action secondary"
              onClick={onCancel}
            >
              Cancelar
            </button>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="primary-button"
          >
            {isSubmitting
              ? initialProduct
                ? "Salvando..."
                : "Publicando..."
              : initialProduct
                ? "Salvar alterações"
                : "Publicar anúncio"}
          </button>
        </div>
      </form>

      <aside className="listing-preview" aria-label="Prévia do anúncio">
        <div className="listing-preview-heading">
          <span>Prévia</span>
          <small>Como o anúncio aparecerá</small>
        </div>

        <div className="preview-card">
          <div className="preview-media">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Prévia do anúncio" />
            ) : (
              <div className="preview-empty-media">
                <span>Adicione uma foto</span>
                <small>A imagem aparecerá aqui</small>
              </div>
            )}
          </div>

          <div className="preview-content">
            <span className="preview-eyebrow">Marketplace</span>
            <h3>{form.title.trim() || "Título"}</h3>
            <strong>
              {Number(form.price) > 0
                ? `R$ ${Number(form.price).toFixed(2)}`
                : "Preço"}
            </strong>
            <p className="preview-location">
              Anunciado agora
              {form.locationName.trim()
                ? ` em ${form.locationName.trim()}`
                : ""}
            </p>

            <h4>Detalhes</h4>
            <p>{form.description.trim() || "A descrição aparecerá aqui."}</p>

            <div className="preview-seller">
              <div className="preview-avatar">V</div>
              <div>
                <b>Seu anúncio</b>
                <span>Informações do vendedor</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
