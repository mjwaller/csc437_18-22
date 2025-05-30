import { useId } from "react";
import "./LoginPage.css";

export function LoginPage() {
  const usernameInputId = useId();

  return (
    <>
      <h2>Login</h2>
      <form className="LoginPage-form">
        <label htmlFor={usernameInputId}>Username</label>
        <input id={usernameInputId} type="text" />
        <button type="submit">Log in</button>
      </form>
    </>
  );
}
