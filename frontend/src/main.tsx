import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductForm } from "./components/product/ProductForm";
import { ProductGrid } from "./components/product/ProductGrid";
import { LoginScreen } from "./components/auth/LoginScreen";
import { api } from "./services/api";
import type { Product } from "./types/product";
import { mockProducts } from "./data/mockProducts";
import "./styles.css";

function App() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(mockProducts[0]?.id ?? null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<{ token: string; user: { id: string; name: string; email: string; cpf?: string } } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshProducts = async () => {
    try {
      const response = await api.getProducts();
      const normalizedProducts = response.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        status: product.status,
        imageUrl: product.imageUrl ?? product.images?.[0]?.url ?? "https://placehold.co/900x700?text=Brickeando",
        seller: {
          id: product.seller?.id ?? "",
          name: product.seller?.name ?? "Vendedor",
        },
        categories: Array.isArray(product.categories)
          ? product.categories.map((item) => ({
              id: item.category?.id ?? item.id ?? "",
              name: item.category?.name ?? item.name ?? "Categoria",
            }))
          : [],
      }));

      setProducts(normalizedProducts);
      if (!selectedProductId && normalizedProducts[0]) {
        setSelectedProductId(normalizedProducts[0].id);
      }
    } catch {
      setProducts(mockProducts);
    }
  };

  useEffect(() => {
    const savedSession = localStorage.getItem("brickeando_session");
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch {
        localStorage.removeItem("brickeando_session");
      }
    }

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProducts();

        if (response.length > 0) {
          const normalizedProducts = response.map((product) => ({
            id: product.id,
            title: product.title,
            description: product.description,
            price: Number(product.price),
            status: product.status,
            imageUrl: product.imageUrl ?? product.images?.[0]?.url ?? "https://placehold.co/900x700?text=Brickeando",
            seller: {
              id: product.seller?.id ?? "",
              name: product.seller?.name ?? "Vendedor",
            },
            categories: Array.isArray(product.categories)
              ? product.categories.map((item) => ({
                  id: item.category?.id ?? item.id ?? "",
                  name: item.category?.name ?? item.name ?? "Categoria",
                }))
              : [],
          }));

          setProducts(normalizedProducts);
          setSelectedProductId((current) => current ?? normalizedProducts[0]?.id ?? null);
        }
      } catch {
        setProducts(mockProducts);
        setSelectedProductId((current) => current ?? mockProducts[0]?.id ?? null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleLocalLogin = (nextSession: { token: string; user: { id: string; name: string; email: string; cpf?: string } }) => {
    setSession(nextSession);
    localStorage.setItem("brickeando_session", JSON.stringify(nextSession));
    setAuthError(null);
  };

  const handleProductSaved = (product: Product) => {
    setProducts((current) => {
      if (editingProductId) {
        return current.map((item) => (item.id === product.id ? product : item));
      }

      return [product, ...current.filter((item) => item.id !== product.id)];
    });

    setSelectedProductId(product.id);
    setEditingProductId(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts((current) => current.filter((item) => item.id !== productId));
      setSelectedProductId((current) => (current === productId ? null : current));
      if (editingProductId === productId) {
        setEditingProductId(null);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível excluir o produto.");
    }
  };

  const editingProduct = products.find((product) => product.id === editingProductId) ?? null;

  if (!session) {
    return <LoginScreen onLogin={handleLocalLogin} authError={authError} />;
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="brand-wrap">
          <img src="/logo.png" alt="Brickeando logo" className="brand-logo" />
        </div>

        <div className="hero-copy">
          <div className="hero-inline">
            <span className="hero-badge">Marketplace demo</span>
            <div className="user-pill">Olá, {session.user.name}</div>
            <button
              type="button"
              className="hero-button ghost"
              onClick={() => {
                setSession(null);
                localStorage.removeItem("brickeando_session");
              }}
            >
              Sair
            </button>
            <button type="button" className="hero-button solid">
              Anunciar
            </button>
          </div>

          <h1 className="hero-title">Brickeando</h1>
          <p className="hero-subtitle">
            Encontre itens incríveis, converse com vendedores e teste o fluxo do marketplace em uma interface moderna.
          </p>
          {authError ? <p className="auth-error">{authError}</p> : null}
        </div>
      </header>

      <section className="section">
        <div className="section-header">
          <h2>Itens em destaque</h2>
          <span>{products.length} itens</span>
        </div>

        {isLoading ? <p>Carregando produtos...</p> : null}
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

        {!isLoading && !error && products.length > 0 ? (
          <ProductGrid
            products={products}
            currentUserId={session.user.id}
            onSelectProduct={setSelectedProductId}
            onEditProduct={(product) => setEditingProductId(product.id)}
            onDeleteProduct={handleDeleteProduct}
          />
        ) : null}
      </section>

      <section className="section">
        <div className="section-header">
          <h2>{editingProduct ? "Editar anúncio" : "Publicar anúncio"}</h2>
          <span>{editingProduct ? "Atualize suas informações" : "Fluxo de cadastro"}</span>
        </div>

        <div className="form-panel">
          <ProductForm
            initialProduct={editingProduct}
            onSuccess={handleProductSaved}
            onCancel={() => setEditingProductId(null)}
          />
        </div>
      </section>

      <section className="section">
        {selectedProductId ? (
          <ProductDetailPage
            productId={selectedProductId}
            currentUserId={session.user.id}
            onEdit={(product) => setEditingProductId(product.id)}
            onDelete={handleDeleteProduct}
          />
        ) : (
          <p>Selecione um produto.</p>
        )}
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
