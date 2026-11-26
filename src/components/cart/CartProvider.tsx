"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

export interface CustomerBasicInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface PlacedOrderRecord {
  id: string;
  orderCode: string;
  itemId: string;
  title: string;
  brand: string;
  image: string;
  href: string;
  quantity: number;
  total: number;
  customer: CustomerBasicInfo;
  placedAt: string;
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

const CART_STORAGE_KEY = "thebhanu-cart-items-v1";
const ORDERS_STORAGE_KEY = "thebhanu-placed-orders-v1";
const CUSTOMER_STORAGE_KEY = "thebhanu-customer-info-v1";

const EMPTY_CUSTOMER: CustomerBasicInfo = {
  name: "",
  email: "",
  phone: "",
  company: "",
};

interface CartContextValue {
  items: CartCatalogItem[];
  activeItem: CartCatalogItem | null;
  setActiveItem: (item: CartCatalogItem) => void;
  addItem: (item: CartCatalogItem) => void;
  removeItem: (id: string) => void;
  restoreFeatured: () => void;
  placedOrders: PlacedOrderRecord[];
  customerInfo: CustomerBasicInfo;
  updateCustomerInfo: (next: CustomerBasicInfo) => void;
  badgeCount: number;
  placeOrder: (
    item: CartCatalogItem,
    order: { quantity: number; total: number },
  ) => PlacedOrderRecord;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartCatalogItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CART_ITEMS;
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartCatalogItem[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage read errors
    }
    return DEFAULT_CART_ITEMS;
  });

  const [placedOrders, setPlacedOrders] = useState<PlacedOrderRecord[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlacedOrderRecord[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerBasicInfo>(() => {
    if (typeof window === "undefined") return EMPTY_CUSTOMER;
    try {
      const raw = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CustomerBasicInfo;
        if (parsed && typeof parsed === "object") {
          return {
            name: parsed.name ?? "",
            email: parsed.email ?? "",
            phone: parsed.phone ?? "",
            company: parsed.company ?? "",
          };
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return EMPTY_CUSTOMER;
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeItem =
    items.find((entry) => entry.id === selectedId) ?? items[0] ?? null;

  const setActiveItem = useCallback((item: CartCatalogItem) => {
    setSelectedId(item.id);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ORDERS_STORAGE_KEY,
        JSON.stringify(placedOrders),
      );
    } catch {
      // Ignore storage write errors
    }
  }, [placedOrders]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CUSTOMER_STORAGE_KEY,
        JSON.stringify(customerInfo),
      );
    } catch {
      // Ignore storage write errors
    }
  }, [customerInfo]);

  const addItem = useCallback((item: CartCatalogItem) => {
    setItems((prev) => {
      const exists = prev.some((entry) => entry.id === item.id);
      return exists ? prev : [item, ...prev];
    });
    setSelectedId(item.id);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const restoreFeatured = useCallback(() => {
    setItems(DEFAULT_CART_ITEMS);
    setSelectedId(DEFAULT_CART_ITEMS[0].id);
  }, []);

  const updateCustomerInfo = useCallback((next: CustomerBasicInfo) => {
    setCustomerInfo(next);
  }, []);

  const placeOrder = useCallback(
    (
      item: CartCatalogItem,
      order: { quantity: number; total: number },
    ): PlacedOrderRecord => {
      const qty = Math.max(1, order.quantity);
      const total = Math.max(item.price, order.total);
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      const created: PlacedOrderRecord = {
        id: `${item.id}-${Date.now()}`,
        orderCode: `BHN-ORD-${codeSuffix}`,
        itemId: item.id,
        title: item.title,
        brand: item.brand,
        image: item.image,
        href: item.href,
        quantity: qty,
        total,
        customer: customerInfo,
        placedAt: new Date().toISOString(),
      };

      setPlacedOrders((prev) => [created, ...prev]);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      return created;
    },
    [customerInfo],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        activeItem,
        setActiveItem,
        addItem,
        removeItem,
        restoreFeatured,
        placedOrders,
        customerInfo,
        updateCustomerInfo,
        badgeCount: items.length,
        placeOrder,
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
