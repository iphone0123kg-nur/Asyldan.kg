import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/store/HeroSection';
import { CategoryGrid } from './components/store/CategoryGrid';
import { WholesaleOffersSection } from './components/store/WholesaleOffersSection';
import { WholesaleBenefitsSection } from './components/store/WholesaleBenefitsSection';
import { DeliveryCoverageSection } from './components/store/DeliveryCoverageSection';
import { ProductCatalog } from './components/store/ProductCatalog';
import { ProductDetailsModal } from './components/store/ProductDetailsModal';
import { CartDrawer } from './components/store/CartDrawer';
import { CheckoutModal } from './components/store/CheckoutModal';
import { OrderSuccessModal } from './components/store/OrderSuccessModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BottomNavAndCartBar } from './components/common/BottomNavAndCartBar';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 antialiased selection:bg-emerald-200">
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-stone-900 antialiased selection:bg-emerald-200 pb-16 lg:pb-0">
      <Header />

      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <HeroSection />
            <CategoryGrid />
            <WholesaleOffersSection />
            <WholesaleBenefitsSection />
            <DeliveryCoverageSection />
          </>
        )}

        {activeTab === 'catalog' && <ProductCatalog />}

        {activeTab === 'wholesale' && (
          <div className="py-6">
            <WholesaleBenefitsSection />
            <WholesaleOffersSection />
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="py-6">
            <DeliveryCoverageSection />
          </div>
        )}
      </main>

      <Footer />

      {/* Global Modals & Drawers */}
      <ProductDetailsModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />

      {/* Persistent Bottom Mobile Nav & Floating Cart Summary Bar */}
      <BottomNavAndCartBar />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
