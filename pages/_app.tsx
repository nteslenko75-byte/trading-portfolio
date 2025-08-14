import type { AppProps } from "next/app";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <div className="container py-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{process.env.NEXT_PUBLIC_SITE_NAME || "Портфель"}</h1>
          <nav className="flex gap-3 text-sm text-neutral-400">
            <a className="hover:text-white" href="/">Головна</a>
            <a className="hover:text-white" href="/trades">Угоди</a>
            <a className="hover:text-white" href="/blog">Блог</a>
            <a className="hover:text-white" href="/disclaimer">Disclaimer</a>
            <a className="hover:text-white" href="/privacy">Privacy</a>
            <a className="hover:text-white" href="/login">Увійти</a>
          </nav>
        </header>
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}
