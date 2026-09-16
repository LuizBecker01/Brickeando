import { useState } from "react";
import { api } from "../../services/api";

interface LoginScreenProps {
  onLogin: (session: {
    token: string;
    user: { id: string; name: string; email: string; cpf?: string };
  }) => void;
  authError?: string | null;
}

const cleanCpf = (value: string) => value.replace(/\D/g, "").slice(0, 11);

const passwordRequirements = [
  {
    label: "Pelo menos 8 caracteres",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "Uma letra maiúscula",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "Uma letra minúscula",
    test: (value: string) => /[a-z]/.test(value),
  },
  { label: "Um número", test: (value: string) => /[0-9]/.test(value) },
  {
    label: "Um caractere especial",
    test: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
  },
];

export function LoginScreen({ onLogin, authError }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const plainCpf = cleanCpf(cpf);

    if (plainCpf.length !== 11) {
      setError("Digite um CPF válido com 11 números.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const data =
        mode === "login"
          ? await api.loginLocal({ cpf: plainCpf, password })
          : await api.registerLocal({
              cpf: plainCpf,
              password,
              name: name.trim() || undefined,
            });

      onLogin({
        token: data.token,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email ?? "",
          cpf: data.user.cpf,
        },
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível entrar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <img src="/logo.png" alt="Brickeando" className="auth-logo" />
        <h1>Entrar no Brickeando</h1>
        <p>
          Para anunciar ou conversar com vendedores, você precisa estar logado.
        </p>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => setMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => setMode("register")}
          >
            Criar conta
          </button>
        </div>

        <div className="auth-form">
          {mode === "register" ? (
            <label className="form-field">
              <span>Nome</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Opcional"
              />
            </label>
          ) : null}

          <label className="form-field">
            <span>CPF</span>
            <input
              value={cpf}
              onChange={(event) => setCpf(cleanCpf(event.target.value))}
              inputMode="numeric"
              placeholder="Somente números"
            />
          </label>

          <label className="form-field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={mode === "register" ? 8 : undefined}
              placeholder={
                mode === "register"
                  ? "Mínimo 8, maiúscula e especial"
                  : "Digite sua senha"
              }
            />
            {mode === "register" ? (
              <ul
                className="password-requirements"
                aria-label="Requisitos da senha"
              >
                {passwordRequirements.map((requirement) => {
                  const isValid = requirement.test(password);

                  return (
                    <li
                      key={requirement.label}
                      className={isValid ? "is-valid" : "is-invalid"}
                    >
                      <span aria-hidden="true">{isValid ? "✓" : "!"}</span>
                      {requirement.label}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </label>

          <button
            type="button"
            className="hero-button solid auth-demo"
            onClick={submit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </div>

        {error || authError ? (
          <p className="auth-error">{error ?? authError}</p>
        ) : null}
      </div>
    </main>
  );
}
