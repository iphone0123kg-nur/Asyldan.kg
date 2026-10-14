import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCategory } from '../../types';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, X, ArrowUpDown, Scale } from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    t,
    language,
    getProductName,
    getProductDesc,
    getCategoryName,
  } = useApp();

  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedUnitType, setSelectedUnitType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'weight_asc' | 'weight_desc' | 'name'>('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Extract unique brands
  const allBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory && p.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameLocalized = getProductName(p).toLowerCase();
          const descLocalized = getProductDesc(p).toLowerCase();
          const matchesName = nameLocalized.includes(q) || p.name.toLowerCase().includes(q);
          const matchesBrand = p.brand.toLowerCase().includes(q);
          const matchesDesc = descLocalized.includes(q) || p.description.toLowerCase().includes(q);
          const matchesUnit = p.weightOrVolume.toLowerCase().includes(q);
          if (!matchesName && !matchesBrand && !matchesDesc && !matchesUnit) return false;
        }

        // Brand filter
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
          return false;
        }

        // Measure unit filter (кг / л / г)
        if (selectedUnitType !== 'all') {
          if (p.measureUnit !== selectedUnitType) return false;
        }

        // In stock only
        if (inStockOnly && !p.inStock) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const locale = language === 'ru' ? 'ru' : 'ky';
        if (sortBy === 'popularity') {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return getProductName(a).localeCompare(getProductName(b), locale);
        }
        if (sortBy === 'weight_asc') {
          return a.numericWeightOrVolume - b.numericWeightOrVolume;
        }
        if (sortBy === 'weight_desc') {
          return b.numericWeightOrVolume - a.numericWeightOrVolume;
        }
        if (sortBy === 'name') {
          return getProductName(a).localeCompare(getProductName(b), locale);
        }
        return 0;
      });
  }, [products, selectedCategory, searchQuery, selectedBrand, selectedUnitType, inStockOnly, sortBy, language, getProductName, getProductDesc]);

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand('all');
    setSelectedUnitType('all');
    setSearchQuery('');
    setInStockOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedBrand !== 'all' ||
    selectedUnitType !== 'all' ||
    searchQuery.trim() !== '' ||
    inStockOnly;

  return (
    <div className="bg-stone-50 min-h-screen py-6 sm:py-8 border-b border-stone-200 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span>{t.catalogBreadcrumb}</span>
            {activeCategoryObj && (
              <>
                <span aria-hidden="true">/</span>
                <span className="font-semibold text-emerald-900">{getCategoryName(activeCategoryObj)}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{filteredProducts.length} {t.catalogFoundSuffix}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {activeCategoryObj ? getCategoryName(activeCategoryObj) : t.catalogAllCategoriesTitle}
            </h1>

            {/* Mobile Filters Trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-white border border-stone-300 rounded-lg shadow-xs cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
                <span>{t.catalogFilterBtnMobile}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Weight & Volume Policy Banner */}
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-emerald-950">
            <Scale className="w-4 h-4 text-emerald-800 shrink-0" />
            <span className="font-semibold">
              {t.catalogBanner}
            </span>
          </div>
          <div className="text-stone-600 text-[11px] shrink-0">
            {t.catalogBannerSub}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Sidebar: Categories & Filters */}
          <aside
            className={`lg:col-span-3 space-y-6 ${
              mobileFiltersOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Search Input */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  {t.catalogSearchTitle}
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[11px] text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {t.catalogClear}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Filter by Unit: Литр / Килограмм / Грамм */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                {t.catalogUnitFilterTitle}
              </span>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { id: 'all', label: t.catalogUnitAll },
                  { id: 'кг', label: t.catalogUnitKg },
                  { id: 'л', label: t.catalogUnitL },
                  { id: 'г', label: t.catalogUnitG },
                ].map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnitType(u.id)}
                    className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-colors cursor-pointer ${
                      selectedUnitType === u.id
                        ? 'bg-emerald-900 text-white font-bold border-emerald-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Filter List */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  {t.catalogCategoriesTitle}
                </span>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
                  >
                    {t.catalogUnitAll}
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === null
                      ? 'bg-emerald-50 text-emerald-950 font-bold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>{t.catalogAllCategories}</span>
                  <span className="text-[11px] text-stone-400 tabular-nums">{products.length}</span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-50 text-emerald-950 font-bold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="truncate">{getCategoryName(cat)}</span>
                    <span className="text-[11px] text-stone-400 tabular-nums shrink-0 ml-2">
                      {products.filter((p) => p.category === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                {t.catalogBrandTitle}
              </span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="all">{t.catalogAllBrands} ({allBrands.length})</option>
                {allBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* In stock toggle */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>{t.catalogOnlyInStock}</span>
              </label>
            </div>

            {/* Reset All Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-full py-2 px-3 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.catalogResetFilters}</span>
              </button>
            )}
          </aside>

          {/* Right Main Grid Area */}
          <main className="lg:col-span-9 space-y-6">
            {/* Sorting & Result Counts Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-stone-500">
                {t.catalogFoundLabel} <span className="font-bold text-stone-900">{filteredProducts.length}</span> {t.catalogFoundSuffix}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-500 hidden sm:inline">{t.catalogSortLabel}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                >
                  <option value="popularity">{t.catalogSortPopular}</option>
                  <option value="weight_asc">{t.catalogSortWeightAsc}</option>
                  <option value="weight_desc">{t.catalogSortWeightDesc}</option>
                  <option value="name">{t.catalogSortName}</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {t.catalogEmptyTitle}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {t.catalogEmptyDesc}
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
                >
                  {t.catalogClearFiltersBtn}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
