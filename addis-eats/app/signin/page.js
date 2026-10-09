import { redirect } from "next/navigation";
import AuthForm from "../AuthForm";
import { getSession } from "../../lib/session";
import { safeNext } from "../../lib/safeNext";

// /signin?next=/checkout is the same page as /signin.
export const metadata = {
  title: "Sign in",
  description: "Sign in to Addis Eats with your phone number and password to check out and follow your orders.",
  alternates: { canonical: "/signin" }
};

export default async function SignInPage({ searchParams }) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);
  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Sign in</h1>
          <p>Use your phone number and password to continue.</p>
        </div>
      </div>
      <AuthForm mode="signin" next={next} />
    </main>
  );
}
