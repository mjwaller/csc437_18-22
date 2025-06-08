// src/LoginPage.tsx
import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";

export interface LoginPageProps {
  isRegistering: boolean;
  onLoginSuccess: (token: string) => void;
}

export function LoginPage({ isRegistering, onLoginSuccess }: LoginPageProps) {
  const usernameInputId = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const endpoint = isRegistering ? "/auth/register" : "/auth/login";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (isRegistering && res.status === 409) {
        setError("Username already taken.");
        setPending(false);
        return;
      } else if (!isRegistering && res.status === 401) {
        setError("Incorrect username or password.");
        setPending(false);
        return;
      } else if (!res.ok) {
        setError("Request failed. Please try again.");
        setPending(false);
        return;
      }

      // On success, backend returns { token: string }
      const { token } = (await res.json()) as { token: string };
      onLoginSuccess(token);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
      <form onSubmit={handleSubmit} className="LoginPage-form">
        <label htmlFor={usernameInputId}>Username</label>
        <input
          id={usernameInputId}
          type="text"
          name="username"
          required
          disabled={isPending}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          required
          disabled={isPending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={isPending}>
          {isPending
            ? isRegistering
              ? "Registering…"
              : "Logging in…"
            : isRegistering
            ? "Register"
            : "Log In"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      {!isRegistering && (
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      )}
    </>
  );
}
