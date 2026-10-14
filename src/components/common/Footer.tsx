import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Phone, Clock, MessageSquare, ShieldCheck, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    settings,
    setActiveTab,
    resetDemoData,
    generateQuickWhatsAppInquiryUrl,
    t,
    getCentralWarehouseAddress,
    getBatkenWarehouseAddress,
    getOperatingHours,
  } = useApp();

  const handleLinkClick = (tab: 'home' | 'catalog' | 'delivery' | 'wholesale' | 'admin') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                Б
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                {settings.companyName}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t.footerAboutText}
            </p>
            <div className="pt-2">
              <a
                href={generateQuickWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.footerWhatsAppLead}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footerSectionsTitle}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => handleLinkClick('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navHome}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('catalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navCatalog}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('wholesale')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navWholesale}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('delivery')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navDelivery}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('admin')}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer pt-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.adminPanel}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Warehouses & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footerWarehousesTitle}
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-stone-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">{t.footerCentralOsh}</strong>
                <span>{getCentralWarehouseAddress()}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-stone-300 pt-1">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">{t.footerBatkenBranch}</strong>
                <span>{getBatkenWarehouseAddress()}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-stone-300 pt-2 border-t border-stone-800">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">{t.footerHoursTitle}</strong>
                <span>{getOperatingHours()}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Contacts & Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footerContactsTitle}
            </h4>
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <a href={`tel:${settings.whatsappPhone}`} className="hover:text-white">
                {settings.displayPhone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>WhatsApp: +{settings.whatsappPhone}</span>
            </div>

            <div className="pt-4 border-t border-stone-800">
              <button
                onClick={() => {
                  if (window.confirm(t.footerResetDemo + '?')) {
                    resetDemoData();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-stone-400" />
                <span>{t.footerResetDemo}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} {settings.companyName}. {t.footerCopyright}
          </div>
          <div className="max-w-xl text-center md:text-right text-[11px] text-stone-500">
            {t.footerLegalNotice}
          </div>
        </div>
      </div>
    </footer>
  );
};
