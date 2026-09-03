export interface CreateUserDto {
  name?: string;
  email?: string | null;
  cpf: string;
  password: string;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  provider?: "LOCAL" | "GOOGLE";
  providerId?: string | null;
}
