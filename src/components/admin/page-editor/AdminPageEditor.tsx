"use client";

import React, { useState, useEffect } from "react";
import HeroTab from "@/components/admin/page-editor/HeroTab";
import PromotionsTab from "@/components/admin/page-editor/PromotionsTab";
import GeneralTab from "@/components/admin/page-editor/GeneralTab";
import CountdownTab from "@/components/admin/page-editor/CountdownTab";

import {
  CarouselSlide,
  PromoCard,
  GeneralConfig,
  PromoBannersConfig,
  CountdownConfig,
} from "@/components/admin/page-editor/types";
import { getStorefrontConfig, saveStorefrontConfig } from "@/functions/storefront";

type TabKey = "hero" | "promotions" | "countdown" | "general";

const TABS: { id: TabKey; label: string }[] = [
  { id: "hero", label: "Hero & Banners" },
  { id: "promotions", label: "Promotions" },
  { id: "countdown", label: "Countdown Banner" },
  { id: "general", label: "Page & SEO Settings" },
];

// Clean empty templates for fresh database initialization
const initialPromoBanners: PromoBannersConfig = {
  bigBanner: {
    subtitle: "",
    title: "",
    description: "",
    buttonText: "Buy Now",
    link: "#",
    imageUrl: "",
    isActive: true,
  },
  smallBanners: [
    {
      id: "small-banner-1",
      subtitle: "",
      title: "",
      highlightText: "",
      description: "",
      buttonText: "Shop Now",
      link: "#",
      imageUrl: "",
      isActive: true,
    },
    {
      id: "small-banner-2",
      subtitle: "",
      title: "",
      highlightText: "",
      description: "",
      buttonText: "Shop Now",
      link: "#",
      imageUrl: "",
      isActive: true,
    },
  ],
};

const initialCountdown: CountdownConfig = {
  badgeText: "",
  title: "",
  description: "",
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  buttonText: "Shop Now",
  link: "#",
  productImageUrl: "",
  isActive: true,
};

const initialGeneral: GeneralConfig = {
  logoUrl: "",
  supportPhone247: "",
  telephone: "",
  email: "",
  address: "",
  pageMetaTitle: "",
};

export default function AdminPageEditor() {
  const [activeTab, setActiveTab] = useState<TabKey>("hero");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States initialized without any hardcoded mock data
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [promos, setPromos] = useState<PromoCard[]>([]);
  const [promoBanners, setPromoBanners] = useState<PromoBannersConfig>(initialPromoBanners);
  const [countdownConfig, setCountdownConfig] = useState<CountdownConfig>(initialCountdown);
  const [generalConfig, setGeneralConfig] = useState<GeneralConfig>(initialGeneral);

  // Load configuration dynamically from the database
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getStorefrontConfig();

        if (Array.isArray(data.slides)) {
          setSlides(data.slides);
        }

        if (Array.isArray(data.promos)) {
          setPromos(data.promos);
        }

        if (data.promoBanners && Object.keys(data.promoBanners).length > 0) {
          setPromoBanners({
            bigBanner: {
              ...initialPromoBanners.bigBanner,
              ...(data.promoBanners.bigBanner || {}),
            },
            smallBanners:
              Array.isArray(data.promoBanners.smallBanners) &&
              data.promoBanners.smallBanners.length > 0
                ? data.promoBanners.smallBanners
                : initialPromoBanners.smallBanners,
          });
        }

        if (data.countdownConfig && Object.keys(data.countdownConfig).length > 0) {
          setCountdownConfig({
            ...initialCountdown,
            ...data.countdownConfig,
          });
        }

        if (data.generalConfig && Object.keys(data.generalConfig).length > 0) {
          setGeneralConfig({
            ...initialGeneral,
            ...data.generalConfig,
          });
        }
      } catch (err: any) {
        console.error("Failed to load storefront configuration:", err.message || err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Save changes directly to the database
  const handleSaveAll = async () => {
    setIsSaving(true);
    const payload = {
      slides,
      promos,
      promoBanners,
      countdownConfig,
      generalConfig,
    };

    try {
      await saveStorefrontConfig(payload);
      alert("Storefront configuration saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Error saving configuration: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-600">
            Loading storefront configuration...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Storefront Page Editor</h1>
            <p className="text-sm text-slate-500">
              Manage hero promotions, promo banners, and site components.
            </p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 font-medium text-sm transition whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab Views */}
        {activeTab === "hero" && (
          <HeroTab
            slides={slides}
            setSlides={setSlides}
            promos={promos}
            setPromos={setPromos}
          />
        )}

        {activeTab === "promotions" && (
          <PromotionsTab
            promoBanners={promoBanners}
            setPromoBanners={setPromoBanners}
          />
        )}

        {activeTab === "countdown" && (
          <CountdownTab
            countdownConfig={countdownConfig}
            setCountdownConfig={setCountdownConfig}
          />
        )}

        {activeTab === "general" && (
          <GeneralTab
            generalConfig={generalConfig}
            setGeneralConfig={setGeneralConfig}
          />
        )}
      </div>
    </div>
  );
}