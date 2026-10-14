import React from 'react';
import { useApp } from '../../context/AppContext';
import { Percent, Truck, FileText, Headphones, CheckCircle2, MessageSquare } from 'lucide-react';

export const WholesaleBenefitsSection: React.FC = () => {
  const { generateQuickWhatsAppInquiryUrl, setActiveTab, t } = useApp();

  return (
    <section className="py-14 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="max-w-3xl mb-10">
          <div className="text-xs uppercase tracking-wider text-emerald-800 font-semibold mb-1">
            {t.b2bBadge}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            {t.b2bTitle}
          </h2>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed">
            {t.b2bSubtitle}
          </p>
        </div>

        {/* 4 Core Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              {t.b2bCard1Title}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.b2bCard1Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              {t.b2bCard2Title}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.b2bCard2Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              {t.b2bCard3Title}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.b2bCard3Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              {t.b2bCard4Title}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.b2bCard4Desc}
            </p>
          </div>
        </div>

        {/* B2B Customer Segment Card */}
        <div className="bg-emerald-950 text-white rounded-2xl p-8 lg:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                {t.b2bCalloutBadge}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {t.b2bCalloutTitle}
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed max-w-2xl">
                {t.b2bCalloutDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-stone-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t.b2bAudience1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t.b2bAudience2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t.b2bAudience3}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t.b2bAudience4}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <a
                href={generateQuickWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-center"
              >
                <MessageSquare className="w-4 h-4 text-stone-950" />
                <span>{t.b2bContractBtn}</span>
              </a>

              <button
                onClick={() => {
                  setActiveTab('catalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 px-4 bg-emerald-900/80 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl border border-emerald-700/60 transition-colors text-center cursor-pointer"
              >
                {t.b2bCatalogBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
