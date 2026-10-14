import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

export const WholesaleOffersSection: React.FC = () => {
  const { products, setActiveTab, t } = useApp();
  const [filterMode, setFilterMode] = useState<'popular' | 'special'>('popular');

  const displayedProducts = products.filter((p) => {
    if (filterMode === 'popular') return p.isPopular;
    if (filterMode === 'special') return p.isSpecialOffer;
    return true;
  });

  return (
    <section className="py-12 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-800 font-semibold mb-1">
              {t.offersBadge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {t.offersTitle}
            </h2>
          </div>

          {/* Filter segment tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => setFilterMode('popular')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterMode === 'popular'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.tabPopular}</span>
            </button>
            <button
              onClick={() => setFilterMode('special')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterMode === 'special'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.tabSpecial}</span>
            </button>
          </div>
        </div>

        {/* Volume & Packaging Info Banner */}
        <div className="mb-8 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              {t.volumeBannerTitle}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {t.volumeBannerText}
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="shrink-0 text-xs font-bold text-emerald-950 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>{t.volumeBannerBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
