import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { CreateUserDto } from "../dtos/user/create-user.dto";
import { LoginUserDto } from "../dtos/user/login-user.dto";
import { AppError } from "../errors/app-error";
import { HttpStatus } from "../errors/http-status";
import { userRepository } from "../repositories/user.repository";
import { validatePassword } from "../utils/password-validator";
import { createAppToken } from "../utils/jwt";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const normalizeCpf = (cpf?: string) => (cpf ?? "").replace(/\D/g, "");

const isValidCpf = (cpf: string): boolean => {
  const cleanCpf = normalizeCpf(cpf);

  if (!/^\d{11}$/.test(cleanCpf)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cleanCpf.charAt(i)) * (10 - i);
  }

  let digit1 = 11 - (sum % 11);
  digit1 = digit1 >= 10 ? 0 : digit1;

  if (Number(cleanCpf.charAt(9)) !== digit1) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cleanCpf.charAt(i)) * (11 - i);
  }

  let digit2 = 11 - (sum % 11);
  digit2 = digit2 >= 10 ? 0 : digit2;

  return Number(cleanCpf.charAt(10)) === digit2;
};

const mapUser = (user: {
  id: string;
  name?: string | null;
  email?: string | null;
  cpf?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: Date;
  provider?: "LOCAL" | "GOOGLE";
}) => ({
  id: user.id,
  name: user.name ?? user.cpf ?? "Usuário",
  email: user.email ?? "",
  cpf: user.cpf ?? "",
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  createdAt: user.createdAt,
  provider: user.provider ?? "LOCAL",
});

export const userService = {
  async register(payload: CreateUserDto) {
    const cpf = normalizeCpf(payload.cpf);

    if (!cpf || !isValidCpf(cpf)) {
      throw new AppError("CPF inválido.", HttpStatus.BAD_REQUEST);
    }

    const passwordValidation = validatePassword(payload.password ?? "");
    if (!passwordValidation.isValid) {
      throw new AppError(
        "A senha não atende aos critérios de segurança.",
        HttpStatus.BAD_REQUEST,
        {
          errors: passwordValidation.errors,
        },
      );
    }

    const existingUser = await userRepository.findByCpf(cpf);
    if (existingUser) {
      throw new AppError(
        "Já existe uma conta cadastrada com este CPF.",
        HttpStatus.CONFLICT,
      );
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await userRepository.create({
      ...payload,
      cpf,
      name: payload.name?.trim() || cpf,
      email: payload.email?.trim().toLowerCase() || null,
      passwordHash,
      provider: "LOCAL",
    });

    const token = createAppToken(
      user.id,
      user.email ?? user.cpf,
      user.name ?? user.cpf,
    );

    return {
      user: mapUser(user),
      token,
    };
  },

  async login(payload: LoginUserDto) {
    const cpf = normalizeCpf(payload.cpf ?? payload.email);

    if (!cpf || !isValidCpf(cpf)) {
      throw new AppError("CPF inválido.", HttpStatus.BAD_REQUEST);
    }

    if (!payload.password || payload.password.length < 4) {
      throw new AppError(
        "A senha deve ter pelo menos 4 caracteres.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await userRepository.findByCpf(cpf);
    if (!user) {
      throw new AppError(
        "CPF ou senha inválidos.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (!user.passwordHash) {
      throw new AppError(
        "Esta conta foi criada com login social. Use o Google para entrar.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AppError(
        "CPF ou senha inválidos.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const token = createAppToken(
      user.id,
      user.email ?? user.cpf,
      user.name ?? user.cpf,
    );

    return {
      user: mapUser(user),
      token,
    };
  },

  async loginWithGoogle(credential: string) {
    if (!credential) {
      throw new AppError(
        "Credencial do Google ausente.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new AppError(
        "Configuração do Google OAuth não encontrada no servidor.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new AppError(
          "Não foi possível validar o usuário do Google.",
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const email = payload.email.toLowerCase();
      const user = await userRepository.upsertGoogleUser({
        email,
        name: payload.name ?? payload.given_name ?? "Usuário Google",
        avatarUrl: payload.picture ?? null,
        providerId: payload.sub,
      });

      const token = createAppToken(
        user.id,
        user.email ?? user.cpf,
        user.name ?? user.cpf,
      );

      return {
        user: mapUser(user),
        token,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Token do Google inválido ou expirado.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado.", HttpStatus.NOT_FOUND);
    }

    return mapUser(user);
  },
};
