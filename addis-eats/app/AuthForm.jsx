"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import { signIn, signUp } from "./actions";

export default function AuthForm({ mode, next }) {
  const isSignUp = mode === "signup";
  const [state, formAction, actionPending] = useActionState(isSignUp ? signUp : signIn, {});
  const [submitting, startTransition] = useTransition();
  const pending = actionPending || submitting;

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }
  const errors = state?.fieldErrors ?? {};
  const otherPage = `${isSignUp ? "/signin" : "/signup"}?next=${encodeURIComponent(next)}`;

  return (
    <form onSubmit={handleSubmit} className="checkout-form auth-form">
      <input type="hidden" name="next" value={next} />
      {isSignUp && (
        <label>Full name<input name="name" autoComplete="name" required />{errors.name?.[0] && <small>{errors.name[0]}</small>}</label>
      )}
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="09XXXXXXXX" required />{errors.phone?.[0] && <small>{errors.phone[0]}</small>}</label>
      <label>Password<input name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required />{errors.password?.[0] && <small>{errors.password[0]}</small>}</label>
      {state?.error && <div className="form-error" role="alert">{state.error}</div>}
      <button className="button full" type="submit" disabled={pending}>
        {pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
      </button>
      <p className="auth-switch">
        {isSignUp ? "Already have an account? " : "New to Addis Eats? "}
        <Link href={otherPage} className="text-link">{isSignUp ? "Sign in" : "Create an account"}</Link>
      </p>
    </form>
  );
}
