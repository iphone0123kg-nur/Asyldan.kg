import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, MessageSquare, Copy, Check, Scale, Droplet } from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const { confirmedOrder, setConfirmedOrder, generateWhatsAppOrderUrl, setActiveTab, t, language } = useApp();
  const [copied, setCopied] = useState(false);

  if (!confirmedOrder) return null;

  const order = confirmedOrder;
  const isRu = language === 'ru';
  const whatsappUrl = generateWhatsAppOrderUrl(order);

  const handleCopyText = () => {
    try {
      const parsed = new URL(whatsappUrl);
      const text = parsed.searchParams.get('text') || '';
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setActiveTab('catalog');
  };

  const regionText = order.customer.region === 'osh'
    ? (isRu ? 'Ошская область' : 'Ош облусу')
    : (isRu ? 'Баткенская область' : 'Баткен облусу');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Success Header Banner */}
        <div className="bg-emerald-950 text-white p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t.successTitle}</h2>
          <div className="text-xs text-emerald-200">
            {t.successOrderNum} <strong className="text-white font-mono">{order.orderNumber}</strong>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Order Brief Box */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3 text-xs">
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">{t.successCustomer}</span>
              <span className="font-semibold text-stone-900">{order.customer.name}</span>
            </div>

            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">{t.successPhone}</span>
              <span className="font-semibold text-stone-900">{order.customer.phone}</span>
            </div>

            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">{t.successAddress}</span>
              <span className="font-semibold text-stone-900 text-right truncate max-w-[240px]">
                {regionText}, {order.customer.cityOrVillage}, {order.customer.detailedAddress}
              </span>
            </div>

            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">{t.successTotalItems}</span>
              <span className="font-bold text-stone-900 tabular-nums">
                {order.totalItemsCount} {t.cartItemCountUnit} ({order.items.length} {isRu ? 'позиций' : 'аталыш'})
              </span>
            </div>

            {/* Total weight & liters */}
            <div className="pt-1 space-y-1">
              {order.totalWeightKg > 0 && (
                <div className="flex justify-between text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-800" />
                    <span>{t.successDryWeight}</span>
                  </span>
                  <strong className="text-emerald-950 tabular-nums font-bold">
                    ~{order.totalWeightKg.toLocaleString()} кг
                  </strong>
                </div>
              )}
              {order.totalVolumeLiters > 0 && (
                <div className="flex justify-between text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-emerald-800" />
                    <span>{t.successLiquidVolume}</span>
                  </span>
                  <strong className="text-emerald-950 tabular-nums font-bold">
                    ~{order.totalVolumeLiters.toLocaleString()} {isRu ? 'л' : 'литр'}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Primary Callout */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>{t.successWhatsAppTitle}</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              {t.successWhatsAppDesc}
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.successWhatsAppBtn}</span>
            </a>
          </div>

          {/* Copy Manual Text Option */}
          <div className="text-center pt-1 border-t border-stone-100">
            <div className="text-[11px] text-stone-500 mb-2">
              {t.successCopyManual}
            </div>
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-emerald-700 font-bold">{t.successCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t.successCopyBtn}</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-stone-500 text-center leading-relaxed">
            {t.successDisclaimer}
          </p>

          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {t.successBackCatalog}
          </button>
        </div>
      </div>
    </div>
  );
};
