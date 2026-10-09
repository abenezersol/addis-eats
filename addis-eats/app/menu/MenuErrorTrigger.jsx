"use client";

import { useSearchParams } from "next/navigation";

export default function MenuErrorTrigger() {
  const searchParams = useSearchParams();

  if (searchParams.get("error") === "1") {
    throw new Error("This is a deliberate Day 36 test error.");
  }

  return null;
}
