import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DELIVERY_REGIONS } from '../../data/mockData';
import { MapPin, Calendar, AlertCircle, Info, Warehouse } from 'lucide-react';

export const DeliveryCoverageSection: React.FC = () => {
  const {
    selectedRegion,
    setSelectedRegion,
    t,
    getDeliveryRegionName,
    getDeliveryRegionDistricts,
    getDeliveryRegionEstimatedTime,
    getDeliveryRegionSchedule,
    getCentralWarehouseAddress,
    getBatkenWarehouseAddress,
  } = useApp();

  const [activeRegionTab, setActiveRegionTab] = useState<'osh' | 'batken'>(selectedRegion);

  const currentRegion = DELIVERY_REGIONS.find((r) => r.id === activeRegionTab) || DELIVERY_REGIONS[0];

  const handleRegionChange = (reg: 'osh' | 'batken') => {
    setActiveRegionTab(reg);
    setSelectedRegion(reg);
  };

  const localizedRegionName = getDeliveryRegionName(currentRegion);
  const localizedDistricts = getDeliveryRegionDistricts(currentRegion);
  const localizedEstimatedTime = getDeliveryRegionEstimatedTime(currentRegion);
  const localizedSchedule = getDeliveryRegionSchedule(currentRegion);

  return (
    <section className="py-14 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="max-w-3xl mb-10">
          <div className="text-xs uppercase tracking-wider text-emerald-800 font-semibold mb-1">
            {t.deliveryBadge}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            {t.deliveryTitle}
          </h2>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed">
            {t.deliverySubtitle}
          </p>
        </div>

        {/* Region Switcher Tabs */}
        <div className="flex items-center gap-2 mb-8 p-1 bg-stone-100 rounded-xl max-w-md">
          <button
            onClick={() => handleRegionChange('osh')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeRegionTab === 'osh'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.deliveryTabOsh}
          </button>
          <button
            onClick={() => handleRegionChange('batken')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeRegionTab === 'batken'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.deliveryTabBatken}
          </button>
        </div>

        {/* Region Details Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Details Panel */}
          <div className="lg:col-span-7 bg-stone-50 rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  {localizedRegionName}
                </h3>
                <span className="text-xs text-stone-500">
                  {t.deliveryEstimatedTimeLabel} {localizedEstimatedTime}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-stone-400 block">{t.deliveryScheduleBadge}</span>
                <span className="text-sm font-bold text-emerald-950">
                  {t.deliveryScheduleValue}
                </span>
              </div>
            </div>

            {/* Covered Towns / Districts */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                {t.deliveryTownsLabel}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {localizedDistricts.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-stone-200/80 text-xs text-stone-800"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispatch Schedule */}
            <div className="bg-white rounded-xl p-4 border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>{t.deliveryScheduleBoxTitle}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {localizedSchedule}
              </p>
            </div>

            {/* Important Dispatcher Disclaimer */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-stone-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{t.deliveryDispatcherNoticeTitle}</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                {t.deliveryDispatcherNoticeText}
              </p>
            </div>
          </div>

          {/* Right Warehouses / Self-pickup Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Warehouse Osh */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900">
                <Warehouse className="w-5 h-5 text-emerald-800" />
                <h4 className="text-sm font-bold text-stone-900">
                  {t.deliveryWarehouseOshTitle}
                </h4>
              </div>
              <p className="text-xs text-stone-600">
                {getCentralWarehouseAddress()}
              </p>
              <div className="text-[11px] text-stone-500 pt-1">
                {t.deliveryWarehouseOshDesc}
              </div>
            </div>

            {/* Warehouse Batken */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900">
                <Warehouse className="w-5 h-5 text-emerald-800" />
                <h4 className="text-sm font-bold text-stone-900">
                  {t.deliveryWarehouseBatkenTitle}
                </h4>
              </div>
              <p className="text-xs text-stone-600">
                {getBatkenWarehouseAddress()}
              </p>
              <div className="text-[11px] text-stone-500 pt-1">
                {t.deliveryWarehouseBatkenDesc}
              </div>
            </div>

            {/* Pickup Notice */}
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>{t.deliveryPickupFreeTitle}</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {t.deliveryPickupFreeDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
