"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
export function ParentsLink({ children, className }: { children: ReactNode; className?: string }) {
  const [href, setHref] = useState("/parents/");
  useEffect(() => {
    const lang = new URLSearchParams(location.search).get("lang");
    if (lang) setHref(`/parents/?lang=${encodeURIComponent(lang)}`);
  }, []);
  return <Link href={href} className={className}>{children}</Link>;
}
