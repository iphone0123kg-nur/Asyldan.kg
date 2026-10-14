import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCategory } from '../../types';
import { ArrowRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { categories, setSelectedCategory, setActiveTab, t, getCategoryName, getCategoryDesc } = useApp();

  const handleSelectCategory = (categoryId: ProductCategory) => {
    setSelectedCategory(categoryId);
    setActiveTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-12 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-800 font-semibold mb-1">
              {t.categoriesBadge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {t.categoriesTitle}
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setActiveTab('catalog');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-950 transition-colors cursor-pointer"
          >
            <span>{t.categoriesViewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 10 Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className="group text-left bg-white rounded-xl border border-stone-200 p-3.5 hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-4/3 rounded-lg overflow-hidden bg-stone-100 mb-3 relative">
                <img
                  src={cat.image}
                  alt={getCategoryName(cat)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                    {getCategoryName(cat)}
                  </h3>
                  <span className="text-[11px] text-stone-500 font-medium tabular-nums">
                    {cat.itemCount} {t.itemsCountSuffix}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                  {getCategoryDesc(cat)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
