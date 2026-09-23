import { createClient } from "@/utils/supabase/client";
import { isCurrentUserOwner } from "@/functions/auth"; // Update to your actual auth file path
import {
  CarouselSlide,
  PromoCard,
  PromoBannersConfig,
  CountdownConfig,
  GeneralConfig,
} from "@/components/admin/page-editor/types";

const supabase = createClient();

export interface StorefrontPayload {
  slides: CarouselSlide[];
  promos: PromoCard[];
  promoBanners: PromoBannersConfig;
  countdownConfig: CountdownConfig;
  generalConfig: GeneralConfig;
}

/**
 * Fetch storefront settings (Accessible to everyone)
 */
export async function getStorefrontConfig(): Promise<StorefrontPayload> {
  const { data, error } = await supabase
    .from("storefront_settings")
    .select("*")
    .eq("id", "default")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return {
        slides: [],
        promos: [],
        promoBanners: {
          bigBanner: {
            subtitle: "",
            title: "",
            description: "",
            buttonText: "Buy Now",
            link: "#",
            imageUrl: "",
            isActive: true,
          },
          smallBanners: [],
        },
        countdownConfig: {
          badgeText: "",
          title: "",
          description: "",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          buttonText: "Shop Now",
          link: "#",
          productImageUrl: "",
          isActive: true,
        },
        generalConfig: {
          logoUrl: "",
          supportPhone247: "",
          telephone: "",
          email: "",
          address: "",
          pageMetaTitle: "",
        },
      };
    }
    console.error("getStorefrontConfig error:", error);
    throw error;
  }

  return {
    slides: data.carousel_slides || [],
    promos: data.promo_cards || [],
    promoBanners: data.promo_banners || {},
    countdownConfig: data.countdown_config || {},
    generalConfig: data.general_config || {},
  };
}

/**
 * Save storefront settings (Only allowed if isCurrentUserOwner() is true)
 */
export async function saveStorefrontConfig(payload: StorefrontPayload): Promise<void> {
  // Check user session
  if (!isCurrentUserOwner()) {
    throw new Error("Permission denied. Only the Store Owner can edit storefront settings.");
  }

  const { error } = await supabase
    .from("storefront_settings")
    .upsert(
      {
        id: "default",
        carousel_slides: payload.slides,
        promo_cards: payload.promos,
        promo_banners: payload.promoBanners,
        countdown_config: payload.countdownConfig,
        general_config: payload.generalConfig,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("saveStorefrontConfig error:", error);
    throw error;
  }
}