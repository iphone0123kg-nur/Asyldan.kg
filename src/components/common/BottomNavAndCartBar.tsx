import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Home,
  Grid,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Scale,
  Sparkles,
} from 'lucide-react';

export const BottomNavAndCartBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cartItemCount,
    cartTotalWeightKg,
    cartTotalVolumeLiters,
    setIsCartOpen,
    generateQuickWhatsAppInquiryUrl,
    language,
    t,
  } = useApp();

  const isRu = language === 'ru';

  const handleTabChange = (tab: 'home' | 'catalog' | 'delivery' | 'wholesale' | 'admin') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in admin mode, do not show customer bottom nav
  if (activeTab === 'admin') return null;

  return (
    <>
      {/* 1. FLOATING DESKTOP & TABLET CART SUMMARY PILL (Always visible when cart has items) */}
      {cartItemCount > 0 && (
        <aside
          aria-label={t.cartTitle}
          className="fixed bottom-20 lg:bottom-6 right-4 sm:right-8 z-40 animate-fade-in"
        >
          <div className="bg-emerald-950 text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl border-2 border-amber-400 flex items-center gap-3 sm:gap-4 max-w-sm sm:max-w-md backdrop-blur-md">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-extrabold shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-emerald-950 tabular-nums">
                {cartItemCount}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="truncate">{t.cartTitle}</span>
              </div>
              <div className="text-[11px] text-stone-200 flex items-center gap-2 mt-0.5 tabular-nums">
                <span>
                  {cartItemCount} {t.cartItemCountUnit}
                </span>
                {cartTotalWeightKg > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                      <Scale className="w-3 h-3" />
                      ~{cartTotalWeightKg.toLocaleString()} кг
                    </span>
                  </>
                )}
                {cartTotalVolumeLiters > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-300 font-semibold">
                      ~{cartTotalVolumeLiters.toLocaleString()} {isRu ? 'л' : 'литр'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-400 text-stone-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
            >
              <span>{isRu ? 'Открыть' : 'Ачуу'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. PERSISTENT MOBILE BOTTOM NAVIGATION BAR (Ensures "Себет" is 100% visible on all mobile/tablet screens) */}
      <nav aria-label="Төмөнкү навигация" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-5 items-center justify-around gap-1 text-center">
          {/* Home */}
          <button
            onClick={() => handleTabChange('home')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'text-emerald-950 font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight truncate w-full">
              {isRu ? 'Главная' : 'Башкы'}
            </span>
          </button>

          {/* Catalog */}
          <button
            onClick={() => handleTabChange('catalog')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'catalog'
                ? 'text-emerald-950 font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Grid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight truncate w-full">
              {isRu ? 'Каталог' : 'Каталог'}
            </span>
          </button>

          {/* Cart ("Себет") - Highlighted central button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-lg text-emerald-950 font-extrabold relative cursor-pointer"
          >
            <div className="relative">
              <div className="w-9 h-7 rounded-lg bg-emerald-950 text-white flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
              </div>
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-400 text-stone-950 text-[10px] font-black rounded-full px-1.5 py-0.2 shadow-sm border border-emerald-950 tabular-nums">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-tight font-black text-emerald-950 mt-0.5 truncate w-full">
              {t.cart}
            </span>
          </button>

          {/* WhatsApp */}
          <a
            href={generateQuickWhatsAppInquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1 px-1 rounded-lg text-stone-500 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 mb-0.5 text-emerald-700" />
            <span className="text-[10px] leading-tight truncate w-full">
              WhatsApp
            </span>
          </a>

          {/* Admin */}
          <button
            onClick={() => handleTabChange('admin')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'text-amber-800 font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5 text-amber-600" />
            <span className="text-[10px] leading-tight truncate w-full">
              {isRu ? 'Админ' : 'Админ'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
