export type TransferStatus = 'completed' | 'pending' | 'failed';

/** How the customer paid for the order. */
export type PaymentMethod = 'cash' | 'bank';
/** How change owed back to the customer was handed over. */
export type ChangeMethod = 'cash' | 'bank';

export interface TransferLineItem {
  itemId: string;
  name: string;
  quantity: number;
  /** Unit price at the time of the transfer (menu prices can change later). */
  price: number;
}

export interface Transfer {
  id: string;
  customer: string;
  date: string; // ISO
  status: TransferStatus;

  items: TransferLineItem[];
  /** Sum of quantity × price across all line items. */
  amount: number;
  /** Denormalized, human-readable summary of items (e.g. "بيتزا مارغريتا ×2، تميس سادة ×1"). */
  itemName?: string;

  paymentMethod: PaymentMethod;

  // --- Cash scenario ---
  hasChange?: boolean;
  changeMethod?: ChangeMethod;
  /** Bank/wallet id the change was sent back from, when changeMethod is 'bank'. */
  changeBankId?: string;
  changeBankName?: string;
  changeAmount?: number;

  // --- Bank/wallet transfer scenario ---
  /** Bank/wallet id the customer paid through. */
  bankId?: string;
  bankName?: string;
  /** Name of the person who made the bank/wallet transfer (may differ from the customer). */
  senderName?: string;
  /** Mobile number of the person who made the bank/wallet transfer. */
  senderPhone?: string;
  transferredAmount?: number;
}

export const MOCK_TRANSFERS: Transfer[] = [
  {
    id: 'TRX-1001',
    customer: 'Ahmad Ali',
    date: '2026-07-01',
    status: 'completed',
    items: [{ itemId: 'ITM-03', name: 'بيتزا مارغريتا', quantity: 2, price: 20 }],
    amount: 40,
    itemName: 'بيتزا مارغريتا ×2',
    paymentMethod: 'cash',
    hasChange: false,
  },
  {
    id: 'TRX-1002',
    customer: 'Sara Youssef',
    date: '2026-07-02',
    status: 'pending',
    items: [
      { itemId: 'ITM-18', name: 'كلزوني', quantity: 1, price: 30 },
      { itemId: 'ITM-27', name: 'مشروبات غازية باردة', quantity: 2, price: 5 },
    ],
    amount: 40,
    itemName: 'كلزوني ×1، مشروبات غازية باردة ×2',
    paymentMethod: 'cash',
    hasChange: true,
    changeMethod: 'bank',
    changeBankId: 'WLT-01',
    changeBankName: 'جوال باي',
    changeAmount: 10,
  },
  {
    id: 'TRX-1003',
    customer: 'Omar Khalid',
    date: '2026-07-03',
    status: 'completed',
    items: [{ itemId: 'ITM-21', name: 'فرشوحة بيت التميس', quantity: 3, price: 25 }],
    amount: 75,
    itemName: 'فرشوحة بيت التميس ×3',
    paymentMethod: 'bank',
    bankId: 'BNK-01',
    bankName: 'بنك فلسطين',
    senderName: 'Omar Khalid',
    transferredAmount: 75,
  },
  {
    id: 'TRX-1004',
    customer: 'Layla Hassan',
    date: '2026-07-04',
    status: 'failed',
    items: [{ itemId: 'ITM-19', name: 'كلزوني دبل جبنة', quantity: 1, price: 35 }],
    amount: 35,
    itemName: 'كلزوني دبل جبنة ×1',
    paymentMethod: 'bank',
    bankId: 'WLT-02',
    bankName: 'بال باي',
    senderName: 'Layla Hassan',
    transferredAmount: 35,
  },
  {
    id: 'TRX-1005',
    customer: 'Kareem Nabil',
    date: '2026-07-05',
    status: 'pending',
    items: [
      { itemId: 'ITM-01', name: 'بيتزا خضار', quantity: 2, price: 20 },
      { itemId: 'ITM-22', name: 'شيبس', quantity: 2, price: 8 },
    ],
    amount: 56,
    itemName: 'بيتزا خضار ×2، شيبس ×2',
    paymentMethod: 'cash',
    hasChange: true,
    changeMethod: 'cash',
    changeAmount: 4,
  },
];
