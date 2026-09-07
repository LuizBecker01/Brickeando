import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductForm } from "./components/product/ProductForm";
import { ProductGrid } from "./components/product/ProductGrid";
import { ProductFilters } from "./components/product/ProductFilters";
import { LoginScreen } from "./components/auth/LoginScreen";
import { api } from "./services/api";
import type { ProductFilters as ProductFilterValues } from "./services/api";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import type { Product } from "./types/product";
import { mockProducts } from "./data/mockProducts";
import "./styles.css";

function App() {
  const { user, signIn, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    mockProducts[0]?.id ?? null,
  );
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [currentView, setCurrentView] = useState<"catalog" | "form" | "detail">(
    "catalog",
  );
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [filters, setFilters] = useState<ProductFilterValues>({ radiusKm: 25 });

  const refreshProducts = async () => {
    try {
      const response = await api.getProducts();
      const normalizedProducts = response.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        status: product.status,
        condition: product.condition,
        locationName: product.locationName,
        latitude: product.latitude,
        longitude: product.longitude,
        imageUrl:
          product.imageUrl ??
          product.images?.[0]?.url ??
          "https://placehold.co/900x700?text=Brickeando",
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
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const [response, categoryResponse] = await Promise.all([
          api.getProducts(filters),
          api.getCategories(),
        ]);
        setCategories(categoryResponse);

        if (response.length > 0) {
          const normalizedProducts = response.map((product) => ({
            id: product.id,
            title: product.title,
            description: product.description,
            price: Number(product.price),
            status: product.status,
            condition: product.condition,
            locationName: product.locationName,
            latitude: product.latitude,
            longitude: product.longitude,
            imageUrl:
              product.imageUrl ??
              product.images?.[0]?.url ??
              "https://placehold.co/900x700?text=Brickeando",
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
          setSelectedProductId(
            (current) => current ?? normalizedProducts[0]?.id ?? null,
          );
        }
      } catch {
        setProducts(mockProducts);
        setSelectedProductId(
          (current) => current ?? mockProducts[0]?.id ?? null,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [
    filters.categoryId,
    filters.minPrice,
    filters.maxPrice,
    filters.latitude,
    filters.longitude,
    filters.radiusKm,
  ]);

  const handleLocalLogin = (nextSession: Parameters<typeof signIn>[0]) => {
    signIn(nextSession);
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
    setCurrentView("detail");
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts((current) => current.filter((item) => item.id !== productId));
      setSelectedProductId((current) =>
        current === productId ? null : current,
      );
      if (editingProductId === productId) {
        setEditingProductId(null);
      }
      setCurrentView("catalog");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível excluir o produto.",
      );
    }
  };

  const editingProduct =
    products.find((product) => product.id === editingProductId) ?? null;
  const visibleProducts = showOnlyMine
    ? products.filter((product) => product.seller.id === user?.id)
    : products;

  const clearFilters = () => setFilters({ radiusKm: 25 });

  if (!user) {
    return <LoginScreen onLogin={handleLocalLogin} authError={authError} />;
  }

  return (
    <main className="app-shell">
      {currentView !== "form" ? (
        <header className="site-header">
          <button
            type="button"
            className="brand-link"
            onClick={() => {
              setShowOnlyMine(false);
              setCurrentView("catalog");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img src="/logo.png" alt="Brickeando" className="brand-logo" />
          </button>

          <nav className="main-nav" aria-label="Navegação principal">
            <button
              type="button"
              className="nav-button nav-button-primary"
              onClick={() => {
                setEditingProductId(null);
                setCurrentView("form");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Anunciar
            </button>
            <button
              type="button"
              className="nav-button"
              onClick={() => {
                setShowOnlyMine(true);
                setCurrentView("catalog");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Meus anúncios
            </button>
            <div className="account-menu">
              <button
                type="button"
                className="nav-button account-button"
                aria-expanded={showAccountMenu}
                onClick={() => setShowAccountMenu((current) => !current)}
              >
                Conta
              </button>
              {showAccountMenu ? (
                <div className="account-popover">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  <button
                    type="button"
                    className="account-signout"
                    onClick={signOut}
                  >
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          </nav>
        </header>
      ) : null}

      {currentView === "catalog" ? (
        <section className="section" id="meus-anuncios">
          <ProductFilters
            filters={filters}
            categories={categories}
            onChange={setFilters}
            onClear={clearFilters}
          />
          <div className="section-header">
            <h2>{showOnlyMine ? "Meus anúncios" : "Itens em destaque"}</h2>
            <div className="section-tools">
              <span>{visibleProducts.length} itens</span>
              {showOnlyMine ? (
                <button
                  type="button"
                  className="clear-filter"
                  onClick={() => setShowOnlyMine(false)}
                >
                  Ver todos
                </button>
              ) : null}
            </div>
          </div>

          {isLoading ? <p>Carregando produtos...</p> : null}
          {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

          {!isLoading && !error && visibleProducts.length > 0 ? (
            <ProductGrid
              products={visibleProducts}
              onSelectProduct={(productId) => {
                setSelectedProductId(productId);
                setCurrentView("detail");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ) : null}
        </section>
      ) : null}

      {currentView === "form" ? (
        <section className="section page-view" id="anunciar">
          <button
            type="button"
            className="back-button"
            onClick={() => setCurrentView("catalog")}
          >
            Voltar para os anúncios
          </button>
          <div className="section-header">
            <h2>{editingProduct ? "Editar anúncio" : "Publicar anúncio"}</h2>
            <span>
              {editingProduct
                ? "Atualize suas informações"
                : "Fluxo de cadastro"}
            </span>
          </div>

          <div className="form-panel">
            <ProductForm
              initialProduct={editingProduct}
              onSuccess={handleProductSaved}
              onCancel={() => {
                setEditingProductId(null);
                setCurrentView("catalog");
              }}
            />
          </div>
        </section>
      ) : null}

      {currentView === "detail" && selectedProductId ? (
        <section className="section page-view">
          <button
            type="button"
            className="back-button"
            onClick={() => setCurrentView("catalog")}
          >
            Voltar para os anúncios
          </button>
          {selectedProductId ? (
            <ProductDetailPage
              productId={selectedProductId}
              currentUserId={user.id}
              onEdit={(product) => {
                setEditingProductId(product.id);
                setCurrentView("form");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onDelete={handleDeleteProduct}
            />
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
