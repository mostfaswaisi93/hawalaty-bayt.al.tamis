export interface MenuItem {
  id: string;
  name: string;
  category: string;
  /** Always in Shekel — the business's only currency. */
  price: number;
  active: boolean;
}

/** The real menu categories of بيت التميس (Bayt Al-Tamis), in printed order. */
export const MENU_CATEGORIES = ['بيتزا', 'تميس', 'الوجبات الغربية', 'السلطات والمقبلات', 'المشروبات'] as const;

/** The real menu of بيت التميس, transcribed from the in-store menu board. */
export const MOCK_MENU: MenuItem[] = [
  // بيتزا
  { id: 'ITM-01', name: 'بيتزا خضار', category: 'بيتزا', price: 20, active: true },
  { id: 'ITM-02', name: 'بيتزا ذرة', category: 'بيتزا', price: 20, active: true },
  { id: 'ITM-03', name: 'بيتزا مارغريتا', category: 'بيتزا', price: 20, active: true },
  { id: 'ITM-04', name: 'بيتزا بالنقانق', category: 'بيتزا', price: 25, active: true },
  { id: 'ITM-05', name: 'بيتزا بصدر دجاج', category: 'بيتزا', price: 30, active: true },

  // التميس
  { id: 'ITM-06', name: 'تميس شاورما بالجبنة', category: 'تميس', price: 17, active: true },
  { id: 'ITM-07', name: 'تميس تشكن بيتزا', category: 'تميس', price: 15, active: true },
  { id: 'ITM-08', name: 'تميس نقانق بالجبنة', category: 'تميس', price: 14, active: true },
  { id: 'ITM-09', name: 'تميس نقانق حار', category: 'تميس', price: 12, active: true },
  { id: 'ITM-10', name: 'تميس جبنة K', category: 'تميس', price: 12, active: true },
  { id: 'ITM-11', name: 'تميس جبنة موزوريلا', category: 'تميس', price: 15, active: true },
  { id: 'ITM-12', name: 'تميس جبنة ساده', category: 'تميس', price: 10, active: true },
  { id: 'ITM-13', name: 'تميس جبنة ميكس', category: 'تميس', price: 10, active: true },
  { id: 'ITM-14', name: 'تميس جبنة بزعتر', category: 'تميس', price: 6, active: true },
  { id: 'ITM-15', name: 'تميس جبنة بيضاء', category: 'تميس', price: 5, active: true },
  { id: 'ITM-16', name: 'تميس زعتر', category: 'تميس', price: 4, active: true },
  { id: 'ITM-17', name: 'تميس سادة', category: 'تميس', price: 2, active: true },

  // الوجبات الغربية
  { id: 'ITM-18', name: 'كلزوني', category: 'الوجبات الغربية', price: 30, active: true },
  { id: 'ITM-19', name: 'كلزوني دبل جبنة', category: 'الوجبات الغربية', price: 35, active: true },
  { id: 'ITM-20', name: 'ساندويتش تشيكن بيتزا', category: 'الوجبات الغربية', price: 22, active: true },
  { id: 'ITM-21', name: 'فرشوحة بيت التميس', category: 'الوجبات الغربية', price: 25, active: true },

  // السلطات والمقبلات
  { id: 'ITM-22', name: 'شيبس', category: 'السلطات والمقبلات', price: 8, active: true },
  { id: 'ITM-23', name: 'سلطة ملفوف', category: 'السلطات والمقبلات', price: 8, active: true },
  { id: 'ITM-24', name: 'زبدية ذرة بالجبنة', category: 'السلطات والمقبلات', price: 15, active: true },
  { id: 'ITM-25', name: 'سلطة مايونيز', category: 'السلطات والمقبلات', price: 8, active: true },
  { id: 'ITM-26', name: 'سلطة تركية', category: 'السلطات والمقبلات', price: 8, active: true },

  // المشروبات
  { id: 'ITM-27', name: 'مشروبات غازية باردة', category: 'المشروبات', price: 5, active: true },
  { id: 'ITM-28', name: 'مياه معدنية', category: 'المشروبات', price: 3, active: true },
];
