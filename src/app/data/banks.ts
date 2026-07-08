export type BankEntityType = 'bank' | 'wallet';

export interface Bank {
  id: string;
  name: string;
  type: BankEntityType;
  code: string;
  active: boolean;
  /** WhatsApp-reachable number (with country code) new orders paid through this account are announced to. */
  phone?: string;
}

export const MOCK_BANKS: Bank[] = [
  { id: 'BNK-01', name: 'بنك فلسطين', type: 'bank', code: 'PAL', active: true, phone: '+970591234567' },
  { id: 'BNK-02', name: 'البنك العربي', type: 'bank', code: 'ARAB', active: true, phone: '+970599876543' },
  { id: 'BNK-03', name: 'بنك القدس', type: 'bank', code: 'QUDS', active: true, phone: '+970568889999' },
  { id: 'BNK-04', name: 'البنك الإسلامي الفلسطيني', type: 'bank', code: 'PIB', active: false },
  { id: 'WLT-01', name: 'جوال باي', type: 'wallet', code: 'JWPAY', active: true, phone: '+970599112233' },
  { id: 'WLT-02', name: 'بال باي', type: 'wallet', code: 'PALPAY', active: true, phone: '+970599445566' },
  { id: 'WLT-03', name: 'ريفليكت', type: 'wallet', code: 'RFLCT', active: true },
];
