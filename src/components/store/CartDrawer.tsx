import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, ShoppingBag, ArrowRight, MessageSquare, Scale, Droplet, Package } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartItemCount,
    cartTotalWeightKg,
    cartTotalVolumeLiters,
    deliveryMethod,
    setDeliveryMethod,
    selectedRegion,
    setSelectedRegion,
    setIsCheckoutOpen,
    settings,
    t,
    language,
    getProductName,
    getProductPackaging,
  } = useApp();

  if (!isCartOpen) return null;

  const isRu = language === 'ru';

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleQuickWhatsAppDraft = () => {
    const regionName = selectedRegion === 'osh'
      ? (isRu ? 'Ошская область' : 'Ош облусу')
      : (isRu ? 'Баткенская область' : 'Баткен облусу');
    const methodStr = deliveryMethod === 'delivery'
      ? (isRu ? 'Доставка автомобилем' : 'Жеткирүү (унаа менен)')
      : (isRu ? 'Самовывоз со склада' : 'Кампадан өзү алып кетүү');

    let msg = isRu
      ? `*СПИСОК ТОВАРОВ В ЗАКАЗЕ* (${settings.companyName})\n`
      : `*ТАМАК-АШ ТОВАРЛАРЫНА ЗАКАЗ ТИЗМЕСИ* (${settings.companyName})\n`;
    msg += `---------------------------------\n`;
    msg += isRu ? `*Регион:* ${regionName}\n` : `*Аймак:* ${regionName}\n`;
    msg += isRu ? `*Способ получения:* ${methodStr}\n\n` : `*Алуу түрү:* ${methodStr}\n\n`;
    msg += isRu ? `*ВЫБРАННЫЕ ТОВАРЫ И ВЕСОВЫЕ ОБЪЕМЫ:*\n` : `*ТАНДАЛГАН ТОВАРЛАР ЖАНА САЛМАКТАРЫ:*\n`;

    cart.forEach((it, idx) => {
      const pName = getProductName(it.product);
      const pkg = getProductPackaging(it.product);
      const qtyUnit = isRu ? 'шт.' : 'даана';
      const totLabel = isRu ? 'Всего' : 'Жалпы';
      msg += `${idx + 1}. *${pName}*\n   Тара: ${pkg}\n   Кол-во: ${it.quantity} ${qtyUnit} | ${totLabel}: ${it.totalWeightOrVolumeText}\n`;
    });

    msg += `---------------------------------\n`;
    if (cartTotalWeightKg > 0) {
      msg += isRu
        ? `*Общий расчетный вес:* ~${cartTotalWeightKg.toLocaleString()} кг\n`
        : `*Жалпы эсептелген салмагы:* ~${cartTotalWeightKg.toLocaleString()} кг\n`;
    }
    if (cartTotalVolumeLiters > 0) {
      msg += isRu
        ? `*Общий объем жидкостей:* ~${cartTotalVolumeLiters.toLocaleString()} литров\n`
        : `*Жалпы суюктук көлөмү:* ~${cartTotalVolumeLiters.toLocaleString()} литр\n`;
    }
    msg += isRu
      ? `*Всего упаковок:* ${cartItemCount} шт.\n\n`
      : `*Жалпы таңгак:* ${cartItemCount} даана\n\n`;
    msg += isRu
      ? `_Здравствуйте! Просим уточнить наличие позиций на складе и рассчитать доставку._`
      : `_Саламатсызбы! Ушул тизме боюнча товарлардын кампадагы бар-жогун тактап, жеткирүү шарттарын билдирип коюуңузду суранабыз._`;

    const url = `https://wa.me/${settings.whatsappPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-950" />
            <h2 className="text-base font-bold text-stone-900">
              {t.cartTitle} ({cartItemCount} {t.cartItemCountUnit})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-stone-400 hover:text-stone-700 cursor-pointer mr-2"
              >
                {t.cartClear}
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label={t.modalClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-sm font-bold text-stone-800">{t.cartEmptyTitle}</h3>
              <p className="text-xs text-stone-500 max-w-xs">
                {t.cartEmptyDesc}
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-4 py-2 bg-emerald-950 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                {t.cartGoToCatalog}
              </button>
            </div>
          ) : (
            <>
              {/* Summary Volume Callout */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-stone-900 block">
                  {t.cartVolumeSummary}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {cartTotalWeightKg > 0 && (
                    <div className="bg-white p-2 rounded-lg border border-stone-200/80 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-800" />
                      <div>
                        <span className="text-[10px] text-stone-500 block">{t.cartDryWeight}</span>
                        <strong className="text-xs text-stone-900 tabular-nums">
                          ~{cartTotalWeightKg.toLocaleString()} кг
                        </strong>
                      </div>
                    </div>
                  )}

                  {cartTotalVolumeLiters > 0 && (
                    <div className="bg-white p-2 rounded-lg border border-stone-200/80 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-emerald-800" />
                      <div>
                        <span className="text-[10px] text-stone-500 block">{t.cartLiquidVolume}</span>
                        <strong className="text-xs text-stone-900 tabular-nums">
                          ~{cartTotalVolumeLiters.toLocaleString()} {isRu ? 'л' : 'литр'}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Card List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-white rounded-xl border border-stone-200 flex items-start gap-3 relative group"
                  >
                    <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={getProductName(item.product)}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-stone-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {getProductName(item.product)}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                          title={isRu ? 'Удалить' : 'Өчүрүү'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {getProductPackaging(item.product)}
                      </div>

                      <div className="text-[11px] font-semibold text-emerald-950 mt-1">
                        {item.totalWeightOrVolumeText}
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                        <span className="text-[11px] text-stone-500">
                          {isRu ? 'Количество:' : 'Саны:'}
                        </span>
                        <div className="flex items-center border border-stone-200 rounded-md bg-stone-50 overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-900 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            {/* Delivery method and region selection */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-700 block">
                {t.cartDeliveryMethodTitle}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    deliveryMethod === 'delivery'
                      ? 'bg-emerald-950 text-white border-emerald-950'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {t.cartDeliveryCourier}
                </button>
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    deliveryMethod === 'pickup'
                      ? 'bg-emerald-950 text-white border-emerald-950'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {t.cartDeliveryPickup}
                </button>
              </div>

              {/* Region Selector */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => setSelectedRegion('osh')}
                  className={`py-1 px-2 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
                    selectedRegion === 'osh'
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {t.cartRegionOsh}
                </button>
                <button
                  onClick={() => setSelectedRegion('batken')}
                  className={`py-1 px-2 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
                    selectedRegion === 'batken'
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {t.cartRegionBatken}
                </button>
              </div>
            </div>

            {/* Total Volume summary */}
            <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{t.cartTotalPackages}</span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {cartItemCount} {t.cartItemCountUnit}
                </span>
              </div>
              {cartTotalWeightKg > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>{t.cartTotalDryWeight}</span>
                  <span className="font-bold text-emerald-950 tabular-nums">
                    ~{cartTotalWeightKg.toLocaleString()} кг
                  </span>
                </div>
              )}
              {cartTotalVolumeLiters > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>{t.cartTotalLiquid}</span>
                  <span className="font-bold text-emerald-950 tabular-nums">
                    ~{cartTotalVolumeLiters.toLocaleString()} {isRu ? 'л' : 'литр'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 px-4 bg-emerald-950 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.cartCheckoutBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleQuickWhatsAppDraft}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>{t.cartWhatsAppOrderBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
