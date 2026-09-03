import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { api } from "../../services/api";

interface GoogleLoginButtonProps {
  onSuccess: (session: { token: string; user: { id: string; name: string; email?: string; cpf?: string } }) => void;
  onError?: (message: string) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  if (!clientId) {
    return (
      <button type="button" className="hero-button ghost" disabled>
        Entrar com Google
      </button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          if (!credentialResponse.credential) {
            onError?.("Google não retornou credencial válida.");
            return;
          }

          try {
            const session = await api.googleLogin(credentialResponse.credential);
            onSuccess(session);
          } catch (error) {
            onError?.(error instanceof Error ? error.message : "Falha ao autenticar com o Google.");
          }
        }}
        onError={() => onError?.("Falha ao autenticar com o Google.")}
        theme="outline"
        text="continue_with"
        shape="pill"
      />
    </GoogleOAuthProvider>
  );
}
