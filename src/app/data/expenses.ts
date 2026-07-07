export interface Expense {
  id: string;
  /** What was bought, e.g. "أسطوانة غاز 2 كيلو". */
  description: string;
  amount: number;
  /** Bank/wallet the purchase was paid from. */
  bankId: string;
  bankName: string;
  date: string; // ISO
}

export const MOCK_EXPENSES: Expense[] = [
  { id: 'EXP-1001', description: 'أسطوانة غاز 2 كيلو', amount: 45, bankId: 'BNK-01', bankName: 'بنك فلسطين', date: '2026-07-01' },
  { id: 'EXP-1002', description: 'طحين ومكونات بيتزا', amount: 220, bankId: 'BNK-02', bankName: 'البنك العربي', date: '2026-07-02' },
  { id: 'EXP-1003', description: 'مواد تنظيف للمطبخ', amount: 60, bankId: 'WLT-01', bankName: 'جوال باي', date: '2026-07-03' },
  { id: 'EXP-1004', description: 'صيانة فرن البيتزا', amount: 180, bankId: 'WLT-02', bankName: 'بال باي', date: '2026-07-04' },
  { id: 'EXP-1005', description: 'علب وأكياس تغليف', amount: 95, bankId: 'BNK-03', bankName: 'بنك القدس', date: '2026-07-05' },
];
