import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Search, Phone, MessageSquare, ShieldCheck, Menu, X, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    toggleLanguage,
    setLanguage,
    t,
    activeTab,
    setActiveTab,
    cartItemCount,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    settings,
    generateQuickWhatsAppInquiryUrl,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleNavClick = (tab: 'home' | 'catalog' | 'delivery' | 'wholesale' | 'admin') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'catalog') {
      setActiveTab('catalog');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top utility alert strip */}
      <div className="bg-emerald-950 text-stone-200 text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-emerald-300 font-medium">{t.wholesaleRetailSubtitle}</span>
            <span className="hidden sm:inline text-stone-400">·</span>
            <span className="hidden sm:inline text-stone-300">{t.coverageRegions}</span>
            <span className="hidden md:inline text-stone-400">·</span>
            <span className="hidden md:inline text-stone-300">{t.workingHoursTop}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-stone-300">
            {/* Single-Click Language Toggle Pill */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 p-0.5 rounded-md bg-emerald-900/90 hover:bg-emerald-800 text-stone-200 text-xs transition-colors border border-emerald-700/80 cursor-pointer"
              title={language === 'ky' ? 'Орус тилине которуу (Русский)' : 'Кыргыз тилине которуу (Кыргызча)'}
              aria-label={t.langToggleAria}
            >
              <Globe className="w-3.5 h-3.5 ml-1 text-amber-400" />
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  language === 'ky'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                КЫРГ
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  language === 'ru'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                РУС
              </span>
            </button>

            <span className="text-stone-600 hidden sm:inline">|</span>

            <a
              href={`tel:${settings.whatsappPhone}`}
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{settings.displayPhone}</span>
            </a>

            <span className="text-stone-600">|</span>

            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1 text-xs hover:text-white transition-colors cursor-pointer ${
                activeTab === 'admin' ? 'text-amber-300 font-semibold' : 'text-stone-300'
              }`}
              title={t.adminPanel}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.adminPanel}</span>
              <span className="sm:hidden">{t.adminPanelShort}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => handleNavClick('home')}
            className="text-left group cursor-pointer flex items-center gap-2 min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm shrink-0">
              Б
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-extrabold tracking-tight text-emerald-950 group-hover:text-emerald-800 transition-colors whitespace-nowrap block leading-tight">
                Береке Опт
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-600 block whitespace-nowrap font-medium truncate">
                {language === 'ky' ? 'Ош · Баткен кампалары' : 'Склады в Оше и Баткене'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-stone-700">
          <button
            onClick={() => handleNavClick('home')}
            className={`cursor-pointer transition-colors whitespace-nowrap py-1 ${
              activeTab === 'home'
                ? 'text-emerald-950 font-bold border-b-2 border-emerald-900'
                : 'hover:text-emerald-950'
            }`}
          >
            {t.navHome}
          </button>
          <button
            onClick={() => handleNavClick('catalog')}
            className={`cursor-pointer transition-colors whitespace-nowrap py-1 ${
              activeTab === 'catalog'
                ? 'text-emerald-950 font-bold border-b-2 border-emerald-900'
                : 'hover:text-emerald-950'
            }`}
          >
            {t.navCatalog}
          </button>
          <button
            onClick={() => handleNavClick('wholesale')}
            className={`cursor-pointer transition-colors whitespace-nowrap py-1 ${
              activeTab === 'wholesale'
                ? 'text-emerald-950 font-bold border-b-2 border-emerald-900'
                : 'hover:text-emerald-950'
            }`}
          >
            {t.navWholesale}
          </button>
          <button
            onClick={() => handleNavClick('delivery')}
            className={`cursor-pointer transition-colors whitespace-nowrap py-1 ${
              activeTab === 'delivery'
                ? 'text-emerald-950 font-bold border-b-2 border-emerald-900'
                : 'hover:text-emerald-950'
            }`}
          >
            {t.navDelivery}
          </button>
        </nav>

        {/* Zone 3: Search, Language Switch, WhatsApp & Prominent "Себет" Cart Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Search on Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:block w-36 lg:w-48 xl:w-56"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-2.5 py-1.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-all"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
          </form>

          {/* Search Toggle for Mobile */}
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="md:hidden p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
            aria-label={t.searchPlaceholder}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Single-Click Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors cursor-pointer shadow-2xs"
            title={language === 'ky' ? 'Орус тилине которуу' : 'Переключить на кыргызский'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-800" />
            <span className={language === 'ky' ? 'text-emerald-950 font-extrabold underline' : 'text-stone-400'}>
              КЫРГ
            </span>
            <span className="text-stone-300 text-[10px]">/</span>
            <span className={language === 'ru' ? 'text-emerald-950 font-extrabold underline' : 'text-stone-400'}>
              РУС
            </span>
          </button>

          {/* WhatsApp Direct Help */}
          <a
            href={generateQuickWhatsAppInquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden md:inline">{t.whatsappBtn}</span>
          </a>

          {/* Shopping Bag "Себет" Button - ALWAYS shows "Себет" / "Корзина" with count */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 active:bg-emerald-950 rounded-lg transition-all shadow-sm cursor-pointer whitespace-nowrap ring-1 ring-emerald-800"
            aria-label={t.cart}
            title={t.cart}
          >
            <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="inline font-bold">{t.cart}</span>
            <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-stone-950 font-extrabold text-[11px] rounded-full tabular-nums min-w-[18px] text-center">
              {cartItemCount}
            </span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Row if open */}
      {showSearchInput && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-stone-100 bg-stone-50">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full text-sm bg-white border border-stone-300 rounded-lg pl-9 pr-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              autoFocus
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          {/* Mobile Single-Click Language Switcher Row */}
          <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <Globe className="w-4 h-4 text-emerald-800" />
              <span>{language === 'ky' ? 'Тилди которуу:' : 'Переключить язык:'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLanguage('ky')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  language === 'ky'
                    ? 'bg-emerald-950 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Кыргызча
              </button>
              <button
                onClick={() => setLanguage('ru')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  language === 'ru'
                    ? 'bg-emerald-950 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Русский
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-2 text-sm font-medium text-stone-800">
            {/* Prominent Cart item in Mobile Drawer */}
            <button
              onClick={() => {
                setIsCartOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 text-white font-bold text-sm shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>{t.cart} ({t.cartTitle})</span>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-400 text-stone-950 rounded-full font-extrabold text-xs tabular-nums">
                {cartItemCount} {t.cartItemCountUnit}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('home')}
              className={`text-left px-3 py-2 rounded-md ${
                activeTab === 'home' ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-stone-50'
              }`}
            >
              {t.navHome}
            </button>
            <button
              onClick={() => handleNavClick('catalog')}
              className={`text-left px-3 py-2 rounded-md ${
                activeTab === 'catalog' ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-stone-50'
              }`}
            >
              {t.navCatalog}
            </button>
            <button
              onClick={() => handleNavClick('wholesale')}
              className={`text-left px-3 py-2 rounded-md ${
                activeTab === 'wholesale' ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-stone-50'
              }`}
            >
              {t.navWholesale}
            </button>
            <button
              onClick={() => handleNavClick('delivery')}
              className={`text-left px-3 py-2 rounded-md ${
                activeTab === 'delivery' ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-stone-50'
              }`}
            >
              {t.navDelivery}
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className={`text-left px-3 py-2 rounded-md flex items-center justify-between ${
                activeTab === 'admin' ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-stone-50 text-stone-700'
              }`}
            >
              <span>{t.adminPanel}</span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </button>
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            <a
              href={generateQuickWhatsAppInquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.whatsappBtn}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
