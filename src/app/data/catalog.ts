export type CatalogType = 'service' | 'good';

export interface CatalogItem {
  id: string;
  name: string;
  type: CatalogType;
  category: string;
  price: number;
  currency: string;
  active: boolean;
}

/** The real menu of بيت التميس (Bayt Al-Tamis), transcribed from the in-store menu board. */
export const MOCK_CATALOG: CatalogItem[] = [
  // بيتزا
  { id: 'ITM-01', name: 'بيتزا خضار', type: 'good', category: 'بيتزا', price: 20, currency: 'ILS', active: true },
  { id: 'ITM-02', name: 'بيتزا ذرة', type: 'good', category: 'بيتزا', price: 20, currency: 'ILS', active: true },
  { id: 'ITM-03', name: 'بيتزا مارغريتا', type: 'good', category: 'بيتزا', price: 20, currency: 'ILS', active: true },
  { id: 'ITM-04', name: 'بيتزا بالنقانق', type: 'good', category: 'بيتزا', price: 25, currency: 'ILS', active: true },
  { id: 'ITM-05', name: 'بيتزا بصدر دجاج', type: 'good', category: 'بيتزا', price: 30, currency: 'ILS', active: true },

  // التميس
  { id: 'ITM-06', name: 'تميس شاورما بالجبنة', type: 'good', category: 'تميس', price: 17, currency: 'ILS', active: true },
  { id: 'ITM-07', name: 'تميس تشكن بيتزا', type: 'good', category: 'تميس', price: 15, currency: 'ILS', active: true },
  { id: 'ITM-08', name: 'تميس نقانق بالجبنة', type: 'good', category: 'تميس', price: 14, currency: 'ILS', active: true },
  { id: 'ITM-09', name: 'تميس نقانق حار', type: 'good', category: 'تميس', price: 12, currency: 'ILS', active: true },
  { id: 'ITM-10', name: 'تميس جبنة K', type: 'good', category: 'تميس', price: 12, currency: 'ILS', active: true },
  { id: 'ITM-11', name: 'تميس جبنة موزوريلا', type: 'good', category: 'تميس', price: 15, currency: 'ILS', active: true },
  { id: 'ITM-12', name: 'تميس جبنة ساده', type: 'good', category: 'تميس', price: 10, currency: 'ILS', active: true },
  { id: 'ITM-13', name: 'تميس جبنة ميكس', type: 'good', category: 'تميس', price: 10, currency: 'ILS', active: true },
  { id: 'ITM-14', name: 'تميس جبنة بزعتر', type: 'good', category: 'تميس', price: 6, currency: 'ILS', active: true },
  { id: 'ITM-15', name: 'تميس جبنة بيضاء', type: 'good', category: 'تميس', price: 5, currency: 'ILS', active: true },
  { id: 'ITM-16', name: 'تميس زعتر', type: 'good', category: 'تميس', price: 4, currency: 'ILS', active: true },
  { id: 'ITM-17', name: 'تميس سادة', type: 'good', category: 'تميس', price: 2, currency: 'ILS', active: true },

  // الوجبات الغربية
  { id: 'ITM-18', name: 'كلزوني', type: 'good', category: 'الوجبات الغربية', price: 30, currency: 'ILS', active: true },
  { id: 'ITM-19', name: 'كلزوني دبل جبنة', type: 'good', category: 'الوجبات الغربية', price: 35, currency: 'ILS', active: true },
  { id: 'ITM-20', name: 'ساندويتش تشيكن بيتزا', type: 'good', category: 'الوجبات الغربية', price: 22, currency: 'ILS', active: true },
  { id: 'ITM-21', name: 'فرشوحة بيت التميس', type: 'good', category: 'الوجبات الغربية', price: 25, currency: 'ILS', active: true },

  // السلطات والمقبلات
  { id: 'ITM-22', name: 'شيبس', type: 'good', category: 'السلطات والمقبلات', price: 8, currency: 'ILS', active: true },
  { id: 'ITM-23', name: 'سلطة ملفوف', type: 'good', category: 'السلطات والمقبلات', price: 8, currency: 'ILS', active: true },
  { id: 'ITM-24', name: 'زبدية ذرة بالجبنة', type: 'good', category: 'السلطات والمقبلات', price: 15, currency: 'ILS', active: true },
  { id: 'ITM-25', name: 'سلطة مايونيز', type: 'good', category: 'السلطات والمقبلات', price: 8, currency: 'ILS', active: true },
  { id: 'ITM-26', name: 'سلطة تركية', type: 'good', category: 'السلطات والمقبلات', price: 8, currency: 'ILS', active: true },

  // المشروبات
  { id: 'ITM-27', name: 'مشروبات غازية باردة', type: 'good', category: 'المشروبات', price: 5, currency: 'ILS', active: true },
  { id: 'ITM-28', name: 'مياه معدنية', type: 'good', category: 'المشروبات', price: 3, currency: 'ILS', active: true },
];
