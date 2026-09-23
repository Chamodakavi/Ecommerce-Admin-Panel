export interface CarouselSlide {
  id: number | string;
  title: string;
  discountText: string;
  description: string;
  buttonText: string;
  link: string;
  imageUrl: string;
  isActive: boolean;
}

export interface PromoCard {
  id: number | string;
  title: string;
  badgeText: string;
  salePrice: number;
  regularPrice: number;
  link: string;
  imageUrl: string;
  isActive: boolean;
}

export interface GeneralConfig {
  logoUrl: string;
  supportPhone247: string;
  telephone: string;
  email: string;
  address: string;
  pageMetaTitle: string;
}

// --- NEW PROMO BANNER TYPES ---
export interface BigPromoBanner {
  subtitle: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
  imageUrl: string;
  isActive: boolean;
}

export interface SmallPromoBanner {
  id: string;
  subtitle: string;
  title: string;
  highlightText: string;
  description?: string;
  buttonText: string;
  link: string;
  imageUrl: string;
  isActive: boolean;
}

export interface PromoBannersConfig {
  bigBanner: BigPromoBanner;
  smallBanners: SmallPromoBanner[];
}

export interface CountdownConfig {
  badgeText: string;      // e.g. "Don’t Miss!!"
  title: string;          // e.g. "Enhance Your Music Experience"
  description: string;    // e.g. "The Havit H206d is a wired PC headphone."
  deadline: string;       // ISO date string e.g. "2026-12-31T23:59:59"
  buttonText: string;     // e.g. "Check it Out!"
  link: string;           // e.g. "#" or "/products/havit-headphone"
  productImageUrl: string;// Product image on the right
  isActive: boolean;
}