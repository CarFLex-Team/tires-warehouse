"use client";
import PageShell from "@/components/PageShell";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageShell>{children} </PageShell>;
}
