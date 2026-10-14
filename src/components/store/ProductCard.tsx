import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Check, Layers, Scale, Package, Plus, Minus, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    setSelectedProductDetails,
    setIsCartOpen,
    t,
    language,
    getProductName,
    getProductPackaging,
  } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isRu = language === 'ru';
  const localizedName = getProductName(product);
  const localizedPackaging = getProductPackaging(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  const handleOpenCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCartOpen(true);
  };

  // Calculate total volume or weight for the selected quantity
  const unitSuffix = product.measureUnit === 'кг' ? 'кг' : product.measureUnit === 'л' ? (isRu ? 'л' : 'литр') : 'г';
  const calculatedTotalVolume = product.numericWeightOrVolume * quantity;

  return (
    <div
      onClick={() => setSelectedProductDetails(product)}
      className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer w-full"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-4/3 bg-stone-100 overflow-hidden flex items-center justify-center">
          {!imageError && product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={localizedName}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center p-4 text-stone-400">
              <Layers className="w-10 h-10 stroke-1 mb-2" />
              <span className="text-xs font-medium text-stone-500 text-center">{product.brand}</span>
            </div>
          )}

          {/* Prominent Weight/Volume Badge */}
          <div className="absolute top-2.5 left-2.5 bg-emerald-950 text-white font-bold text-xs px-2.5 py-1 rounded shadow-md flex items-center gap-1.5 tabular-nums">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>{product.weightOrVolume}</span>
          </div>

          {/* Packaging Unit Label */}
          <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-stone-200 text-[11px] px-2 py-0.5 rounded">
            {localizedPackaging}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          {/* Brand & Stock Status */}
          <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-stone-600 truncate">
              {product.brand}
            </span>
            <span className="shrink-0 text-[11px] text-emerald-800 font-semibold">
              {product.inStock ? t.cardInStock : t.cardPreorder}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
            {localizedName}
          </h3>

          {/* Weight & Volume Specification Box (No Prices displayed to customer) */}
          <div className="mt-3 pt-3 border-t border-stone-100 space-y-2">
            <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-lg border border-stone-100">
              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <Scale className="w-3.5 h-3.5 text-emerald-800" />
                <span className="font-medium">{t.cardNetWeight}</span>
              </div>
              <span className="text-sm font-extrabold text-stone-900 tabular-nums">
                {product.weightOrVolume}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <div className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-stone-400" />
                <span>{t.cardPackaging}</span>
              </div>
              <span className="font-semibold text-stone-700 truncate max-w-[140px]">
                {localizedPackaging}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer: Quantity Selector & "Себетке кошуу" Button */}
      <div className="p-4 pt-0 space-y-2.5" onClick={(e) => e.stopPropagation()}>
        {/* Quantity Stepper with Live Weight Display */}
        <div className="flex items-center justify-between gap-2 bg-stone-50 p-1.5 rounded-lg border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-600 pl-1">
            {isRu ? 'Количество:' : 'Саны (таңгак):'}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded bg-white hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
              title="Азайтуу"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-stone-900 tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 rounded bg-white hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
              title="Көбөйтүү"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Calculated Volume Info for Selected Qty */}
        {quantity > 1 && (
          <div className="text-[11px] text-emerald-800 font-medium px-1 flex justify-between tabular-nums">
            <span>{isRu ? 'Расчетный объем:' : 'Эсептелген көлөмү:'}</span>
            <strong>~{calculatedTotalVolume} {unitSuffix} ({quantity} таңгак)</strong>
          </div>
        )}

        {/* Primary Action Button: "Себетке кошуу" */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
              justAdded
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-500'
                : 'bg-emerald-950 hover:bg-emerald-900 active:bg-emerald-950 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 text-amber-300" />
                <span>{t.cardAdded}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>{t.cardAddToCart}</span>
              </>
            )}
          </button>

          {/* Details / Open Cart shortcut */}
          {justAdded ? (
            <button
              type="button"
              onClick={handleOpenCart}
              className="px-2.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs whitespace-nowrap"
              title={t.cardGoToCart}
            >
              <span>{t.cardGoToCart}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProductDetails(product);
              }}
              className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title={t.cardDetails}
            >
              <span className="text-xs font-medium text-emerald-900">{t.cardDetails}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

