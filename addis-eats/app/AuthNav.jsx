"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "../lib/fetcher";
import { signOut } from "./actions";

// The header lives in the root layout, which stays static, so it asks /api/me who is signed in.
export default function AuthNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data, mutate } = useSWR("/api/me", fetcher);
  const user = data?.user;

  // The header persists between pages, so check again after every navigation.
  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  async function handleSignOut() {
    await signOut();
    await mutate({ user: null }, { revalidate: false });
    router.push("/");
    router.refresh();
  }

  if (!data) return null;
  if (!user) return <Link href="/signin" className="session-button">Sign in</Link>;
  return (
    <>
      {user.role === "staff" && <Link href="/kitchen" className="header-cart">Kitchen</Link>}
      <span className="header-user">Hi, {user.name}</span>
      <button type="button" className="session-button" onClick={handleSignOut}>Sign out</button>
    </>
  );
}
