import { useState } from "react";

interface LoginScreenProps {
  onLogin: (session: { token: string; user: { id: string; name: string; email: string; cpf?: string } }) => void;
  authError?: string | null;
}

const cleanCpf = (value: string) => value.replace(/\D/g, "").slice(0, 11);

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

    if (password.length < 4) {
      setError("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(mode === "login" ? "http://localhost:777/api/users/login" : "http://localhost:777/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { cpf: plainCpf, password }
            : { cpf: plainCpf, password, name: name.trim() || undefined },
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível entrar no sistema.");
      }

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
      setError(submitError instanceof Error ? submitError.message : "Não foi possível entrar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <img src="/logo.png" alt="Brickeando" className="auth-logo" />
        <h1>Entrar no Brickeando</h1>
        <p>Para anunciar ou conversar com vendedores, você precisa estar logado.</p>

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
              placeholder="Mínimo 4 dígitos"
            />
          </label>

          <button type="button" className="hero-button solid auth-demo" onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </div>

        {(error || authError) ? <p className="auth-error">{error ?? authError}</p> : null}
      </div>
    </main>
  );
}
