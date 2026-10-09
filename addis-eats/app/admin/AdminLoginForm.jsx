"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminSignIn } from "./actions";
import { useAdmin } from "./AdminProvider";

export default function AdminLoginForm({ next }) {
  const router = useRouter();
  const { login } = useAdmin();
  const [state, formAction, pending] = useActionState(adminSignIn, {});
  const errors = state?.fieldErrors ?? {};

  // On success the server has set the cookie. Put the admin into context (and sessionStorage), then go on.
  useEffect(() => {
    if (!state?.success) return;
    login(state.admin);
    router.replace(state.next);
    router.refresh();
  }, [state, login, router]);

  return (
    <form action={formAction} className="checkout-form auth-form">
      <input type="hidden" name="next" value={next} />
      <label>
        Username
        <input name="username" autoComplete="username" required />
        {errors.username?.[0] && <small>{errors.username[0]}</small>}
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
        {errors.password?.[0] && <small>{errors.password[0]}</small>}
      </label>
      {state?.error && (
        <div className="form-error" role="alert">
          {state.error}
        </div>
      )}
      <button className="button full" type="submit" disabled={pending || state?.success}>
        {pending || state?.success ? "Please wait…" : "Sign in to admin"}
      </button>
    </form>
  );
}
