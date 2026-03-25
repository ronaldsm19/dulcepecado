"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WhatsAppInlineButton } from "@/components/WhatsAppButton";
import { SeedProduct } from "@/data/seed";

interface ProductModalProps {
  product: SeedProduct & { _id?: string };
  isOpen: boolean;
  onClose: () => void;
}

const FREE_TOPPINGS = 2;
const EXTRA_TOPPING_PRICE = 150;

const categoryLabels: Record<string, { label: string; color: string }> = {
  gelatina: {
    label: "Gelatina Mosaico",
    color: "bg-brand-pink/10 text-brand-pink border-brand-pink/20",
  },
  apretado: {
    label: "Apretado Gourmet",
    color: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
  },
  especial: {
    label: "Edición Especial",
    color: "bg-brand-yellow/20 text-amber-700 border-brand-yellow/30",
  },
};

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const cat = categoryLabels[product.category] ?? categoryLabels.especial;
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  // Reset selections whenever a different product opens
  useEffect(() => {
    setSelectedToppings([]);
  }, [product._id]);

  function toggleTopping(topping: string) {
    setSelectedToppings((prev) =>
      prev.includes(topping) ? prev.filter((t) => t !== topping) : [...prev, topping]
    );
  }

  const extraCount = Math.max(0, selectedToppings.length - FREE_TOPPINGS);
  const finalPrice = product.price + extraCount * EXTRA_TOPPING_PRICE;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0">
        {/* ── Product image ── */}
        <div className="relative w-full h-56 overflow-hidden rounded-t-2xl">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 512px"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* ── Content ── */}
        <div className="px-6 pb-6 pt-4 space-y-4">
          <DialogHeader className="p-0">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border w-fit ${cat.color}`}
            >
              {cat.label}
            </span>
            <DialogTitle className="mt-2 leading-tight">{product.name}</DialogTitle>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-3xl font-bold gradient-text font-brand">
                ₡{finalPrice.toLocaleString("es-CR")}
              </p>
              {extraCount > 0 && (
                <span className="text-sm text-brand-dark/50">
                  +₡{(extraCount * EXTRA_TOPPING_PRICE).toLocaleString("es-CR")} toppings extra
                </span>
              )}
            </div>
          </DialogHeader>

          <DialogDescription className="text-sm leading-relaxed text-brand-dark/70">
            {product.description}
          </DialogDescription>

          {/* ── Toppings selector ── */}
          {product.toppings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-brand-dark">
                  Elige tus toppings
                </h4>
                <span className="text-xs text-brand-dark/50">
                  {selectedToppings.length} seleccionado{selectedToppings.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-brand-dark/50 mb-3">
                Incluye hasta {FREE_TOPPINGS} toppings · Topping adicional: ₡{EXTRA_TOPPING_PRICE.toLocaleString("es-CR")} c/u
              </p>
              <div className="flex flex-wrap gap-2">
                {product.toppings.map((topping) => {
                  const selected = selectedToppings.includes(topping);
                  return (
                    <button
                      key={topping}
                      type="button"
                      onClick={() => toggleTopping(topping)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? "bg-brand-pink text-white border-brand-pink"
                          : "bg-brand-muted text-brand-dark/80 border-brand-pink/20 hover:border-brand-pink/50"
                      }`}
                    >
                      {topping}
                    </button>
                  );
                })}
              </div>
              {extraCount > 0 && (
                <p className="mt-2 text-xs text-brand-pink font-medium">
                  {extraCount} topping{extraCount !== 1 ? "s" : ""} extra · +₡{(extraCount * EXTRA_TOPPING_PRICE).toLocaleString("es-CR")}
                </p>
              )}
            </div>
          )}

          {/* ── WhatsApp CTA ── */}
          <div className="pt-2">
            <WhatsAppInlineButton
              product={product}
              selectedToppings={selectedToppings}
              finalPrice={finalPrice}
            />
            <p className="text-center text-xs text-brand-dark/40 mt-2">
              Te redirigiremos a WhatsApp con tu pedido listo 💬
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
