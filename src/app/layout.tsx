import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Dulce Pecado | Postres Premium Costa Rica",
  description:
    "Gelatinas mosaico y apretados gourmet artesanales. El placer en cada cucharada. Pedidos en San José, Costa Rica.",
  openGraph: {
    title: "Dulce Pecado | Postres Premium Costa Rica",
    description: "Gelatinas mosaico y apretados gourmet artesanales.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} scroll-smooth`}
    >
      <body className="font-sans antialiased bg-white text-brand-dark">
        {children}
      </body>
    </html>
  );
}
