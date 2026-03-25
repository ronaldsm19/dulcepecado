import HeroSection from "@/components/HeroSection";
import BestSellersSection from "@/components/BestSellersSection";
import ProductsSection from "@/components/ProductsSection";
import TrustSection from "@/components/TrustSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { SeedProduct } from "@/data/seed";

async function getProducts(): Promise<(SeedProduct & { _id?: string })[]> {
  try {
    await connectToDatabase();
    const products = await Product.find({ available: true })
      .sort({ createdAt: -1 })
      .lean();
    return products as unknown as (SeedProduct & { _id?: string })[];
  } catch (error) {
    console.error("[page] Error loading products from MongoDB:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = products.filter((p) => (p as SeedProduct & { featured?: boolean }).featured);

  return (
    <main>
      <HeroSection />
      <BestSellersSection products={featuredProducts} />
      <ProductsSection products={products} />
      <TrustSection />
      <AboutSection />
      <Footer />
      <WhatsAppButton floating />
    </main>
  );
}
