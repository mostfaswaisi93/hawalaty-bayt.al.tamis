/** Icon + accent mapping for the real printed menu categories — shared by the Menu page and its category editor. */
const MENU_CATEGORY_STYLE: Record<string, { icon: string; badge: string }> = {
  'بيتزا': { icon: 'local_pizza', badge: 'bg-brand/10 text-brand' },
  'تميس': { icon: 'lunch_dining', badge: 'bg-secondary-container/20 text-secondary' },
  'الوجبات الغربية': { icon: 'dinner_dining', badge: 'bg-primary/10 text-primary' },
  'السلطات والمقبلات': { icon: 'nutrition', badge: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' },
  'المشروبات': { icon: 'local_cafe', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
};
const DEFAULT_MENU_CATEGORY_STYLE = { icon: 'restaurant_menu', badge: 'bg-brand/10 text-brand' };

export function menuCategoryIcon(category: string): string {
  return (MENU_CATEGORY_STYLE[category] ?? DEFAULT_MENU_CATEGORY_STYLE).icon;
}

export function menuCategoryBadge(category: string): string {
  return (MENU_CATEGORY_STYLE[category] ?? DEFAULT_MENU_CATEGORY_STYLE).badge;
}
