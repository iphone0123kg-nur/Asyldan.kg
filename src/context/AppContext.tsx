import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CategoryItem,
  CartItem,
  Order,
  Customer,
  ExpenseRecord,
  BusinessSettings,
  DeliveryRegionId,
  DeliveryRegion,
  DeliveryMethod,
  OrderCustomerInfo,
  OrderStatus,
  ProductCategory,
  Language,
} from '../types';
import {
  INITIAL_SETTINGS,
  CATEGORIES,
  INITIAL_PRODUCTS,
  DELIVERY_REGIONS,
  SAMPLE_ORDERS,
  SAMPLE_CUSTOMERS,
  SAMPLE_EXPENSES,
} from '../data/mockData';
import { translations } from '../i18n/translations';

interface AppContextType {
  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations['ky'];

  // Navigation & UI state
  activeTab: 'home' | 'catalog' | 'delivery' | 'wholesale' | 'admin';
  setActiveTab: (tab: 'home' | 'catalog' | 'delivery' | 'wholesale' | 'admin') => void;
  selectedCategory: ProductCategory | null;
  setSelectedCategory: (cat: ProductCategory | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedProductDetails: Product | null;
  setSelectedProductDetails: (product: Product | null) => void;
  confirmedOrder: Order | null;
  setConfirmedOrder: (order: Order | null) => void;
  adminSubTab: string;
  setAdminSubTab: (tab: string) => void;

  // Products & Categories
  products: Product[];
  categories: CategoryItem[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartTotalWeightKg: number;
  cartTotalVolumeLiters: number;
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  selectedRegion: DeliveryRegionId;
  setSelectedRegion: (region: DeliveryRegionId) => void;

  // Orders
  orders: Order[];
  createOrder: (customer: OrderCustomerInfo) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, assignedDriver?: string) => void;
  updateOrder: (orderId: string, updatedOrder: Partial<Order>) => void;

  // Admin ERP data
  customers: Customer[];
  expenses: ExpenseRecord[];
  addExpense: (exp: Omit<ExpenseRecord, 'id'>) => void;

  // Settings
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetDemoData: () => void;

  // WhatsApp generator & receipts
  generateWhatsAppOrderUrl: (order: Order) => string;
  generateWhatsAppReceiptUrl: (order: Order) => string;
  generateQuickWhatsAppInquiryUrl: (product?: Product) => string;
  getProductBaseWholesalePrice: (product: Product) => number;

  // Helper getters for localized product & category & delivery & settings
  getProductName: (p: Product) => string;
  getProductDesc: (p: Product) => string;
  getProductPackaging: (p: Product) => string;
  getProductWarehouse: (p: Product) => string;
  getCategoryName: (c: CategoryItem) => string;
  getCategoryDesc: (c: CategoryItem) => string;
  getDeliveryRegionName: (r: DeliveryRegion) => string;
  getDeliveryRegionDistricts: (r: DeliveryRegion) => string[];
  getDeliveryRegionEstimatedTime: (r: DeliveryRegion) => string;
  getDeliveryRegionSchedule: (r: DeliveryRegion) => string;
  getCentralWarehouseAddress: () => string;
  getBatkenWarehouseAddress: () => string;
  getOperatingHours: () => string;
  getTagline: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language state (persisted in localStorage)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bereke_lang');
    return saved === 'ru' || saved === 'ky' ? saved : 'ky';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bereke_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'ky' ? 'ru' : 'ky';
    setLanguage(nextLang);
  };

  const t = translations[language];

  // Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'delivery' | 'wholesale' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [adminSubTab, setAdminSubTab] = useState('overview');

