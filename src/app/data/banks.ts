export type BankEntityType = 'bank' | 'wallet';

export interface Bank {
  id: string;
  name: string;
  type: BankEntityType;
  code: string;
  country: string;
  /** SWIFT/BIC applies to banks only — digital wallets don't have one. */
  swift?: string;
  active: boolean;
}

export const COUNTRIES = ['PS', 'IL', 'JO', 'EG', 'SA', 'AE'];

export const MOCK_BANKS: Bank[] = [
  { id: 'BNK-01', name: 'بنك فلسطين', type: 'bank', code: 'PAL', country: 'PS', swift: 'PALSPS22XXX', active: true },
  { id: 'BNK-02', name: 'البنك العربي', type: 'bank', code: 'ARAB', country: 'PS', swift: 'ARABPS22XXX', active: true },
  { id: 'BNK-03', name: 'بنك القدس', type: 'bank', code: 'QUDS', country: 'PS', swift: 'QUDSPS22XXX', active: true },
  { id: 'BNK-04', name: 'البنك الإسلامي الفلسطيني', type: 'bank', code: 'PIB', country: 'PS', swift: 'PIBKPS22XXX', active: false },
  { id: 'WLT-01', name: 'جوال باي', type: 'wallet', code: 'JWPAY', country: 'PS', active: true },
  { id: 'WLT-02', name: 'بال باي', type: 'wallet', code: 'PALPAY', country: 'PS', active: true },
  { id: 'WLT-03', name: 'ريفليكت', type: 'wallet', code: 'RFLCT', country: 'PS', active: true },
];
