import { defineTool } from '../types';

export default defineTool({
  slug: 'exchange-rate',
  name: 'Currency Converter',
  seoTitle: 'Currency Converter: Daily Exchange Rates for USD, EUR, GBP, MXN',
  description:
    'Free currency converter with daily mid-market exchange rates. Convert US dollars to euros, pounds, pesos, yen and 25+ currencies, with a quick conversion table.',
  category: 'finance',
  icon: 'ArrowLeftRight',
  keywords: [
    'currency converter',
    'exchange rate',
    'exchange rate calculator',
    'money converter',
    'usd to eur',
    'dollar to euro',
    'euro to dollar',
    'usd to gbp',
    'pound to dollar',
    'dollar to peso',
    'usd to mxn',
    'usd to cad',
    'dollar to yen',
    'usd to inr',
    'foreign currency converter',
    'mid-market exchange rate',
  ],
  intro:
    'Type an amount and pick two currencies to convert at today’s mid-market rate. A quick table shows common amounts, and a second table compares major currencies against the US dollar.',
  howTo: [
    'Enter the amount you want to convert in “Amount”.',
    'Choose the currency you have in “From” and the one you want in “To”. Use the swap button to reverse them.',
    'Read the converted amount and the rate in both directions. The quick conversion table lists common amounts such as 1, 10, 100 and 1,000.',
    'Your last currencies and amount are remembered, and saved rates are used if you lose your connection.',
  ],
  sections: [
    {
      heading: 'How currency conversion works',
      body: [
        'An exchange rate tells you how much of one currency you get for one unit of another. If 1 USD = 0.90 EUR, then $500 converts to 500 × 0.90 = €450. Going the other way you divide: €100 is 100 ÷ 0.90 ≈ $111.11.',
        'Rates between two non-dollar currencies, such as euros to yen, are cross rates. This converter derives every pair from one daily set of rates, so EUR to JPY is consistent with USD to EUR and USD to JPY. For currencies with small units, like the yen, won or dong, the quick table switches to amounts such as 1,000 and 10,000 so the numbers stay readable.',
      ],
    },
    {
      heading: 'Mid-market rate vs. the rate you actually get',
      body: [
        'The mid-market rate is the midpoint between the buy and sell prices that banks trade at with each other. It is the fairest benchmark, and it is what this tool shows. Almost nobody exchanges money at exactly that rate, though.',
        'Banks, airport exchange kiosks, card networks and transfer services all add a spread on top, and some also charge a fixed fee. A bank might sell you euros a few percent above the mid-market rate, and airport kiosks are often much worse. To see what a quote really costs, convert the same amount here and compare: the gap is the markup you are paying.',
      ],
    },
    {
      heading: 'Tips for spending money abroad',
      body: [
        'Credit cards usually give a rate close to the mid-market rate, but many US cards add a foreign transaction fee of up to 3%. Cards marketed for travel often have no foreign transaction fee, which makes them one of the cheapest ways to pay overseas.',
        'When a card terminal or ATM abroad offers to charge you in US dollars, decline and pay in the local currency. This offer is called dynamic currency conversion, and the rate it uses is typically much worse than your card network’s. For cash, a debit card at a local bank ATM is usually cheaper than exchanging dollars before you leave, but check your bank’s ATM and foreign transaction fees first.',
      ],
    },
  ],
  faq: [
    {
      q: 'What exchange rate does this converter use?',
      a: 'Daily mid-market reference rates from ExchangeRate-API. They are the midpoint between buy and sell prices, without the markup banks or card networks add.',
    },
    {
      q: 'How often are the rates updated?',
      a: 'Once a day. The time of the last update is shown under the result, in your own time zone. Rates are saved in your browser for a few hours so the page loads faster.',
    },
    {
      q: 'Why is my bank’s rate different?',
      a: 'Banks and exchange services add a spread to the mid-market rate and may also charge fees. The difference between their quote and the rate here is roughly what the exchange costs you.',
    },
    {
      q: 'Should I pay in dollars or the local currency when traveling?',
      a: 'Pay in the local currency. If a terminal offers to convert to US dollars on the spot, the rate it uses is usually worse than the one your card would apply.',
    },
    {
      q: 'Can I use it offline?',
      a: 'If the page has loaded rates before, it uses the most recently saved rates when you are offline and shows when they were last updated. The first visit needs a connection.',
    },
    {
      q: 'Is it accurate enough for wire transfers or invoices?',
      a: 'Use it as a reference. For a transfer or a contract, the rate that counts is the one your bank or payment service quotes at the moment you send the money.',
    },
  ],
  related: ['japan-tax-refund', 'percentage-calculator', 'unit-converter', 'split-bill', 'compound-interest', 'calculator'],
  priority: 96,
  updated: '2026-10-29',
});
