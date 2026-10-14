import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ClipboardList,
  Users,
  Truck,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Plus,
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  Save,
  MessageSquare,
  Building,
  Scale,
  Droplet,
  Globe,
  Edit3,
  FileText,
  Printer,
  CheckCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus, Product, ProductCategory } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    language,
    toggleLanguage,
    t,
    adminSubTab,
    setAdminSubTab,
    setActiveTab,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    orders,
    updateOrderStatus,
    updateOrder,
    customers,
    expenses,
    addExpense,
    settings,
    updateSettings,
    resetDemoData,
    generateWhatsAppOrderUrl,
    generateWhatsAppReceiptUrl,
    getProductBaseWholesalePrice,
    getProductName,
    getProductPackaging,
    getCategoryName,
    getCentralWarehouseAddress,
    getBatkenWarehouseAddress,
    getOperatingHours,
  } = useApp();

  const isRu = language === 'ru';

  // Search & Filters in Admin
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Dynamic Pricing Modal state (User request #5)
  const [pricingOrder, setPricingOrder] = useState<Order | null>(null);
  const [pricingItems, setPricingItems] = useState<{
    productId: string;
    name: string;
    packaging: string;
    weightOrVolume: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl?: string;
  }[]>([]);
  const [pricingDeliveryFee, setPricingDeliveryFee] = useState<number>(300);
  const [pricingDiscount, setPricingDiscount] = useState<number>(0);
  const [pricingNotes, setPricingNotes] = useState<string>('');
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [priceSavedToast, setPriceSavedToast] = useState(false);

  // Open Order Pricing editor
  const handleOpenOrderPricing = (ord: Order) => {
    setPricingOrder(ord);
    const items = ord.items.map((it) => {
      const unitPrice =
        it.unitPrice !== undefined && it.unitPrice > 0
          ? it.unitPrice
          : getProductBaseWholesalePrice(it.product);
      const totalPrice = it.totalPrice !== undefined && it.totalPrice > 0 ? it.totalPrice : unitPrice * it.quantity;
      return {
        productId: it.product.id,
        name: getProductName(it.product),
        packaging: getProductPackaging(it.product),
        weightOrVolume: it.product.weightOrVolume,
        quantity: it.quantity,
        unitPrice,
        totalPrice,
        imageUrl: it.product.imageUrl,
      };
    });
    setPricingItems(items);
    setPricingDeliveryFee(
      ord.deliveryFee !== undefined
        ? ord.deliveryFee
        : ord.deliveryMethod === 'delivery'
        ? (ord.customer.region === 'batken' ? 500 : 300)
        : 0
    );
    setPricingDiscount(ord.discountAmount || 0);
    setPricingNotes(ord.adminPriceNotes || '');
  };

  // Change individual line item price (hourly price edit)
  const handleItemUnitPriceChange = (index: number, newUnitPrice: number) => {
    setPricingItems((prev) => {
      const copy = [...prev];
      const cleanPrice = Math.max(0, isNaN(newUnitPrice) ? 0 : newUnitPrice);
      copy[index].unitPrice = cleanPrice;
      copy[index].totalPrice = cleanPrice * copy[index].quantity;
      return copy;
    });
  };

  // Change line item quantity
  const handleItemQtyChange = (index: number, newQty: number) => {
    setPricingItems((prev) => {
      const copy = [...prev];
      const cleanQty = Math.max(1, isNaN(newQty) ? 1 : newQty);
      copy[index].quantity = cleanQty;
      copy[index].totalPrice = copy[index].unitPrice * cleanQty;
      return copy;
    });
  };

  // Calculated values for current editing order
  const currentPricingSubtotal = pricingItems.reduce((sum, it) => sum + it.totalPrice, 0);
  const currentPricingGrandTotal = Math.max(
    0,
    currentPricingSubtotal + (pricingDeliveryFee || 0) - (pricingDiscount || 0)
  );

  // Save updated order pricing
  const handleSaveOrderPrices = () => {
    if (!pricingOrder) return;
    const updatedItems = pricingOrder.items.map((it, idx) => {
      const pi = pricingItems[idx];
      if (pi) {
        return {
          ...it,
          quantity: pi.quantity,
          unitPrice: pi.unitPrice,
          totalPrice: pi.totalPrice,
        };
      }
      return it;
    });

    const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
    updateOrder(pricingOrder.id, {
      items: updatedItems,
      subtotalAmount: currentPricingSubtotal,
      deliveryFee: pricingDeliveryFee,
      discountAmount: pricingDiscount,
      totalAmount: currentPricingGrandTotal,
      priceConfirmedAt: nowTime,
      adminPriceNotes: pricingNotes.trim() || undefined,
      status: pricingOrder.status === 'new' ? 'processing' : pricingOrder.status,
    });

    setPricingOrder((prev) =>
      prev
        ? {
            ...prev,
            items: updatedItems,
            subtotalAmount: currentPricingSubtotal,
            deliveryFee: pricingDeliveryFee,
            discountAmount: pricingDiscount,
            totalAmount: currentPricingGrandTotal,
            priceConfirmedAt: nowTime,
            adminPriceNotes: pricingNotes.trim() || undefined,
            status: prev.status === 'new' ? 'processing' : prev.status,
          }
        : null
    );

    setPriceSavedToast(true);
    setTimeout(() => setPriceSavedToast(false), 2500);
  };

  // Send WhatsApp official receipt directly to customer
  const handleSendReceiptToCustomer = () => {
    if (!pricingOrder) return;
    handleSaveOrderPrices();

    const orderForReceipt: Order = {
      ...pricingOrder,
      subtotalAmount: currentPricingSubtotal,
      deliveryFee: pricingDeliveryFee,
      discountAmount: pricingDiscount,
      totalAmount: currentPricingGrandTotal,
      adminPriceNotes: pricingNotes.trim() || undefined,
      items: pricingOrder.items.map((it, idx) => ({
        ...it,
        quantity: pricingItems[idx]?.quantity || it.quantity,
        unitPrice: pricingItems[idx]?.unitPrice || it.unitPrice || 0,
        totalPrice: pricingItems[idx]?.totalPrice || it.totalPrice || 0,
      })),
    };

    const url = generateWhatsAppReceiptUrl(orderForReceipt);
    window.open(url, '_blank');
  };

  // Modal for new/edit product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    name_ky: '',
    name_ru: '',
    brand: '',
    category: 'rice',
    weightOrVolume: '25 кг',
    numericWeightOrVolume: 25,
    measureUnit: 'кг',
    packagingUnit: 'Кап (25 кг)',
    inStock: true,
    stockQuantity: 100,
    warehouseLocation: 'Ош (Центральный)',
    description: '',
    imageUrl: '/src/assets/images/category_rice_grains_1791884423336.jpg',
  });

  // Modal for new expense
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'fuel' as const,
    amount: 5000,
    date: new Date().toISOString().substring(0, 10),
    notes: '',
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Overview metrics
  const totalWeightKgAllOrders = orders.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0);
  const totalVolumeLitersAllOrders = orders.reduce((sum, o) => sum + (o.totalVolumeLiters || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'new' || o.status === 'processing').length;
  const lowStockProducts = products.filter((p) => p.stockQuantity < 100);

  // Open product modal
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      name_ky: '',
      name_ru: '',
      brand: '',
      category: 'rice',
      weightOrVolume: '25 кг',
      numericWeightOrVolume: 25,
      measureUnit: 'кг',
      packagingUnit: isRu ? 'Мешок (25 кг)' : 'Кап (25 кг)',
      inStock: true,
      stockQuantity: 100,
      warehouseLocation: 'Ош (Центральный)',
      description: '',
      imageUrl: '/src/assets/images/category_rice_grains_1791884423336.jpg',
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.brand) return;

    if (editingProductId) {
      updateProduct(editingProductId, productForm);
    } else {
      addProduct(productForm as any);
    }
    setIsProductModalOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const navItems = [
    { id: 'overview', label: t.adminTabOverview, icon: LayoutDashboard },
    { id: 'products', label: t.adminTabProducts, count: products.length, icon: Package },
    { id: 'categories', label: t.adminTabCategories, count: categories.length, icon: FolderTree },
    { id: 'inventory', label: t.adminTabInventory, alert: lowStockProducts.length > 0, icon: Boxes },
    { id: 'orders', label: t.adminTabOrders, count: orders.length, alert: pendingOrders > 0, icon: ClipboardList },
    { id: 'customers', label: t.adminTabCustomers, count: customers.length, icon: Users },
    { id: 'delivery', label: t.adminTabDelivery, icon: Truck },
    { id: 'expenses', label: t.adminTabExpenses, count: expenses.length, icon: Receipt },
    { id: 'reports', label: t.adminTabReports, icon: BarChart3 },
    { id: 'settings', label: t.adminTabSettings, icon: SettingsIcon },
  ];

  const getOrderStatusLabel = (status: OrderStatus) => {
    if (isRu) {
      switch (status) {
        case 'new': return 'Новый';
        case 'processing': return 'В сборке';
        case 'in_transit': return 'В пути';
        case 'delivered': return 'Доставлен';
        case 'cancelled': return 'Отменен';
      }
    }
    switch (status) {
      case 'new': return 'Жаңы';
      case 'processing': return 'Сборкада';
      case 'in_transit': return 'Жолдо';
      case 'delivered': return 'Жеткирилди';
      case 'cancelled': return 'Жокко чыгарылды';
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="bg-emerald-950 text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b border-emerald-900 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm">
            ERP
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">
              {t.adminHeaderTitle} — {settings.companyName}
            </h1>
            <span className="text-[11px] text-emerald-300">
              {t.adminHeaderSubtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Single-Click Language Switcher in Admin Header */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-700 bg-emerald-900/90 hover:bg-emerald-800 text-stone-200 transition-colors cursor-pointer"
            title={language === 'ky' ? 'Орус тилине которуу' : 'Переключить на кыргызский'}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className={language === 'ky' ? 'text-amber-300 font-extrabold underline' : 'text-stone-300'}>
              КЫРГ
            </span>
            <span className="text-stone-500">/</span>
            <span className={language === 'ru' ? 'text-amber-300 font-extrabold underline' : 'text-stone-300'}>
              РУС
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.adminReturnBtn}</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-stone-200 shrink-0 p-3 sm:p-4 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 py-2">
            {t.adminSidebarNav}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminSubTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-950 text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded font-semibold tabular-nums ${
                      isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.alert && (
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                )}
              </button>
            );
          })}

          <div className="pt-4 border-t border-stone-200 mt-4 px-2">
            <button
              onClick={() => {
                if (confirm(isRu ? 'Сбросить все демонстрационные данные?' : 'Демонстрациялык маалыматтарды баштапкы абалга келтирүүнү каалайсызбы?')) {
                  resetDemoData();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] text-stone-500 hover:text-stone-800 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isRu ? 'Сброс демо-данных' : 'Баштапкы абалга кайтаруу'}</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {adminSubTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {isRu ? 'Общие объемы распределительного центра' : 'Бөлүштүрүүчү борбордун жалпы көлөмдөрү'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isRu
                    ? 'Вес продуктов и объемы жидкостей по Ошской и Баткенской областям'
                    : 'Ош жана Баткен облустары боюнча товарлардын салмагы жана суюктук көлөмдөрү'}
                </p>
              </div>

              {/* KPI Cards based on Weight & Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                    <Scale className="w-4 h-4 text-emerald-800" />
                    <span>{t.adminMetricTotalWeight}</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-950 tabular-nums">
                    ~{totalWeightKgAllOrders.toLocaleString()} кг
                  </div>
                  <span className="text-[11px] text-emerald-700 block font-medium">
                    {isRu ? 'Мука, рис, сахар, макароны, соль' : 'Ун, күрүч, кант, макарон, туз'}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                    <Droplet className="w-4 h-4 text-emerald-800" />
                    <span>{t.adminMetricTotalVolume}</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-950 tabular-nums">
                    ~{totalVolumeLitersAllOrders.toLocaleString()} {isRu ? 'л' : 'литр'}
                  </div>
                  <span className="text-[11px] text-stone-500 block">
                    {isRu ? 'Растительные масла и соусы' : 'Өсүмдүк майлары жана соустар'}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-xs text-stone-500 font-medium">{t.adminMetricPendingOrders}</span>
                  <div className="text-2xl font-bold text-amber-700 tabular-nums">
                    {pendingOrders}
                  </div>
                  <span className="text-[11px] text-stone-500 block">
                    {isRu ? 'В процессе сборки и доставки' : 'Чогултуу жана жеткирүү стадиясында'}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-xs text-stone-500 font-medium">{isRu ? 'Позиций в каталоге' : 'Каталогдогу позициялар'}</span>
                  <div className="text-2xl font-bold text-stone-800 tabular-nums">
                    {products.length}
                  </div>
                  <span className="text-[11px] text-stone-500 block">
                    {isRu ? '10 основных категорий' : '10 негизги категория'}
                  </span>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900">
                    {isRu ? 'Последние заказы и вес партий' : 'Акыркы заказдар жана жүктөрдүн салмагы'}
                  </h3>
                  <button
                    onClick={() => setAdminSubTab('orders')}
                    className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                  >
                    {isRu ? 'Все заказы' : 'Бардык заказдар'} ({orders.length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-2.5">{isRu ? 'Заказ #' : 'Заказ #'}</th>
                        <th className="p-2.5">{isRu ? 'Получатель' : 'Кардар'}</th>
                        <th className="p-2.5">{isRu ? 'Регион' : 'Аймак'}</th>
                        <th className="p-2.5">{isRu ? 'Общий вес / объем' : 'Жалпы салмак / көлөм'}</th>
                        <th className="p-2.5">{isRu ? 'Статус' : 'Статус'}</th>
                        <th className="p-2.5 text-right">WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-50">
                          <td className="p-2.5 font-bold font-mono text-stone-900">
                            {ord.orderNumber}
                          </td>
                          <td className="p-2.5">
                            <span className="font-semibold block text-stone-800">
                              {ord.customer.name}
                            </span>
                            {ord.customer.businessName && (
                              <span className="text-[10px] text-stone-500">
                                {ord.customer.businessName}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-stone-600">
                            {ord.customer.region === 'osh' ? (isRu ? 'Ош' : 'Ош') : (isRu ? 'Баткен' : 'Баткен')}, {ord.customer.cityOrVillage}
                          </td>
                          <td className="p-2.5 font-bold tabular-nums text-stone-900">
                            {ord.totalWeightKg > 0 && `${ord.totalWeightKg} кг `}
                            {ord.totalVolumeLiters > 0 && `${ord.totalVolumeLiters} л`}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                ord.status === 'new'
                                  ? 'bg-amber-100 text-amber-900'
                                  : ord.status === 'processing'
                                  ? 'bg-blue-100 text-blue-900'
                                  : ord.status === 'in_transit'
                                  ? 'bg-purple-100 text-purple-900'
                                  : ord.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              {getOrderStatusLabel(ord.status)}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <a
                              href={generateWhatsAppOrderUrl(ord)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-800 font-semibold hover:underline"
                            >
                              WhatsApp
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS (NO PRICES, ONLY GRAMS/LITERS/PACKAGING) */}
          {adminSubTab === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {isRu ? 'Товары и весовые объемы' : 'Товарлар жана салмак көлөмдөрү'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {isRu
                      ? 'Параметры граммов, литров, килограммов и тары для каждого товара'
                      : 'Ар бир товардын грамм, литр, килограмм жана таңгак параметрлери'}
                  </p>
                </div>
                <button
                  onClick={handleOpenNewProduct}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.adminAddProductBtn}</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center gap-2">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder={t.adminSearchPlaceholder}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="flex-1 text-xs bg-transparent focus:outline-none"
                />
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                      <tr>
                        <th className="p-3">{t.adminTableColProduct}</th>
                        <th className="p-3">{t.adminTableColCategory}</th>
                        <th className="p-3">{t.adminTableColWeight}</th>
                        <th className="p-3">{t.adminTableColPackaging}</th>
                        <th className="p-3">{t.adminTableColStock}</th>
                        <th className="p-3">{t.adminTableColWarehouse}</th>
                        <th className="p-3 text-right">{t.adminTableColActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products
                        .filter(
                          (p) =>
                            getProductName(p).toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.weightOrVolume.toLowerCase().includes(productSearch.toLowerCase())
                        )
                        .map((prod) => (
                          <tr key={prod.id} className="hover:bg-stone-50">
                            <td className="p-3 font-semibold text-stone-900">
                              <div className="truncate max-w-[200px]">{getProductName(prod)}</div>
                              <span className="text-[10px] text-stone-400 block">{prod.brand}</span>
                            </td>
                            <td className="p-3 text-stone-600 capitalize">{prod.category}</td>
                            <td className="p-3 font-bold tabular-nums text-emerald-950">
                              {prod.weightOrVolume}
                            </td>
                            <td className="p-3 text-stone-600">{getProductPackaging(prod)}</td>
                            <td className="p-3">
                              <span
                                className={`font-bold tabular-nums ${
                                  prod.stockQuantity < 100 ? 'text-amber-700' : 'text-stone-800'
                                }`}
                              >
                                {prod.stockQuantity} {isRu ? 'упак.' : 'таңгак'}
                              </span>
                            </td>
                            <td className="p-3 text-stone-500 text-[11px]">
                              {isRu ? (prod.warehouseLocation_ru || prod.warehouseLocation) : (prod.warehouseLocation_ky || prod.warehouseLocation)}
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => handleEditProduct(prod)}
                                className="text-emerald-800 font-semibold hover:underline cursor-pointer"
                              >
                                {t.adminEditBtn}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(isRu ? `Удалить товар "${getProductName(prod)}"?` : `"${getProductName(prod)}" товарын өчүрүүгө ишенесизби?`)) {
                                    deleteProduct(prod.id);
                                  }
                                }}
                                className="text-rose-600 hover:underline cursor-pointer"
                              >
                                {t.adminDeleteBtn}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {adminSubTab === 'categories' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {isRu ? 'Категории продуктов питания (10)' : 'Тамак-аш категориялары (10)'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isRu ? 'Основные товарные группы бакалеи' : 'Азык-түлүктөрдүн негизги топтору'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white p-4 rounded-xl border border-stone-200 flex items-start gap-4"
                  >
                    <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                      <img
                        src={cat.image}
                        alt={getCategoryName(cat)}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-stone-900 truncate">{getCategoryName(cat)}</h3>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {products.filter((p) => p.category === cat.id).length} {t.itemsCountSuffix}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">
                        {isRu ? cat.description_ru || cat.description : cat.description_ky || cat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY */}
          {adminSubTab === 'inventory' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {isRu ? 'Складской учет и остатки' : 'Кампалык эсеп жана калдыктар'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isRu
                    ? 'Товары на Центральном складе (Ош) и в филиале (Баткен)'
                    : 'Борбордук кампада (Ош) жана филиалда (Баткен) сакталган таңгактар'}
                </p>
              </div>

              {/* Warehouse summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-emerald-800" />
                      <h3 className="text-base font-bold text-stone-900">
                        {isRu ? 'Центральный склад (Ош)' : 'Борбордук кампа (Ош)'}
                      </h3>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                      {isRu ? 'Активен' : 'Иштеп жатат'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {getCentralWarehouseAddress()}
                  </p>
                  <div className="pt-2 border-t border-stone-100 text-xs space-y-1 text-stone-700">
                    <div className="flex justify-between">
                      <span>{isRu ? 'Площадь:' : 'Аянты:'}</span>
                      <strong className="font-semibold">650 м²</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{isRu ? 'Заполняемость:' : 'Жүктөлүшү:'}</span>
                      <strong className="font-semibold text-emerald-800">78%</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-emerald-800" />
                      <h3 className="text-base font-bold text-stone-900">
                        {isRu ? 'Филиал склада (Баткен)' : 'Филиал кампасы (Баткен)'}
                      </h3>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                      {isRu ? 'Активен' : 'Иштеп жатат'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {getBatkenWarehouseAddress()}
                  </p>
                  <div className="pt-2 border-t border-stone-100 text-xs space-y-1 text-stone-700">
                    <div className="flex justify-between">
                      <span>{isRu ? 'Площадь:' : 'Аянты:'}</span>
                      <strong className="font-semibold">280 м²</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{isRu ? 'Заполняемость:' : 'Жүктөлүшү:'}</span>
                      <strong className="font-semibold text-emerald-800">62%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="p-4 border-b border-stone-200">
                  <h4 className="text-sm font-bold text-stone-900">
                    {isRu ? 'Ведомость веса и складских остатков' : 'Товарлардын салмак жана калдык ведомосту'}
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">{isRu ? 'Штрихкод' : 'Штрихкод'}</th>
                        <th className="p-3">{isRu ? 'Товар' : 'Товардын аты'}</th>
                        <th className="p-3">{isRu ? 'Вес / Объем' : 'Салмагы / Көлөмү'}</th>
                        <th className="p-3">{isRu ? 'Тара' : 'Таңгагы'}</th>
                        <th className="p-3">{isRu ? 'Склад' : 'Кампа'}</th>
                        <th className="p-3">{isRu ? 'Остаток' : 'Калдык'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50">
                          <td className="p-3 font-mono text-stone-500">
                            {p.barcode || '470001829000'}
                          </td>
                          <td className="p-3 font-semibold text-stone-900">{getProductName(p)}</td>
                          <td className="p-3 font-bold text-emerald-950">{p.weightOrVolume}</td>
                          <td className="p-3 text-stone-600">{getProductPackaging(p)}</td>
                          <td className="p-3 text-stone-600">
                            {isRu ? (p.warehouseLocation_ru || p.warehouseLocation) : (p.warehouseLocation_ky || p.warehouseLocation)}
                          </td>
                          <td className="p-3 font-bold tabular-nums text-stone-900">
                            {p.stockQuantity} {isRu ? 'упак.' : 'таңгак'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {adminSubTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {isRu ? 'Журнал заказов' : 'Заказдардын журналы'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {isRu ? 'Управление статусами поставок' : 'Статустарды алмаштыруу жана айдоочуларга бөлүштүрүү'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-lg text-xs">
                  {['all', 'new', 'processing', 'in_transit', 'delivered'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-emerald-950 text-white font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {st === 'all'
                        ? (isRu ? 'Все' : 'Бардыгы')
                        : getOrderStatusLabel(st as OrderStatus)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                      <tr>
                        <th className="p-3">{isRu ? 'Номер' : 'Номер'}</th>
                        <th className="p-3">{isRu ? 'Дата' : 'Убактысы'}</th>
                        <th className="p-3">{isRu ? 'Клиент' : 'Кардар'}</th>
                        <th className="p-3">{isRu ? 'Адрес' : 'Дареги'}</th>
                        <th className="p-3">{isRu ? 'Вес / Объем' : 'Көлөмү/Салмагы'}</th>
                        <th className="p-3">{isRu ? 'Сумма заказа' : 'Заказдын суммасы'}</th>
                        <th className="p-3">{isRu ? 'Статус' : 'Статус'}</th>
                        <th className="p-3 text-right">{isRu ? 'Управление ценами и чек' : 'Баалар & Чек'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders
                        .filter(
                          (o) => orderStatusFilter === 'all' || o.status === orderStatusFilter
                        )
                        .map((ord) => (
                          <tr key={ord.id} className="hover:bg-stone-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-stone-900">
                              {ord.orderNumber}
                            </td>
                            <td className="p-3 text-stone-500 whitespace-nowrap">
                              {ord.createdAt}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-stone-900 block">
                                {ord.customer.name}
                              </span>
                              {ord.customer.businessName && (
                                <span className="text-[10px] text-emerald-800 font-semibold block">
                                  {ord.customer.businessName}
                                </span>
                              )}
                              <span className="text-[10px] text-stone-500">
                                {ord.customer.phone}
                              </span>
                            </td>
                            <td className="p-3 text-stone-700">
                              <span className="font-medium block">
                                {ord.customer.region === 'osh' ? (isRu ? 'Ош' : 'Ош') : (isRu ? 'Баткен' : 'Баткен')}, {ord.customer.cityOrVillage}
                              </span>
                              <span className="text-[10px] text-stone-500 truncate max-w-[150px] block">
                                {ord.customer.detailedAddress}
                              </span>
                            </td>
                            <td className="p-3 font-bold tabular-nums text-stone-900 whitespace-nowrap">
                              {ord.totalWeightKg > 0 && `${ord.totalWeightKg} кг `}
                              {ord.totalVolumeLiters > 0 && `${ord.totalVolumeLiters} л`}
                              <span className="text-[10px] text-stone-500 block font-normal">
                                {ord.totalItemsCount} {isRu ? 'упак.' : 'таңгак'} ({ord.items.length} поз.)
                              </span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="font-extrabold text-xs text-emerald-950 tabular-nums">
                                {(ord.totalAmount || 0).toLocaleString()} сом
                              </div>
                              <div className="text-[10px] text-stone-500">
                                {isRu ? 'Товары:' : 'Товарлар:'} {(ord.subtotalAmount || 0).toLocaleString()} с.
                                {ord.deliveryFee > 0 && ` + ${isRu ? 'дост.' : 'жетк.'} ${ord.deliveryFee} с.`}
                              </div>
                              {ord.priceConfirmedAt && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 border border-emerald-200/50">
                                  <CheckCheck className="w-2.5 h-2.5" />
                                  <span>{isRu ? 'Цены зафиксированы' : 'Баалар бекитилген'}</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <select
                                value={ord.status}
                                onChange={(e) =>
                                  updateOrderStatus(ord.id, e.target.value as OrderStatus)
                                }
                                className="text-[11px] font-bold rounded px-2 py-1 border border-stone-200 bg-white cursor-pointer"
                              >
                                <option value="new">{isRu ? 'Новый' : 'Жаңы'}</option>
                                <option value="processing">{isRu ? 'В сборке' : 'Сборкада'}</option>
                                <option value="in_transit">{isRu ? 'В пути' : 'Жолдо'}</option>
                                <option value="delivered">{isRu ? 'Доставлен' : 'Жеткирилди'}</option>
                                <option value="cancelled">{isRu ? 'Отменен' : 'Жокко чыгарылды'}</option>
                              </select>
                            </td>
                            <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                              {/* Open Pricing & Receipt Editor Button */}
                              <button
                                onClick={() => handleOpenOrderPricing(ord)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                                title={isRu ? 'Редактировать часовые цены и сформировать чек' : 'Сааттык бааларды өзгөртүү жана чек чыгаруу'}
                              >
                                <Edit3 className="w-3 h-3 text-emerald-700" />
                                <span>{isRu ? 'Цены и Чек' : 'Баалар & Чек'}</span>
                              </button>

                              {/* WhatsApp Direct Send Receipt Button */}
                              <a
                                href={generateWhatsAppReceiptUrl(ord)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-white rounded-md font-bold text-[11px] transition-colors"
                                title={isRu ? 'Отправить чек клиенту в WhatsApp' : 'Кардарга WhatsApp аркылуу чекти жиберүү'}
                              >
                                <MessageSquare className="w-3 h-3 text-amber-400" />
                                <span>WhatsApp</span>
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMERS */}
          {adminSubTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {isRu ? 'База клиентов и контрагентов' : 'Кардарлардын тизмеси'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isRu ? 'Магазины, кафе, чайханы и оптовые покупатели' : 'Дүкөндөр, кафелер, ашканалар жана жеке адамдар'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-5 rounded-xl border border-stone-200 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">{c.name}</h3>
                        {c.companyName && (
                          <span className="text-[11px] text-emerald-800 font-medium block">
                            {c.companyName}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                        {c.type === 'grocery_store'
                          ? (isRu ? 'Магазин' : 'Дүкөн')
                          : c.type === 'cafe_restaurant'
                          ? (isRu ? 'Кафе / HoReCa' : 'Кафе')
                          : (isRu ? 'Оптовый клиент' : 'Дүң кардар')}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1 pt-2 border-t border-stone-100">
                      <div className="flex justify-between">
                        <span>{isRu ? 'Телефон:' : 'Телефон:'}</span>
                        <span className="font-semibold">{c.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isRu ? 'Регион:' : 'Аймак:'}</span>
                        <span className="font-semibold">{c.cityOrVillage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isRu ? 'Количество заказов:' : 'Заказдардын саны:'}</span>
                        <span className="font-bold tabular-nums text-stone-900">
                          {c.ordersCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: DELIVERY */}
          {adminSubTab === 'delivery' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {isRu ? 'Логистика и рейсы автопарка' : 'Логистика жана маршруттар'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isRu
                    ? 'График грузовых рейсов по Ошской и Баткенской областям'
                    : 'Ош жана Баткен облустары боюнча жүк ташуучу унаалардын графиги'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-emerald-800" />
                      <h3 className="text-sm font-bold text-stone-900">
                        {isRu ? 'Маршрут: Ош — Кара-Суу — Ноокат — Узген' : 'Каттам: Ош — Кара-Суу — Ноокат — Өзгөн'}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                      {isRu ? 'Ежедневно' : 'Күн сайын'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {isRu
                      ? 'Ежедневное снабжение магазинов и кафе мукой, рисом, маслом и сахаром.'
                      : 'Дүкөндөрдү күн сайын керектүү ун, күрүч, май жана кумшекер менен камсыздоо.'}
                  </p>

                  <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1.5 text-stone-700">
                    <div className="flex justify-between">
                      <span>{isRu ? 'Транспорт:' : 'Унаа:'}</span>
                      <strong className="font-semibold">Газель Next (02KG 451 ADC)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{isRu ? 'Водитель-экспедитор:' : 'Айдоочу-экспедитор:'}</span>
                      <strong className="font-semibold">Азиз Касымов (+996 771 89-01-23)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{isRu ? 'Грузоподъемность:' : 'Жүк көтөрүмдүүлүгү:'}</span>
                      <span>{isRu ? '3.5 тонны (70 мешков)' : '3.5 тонна (70 кап ун/кумшекер)'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-emerald-800" />
                      <h3 className="text-sm font-bold text-stone-900">
                        {isRu ? 'Маршрут: Ош — Кызыл-Кия — Кадамжай — Баткен' : 'Каттам: Ош — Кызыл-Кыя — Кадамжай — Баткен'}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {isRu ? 'Среда, Суббота (06:00)' : 'Шаршемби, Ишемби (06:00)'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {isRu
                      ? 'Доставка оптовых партий продуктов в филиал г. Баткен, Кадамжай и Кызыл-Кию.'
                      : 'Баткен филиалына жана Кадамжай, Кызыл-Кыя соода түйүндөрүнө чоң көлөмдөгү жүктөрдү жеткирүү.'}
                  </p>

                  <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1.5 text-stone-700">
                    <div className="flex justify-between">
                      <span>{isRu ? 'Транспорт:' : 'Унаа:'}</span>
                      <strong className="font-semibold">Isuzu Forward (03KG 782 AAB)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{isRu ? 'Водитель-экспедитор:' : 'Айдоочу-экспедитор:'}</span>
                      <strong className="font-semibold">Нурбек Турсунов (+996 552 44-55-66)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{isRu ? 'Грузоподъемность:' : 'Жүк көтөрүмдүүлүгү:'}</span>
                      <span>{isRu ? '7.0 тонн (140 мешков)' : '7.0 тонна (140 кап)'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: EXPENSES */}
          {adminSubTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {isRu ? 'Учет расходов склада и транспорта' : 'Чыгымдарды эсепке алуу'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {isRu ? 'ГСМ, аренда склада, логистика' : 'Күйүүчү май, кампа ижарасы, логистика'}
                  </p>
                </div>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRu ? 'Добавить статью' : 'Чыгым кошуу'}</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">{isRu ? 'Дата' : 'Датасы'}</th>
                        <th className="p-3">{isRu ? 'Статья' : 'Статья'}</th>
                        <th className="p-3">{isRu ? 'Категория' : 'Категория'}</th>
                        <th className="p-3">{isRu ? 'Примечание' : 'Эскертүү'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {expenses.map((e) => (
                        <tr key={e.id} className="hover:bg-stone-50">
                          <td className="p-3 text-stone-500">{e.date}</td>
                          <td className="p-3 font-semibold text-stone-900">{e.title}</td>
                          <td className="p-3 text-stone-600">
                            <span className="capitalize">{e.category}</span>
                          </td>
                          <td className="p-3 text-stone-500 text-[11px]">{e.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REPORTS */}
          {adminSubTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {isRu ? 'Аналитика объемов и распределения' : 'Көлөм аналитикасы'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isRu ? 'Тоннаж недельных и месячных отгрузок' : 'Апталык жана айлык жүктөрдүн тоннажы'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-3">
                  <h3 className="text-sm font-bold text-stone-900">
                    {isRu ? 'Топ востребованных объемов' : 'Эң көп суроо-талапка ээ көлөмдөр'}
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span>{isRu ? '1. Мука мешки 50 кг' : '1. Ун 50 кг каптар'}</span>
                      <strong className="tabular-nums">68 {isRu ? 'мешков/нед.' : 'кап/апта'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span>{isRu ? '2. Рис мешки 25 кг' : '2. Күрүч 25 кг каптар'}</span>
                      <strong className="tabular-nums">34 {isRu ? 'мешка/нед.' : 'кап/апта'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span>{isRu ? '3. Масло бутылки 5 л' : '3. Май 5 л бөтөлкөлөр'}</span>
                      <strong className="tabular-nums">42 {isRu ? 'бутылки/нед.' : 'даана/апта'}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>{isRu ? '4. Сахар мешки 50 кг' : '4. Сахар 50 кг каптар'}</span>
                      <strong className="tabular-nums">29 {isRu ? 'мешков/нед.' : 'кап/апта'}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-3">
                  <h3 className="text-sm font-bold text-stone-900">
                    {isRu ? 'По типу тары' : 'Таңгак түрлөрү боюнча'}
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-stone-600 mb-1">
                        <span>{isRu ? 'Крупные мешки (25 кг, 50 кг):' : 'Чоң каптар (25 кг, 50 кг):'}</span>
                        <strong className="font-bold">75%</strong>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div className="bg-emerald-900 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-stone-600 mb-1">
                        <span>{isRu ? 'Коробки и бутылки (1л, 5л):' : 'Кутулар жана бөтөлкөлөр (1л, 5л):'}</span>
                        <strong className="font-bold">25%</strong>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-3">
                  <h3 className="text-sm font-bold text-stone-900">
                    {isRu ? 'География поставок' : 'Жүктүн географиясы'}
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span>{isRu ? 'г. Ош и Кара-Суу' : 'Ош ш. жана Кара-Суу'}</span>
                      <strong className="tabular-nums">54%</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span>{isRu ? 'Ноокат и Узген' : 'Ноокат жана Өзгөн'}</span>
                      <strong className="tabular-nums">26%</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>{isRu ? 'Баткенская область' : 'Баткен облусу'}</span>
                      <strong className="tabular-nums">20%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {adminSubTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {isRu ? 'Настройки предприятия' : 'Ишкананын жөндөөлөрү'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isRu
                    ? 'Рабочий WhatsApp, адреса складов и контакты'
                    : 'WhatsApp номерин, даректерди жана байланыштарды өзгөртүү'}
                </p>
              </div>

              {settingsSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{isRu ? 'Настройки успешно сохранены!' : 'Жөндөөлөр ийгиликтүү сакталды!'}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-stone-200 space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isRu ? 'Название компании' : 'Ишкананын аталышы'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.companyName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, companyName: e.target.value })
                    }
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      {isRu ? 'Номер WhatsApp (только цифры)' : 'WhatsApp номери (цифралар гана)'}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappPhone}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, whatsappPhone: e.target.value })
                      }
                      placeholder="996555123456"
                      className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      {isRu ? 'Отображаемый телефон' : 'Көрсөтүлүүчү телефон'}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.displayPhone}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, displayPhone: e.target.value })
                      }
                      className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isRu ? 'Адрес центрального склада в Оше' : 'Оштогу борбордук кампанын дареги'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.centralWarehouseAddress}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        centralWarehouseAddress: e.target.value,
                      })
                    }
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isRu ? 'Адрес филиала склада в Баткене' : 'Баткендеги филиал кампасынын дареги'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.batkenWarehouseAddress}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        batkenWarehouseAddress: e.target.value,
                      })
                    }
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isRu ? 'Режим работы' : 'Иш тартиби'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.operatingHours}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, operatingHours: e.target.value })
                    }
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isRu ? 'Сохранить настройки' : 'Жөндөөлөрдү сактоо'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Product Modal for Add/Edit (WEIGHT, LITERS, GRAMS FOCUS - NO PRICES) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900">
              {editingProductId
                ? (isRu ? 'Редактировать товар' : 'Товардын маалыматын оңдоо')
                : (isRu ? 'Добавить новый товар' : 'Жаңы товар кошуу')}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  {isRu ? 'Название товара' : 'Товардын аталышы'}
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value, name_ky: e.target.value, name_ru: e.target.value })}
                  placeholder={isRu ? 'Рис Узгенский Девзира' : 'Күрүч Өзгөн Девзира'}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {isRu ? 'Бренд / Производитель' : 'Бренд / Өндүрүүчү'}
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {isRu ? 'Категория' : 'Категория'}
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value as ProductCategory })
                    }
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {getCategoryName(c)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {isRu ? 'Вес / Объем (текст)' : 'Салмагы / Көлөмү (текст)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="25 кг, 5 л, 400 г..."
                    value={productForm.weightOrVolume}
                    onChange={(e) =>
                      setProductForm({ ...productForm, weightOrVolume: e.target.value })
                    }
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {isRu ? 'Единица измерения' : 'Бирдиги'}
                  </label>
                  <select
                    value={productForm.measureUnit}
                    onChange={(e) =>
                      setProductForm({ ...productForm, measureUnit: e.target.value as any })
                    }
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 cursor-pointer"
                  >
                    <option value="кг">{isRu ? 'Килограмм (кг)' : 'Килограмм (кг)'}</option>
                    <option value="л">{isRu ? 'Литр (л)' : 'Литр (л)'}</option>
                    <option value="г">{isRu ? 'Грамм (г)' : 'Грамм (г)'}</option>
                    <option value="мл">{isRu ? 'Миллилитр (мл)' : 'Миллилитр (мл)'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {isRu ? 'Числовое значение' : 'Сандык мааниси'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.numericWeightOrVolume}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        numericWeightOrVolume: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {isRu ? 'Тара' : 'Таңгагы'}
                  </label>
                  <input
                    type="text"
                    value={productForm.packagingUnit}
                    onChange={(e) =>
                      setProductForm({ ...productForm, packagingUnit: e.target.value, packagingUnit_ky: e.target.value, packagingUnit_ru: e.target.value })
                    }
                    placeholder={isRu ? 'Мешок (25 кг), Бутылка (5 л)...' : 'Кап (25 кг), Бөтөлкө (5 л)...'}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {isRu ? 'Остаток на складе' : 'Кампадагы калдык'}
                  </label>
                  <input
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        stockQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {isRu ? 'Склад' : 'Кампа'}
                  </label>
                  <select
                    value={productForm.warehouseLocation}
                    onChange={(e) =>
                      setProductForm({ ...productForm, warehouseLocation: e.target.value as any })
                    }
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 cursor-pointer"
                  >
                    <option value="Ош (Центральный)">{isRu ? 'Ош (Центральный)' : 'Ош (Борбордук)'}</option>
                    <option value="Баткен (Филиал)">{isRu ? 'Баткен (Филиал)' : 'Баткен (Филиал)'}</option>
                    <option value="Оба склада">{isRu ? 'Оба склада' : 'Эки кампада тең'}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer"
                >
                  {t.adminCancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white font-semibold rounded-lg cursor-pointer"
                >
                  {t.adminSaveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-stone-200 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900">
              {isRu ? 'Запись расхода' : 'Чыгым каттоо'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addExpense(expenseForm);
                setIsExpenseModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  {isRu ? 'Наименование расхода' : 'Чыгымдын аталышы'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRu ? 'ГСМ, аренда склада...' : 'Күйүүчү май, ижара...'}
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  {isRu ? 'Категория' : 'Категория'}
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 cursor-pointer"
                >
                  <option value="fuel">{isRu ? 'ГСМ (Дизель/Бензин)' : 'Күйүүчү май (ГСМ)'}</option>
                  <option value="warehouse_rent">{isRu ? 'Аренда склада' : 'Кампа ижарасы'}</option>
                  <option value="salaries">{isRu ? 'Зарплата грузчиков' : 'Жүктөөчүлөрдүн айлыгы'}</option>
                  <option value="logistics">{isRu ? 'Транспортные расходы' : 'Транспорттук чыгымдар'}</option>
                  <option value="packaging">{isRu ? 'Упаковочные материалы' : 'Таңгактоочу материалдар'}</option>
                  <option value="other">{isRu ? 'Прочие расходы' : 'Башка чыгымдар'}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3 py-2 bg-stone-100 text-stone-700 rounded-lg cursor-pointer"
                >
                  {t.adminCancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-950 text-white font-semibold rounded-lg cursor-pointer"
                >
                  {t.adminSaveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC ORDER PRICING & WHATSAPP RECEIPT MODAL (User Request #5) */}
      {pricingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-950 text-white text-[11px] font-mono font-bold rounded">
                    {pricingOrder.orderNumber}
                  </span>
                  <h3 className="text-base font-bold text-stone-900">
                    {t.orderPricingModalTitle}
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t.orderPricingModalSub}
                </p>
              </div>
              <button
                onClick={() => setPricingOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Hourly market fluctuation callout */}
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 leading-relaxed">
                  <strong className="block font-bold mb-0.5">
                    {isRu
                      ? 'Внимание: оптовые цены меняются каждый час!'
                      : 'Көңүл буруңуз: Дүң баалар саат сайын өзгөрүп турат!'}
                  </strong>
                  <span>
                    {isRu
                      ? 'Клиент оформил заявку без указания цен. Вы можете скорректировать цену каждой позиции в сомах по текущему курсу склада, изменить количество или стоимость доставки, а затем отправить клиенту официальный чек в WhatsApp для согласования.'
                      : 'Кардар заказды баасын көрбөй туруп берген. Бул жерде ар бир товардын баасын ушул сааттагы кампанын актуалдуу баасы боюнча сом менен өзгөртүп, суммасын эсептеп, кардарга WhatsApp аркылуу расмий чекти жөнөтүңүз.'}
                  </span>
                </div>
              </div>

              {/* Customer summary card */}
              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
                <div>
                  <span className="text-stone-400 block text-[11px]">{isRu ? 'Получатель:' : 'Кардар:'}</span>
                  <strong className="text-stone-900 font-semibold">{pricingOrder.customer.name}</strong>
                  {pricingOrder.customer.businessName && (
                    <span className="text-emerald-800 block font-medium">{pricingOrder.customer.businessName}</span>
                  )}
                  <span className="text-stone-600 block">{pricingOrder.customer.phone}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">{isRu ? 'Адрес доставки:' : 'Жеткирүү дареги:'}</span>
                  <strong className="text-stone-900">
                    {pricingOrder.customer.region === 'osh' ? (isRu ? 'Ошская область' : 'Ош облусу') : (isRu ? 'Баткенская область' : 'Баткен облусу')},{' '}
                    {pricingOrder.customer.cityOrVillage}
                  </strong>
                  <span className="text-stone-600 block truncate">{pricingOrder.customer.detailedAddress}</span>
                  <span className="text-emerald-900 font-medium block">
                    {pricingOrder.deliveryMethod === 'delivery'
                      ? (isRu ? 'Доставка грузовым авто' : 'Жеткирүү (унаа менен)')
                      : (isRu ? 'Самовывоз со склада' : 'Кампадан өзү алып кетүү')}
                  </span>
                </div>
              </div>

              {/* Items & Hourly Pricing Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-stone-100/70 border-b border-stone-200 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    {t.orderPricingReceiptItemsHeader}
                  </h4>
                  <span className="text-[11px] text-stone-500">
                    {pricingItems.length} {isRu ? 'позиций' : 'аталыш'}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">{t.orderPricingItemName}</th>
                        <th className="p-2.5">{t.orderPricingWeightVolume}</th>
                        <th className="p-2.5 w-24 text-center">{t.orderPricingQty}</th>
                        <th className="p-2.5 w-32">{t.orderPricingUnitPrice}</th>
                        <th className="p-2.5 w-28 text-right">{t.orderPricingTotalPrice}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {pricingItems.map((item, idx) => (
                        <tr key={item.productId} className="hover:bg-stone-50">
                          <td className="p-2.5">
                            <span className="font-bold text-stone-900 block truncate max-w-[220px]">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {item.packaging}
                            </span>
                          </td>
                          <td className="p-2.5 text-stone-700 font-medium">
                            {item.weightOrVolume}
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="inline-flex items-center border border-stone-200 rounded bg-white">
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(idx, item.quantity - 1)}
                                className="px-1.5 py-0.5 text-stone-500 hover:bg-stone-100 text-xs font-bold"
                              >
                                -
                              </button>
                              <span className="px-2 font-bold tabular-nums text-stone-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(idx, item.quantity + 1)}
                                className="px-1.5 py-0.5 text-stone-500 hover:bg-stone-100 text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                step="10"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleItemUnitPriceChange(idx, parseFloat(e.target.value) || 0)
                                }
                                className="w-full p-1.5 pr-8 bg-white border border-emerald-400 rounded-lg text-xs font-bold tabular-nums text-emerald-950 focus:ring-1 focus:ring-emerald-700 outline-none"
                              />
                              <span className="absolute right-2 top-1.5 text-[10px] text-stone-400 pointer-events-none font-semibold">
                                сом
                              </span>
                            </div>
                          </td>
                          <td className="p-2.5 text-right font-extrabold tabular-nums text-emerald-950">
                            {item.totalPrice.toLocaleString()} сом
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals & Adjustments Card */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3 text-xs">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="font-medium">{t.orderPricingSubtotal}</span>
                  <span className="font-bold tabular-nums text-stone-900 text-sm">
                    {currentPricingSubtotal.toLocaleString()} сом
                  </span>
                </div>

                {/* Delivery fee adjustment */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-stone-200">
                  <label className="text-stone-700 font-medium">
                    {t.orderPricingDeliveryFee}
                  </label>
                  <div className="w-36 relative">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={pricingDeliveryFee}
                      onChange={(e) => setPricingDeliveryFee(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 pr-8 bg-white border border-stone-300 rounded-lg text-right font-bold tabular-nums text-stone-900"
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-stone-400 pointer-events-none">
                      сом
                    </span>
                  </div>
                </div>

                {/* Discount adjustment */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-stone-700 font-medium">
                    {t.orderPricingDiscount}
                  </label>
                  <div className="w-36 relative">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={pricingDiscount}
                      onChange={(e) => setPricingDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 pr-8 bg-white border border-stone-300 rounded-lg text-right font-bold tabular-nums text-stone-900"
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-stone-400 pointer-events-none">
                      сом
                    </span>
                  </div>
                </div>

                {/* Hourly Price Note */}
                <div className="pt-2 border-t border-stone-200">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    {t.orderPricingHourlyNote}
                  </label>
                  <input
                    type="text"
                    value={pricingNotes}
                    onChange={(e) => setPricingNotes(e.target.value)}
                    placeholder={t.orderPricingHourlyNotePlaceholder}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-900 text-xs"
                  />
                </div>

                {/* Grand Total Bar */}
                <div className="p-3 bg-emerald-950 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-200 uppercase tracking-wider block font-semibold">
                      {t.orderPricingTotalSum}
                    </span>
                    <span className="text-[10px] text-stone-300">
                      {isRu ? 'Включая доставку и скидку' : 'Жеткирүү акысы жана арзандатуу кошулган'}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold tabular-nums text-amber-300">
                    {currentPricingGrandTotal.toLocaleString()} СОМ
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {priceSavedToast && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg animate-fade-in">
                    <CheckCheck className="w-4 h-4 text-emerald-700" />
                    <span>{isRu ? 'Цены успешно зафиксированы!' : 'Баалар ийгиликтүү бекитилди!'}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Print / View Check Button */}
                <button
                  type="button"
                  onClick={() => setIsReceiptPreviewOpen(true)}
                  className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-stone-600" />
                  <span>{t.orderPricingPrintCheck}</span>
                </button>

                {/* Save Prices */}
                <button
                  type="button"
                  onClick={handleSaveOrderPrices}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>{t.orderPricingSaveBtn}</span>
                </button>

                {/* Primary: Send Check in WhatsApp */}
                <button
                  type="button"
                  onClick={handleSendReceiptToCustomer}
                  className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>{t.orderPricingSendWhatsAppCheck}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PAPER RECEIPT / INVOICE PREVIEW MODAL */}
      {isReceiptPreviewOpen && pricingOrder && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-300">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 no-print">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {t.orderPricingCheckPreviewTitle}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-950 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isRu ? 'Печать чека' : 'Басып чыгаруу'}</span>
                </button>
                <button
                  onClick={() => setIsReceiptPreviewOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="border border-stone-300 rounded-xl p-6 bg-white space-y-4 font-mono text-xs text-stone-900">
              {/* Receipt Header */}
              <div className="text-center space-y-1 border-b border-dashed border-stone-300 pb-4">
                <h2 className="text-base font-bold tracking-tight uppercase">
                  {settings.companyName}
                </h2>
                <div className="text-[11px] text-stone-600">
                  {isRu ? 'Оптово-розничная база продовольственных товаров' : 'Тамак-аш продукцияларынын дүң жана чекене базасы'}
                </div>
                <div className="text-[10px] text-stone-500">
                  Ош ш., Касымбеков 45 | Баткен ш., Раззаков 12
                </div>
                <div className="text-[11px] font-bold text-emerald-950 pt-1">
                  {t.orderPricingReceiptHeader}
                </div>
              </div>

              {/* Order Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-dashed border-stone-300 pb-3">
                <div>
                  <span className="text-stone-500 block">{t.orderPricingReceiptOrderNum}</span>
                  <strong className="font-bold">{pricingOrder.orderNumber}</strong>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block">{t.orderPricingReceiptDate}</span>
                  <span>{pricingOrder.priceConfirmedAt || pricingOrder.createdAt}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">{t.orderPricingReceiptCustomer}</span>
                  <strong>{pricingOrder.customer.name}</strong>
                  {pricingOrder.customer.businessName && <div>{pricingOrder.customer.businessName}</div>}
                  <div>{pricingOrder.customer.phone}</div>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block">{t.orderPricingReceiptAddress}</span>
                  <span>{pricingOrder.customer.cityOrVillage}, {pricingOrder.customer.detailedAddress}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-b border-dashed border-stone-300 pb-4 text-[11px]">
                <div className="font-bold uppercase tracking-wider text-[10px] text-stone-600">
                  {t.orderPricingReceiptItemsHeader}
                </div>
                {pricingItems.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <div className="font-bold">{idx + 1}. {it.name}</div>
                      <div className="text-[10px] text-stone-500">
                        {it.packaging} | {it.quantity} x {it.unitPrice.toLocaleString()} сом
                      </div>
                    </div>
                    <div className="font-bold tabular-nums">
                      {it.totalPrice.toLocaleString()} с.
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Totals */}
              <div className="space-y-1.5 text-xs pt-1 border-b border-dashed border-stone-300 pb-3">
                <div className="flex justify-between text-stone-600">
                  <span>{t.orderPricingReceiptSubtotal}</span>
                  <span className="font-bold tabular-nums">{currentPricingSubtotal.toLocaleString()} сом</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{t.orderPricingReceiptDelivery}</span>
                  <span className="font-bold tabular-nums">
                    {pricingDeliveryFee > 0 ? `${pricingDeliveryFee.toLocaleString()} сом` : '0 сом (Кампадан)'}
                  </span>
                </div>
                {pricingDiscount > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>{t.orderPricingReceiptDiscount}</span>
                    <span className="font-bold tabular-nums">-{pricingDiscount.toLocaleString()} сом</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-stone-950 pt-2 border-t border-stone-300">
                  <span>{t.orderPricingReceiptTotal}</span>
                  <span className="tabular-nums">{currentPricingGrandTotal.toLocaleString()} СОМ</span>
                </div>
              </div>

              {/* Payment Details & Footer */}
              <div className="text-[10px] text-stone-500 text-center space-y-1">
                <p className="font-semibold text-stone-800">{t.orderPricingReceiptPayment}</p>
                <p>{t.orderPricingReceiptFooter}</p>
                <div className="pt-2 text-[9px] text-stone-400">
                  Чекти түзгөн оператор: «Береке Опт» Склад сервери | Мөөр: [БЕКИТИЛДИ]
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setIsReceiptPreviewOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                {t.modalClose}
              </button>
              <button
                type="button"
                onClick={handleSendReceiptToCustomer}
                className="px-5 py-2 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>{t.orderPricingSendWhatsAppCheck}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
