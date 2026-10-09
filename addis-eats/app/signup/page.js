import { redirect } from "next/navigation";
import AuthForm from "../AuthForm";
import { getSession } from "../../lib/session";
import { safeNext } from "../../lib/safeNext";

// /signup?next=/checkout is the same page as /signup.
export const metadata = {
  title: "Create your account",
  description: "Create an Addis Eats account with your phone number and a password to order food and follow your deliveries.",
  alternates: { canonical: "/signup" }
};

export default async function SignUpPage({ searchParams }) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);
  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">JOIN ADDIS EATS</span>
          <h1>Create your account</h1>
          <p>Your phone number and a password of at least 8 characters.</p>
        </div>
      </div>
      <AuthForm mode="signup" next={next} />
    </main>
  );
}
