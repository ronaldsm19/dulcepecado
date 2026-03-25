import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
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
