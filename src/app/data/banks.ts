export type BankEntityType = 'bank' | 'wallet';

export interface Bank {
  id: string;
  name: string;
  type: BankEntityType;
  code: string;
  active: boolean;
}

export const MOCK_BANKS: Bank[] = [
  { id: 'BNK-01', name: 'بنك فلسطين', type: 'bank', code: 'PAL', active: true },
  { id: 'BNK-02', name: 'البنك العربي', type: 'bank', code: 'ARAB', active: true },
  { id: 'BNK-03', name: 'بنك القدس', type: 'bank', code: 'QUDS', active: true },
  { id: 'BNK-04', name: 'البنك الإسلامي الفلسطيني', type: 'bank', code: 'PIB', active: false },
  { id: 'WLT-01', name: 'جوال باي', type: 'wallet', code: 'JWPAY', active: true },
  { id: 'WLT-02', name: 'بال باي', type: 'wallet', code: 'PALPAY', active: true },
  { id: 'WLT-03', name: 'ريفليكت', type: 'wallet', code: 'RFLCT', active: true },
];
