"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface CartCatalogItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  image: string;
  href: string;
  source: "Marketplace" | "UI Library";
}

export const DEFAULT_CART_ITEMS: CartCatalogItem[] = [
  {
    id: "sylva-studio",
    title: "Sylva Nature-Tech Studio",
    brand: "THE BHANU · Marketplace",
    price: 1,
    image: "/marketplace/sylva-studio-overview.svg",
    href: "/products/sylva-nature-tech-studio-template",
    source: "Marketplace",
  },
  {
    id: "nature-glass-ui",
    title: "Nature Glass UI Kit",
    brand: "THE BHANU · UI Library",
    price: 1,
    image: "/marketplace/nature-glass-ui-overview.svg",
    href: "/components",
    source: "UI Library",
  },
  {
    id: "veridian-portal",
    title: "Veridian Customer Portal",
    brand: "THE BHANU · Marketplace",
    price: 1,
    image: "/marketplace/veridian-portal-overview.svg",
    href: "/products/veridian-customer-portal",
    source: "Marketplace",
  },
  {
    id: "grounded-ai",
    title: "Grounded AI Pipeline",
    brand: "THE BHANU · Marketplace",
    price: 1,
    image: "/marketplace/grounded-ai-overview.svg",
    href: "/products/grounded-ai-workflow-agent",
    source: "Marketplace",
  },
];

interface CartContextValue {
  items: CartCatalogItem[];
  activeItem: CartCatalogItem;
  setActiveItem: (item: CartCatalogItem) => void;
  addItem: (item: CartCatalogItem) => void;
  badgeCount: number;
  recordOrder: (order: { quantity: number; total: number }) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartCatalogItem[]>(DEFAULT_CART_ITEMS);
  const [activeItem, setActiveItem] = useState<CartCatalogItem>(DEFAULT_CART_ITEMS[0]);
  const [badgeCount, setBadgeCount] = useState(1);

  const addItem = useCallback((item: CartCatalogItem) => {
    setItems((prev) => {
      const exists = prev.some((entry) => entry.id === item.id);
      return exists ? prev : [item, ...prev];
    });
    setActiveItem(item);
    setBadgeCount((c) => c + 1);
  }, []);

  const recordOrder = useCallback((order: { quantity: number; total: number }) => {
    setBadgeCount((c) => c + order.quantity);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        activeItem,
        setActiveItem,
        addItem,
        badgeCount,
        recordOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
