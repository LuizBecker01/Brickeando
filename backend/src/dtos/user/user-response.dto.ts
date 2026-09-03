export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: Date;
}
