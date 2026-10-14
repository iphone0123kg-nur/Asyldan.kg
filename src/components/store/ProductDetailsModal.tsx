import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShoppingBag, Check, MessageSquare, Warehouse, ShieldAlert, Scale, Package, Layers } from 'lucide-react';

export const ProductDetailsModal: React.FC = () => {
  const {
    selectedProductDetails,
    setSelectedProductDetails,
    addToCart,
    setIsCartOpen,
    generateQuickWhatsAppInquiryUrl,
    t,
    language,
    getProductName,
    getProductDesc,
    getProductPackaging,
    getProductWarehouse,
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (selectedProductDetails) {
      setQuantity(1);
      setJustAdded(false);
    }
  }, [selectedProductDetails]);

  if (!selectedProductDetails) return null;

  const product = selectedProductDetails;
  const isRu = language === 'ru';
  const localizedName = getProductName(product);
  const localizedDesc = getProductDesc(product);
  const localizedPackaging = getProductPackaging(product);
  const localizedWarehouse = getProductWarehouse(product);

  // Calculate total weight or volume
  let totalCalculationText = '';
  const unitPkg = isRu ? 'упак.' : 'таңгак';
  const unitPieces = isRu ? 'шт.' : 'даана';
  const literWord = isRu ? 'л' : 'литр';

  if (product.measureUnit === 'кг') {
    const total = product.numericWeightOrVolume * quantity;
    totalCalculationText = `${total} кг (${quantity} x ${product.weightOrVolume})`;
  } else if (product.measureUnit === 'г') {
    const totalG = product.numericWeightOrVolume * quantity;
    totalCalculationText = totalG >= 1000 ? `${totalG / 1000} кг (${quantity} x ${product.weightOrVolume})` : `${totalG} г (${quantity} x ${product.weightOrVolume})`;
  } else if (product.measureUnit === 'л') {
    const totalL = product.numericWeightOrVolume * quantity;
    totalCalculationText = `${totalL} ${literWord} (${quantity} x ${product.weightOrVolume})`;
  } else {
    totalCalculationText = `${quantity} ${unitPkg}`;
  }

  const handleAdd = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setSelectedProductDetails(null);
      setIsCartOpen(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductDetails(null)}
          className="absolute top-4 right-4 z-10 p-2 text-stone-400 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-colors cursor-pointer"
          aria-label={t.modalClose}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image & Warehouse info */}
          <div className="bg-stone-100 flex flex-col justify-between p-6">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-stone-200 flex items-center justify-center mb-4">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={localizedName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Layers className="w-16 h-16 text-stone-300" />
              )}
              {/* Weight badge */}
              <div className="absolute top-2.5 left-2.5 bg-emerald-950 text-white text-xs font-bold px-2.5 py-1 rounded shadow-md flex items-center gap-1.5 tabular-nums">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>{product.weightOrVolume}</span>
              </div>
              <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 text-white text-[11px] px-2 py-0.5 rounded">
                {localizedPackaging}
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-emerald-800" />
                <span>
                  {t.modalWarehouse} <strong className="text-stone-900">{localizedWarehouse}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>
                  {t.modalStockRemaining}{' '}
                  <strong className="text-stone-900 tabular-nums">
                    {product.stockQuantity} {t.modalPackages}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Weight, Volume & Quantity Stepper */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                {product.brand}
              </div>
              <h2 className="text-lg font-bold text-stone-900 leading-snug">
                {localizedName}
              </h2>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {localizedDesc}
              </p>

              {/* Weight & Volume Specification Box (No Prices) */}
              <div className="mt-5 p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <Scale className="w-4 h-4 text-emerald-800" />
                    <span className="font-semibold">{t.modalNetWeightLabel}</span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-950 tabular-nums">
                    {product.weightOrVolume}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <Package className="w-4 h-4 text-stone-400" />
                    <span>{t.modalPackagingLabel}</span>
                  </div>
                  <span className="font-semibold text-stone-800">
                    {localizedPackaging}
                  </span>
                </div>
              </div>

              {/* Live Quantity Selector & Volume Accumulator */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-800">
                    {t.modalQuantityLabel}
                  </label>
                  <span className="text-xs text-stone-500">
                    {t.modalOneItemEquals} {product.weightOrVolume}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-stone-600 hover:bg-stone-100 font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stockQuantity}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-14 text-center text-sm font-bold text-stone-900 focus:outline-none tabular-nums"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-stone-600 hover:bg-stone-100 font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-stone-500">
                    {t.modalItemUnitLabel}
                  </span>
                </div>

                {/* Total Calculated Weight / Volume */}
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="text-stone-700 font-medium">{t.modalTotalCalculatedVolume}</span>
                  <span className="text-sm font-bold text-emerald-950 tabular-nums">
                    {totalCalculationText}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-stone-200">
              <button
                onClick={handleAdd}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  justAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-950 hover:bg-emerald-900 text-white shadow-sm'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t.cardAdded}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.cardAddToCart} ({quantity} {unitPieces} = {totalCalculationText})</span>
                  </>
                )}
              </button>

              <a
                href={generateQuickWhatsAppInquiryUrl(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.modalWhatsAppInquiry}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
