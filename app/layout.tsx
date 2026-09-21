import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "LogixSphere Week Planner — Protótipo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
