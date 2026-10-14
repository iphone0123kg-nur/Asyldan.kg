import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryRegionId } from '../../types';
import { DELIVERY_REGIONS } from '../../data/mockData';
import { X, CheckCircle, Truck, Building2, Scale, Droplet } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartItemCount,
    cartTotalWeightKg,
    cartTotalVolumeLiters,
    deliveryMethod,
    setDeliveryMethod,
    selectedRegion,
    setSelectedRegion,
    createOrder,
    t,
    language,
    getProductName,
    getProductPackaging,
    getDeliveryRegionName,
    getDeliveryRegionDistricts,
  } = useApp();

  const isRu = language === 'ru';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+996 ');
  const [businessName, setBusinessName] = useState('');
  const [cityOrVillage, setCityOrVillage] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState(t.checkoutTimeDay);
  const [orderNotes, setOrderNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const currentRegionData = DELIVERY_REGIONS.find((r) => r.id === selectedRegion) || DELIVERY_REGIONS[0];
  const regionDistricts = getDeliveryRegionDistricts(currentRegionData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(t.checkoutErrName);
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg(t.checkoutErrPhone);
      return;
    }
    if (deliveryMethod === 'delivery' && !detailedAddress.trim()) {
      setErrorMsg(t.checkoutErrAddress);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      createOrder({
        name: name.trim(),
        phone: phone.trim(),
        businessName: businessName.trim() || undefined,
        region: selectedRegion,
        cityOrVillage: cityOrVillage.trim() || regionDistricts[0],
        detailedAddress: deliveryMethod === 'pickup'
          ? (isRu ? 'Самовывоз со склада' : 'Кампадан өзү алып кетүү')
          : detailedAddress.trim(),
        orderNotes: orderNotes.trim() || undefined,
        preferredDeliveryTime,
      });
      setIsSubmitting(false);
      setIsCheckoutOpen(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              {t.checkoutTitle}
            </h2>
            <p className="text-xs text-stone-500">
              {t.checkoutSubtitle}
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label={t.modalClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Delivery or Pickup Segment */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-2">
              {t.checkoutStep1}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  deliveryMethod === 'delivery'
                    ? 'border-emerald-800 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-800'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Truck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">{t.cartDeliveryCourier}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {t.checkoutDeliveryDesc}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  deliveryMethod === 'pickup'
                    ? 'border-emerald-800 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-800'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">{t.cartDeliveryPickup}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {t.checkoutPickupDesc}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Contact Details */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
              {t.checkoutStep2}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.checkoutNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.checkoutNamePlaceholder}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.checkoutPhoneLabel} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.checkoutPhonePlaceholder}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t.checkoutBusinessLabel}
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={t.checkoutBusinessPlaceholder}
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
              />
            </div>
          </div>

          {/* Delivery Region and Address */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
              {t.checkoutStep3}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.checkoutRegionLabel} *
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as DeliveryRegionId)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                >
                  {DELIVERY_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {getDeliveryRegionName(r)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.checkoutCityLabel}
                </label>
                <select
                  value={cityOrVillage}
                  onChange={(e) => setCityOrVillage(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                >
                  {regionDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {deliveryMethod === 'delivery' && (
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.checkoutAddressLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  placeholder={t.checkoutAddressPlaceholder}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.checkoutTimeLabel}
                </label>
                <select
                  value={preferredDeliveryTime}
                  onChange={(e) => setPreferredDeliveryTime(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                >
                  <option value={t.checkoutTimeDay}>{t.checkoutTimeDay}</option>
                  <option value={t.checkoutTimeMorning}>{t.checkoutTimeMorning}</option>
                  <option value={t.checkoutTimeAfternoon}>{t.checkoutTimeAfternoon}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.checkoutNotesLabel}
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder={t.checkoutNotesPlaceholder}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Order Summary Spec Box */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-stone-900 border-b border-stone-200 pb-2">
              <span>{t.checkoutSummaryTitle}</span>
              <span className="tabular-nums">{cartItemCount} {t.cartItemCountUnit}</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {cart.map((it) => (
                <div key={it.product.id} className="flex justify-between text-stone-600">
                  <span className="truncate max-w-[280px]">
                    {getProductName(it.product)} ({it.quantity} x {getProductPackaging(it.product)})
                  </span>
                  <span className="font-semibold text-stone-900 shrink-0 ml-2">
                    {it.totalWeightOrVolumeText}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 flex flex-wrap gap-4 text-emerald-950 font-bold">
              {cartTotalWeightKg > 0 && (
                <div className="flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{t.cartTotalDryWeight} ~{cartTotalWeightKg.toLocaleString()} кг</span>
                </div>
              )}
              {cartTotalVolumeLiters > 0 && (
                <div className="flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{t.cartTotalLiquid} ~{cartTotalVolumeLiters.toLocaleString()} {isRu ? 'л' : 'литр'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-950 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{t.checkoutSubmitting}</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>{t.checkoutSubmitBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
