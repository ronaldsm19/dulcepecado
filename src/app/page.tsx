import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { seedProducts, SeedProduct } from "@/data/seed";

async function getProducts(): Promise<(SeedProduct & { _id?: string })[]> {
  if (!process.env.MONGODB_URI) {
    // No DB configured — use seed data as demo
    return seedProducts;
  }

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/products`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60s
    });

    if (!res.ok) throw new Error("Fetch failed");
    const data = await res.json();
    return data.products ?? seedProducts;
  } catch {
    return seedProducts;
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main>
      <HeroSection />
      <ProductsSection products={products} />
      <AboutSection />
      <Footer />
      <WhatsAppButton floating />
    </main>
  );
}
