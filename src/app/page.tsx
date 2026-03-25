export const dynamic = "force-dynamic";

import HeroSection from "@/components/HeroSection";
import BestSellersSection from "@/components/BestSellersSection";
import ProductsSection from "@/components/ProductsSection";
import TrustSection from "@/components/TrustSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { SiteSettings } from "@/models/SiteSettings";
import { SeedProduct } from "@/data/seed";

async function getProducts(): Promise<(SeedProduct & { _id?: string })[]> {
  try {
    await connectToDatabase();
    const products = await Product.find({ available: true })
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(products)) as (SeedProduct & { _id?: string })[];
  } catch (error) {
    console.error("[page] Error loading products from MongoDB:", error);
    return [];
  }
}

async function getSettings() {
  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne({}).lean();
    if (!settings) return null;
    return JSON.parse(JSON.stringify(settings)) as { about?: { title: string; paragraph1: string; paragraph2: string; images: string[] } };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const featuredProducts = products.filter((p) => (p as SeedProduct & { featured?: boolean }).featured);

  return (
    <main>
      <HeroSection />
      <BestSellersSection products={featuredProducts} />
      <ProductsSection products={products} />
      <TrustSection />
      <AboutSection aboutData={settings?.about} />
      <Footer />
      <WhatsAppButton floating />
    </main>
  );
}