  // Business state
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bereke_products_v3');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories] = useState<CategoryItem[]>(CATEGORIES);

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('bereke_settings_v3');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bereke_cart_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedRegion, setSelectedRegion] = useState<DeliveryRegionId>('osh');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('bereke_orders_v3');
    return saved ? JSON.parse(saved) : SAMPLE_ORDERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('bereke_customers_v3');
    return saved ? JSON.parse(saved) : SAMPLE_CUSTOMERS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('bereke_expenses_v3');
    return saved ? JSON.parse(saved) : SAMPLE_EXPENSES;
  });

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('bereke_products_v3', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bereke_cart_v3', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('bereke_orders_v3', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bereke_settings_v3', JSON.stringify(settings));
  }, [settings]);

  // Helpers for localized names
  const getProductName = (p: Product) => (language === 'ru' ? p.name_ru || p.name : p.name_ky || p.name);
  const getProductDesc = (p: Product) => (language === 'ru' ? p.description_ru || p.description : p.description_ky || p.description);
  const getProductPackaging = (p: Product) => (language === 'ru' ? p.packagingUnit_ru || p.packagingUnit : p.packagingUnit_ky || p.packagingUnit);
  const getProductWarehouse = (p: Product) => (language === 'ru' ? p.warehouseLocation_ru || p.warehouseLocation || 'Ош' : p.warehouseLocation_ky || p.warehouseLocation || 'Ош');
  const getCategoryName = (c: CategoryItem) => (language === 'ru' ? c.name_ru || c.name : c.name_ky || c.name);
  const getCategoryDesc = (c: CategoryItem) => (language === 'ru' ? c.description_ru || c.description : c.description_ky || c.description);
  const getDeliveryRegionName = (r: DeliveryRegion) => (language === 'ru' ? r.name_ru || r.name : r.name_ky || r.name);
  const getDeliveryRegionDistricts = (r: DeliveryRegion) => (language === 'ru' ? r.districts_ru || r.districts : r.districts_ky || r.districts);
  const getDeliveryRegionEstimatedTime = (r: DeliveryRegion) => (language === 'ru' ? r.estimatedTime_ru || r.estimatedTime : r.estimatedTime_ky || r.estimatedTime);
  const getDeliveryRegionSchedule = (r: DeliveryRegion) => (language === 'ru' ? r.scheduleDescription_ru || r.scheduleDescription : r.scheduleDescription_ky || r.scheduleDescription);
  const getCentralWarehouseAddress = (): string =>
    (language === 'ru'
      ? settings.centralWarehouseAddress_ru || settings.centralWarehouseAddress || 'г. Ош, ул. Касымбекова 45'
      : settings.centralWarehouseAddress_ky || settings.centralWarehouseAddress || 'Ош ш., Касымбеков көч. 45');
  const getBatkenWarehouseAddress = (): string =>
    (language === 'ru'
      ? settings.batkenWarehouseAddress_ru || settings.batkenWarehouseAddress || 'г. Баткен, ул. Раззакова 12'
      : settings.batkenWarehouseAddress_ky || settings.batkenWarehouseAddress || 'Баткен ш., Раззаков көч. 12');
  const getOperatingHours = (): string =>
    (language === 'ru'
      ? settings.operatingHours_ru || settings.operatingHours || 'Пн-Сб: 08:00 - 19:00'
      : settings.operatingHours_ky || settings.operatingHours || 'Дүйшөмбү-Ишемби: 08:00 - 19:00');
  const getTagline = (): string =>
    (language === 'ru'
      ? settings.tagline_ru || 'Оптовые и розничные поставки продуктов питания в Ошской и Баткенской областях'
      : settings.tagline_ky || 'Ош жана Баткен облустары боюнча тамак-аш продукцияларын дүң жана чекене жеткирүү');

  // Base wholesale pricing logic (internal for Admin, hidden from customer in catalog)
  const getProductBaseWholesalePrice = (product: Product): number => {
    if (product.baseWholesalePrice && product.baseWholesalePrice > 0) {
      return product.baseWholesalePrice;
    }
    switch (product.category) {
      case 'rice':
        return Math.round(product.numericWeightOrVolume * 86);
      case 'oil':
        return Math.round(product.numericWeightOrVolume * 124);
      case 'flour':
        return Math.round(product.numericWeightOrVolume * 38);
      case 'sugar':
        return Math.round(product.numericWeightOrVolume * 68);
      case 'salt':
        return Math.round(product.numericWeightOrVolume * 12);
      case 'pasta':
        return Math.round(product.numericWeightOrVolume * 60);
      case 'sauces':
        return Math.round(product.numericWeightOrVolume * 95);
      case 'mayo':
        return Math.round(product.numericWeightOrVolume * 140);
      case 'canned':
        return Math.round(product.numericWeightOrVolume * 390);
      default:
        return Math.round(product.numericWeightOrVolume * 220);
    }
  };

  // Cart calculations by weight/volume
  const calculateCartItem = (product: Product, quantity: number): CartItem => {
    let weightText = '';
    const unitPkg = language === 'ru' ? 'упак.' : 'таңгак';
    if (product.measureUnit === 'кг') {
      const totalKg = product.numericWeightOrVolume * quantity;
      weightText = `${totalKg} кг (${quantity} x ${product.weightOrVolume})`;
    } else if (product.measureUnit === 'г') {
      const totalG = product.numericWeightOrVolume * quantity;
      weightText = totalG >= 1000 ? `${totalG / 1000} кг (${quantity} x ${product.weightOrVolume})` : `${totalG} г (${quantity} x ${product.weightOrVolume})`;
    } else if (product.measureUnit === 'л') {
      const totalL = product.numericWeightOrVolume * quantity;
      weightText = `${totalL} л (${quantity} x ${product.weightOrVolume})`;
    } else {
      weightText = `${quantity} ${unitPkg} (${product.weightOrVolume})`;
    }

    const unitPrice = getProductBaseWholesalePrice(product);
    const totalPrice = unitPrice * quantity;

    return {
      product,
      quantity,
      selectedUnit: getProductPackaging(product),
      totalWeightOrVolumeText: weightText,
      unitPrice,
      totalPrice,
    };
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const newQuantity = prevCart[existingIndex].quantity + quantity;
        const updated = [...prevCart];
        updated[existingIndex] = calculateCartItem(product, newQuantity);
        return updated;
      } else {
        return [...prevCart, calculateCartItem(product, quantity)];
      }
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          return calculateCartItem(item.product, quantity);
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Total weight in kilograms
  const cartTotalWeightKg = cart.reduce((sum, item) => {
    const p = item.product;
    if (p.measureUnit === 'кг') {
      return sum + p.numericWeightOrVolume * item.quantity;
    } else if (p.measureUnit === 'г') {
      return sum + (p.numericWeightOrVolume / 1000) * item.quantity;
    }
    return sum;
  }, 0);

  // Total volume in liters
  const cartTotalVolumeLiters = cart.reduce((sum, item) => {
    const p = item.product;
    if (p.measureUnit === 'л') {
      return sum + p.numericWeightOrVolume * item.quantity;
    } else if (p.measureUnit === 'мл') {
      return sum + (p.numericWeightOrVolume / 1000) * item.quantity;
    }
    return sum;
  }, 0);

  // Order creation (calculates item prices, subtotal, and total ready for Admin)
  const createOrder = (customer: OrderCustomerInfo): Order => {
    const orderNum = `BO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pricedItems: CartItem[] = cart.map((it) => {
      const unitPrice = it.unitPrice || getProductBaseWholesalePrice(it.product);
      const totalPrice = unitPrice * it.quantity;
      return {
        ...it,
        unitPrice,
        totalPrice,
      };
    });

    const subtotalAmount = pricedItems.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
    const deliveryFee = deliveryMethod === 'delivery' ? (customer.region === 'batken' ? 500 : 300) : 0;
    const totalAmount = subtotalAmount + deliveryFee;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customer,
      items: pricedItems,
      totalWeightKg: cartTotalWeightKg,
      totalVolumeLiters: cartTotalVolumeLiters,
      totalItemsCount: cartItemCount,
      deliveryMethod,
      status: 'new',
      subtotalAmount,
      deliveryFee,
      discountAmount: 0,
      totalAmount,
      priceConfirmedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminPriceNotes: language === 'ru' ? 'Рассчитано по базовым складским ценам' : 'Кампанын дүң базалык баалары боюнча эсептелди',
      paymentStatus: 'pending',
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setConfirmedOrder(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, assignedDriver?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status,
            assignedDriver: assignedDriver !== undefined ? assignedDriver : ord.assignedDriver,
          };
        }
        return ord;
      })
    );
  };

  const updateOrder = (orderId: string, updatedOrder: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newItems = updatedOrder.items || ord.items;
          const subtotalAmount =
            updatedOrder.subtotalAmount !== undefined
              ? updatedOrder.subtotalAmount
              : newItems.reduce((sum, it) => sum + (it.totalPrice || (it.unitPrice || 0) * it.quantity), 0);
          const deliveryFee =
            updatedOrder.deliveryFee !== undefined ? updatedOrder.deliveryFee : ord.deliveryFee;
          const discountAmount =
            updatedOrder.discountAmount !== undefined ? updatedOrder.discountAmount : (ord.discountAmount || 0);
          const totalAmount = Math.max(0, subtotalAmount + deliveryFee - discountAmount);

          return {
            ...ord,
            ...updatedOrder,
            items: newItems,
            subtotalAmount,
            deliveryFee,
            discountAmount,
            totalAmount,
            priceConfirmedAt:
              updatedOrder.priceConfirmedAt ||
              new Date().toISOString().replace('T', ' ').substring(0, 16),
          };
        }
        return ord;
      })
    );
  };

  // Product management (Admin)
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const prod: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [prod, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addExpense = (exp: Omit<ExpenseRecord, 'id'>) => {
    const newExp: ExpenseRecord = {
      ...exp,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetDemoData = () => {
    localStorage.removeItem('bereke_products_v3');
    localStorage.removeItem('bereke_cart_v3');
    localStorage.removeItem('bereke_orders_v3');
    localStorage.removeItem('bereke_settings_v3');
    localStorage.removeItem('bereke_customers_v3');
    localStorage.removeItem('bereke_expenses_v3');
    setProducts(INITIAL_PRODUCTS);
    setCart([]);
    setOrders(SAMPLE_ORDERS);
    setCustomers(SAMPLE_CUSTOMERS);
    setExpenses(SAMPLE_EXPENSES);
    setSettings(INITIAL_SETTINGS);
  };

  // WhatsApp formatted string generator in active language
  const generateWhatsAppOrderUrl = (order: Order) => {
    const isRu = language === 'ru';
    const regionName = order.customer.region === 'osh'
      ? (isRu ? 'Ошская область' : 'Ош облусу')
      : (isRu ? 'Баткенская область' : 'Баткен облусу');
    const methodStr = order.deliveryMethod === 'delivery'
      ? (isRu ? 'Доставка автомобилем' : 'Жеткирүү (унаа менен)')
      : (isRu ? 'Самовывоз со склада' : 'Кампадан өзү алып кетүү');

    let msg = isRu
      ? `*ЗАЯВКА НА ПОСТАВКУ ПРОДУКТОВ #${order.orderNumber}* (${settings.companyName})\n`
      : `*ТАМАК-АШ ПРОДУКЦИЯЛАРЫНА ЗАКАЗ #${order.orderNumber}* (${settings.companyName})\n`;
    msg += `---------------------------------\n`;
    msg += isRu ? `*Клиент:* ${order.customer.name}\n` : `*Буйрутма берүүчү:* ${order.customer.name}\n`;
    if (order.customer.businessName) {
      msg += isRu ? `*Магазин/Заведение:* ${order.customer.businessName}\n` : `*Ишкана/Дүкөн/Кафе:* ${order.customer.businessName}\n`;
    }
    msg += isRu ? `*Телефон:* ${order.customer.phone}\n` : `*Телефон:* ${order.customer.phone}\n`;
    msg += isRu ? `*Регион:* ${regionName}, ${order.customer.cityOrVillage}\n` : `*Аймак:* ${regionName}, ${order.customer.cityOrVillage}\n`;
    msg += isRu ? `*Адрес:* ${order.customer.detailedAddress}\n` : `*Дареги:* ${order.customer.detailedAddress}\n`;
    if (order.customer.preferredDeliveryTime) {
      msg += isRu ? `*Желаемое время:* ${order.customer.preferredDeliveryTime}\n` : `*Ыңгайлуу убакыт:* ${order.customer.preferredDeliveryTime}\n`;
    }
    if (order.customer.orderNotes) {
      msg += isRu ? `*Примечание:* ${order.customer.orderNotes}\n` : `*Кошумча:* ${order.customer.orderNotes}\n`;
    }
    msg += isRu
      ? `\n*ТОВАРЫ И ВЕСОВЫЕ ОБЪЕМЫ:*\n`
      : `\n*БУЙРУТМА БЕРИЛГЕН ТОВАРЛАР ЖАНА КӨЛӨМДӨР:*\n`;

    order.items.forEach((it, idx) => {
      const prodName = getProductName(it.product);
      const pkg = getProductPackaging(it.product);
      const unitLabel = isRu ? 'шт.' : 'даана';
      const totalLabel = isRu ? 'Всего' : 'Жалпы';
      msg += `${idx + 1}. *${prodName}*\n   ${pkg}\n   ${it.quantity} ${unitLabel} | ${totalLabel}: ${it.totalWeightOrVolumeText}\n`;
    });

    msg += `---------------------------------\n`;
    if (order.totalWeightKg > 0) {
      msg += isRu
        ? `*Общий расчетный вес (сухой):* ~${order.totalWeightKg.toLocaleString()} кг\n`
        : `*Жалпы салмагы (кургак жүк):* ~${order.totalWeightKg.toLocaleString()} кг\n`;
    }
    if (order.totalVolumeLiters > 0) {
      msg += isRu
        ? `*Общий объем жидкостей:* ~${order.totalVolumeLiters.toLocaleString()} л\n`
        : `*Жалпы көлөмү (суюктуктар):* ~${order.totalVolumeLiters.toLocaleString()} литр\n`;
    }
    msg += isRu
      ? `*Всего упаковок:* ${order.totalItemsCount} шт.\n`
      : `*Жалпы таңгак саны:* ${order.totalItemsCount} даана\n`;
    msg += isRu
      ? `*Способ получения:* ${methodStr}\n\n`
      : `*Алуу ыкмасы:* ${methodStr}\n\n`;
    msg += isRu
      ? `_Здравствуйте! Просим подтвердить наличие партии на складе и согласовать выезд транспорта._`
      : `_Саламатсызбы! Ушул көлөмдөгү товарларды жеткирүү шарттарын жана кампадагы даярдыгын билдирип коюуңузду суранабыз._`;

    const encoded = encodeURIComponent(msg);
    return `https://wa.me/${settings.whatsappPhone}?text=${encoded}`;
  };

  const generateQuickWhatsAppInquiryUrl = (product?: Product) => {
    const isRu = language === 'ru';
    let msg = isRu
      ? `Здравствуйте! Обращаюсь с сайта ${settings.companyName}.\n`
      : `Саламатсызбы! Сиздердин сайтка байланыштуу кайрылып жатам (${settings.companyName}).\n`;

    if (product) {
      const prodName = getProductName(product);
      const pkg = getProductPackaging(product);
      msg += isRu
        ? `Интересует товар: *${prodName}*\nФасовка/объем: *${pkg}* (${product.weightOrVolume})\nУточните наличие на складах в Оше / Баткене.`
        : `Төмөнкү товар боюнча маалымат алгым келет:\n*${prodName}*\nКөлөмү / Салмагы: *${pkg}* (${product.weightOrVolume})\nОш / Баткен кампаларыңызда бар-жогун тактап берсеңиз.`;
    } else {
      msg += isRu
        ? `Хочу уточнить условия оптовых поставок и график выезда машин по Ошской и Баткенской областям.`
        : `Ош жана Баткен облустары боюнча дүң жеткирүүнүн көлөмдөрү жана графиги жөнүндө маалымат алгым келет.`;
    }
    return `https://wa.me/${settings.whatsappPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Official Commercial Check / WhatsApp Receipt generator (User request #5)
  const generateWhatsAppReceiptUrl = (order: Order) => {
    const isRu = language === 'ru';
    const regionName = order.customer.region === 'osh'
      ? (isRu ? 'Ошская область' : 'Ош облусу')
      : (isRu ? 'Баткенская область' : 'Баткен облусу');
    const methodStr = order.deliveryMethod === 'delivery'
      ? (isRu ? 'Доставка грузовым авто' : 'Жеткирүү (унаа менен)')
      : (isRu ? 'Самовывоз со склада' : 'Кампадан өзү алып кетүү');

    let msg = isRu
      ? `🧾 *ОФИЦИАЛЬНЫЙ ТОВАРНЫЙ ЧЕК / НАКЛАДНАЯ*\n`
      : `🧾 *РАСМИЙ ЭСЕП-ФАКТУРА / ТОВАРДЫК ЧЕК*\n`;
    msg += `🏢 ${settings.companyName} (${isRu ? 'Оптовый склад южного региона' : 'Түштүк аймактык дүң базасы'})\n`;
    msg += `---------------------------------\n`;
    msg += isRu ? `*Чек / Заказ №:* ${order.orderNumber}\n` : `*Чек / Заказ №:* ${order.orderNumber}\n`;
    msg += isRu ? `*Дата расчета:* ${order.priceConfirmedAt || order.createdAt}\n` : `*Эсептелген убактысы:* ${order.priceConfirmedAt || order.createdAt}\n`;
    msg += isRu ? `*Клиент:* ${order.customer.name}\n` : `*Кардар:* ${order.customer.name}\n`;
    if (order.customer.businessName) {
      msg += isRu ? `*Организация:* ${order.customer.businessName}\n` : `*Ишкана/Дүкөн:* ${order.customer.businessName}\n`;
    }
    msg += isRu ? `*Телефон:* ${order.customer.phone}\n` : `*Телефон:* ${order.customer.phone}\n`;
    msg += isRu
      ? `*Адрес:* ${regionName}, ${order.customer.cityOrVillage}, ${order.customer.detailedAddress}\n`
      : `*Дареги:* ${regionName}, ${order.customer.cityOrVillage}, ${order.customer.detailedAddress}\n`;
    msg += isRu ? `*Способ получения:* ${methodStr}\n` : `*Алуу түрү:* ${methodStr}\n`;
    if (order.adminPriceNotes) {
      msg += isRu ? `*Тариф / Примечание:* ${order.adminPriceNotes}\n` : `*Сааттык тариф эскертүүсү:* ${order.adminPriceNotes}\n`;
    }
    msg += `---------------------------------\n`;
    msg += isRu ? `*СПИСОК ТОВАРОВ И АКТУАЛЬНЫЕ ЦЕНЫ:*\n` : `*ТОВАРЛАР ТИЗМЕСИ ЖАНА АКТУАЛДУУ БААЛАРЫ:*\n`;

    order.items.forEach((it, idx) => {
      const pName = getProductName(it.product);
      const pkg = getProductPackaging(it.product);
      const unitPrice = it.unitPrice || 0;
      const lineTotal = it.totalPrice || (unitPrice * it.quantity);
      const qtyUnit = isRu ? 'шт.' : 'даана';
      msg += `${idx + 1}. *${pName}*\n`;
      msg += `   Тара: ${pkg}\n`;
      msg += `   ${it.quantity} ${qtyUnit} × ${unitPrice.toLocaleString()} сом = *${lineTotal.toLocaleString()} сом*\n`;
    });

    msg += `---------------------------------\n`;
    msg += isRu
      ? `*Сумма по товарам:* ${order.subtotalAmount.toLocaleString()} сом\n`
      : `*Товарлардын суммасы:* ${order.subtotalAmount.toLocaleString()} сом\n`;

    if (order.deliveryFee > 0) {
      msg += isRu
        ? `*Доставка автотранспортом:* ${order.deliveryFee.toLocaleString()} сом\n`
        : `*Жеткирүү акысы:* ${order.deliveryFee.toLocaleString()} сом\n`;
    } else {
      msg += isRu
        ? `*Доставка:* 0 сом (Самовывоз)\n`
        : `*Жеткирүү:* 0 сом (Кампадан алуу)\n`;
    }

    if (order.discountAmount && order.discountAmount > 0) {
      msg += isRu
        ? `*Скидка:* -${order.discountAmount.toLocaleString()} сом\n`
        : `*Арзандатуу:* -${order.discountAmount.toLocaleString()} сом\n`;
    }

    msg += `💰 *${isRu ? 'ИТОГО К ОПЛАТЕ:' : 'ЖАЛПЫ ТӨЛӨМ СУММАСЫ:'} ${order.totalAmount.toLocaleString()} СОМ*\n`;
    msg += `---------------------------------\n`;
    msg += isRu
      ? `*Реквизиты для оплаты:*\n• МБанк QR / перевод: 0772 34-56-78\n• Наличными экспедитору при получении\n\n`
      : `*Төлөм реквизиттери:*\n• МБанк QR / которуу: 0772 34-56-78\n• Жүктү түшүргөндө айдоочуга накталай\n\n`;
    msg += isRu
      ? `_Уважаемый клиент! Оптовые цены зафиксированы на данный час. Пожалуйста, проверьте наименования и сумму чека и подтвердите заказ ответным сообщением «Согласен»._`
      : `_Урматтуу кардар! Дүң баалар ушул саатка карата такталды. Чектеги товарлардын тизмесин жана суммасын текшерип, «Макулмун» деп жооп бериңиз._`;

    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.length >= 9 ? cleanPhone : settings.whatsappPhone;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        selectedProductDetails,
        setSelectedProductDetails,
        confirmedOrder,
        setConfirmedOrder,
        adminSubTab,
        setAdminSubTab,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
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
        orders,
        createOrder,
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
        generateQuickWhatsAppInquiryUrl,
        getProductBaseWholesalePrice,
        getProductName,
        getProductDesc,
        getProductPackaging,
        getProductWarehouse,
        getCategoryName,
        getCategoryDesc,
        getDeliveryRegionName,
        getDeliveryRegionDistricts,
        getDeliveryRegionEstimatedTime,
        getDeliveryRegionSchedule,
        getCentralWarehouseAddress,
        getBatkenWarehouseAddress,
        getOperatingHours,
        getTagline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
