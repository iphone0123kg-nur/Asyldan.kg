import React from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, ShieldCheck, ArrowRight, MessageSquare, Warehouse, Scale } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { t, setActiveTab, generateQuickWhatsAppInquiryUrl } = useApp();

  return (
    <section className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-950 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
              <Warehouse className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15] text-balance">
              {t.heroTitle}
            </h1>

            <p className="text-base text-stone-600 leading-relaxed max-w-2xl">
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveTab('catalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <span>{t.heroBtnCatalog}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={generateQuickWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>{t.heroBtnWhatsApp}</span>
              </a>
            </div>

            {/* Regional guarantee bullets */}
            <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>{t.heroBullet1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>{t.heroBullet2}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{t.heroBullet3}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Focal Point */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md aspect-4/3 lg:aspect-auto lg:h-[420px]">
              <img
                src="/src/assets/images/hero_grocery_distribution_1791884423111.jpg"
                alt="Distribution Warehouse"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-1">
                  {t.heroCardLocationTitle}
                </div>
                <div className="text-base font-bold leading-snug">
                  {t.heroCardLocationSub}
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  {t.heroCardLocationDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Metric Strip below Hero */}
        <div className="mt-12 pt-8 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
            <div className="text-2xl font-bold text-emerald-950 tabular-nums">{t.heroMetric1Value}</div>
            <div className="text-xs text-stone-700 font-semibold mt-0.5">{t.heroMetric1Label}</div>
            <p className="text-[11px] text-stone-500 mt-1">{t.heroMetric1Sub}</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
            <div className="text-2xl font-bold text-emerald-950 tabular-nums">{t.heroMetric2Value}</div>
            <div className="text-xs text-stone-700 font-semibold mt-0.5">{t.heroMetric2Label}</div>
            <p className="text-[11px] text-stone-500 mt-1">{t.heroMetric2Sub}</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
            <div className="text-2xl font-bold text-emerald-950 tabular-nums">{t.heroMetric3Value}</div>
            <div className="text-xs text-stone-700 font-semibold mt-0.5">{t.heroMetric3Label}</div>
            <p className="text-[11px] text-stone-500 mt-1">{t.heroMetric3Sub}</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
            <div className="text-2xl font-bold text-emerald-950 tabular-nums">{t.heroMetric4Value}</div>
            <div className="text-xs text-stone-700 font-semibold mt-0.5">{t.heroMetric4Label}</div>
            <p className="text-[11px] text-stone-500 mt-1">{t.heroMetric4Sub}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
