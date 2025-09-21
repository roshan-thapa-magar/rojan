"use client";

import Header from "@/components/hero/header";
import Footer from "@/components/hero/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
