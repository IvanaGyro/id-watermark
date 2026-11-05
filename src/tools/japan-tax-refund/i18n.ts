import { defineToolI18n } from '../../i18n/tool';

interface Currency {
  code: string;
  name: string;
}

export interface Strings {
  receiptsTitle: string;
  modeLabel: string;
  modeGross: string;
  modeNet: string;
  storeLabel: string;
  storePlaceholder: string;
  dateLabel: string;
  stdLabel: string;
  stdHint: string;
  foodLabel: string;
  foodHint: string;
  remove: string;
  addReceipt: string;
  clearAll: string;
  counterHint: string;
  tripTitle: string;
  departureLabel: string;
  departureHint: string;
  feeLabel: string;
  feeHint: string;
  currencyLabel: string;
  currencies: Currency[];
  resultLabel: string;
  statEligible: string;
  statRefund: string;
  statFee: string;
  statDeadline: string;
  tableHead: [string, string, string, string];
  checkTitle: string;
  checks: string[];
  /** Text around the required "Rates By Exchange Rate API" link. */
  rateBefore: string;
  rateAfter: string;
  client: {
    prefKey: string;
    defaultCurrency: string;
    /** {n} */
    receiptName: string;
    /** {n} */
    removeAria: string;
    confirmClear: string;
    /** {n} formatted yen */
    yen: string;
    /** {amount} {code} */
    approx: string;
    /** {n} receipts that qualify, {total} filled */
    eligible: string;
    emptyResult: string;
    /** {yen} refund before fee, {fee} fee */
    afterFee: string;
    noRate: string;
    /** {rate} {code} {time} */
    rateLine: string;
    /** {time} */
    rateCached: string;
    status: {
      ok: string;
      below: string;
      old: string;
      expired: string;
      departBefore: string;
      badAmount: string;
      badDate: string;
      empty: string;
    };
    /** Space between two sentences: '' in Chinese, ' ' in English. */
    sentenceGap: string;
    /** {short} yen before tax still missing */
    belowDetail: string;
    /** {topUp} more tax-included 10% goods */
    topUpGross: string;
    /** {topUp} more before-tax 10% goods */
    topUpNet: string;
    oldDetail: string;
    /** {date} {days} days left from today */
    deadline: string;
    /** {date} */
    deadlinePassed: string;
    /** {date} */
    expiredDetail: string;
    departBeforeDetail: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    receiptsTitle: '收據',
    modeLabel: '輸入的金額是',
    modeGross: '含稅（標價）',
    modeNet: '稅前',
    storeLabel: '店名（選填）',
    storePlaceholder: '例：唐吉訶德 道頓堀店',
    dateLabel: '購買日期',
    stdLabel: '一般商品（10%）',
    stdHint: '藥妝、電器、衣服、酒',
    foodLabel: '食品飲料（8%）',
    foodHint: '零食、伴手禮、飲料，不含酒',
    remove: '刪除',
    addReceipt: '新增收據',
    clearAll: '全部清除',
    counterHint:
      '一張收據填一次結帳的金額。百貨公司或購物中心的免稅櫃台合併辦理時，同一天在各店買的可以合算，填成同一張收據即可。',
    tripTitle: '出境與退款',
    departureLabel: '出境日期（選填）',
    departureHint: '填了會檢查每張收據有沒有超過 90 天期限。',
    feeLabel: '退款手續費（%）',
    feeHint: '政府不收費；店家委託的退款業者可能收手續費，比例各店不同，結帳時問店家。',
    currencyLabel: '換算幣別',
    currencies: [
      { code: 'TWD', name: '新台幣' },
      { code: 'HKD', name: '港幣' },
      { code: 'MOP', name: '澳門幣' },
      { code: 'CNY', name: '人民幣' },
      { code: 'USD', name: '美元' },
      { code: 'SGD', name: '新加坡幣' },
      { code: 'MYR', name: '馬來西亞令吉' },
      { code: 'KRW', name: '韓元' },
    ],
    resultLabel: '預估退稅（扣除手續費後）',
    statEligible: '可退收據',
    statRefund: '退稅合計',
    statFee: '手續費',
    statDeadline: '最早期限',
    tableHead: ['收據', '稅前合計', '退稅', '狀態'],
    checkTitle: '出境前檢查',
    checks: [
      '到機場先做海關確認（KIOSK 或 Visit Japan Web），再託運行李；託運後不能補辦。',
      '同一張收據的商品要全部帶在身上，少一件整張收據都不退。',
      '食品、化妝品等消耗品在日本開封用掉就不能退，會用掉的東西分開結帳。',
      '郵寄回國的商品不退；稅前單價 100 萬日圓以上的商品，海關可能要看鑑定書或保證書。',
    ],
    rateBefore: '退稅金額為估算，實際以店家與退款業者為準。匯率為國際市場中價（',
    rateAfter: '），信用卡或現金入帳的匯率會不同。',
    client: {
      prefKey: 'japan-tax-refund',
      defaultCurrency: 'TWD',
      receiptName: '收據 {n}',
      removeAria: '刪除收據 {n}',
      confirmClear: '再按一次清除',
      yen: '{n} 日圓',
      approx: '約 {amount} {code}',
      eligible: '{n} / {total} 張',
      emptyResult: '輸入收據金額後，這裡會顯示能退多少。',
      afterFee: '退稅 {yen}，扣手續費 {fee}',
      noRate: '目前取不到匯率，只顯示日圓金額。',
      rateLine: '1 日圓 ≈ {rate} {code}（{time} 更新）',
      rateCached: '離線中，使用 {time} 的匯率',
      status: {
        ok: '可退稅',
        below: '未達門檻',
        old: '舊制',
        expired: '超過期限',
        departBefore: '日期有誤',
        badAmount: '金額有誤',
        badDate: '缺購買日期',
        empty: '尚未輸入',
      },
      sentenceGap: '',
      belowDetail: '稅前還差 {short}，同店同日稅前要滿 5,000 日圓。',
      topUpGross: '同一張收據再買含稅 {topUp}的一般商品就能退。',
      topUpNet: '同一張收據再買稅前 {topUp}的一般商品就能退。',
      oldDetail: '10/31 以前買的適用舊制，結帳時已經免稅，不會再退；出境時一樣要帶著給海關看。',
      deadline: '海關確認期限：{date}（還有 {days} 天）',
      deadlinePassed: '海關確認期限 {date} 已過',
      expiredDetail: '出境日超過期限 {date}，這張收據拿不到退稅。',
      departBeforeDetail: '出境日期早於購買日期，請檢查日期。',
    },
  },
  en: {
    receiptsTitle: 'Receipts',
    modeLabel: 'Amounts you enter are',
    modeGross: 'Tax included (price tag)',
    modeNet: 'Before tax',
    storeLabel: 'Store (optional)',
    storePlaceholder: 'e.g. Don Quijote Dotonbori',
    dateLabel: 'Purchase date',
    stdLabel: 'General goods (10%)',
    stdHint: 'Cosmetics, electronics, clothes, alcohol',
    foodLabel: 'Food and drink (8%)',
    foodHint: 'Snacks, souvenirs, drinks; not alcohol',
    remove: 'Remove',
    addReceipt: 'Add receipt',
    clearAll: 'Clear all',
    counterHint:
      'Enter one checkout per receipt. At a department store or mall tax-free counter that handles several shops, same-day purchases can be added up, so enter them as one receipt.',
    tripTitle: 'Departure and refund',
    departureLabel: 'Departure date (optional)',
    departureHint: 'Checks each receipt against the 90-day deadline.',
    feeLabel: 'Refund fee (%)',
    feeHint: 'The government charges nothing, but the refund agent a store uses may take a fee. Ask at checkout.',
    currencyLabel: 'Show in',
    currencies: [
      { code: 'USD', name: 'US dollar' },
      { code: 'GBP', name: 'British pound' },
      { code: 'EUR', name: 'Euro' },
      { code: 'AUD', name: 'Australian dollar' },
      { code: 'CAD', name: 'Canadian dollar' },
      { code: 'NZD', name: 'New Zealand dollar' },
      { code: 'SGD', name: 'Singapore dollar' },
      { code: 'HKD', name: 'Hong Kong dollar' },
      { code: 'KRW', name: 'Korean won' },
      { code: 'CNY', name: 'Chinese yuan' },
      { code: 'TWD', name: 'New Taiwan dollar' },
      { code: 'THB', name: 'Thai baht' },
      { code: 'PHP', name: 'Philippine peso' },
      { code: 'MYR', name: 'Malaysian ringgit' },
      { code: 'INR', name: 'Indian rupee' },
    ],
    resultLabel: 'Estimated refund (after fee)',
    statEligible: 'Receipts that qualify',
    statRefund: 'Total refund',
    statFee: 'Fee',
    statDeadline: 'First deadline',
    tableHead: ['Receipt', 'Before tax', 'Refund', 'Status'],
    checkTitle: 'Before you fly',
    checks: [
      'At the airport, get the customs check (kiosk or Visit Japan Web) before you check in bags. It cannot be done after.',
      'Carry every item on a receipt. If one is missing, nothing on that receipt is refunded.',
      'Food, cosmetics and other consumables opened or used in Japan lose the refund, so buy those on a separate receipt.',
      'Goods mailed home are not refunded. For items of 1,000,000 yen or more before tax, customs may ask for an appraisal or warranty.',
    ],
    rateBefore: 'Refunds are estimates; the store and its refund agent decide the final amount. Mid-market rate (',
    rateAfter: '); your card or cash payout will use a different rate.',
    client: {
      prefKey: 'japan-tax-refund:en',
      defaultCurrency: 'USD',
      receiptName: 'Receipt {n}',
      removeAria: 'Remove receipt {n}',
      confirmClear: 'Tap again to clear',
      yen: '¥{n}',
      approx: '≈ {amount} {code}',
      eligible: '{n} of {total}',
      emptyResult: 'Enter receipt amounts to see your refund here.',
      afterFee: 'Refund {yen}, fee {fee}',
      noRate: 'Exchange rates are unavailable right now, so only yen is shown.',
      rateLine: '¥1 ≈ {rate} {code} (updated {time})',
      rateCached: 'Offline: using rates from {time}',
      status: {
        ok: 'Refund',
        below: 'Below minimum',
        old: 'Old system',
        expired: 'Too late',
        departBefore: 'Check dates',
        badAmount: 'Check amount',
        badDate: 'Add date',
        empty: 'Not filled in',
      },
      sentenceGap: ' ',
      belowDetail: '{short} short before tax. One store, one day needs ¥5,000 before tax.',
      topUpGross: 'Add {topUp} of general goods (tax included) to this receipt to qualify.',
      topUpNet: 'Add {topUp} of general goods (before tax) to this receipt to qualify.',
      oldDetail:
        'Bought on or before Oct 31, 2026: the old system applies, so it was tax-free at the till and there is nothing to refund. Customs still checks the goods when you leave.',
      deadline: 'Customs check deadline: {date} ({days} days left)',
      deadlinePassed: 'The customs check deadline ({date}) has passed',
      expiredDetail: 'You leave after the {date} deadline, so this receipt gets no refund.',
      departBeforeDetail: 'The departure date is before the purchase date.',
    },
  },
});
