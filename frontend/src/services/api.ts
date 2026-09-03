export interface ProductApiResponse {
  id: string;
  title: string;
  description: string;
  price: number | string;
  imageUrl?: string | null;
  status: "DISPONIVEL" | "RESERVADO" | "VENDIDO";
  seller?: {
    id: string;
    name: string;
    email?: string;
  };
  categories?: Array<{
    id?: string;
    name?: string;
    category?: {
      id: string;
      name: string;
    };
  }>;
  images?: Array<{
    id: string;
    url: string;
    altText?: string | null;
  }>;
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

const API_BASE_URL = "http://localhost:777/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? "Erro ao realizar a requisição.");
  }

  return response.json() as Promise<T>;
}

export const api = {
  async getProducts(): Promise<ProductApiResponse[]> {
    const response = await fetch(`${API_BASE_URL}/products`);
    return handleResponse<ProductApiResponse[]>(response);
  },

  async getProductById(id: string): Promise<ProductApiResponse> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse<ProductApiResponse>(response);
  },

  async createProduct(payload: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    status?: "DISPONIVEL" | "RESERVADO" | "VENDIDO";
    sellerId: string;
  }): Promise<ProductApiResponse> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return handleResponse<ProductApiResponse>(response);
  },

  async registerLocal(payload: { cpf: string; password: string; name?: string }): Promise<AuthSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return handleResponse<AuthSessionResponse>(response);
  },

  async loginLocal(payload: { cpf: string; password: string }): Promise<AuthSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return handleResponse<AuthSessionResponse>(response);
  },

  async googleLogin(credential: string): Promise<AuthSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/users/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    });

    return handleResponse<AuthSessionResponse>(response);
  },
};
