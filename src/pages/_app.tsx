import "@/styles/globals.css";
import { useEffect } from "react";
import type { AppProps } from "next/app";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { useRouter } from "next/router";
import { Prompt } from "next/font/google";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600"],
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const navbarPages = ["/login", "/register"];
  const footerPages = ["/"];

  const showNavbar = navbarPages.includes(router.pathname);
  const showFooter = footerPages.includes(router.pathname);

  return (
    <main className={`${prompt.className}`}>
      {showNavbar && <Navbar />}
        <Component {...pageProps} />
      {showFooter && <Footer />}
    </main>
  );
}
