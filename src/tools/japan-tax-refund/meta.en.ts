import { defineTool } from '../types';

export default defineTool({
  slug: 'japan-tax-refund',
  name: 'Japan Tax Refund Calculator',
  seoTitle: 'Japan Tax Refund Calculator: ¥5,000 Minimum and 90-Day Deadline',
  description:
    'Work out your Japan tax-free shopping refund under the new system from November 2026: enter each receipt, check the ¥5,000 minimum and 90-day deadline, and see it in your currency.',
  category: 'calc',
  icon: 'ReceiptJapaneseYen',
  keywords: [
    'japan tax refund calculator',
    'japan tax free calculator',
    'japan tax refund',
    'japan tax free minimum purchase',
    'japan tax free 5000 yen',
    'japan tax refund new system 2026',
    'japan consumption tax refund tourist',
    'how much tax refund in japan',
  ],
  intro:
    'Enter what you spent at each store in Japan and see how much consumption tax you get back under the refund system that started in November 2026, which receipts fall short of the ¥5,000 minimum, and the customs deadline for each.',
  howTo: [
    'Under "Receipts", enter the "Purchase date" and the amounts for "General goods (10%)" and "Food and drink (8%)". Price tags in Japan include tax, so keep "Tax included (price tag)" selected.',
    'Use "Add receipt" for each separate checkout. The store name is optional.',
    'Under "Departure and refund", enter your departure date and any refund fee, and pick the currency to show.',
    'The summary shows your estimated refund after the fee, the status of each receipt and the first customs deadline. Receipts under the minimum show how much more you would need to buy.',
  ],
  sections: [
    {
      heading: 'How the new refund system works',
      body: [
        "Since 1 November 2026, Japan's tax-free shopping for tourists uses a refund method. You pay the full tax-inclusive price at the store. When you leave Japan, customs confirms at the airport or seaport that you are taking the goods with you, and the store, or the refund company it uses, then pays back the consumption tax. Showing your passport to pay the tax-free price at the till is no longer possible.",
        'What counts is the purchase date, not the departure date. Goods bought on or before 31 October 2026 follow the old rules: they were already tax-free at the till, so there is nothing to refund. The new system also drops the separate counting of general goods and consumables, the ¥500,000 cap on consumables and the sealed packaging for consumables.',
        'Get the customs check before you check in your bags, at a tax-free kiosk in the departure lobby or, at some airports, online through Visit Japan Web. Once your bags are checked in, it is too late.',
      ],
    },
    {
      heading: 'How much tax you get back',
      body: [
        'The refund is the consumption tax inside the price, not 10% of the price. General goods are taxed at 10%, so the refund is the tax-included price × 10/110. Food and non-alcoholic drinks are taxed at 8%, so the refund is the price × 8/108.',
        'For example, cosmetics for ¥11,000 including tax are ¥10,000 before tax and get ¥1,000 back. Snacks for ¥5,400 are ¥5,000 before tax and get ¥400 back. A receipt with ¥3,300 of general goods and ¥2,160 of food comes to ¥3,000 + ¥2,000 = ¥5,000 before tax, just enough to qualify, and refunds ¥300 + ¥160 = ¥460.',
        "The government charges no fee, but most stores hand refunds to a refund agent. The Japan Tourism Agency's FAQ for tax-free shops says there is no rule on whether the traveler or the store pays that fee, and that travelers usually pay it in other countries. Enter the fee percentage here to see what reaches you.",
      ],
    },
    {
      heading: 'The ¥5,000 minimum and the 90-day deadline',
      body: [
        'You need ¥5,000 or more before tax at one store on one day, with general goods and food added together. That is ¥5,500 including tax for general goods only, or ¥5,400 for food only. A receipt with ¥3,300 of general goods and ¥1,080 of food is ¥4,000 before tax, so ¥1,100 more of general goods on the same checkout would make it qualify. Department stores and malls with a tax-free procedure counter that handles several shops can add up your same-day purchases there.',
        "Customs must confirm the goods within 90 days of the purchase date, counted from the next day. The National Tax Agency's example: goods bought on 1 November must be confirmed by 30 January. Customs checks each receipt as a whole, so if one item from a receipt is missing, the whole receipt loses its refund.",
      ],
    },
  ],
  faq: [
    {
      q: 'What is the minimum purchase for a tax refund in Japan?',
      a: '¥5,000 before tax at one store on one day, with general goods and food counted together. That is about ¥5,500 including tax for general goods or ¥5,400 for food.',
    },
    {
      q: 'Is the Japan tax refund 10%?',
      a: 'Not quite. For general goods you get the price × 10/110, about 9.09% of what you paid. For food and drink it is × 8/108, about 7.4%. A ¥11,000 purchase returns ¥1,000.',
    },
    {
      q: 'Are there fees with the new refund system?',
      a: "The government charges nothing, but the refund agent a store uses may take a fee, and there is no rule on who pays it. Travelers usually pay it in other countries. Ask the store at checkout, because rates differ.",
    },
    {
      q: 'I bought something in late October 2026. Do I get a refund?',
      a: 'No. Purchases on or before 31 October 2026 follow the old system, so they were already tax-free at the till. Customs still checks those goods when you leave.',
    },
    {
      q: 'How long do I have to leave Japan?',
      a: 'Customs must confirm the goods within 90 days, counted from the day after purchase. Goods bought on 15 December 2026 must be confirmed by 15 March 2027.',
    },
    {
      q: 'How accurate is this calculator?',
      a: 'It estimates the tax per receipt, rounding each rate down to the yen. The store and its refund agent decide the final refund, the fee and the exchange rate you receive.',
    },
  ],
  related: ['exchange-rate', 'sales-tax-calculator', 'discount-calculator', 'split-bill', 'timezone-converter'],
  blogPosts: [
    {
      title: 'Japan Tax-Free Shopping 2026: How the New Refund System Works, With Kiosk Locations at 8 Airports',
      url: 'https://blog.6yuwei.com/en/2026/11/05/japan-tax-free-refund-method-guide-2026/',
    },
  ],
  priority: 70,
  updated: '2026-11-06',
});
