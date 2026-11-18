import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sistemas Joscal – Tecnología para gestionar, monitorear y decidir mejor",
    template: "%s · Sistemas Joscal",
  },
  description:
    "Desarrollo web a la medida, MEAL y tableros de indicadores, automatización e inteligencia artificial para ONG, centros educativos, PYMES y emprendimientos.",
  openGraph: {
    title: "Sistemas Joscal",
    description: "La tecnología se adapta a tus procesos, no al revés.",
    locale: "es_SV",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${jakarta.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
