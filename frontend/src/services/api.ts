import axios from "axios";

export interface ProductApiResponse {
  id: string;
  title: string;
  description: string;
  price: number | string;
  imageUrl?: string | null;
  status: "DISPONIVEL" | "RESERVADO" | "VENDIDO";
  condition: "NOVO" | "SEMINOVO" | "USADO" | "PARA_REPARO";
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  seller?: { id: string; name: string; email?: string };
  categories?: Array<{
    id?: string;
    name?: string;
    category?: { id: string; name: string };
  }>;
  images?: Array<{ id: string; url: string; altText?: string | null }>;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface AuthSessionResponse {
  token: string;
  user: {
    id: string;
    name: string;
    cpf?: string;
    email?: string;
    avatarUrl?: string | null;
    provider?: "LOCAL" | "GOOGLE";
  };
}

const apiClient = axios.create({
  baseURL:
    (import.meta.env.VITE_API_URL as string | undefined) ??
    "http://localhost:777/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("@Brickeando:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("@Brickeando:token");
      localStorage.removeItem("@Brickeando:user");
      localStorage.removeItem("brickeando_session");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    const validationErrors = error.response?.data?.details?.errors;
    if (Array.isArray(validationErrors)) {
      return validationErrors.join(" ");
    }
    return typeof message === "string" ? message : fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export const api = {
  async getProducts(filters?: ProductFilters): Promise<ProductApiResponse[]> {
    const { data } = await apiClient.get<ProductApiResponse[]>("/products", {
      params: filters,
    });
    return data;
  },

  async getCategories(): Promise<
    Array<{ id: string; name: string; slug: string }>
  > {
    const { data } =
      await apiClient.get<Array<{ id: string; name: string; slug: string }>>(
        "/categories",
      );
    return data;
  },

  async getProductById(id: string): Promise<ProductApiResponse> {
    const { data } = await apiClient.get<ProductApiResponse>(`/products/${id}`);
    return data;
  },

  async createProduct(payload: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    imageUrls?: string[];
    locationName?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    categoryIds?: string[];
    condition?: "NOVO" | "SEMINOVO" | "USADO" | "PARA_REPARO";
    status?: "DISPONIVEL" | "RESERVADO" | "VENDIDO";
    sellerId?: string;
  }): Promise<ProductApiResponse> {
    try {
      const { data } = await apiClient.post<ProductApiResponse>(
        "/products",
        payload,
      );
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Erro ao cadastrar o produto."));
    }
  },

  async updateProduct(
    productId: string,
    payload: {
      title?: string;
      description?: string;
      price?: number;
      imageUrl?: string | null;
      imageUrls?: string[];
      locationName?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      categoryIds?: string[];
      condition?: "NOVO" | "SEMINOVO" | "USADO" | "PARA_REPARO";
      status?: "DISPONIVEL" | "RESERVADO" | "VENDIDO";
    },
  ): Promise<ProductApiResponse> {
    try {
      const { data } = await apiClient.put<ProductApiResponse>(
        `/products/${productId}`,
        payload,
      );
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Erro ao atualizar o produto."));
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      await apiClient.delete(`/products/${productId}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Erro ao excluir o produto."));
    }
  },

  async registerLocal(payload: {
    cpf: string;
    password: string;
    name?: string;
  }): Promise<AuthSessionResponse> {
    try {
      const { data } = await apiClient.post<AuthSessionResponse>(
        "/users/register",
        payload,
      );
      return data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Não foi possível criar a conta."),
      );
    }
  },

  async loginLocal(payload: {
    cpf: string;
    password: string;
  }): Promise<AuthSessionResponse> {
    try {
      const { data } = await apiClient.post<AuthSessionResponse>(
        "/users/login",
        payload,
      );
      return data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Não foi possível entrar no sistema."),
      );
    }
  },

  async googleLogin(credential: string): Promise<AuthSessionResponse> {
    const { data } = await apiClient.post<AuthSessionResponse>(
      "/users/google",
      { credential },
    );
    return data;
  },
};
