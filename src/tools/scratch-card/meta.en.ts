import { defineTool } from '../types';

export default defineTool({
  slug: 'scratch-card',
  name: 'Scratch Card Maker',
  seoTitle: 'Scratch Card Maker: Free Online Scratch-Off Reveal Messages',
  description:
    'Make a free online scratch card: hide a message under a gold or silver layer and send the link. Great for gender reveals, birthday surprises and proposals.',
  category: 'generator',
  icon: 'Ticket',
  keywords: [
    'online scratch card maker',
    'scratch card maker',
    'scratch off reveal message',
    'digital scratch off card',
    'gender reveal scratch card',
    'virtual scratch off',
    'scratch off card generator',
    'pregnancy announcement scratch off',
    'surprise message link',
  ],
  intro:
    'Hide a message under a scratch-off layer and send the link; they scratch it with a finger or mouse to see it. Made for confessions, birthday surprises, gender reveals and prize games, and nothing is uploaded.',
  howTo: [
    'Pick an idea under “Start from an idea”, such as Confession, Birthday or Gender reveal, then change the “Hidden message” to your own words. Line breaks are fine.',
    'Add a card title and a “From” name if you like, choose a scratch layer and a card color, and set how much must be scratched before the card reveals itself. Try scratching the preview card.',
    'For a prize game, switch “Under the scratch layer” to “A random prize” and list one result per line. A new result is drawn every time the link is opened.',
    'Tap “Copy link” and paste it into a text or chat, use “Share” on a phone, or let them scan the QR code. The card reveals itself once enough is scratched off, or when they tap “Reveal all”.',
  ],
  sections: [
    {
      heading: 'Scratch card ideas: confessions, birthdays and gender reveals',
      body: [
        'Confession: put “I really like you” under the hearts layer with a title like “I have something to tell you”. It buys a few seconds of suspense that a plain text never does, and you can leave the name blank to keep them guessing. Birthday surprise: hide where the present is, tonight’s restaurant, or a homemade coupon such as “Good for one breakfast in bed”.',
        'Gender reveal: choose a neutral silver or gold layer, set the card color to match the answer, keep the title neutral, and post the link in the family group chat so everyone scratches at once. Pregnancy announcements, proposals and other big news work the same way. You can also download the QR code and print it on a gift tag or a greeting card to hand over in person.',
      ],
    },
    {
      heading: 'How the prize draw works',
      body: [
        'Switch “Under the scratch layer” to “A random prize” and list up to 10 results, one per line. Each time the card opens, the page draws one with the browser’s cryptographic random number generator, crypto.getRandomValues(), so every line has the same chance. Listing a result twice doubles its odds: with 5 lines, 2 of them “Better luck next time”, that result comes up 40% of the time.',
        'Because the draw happens in the recipient’s browser, opening or reloading the link draws again, and different people each get their own result. That makes it a good office, classroom or party game, but not a fair way to run an official giveaway. For that, use the random name picker or the spin wheel in front of everyone and keep a record.',
      ],
    },
    {
      heading: 'Where the card is stored and who can read it',
      body: [
        'There is no account and no database. The title, sender and message are encoded into the part of the link after the “#”. Browsers never send that part to a server, so this site never receives your card, and link previews in iMessage, WhatsApp or Messenger only show the page title and image, not your message.',
        'Encoded is not encrypted, though. Anyone with the full link can open the card, including people it gets forwarded to, and someone technical could decode it without scratching, so keep passwords, addresses and other sensitive details out of it. A sent card cannot be edited; change it and send the new link. Your draft is kept only in this browser on this device.',
      ],
    },
  ],
  faq: [
    {
      q: 'Does the recipient need an app or an account?',
      a: 'No. The link opens in any phone or computer browser, iPhone and Android included, and the page does not scroll while they scratch the card.',
    },
    {
      q: 'Is my message uploaded or visible to anyone else?',
      a: 'It is not uploaded; it exists only inside the link. But anyone who has the link can open it, so send it only to the people you mean it for and keep sensitive details out of it.',
    },
    {
      q: 'Does a prize card show the same result every time?',
      a: 'No. A new result is drawn every time the link is opened or the page is reloaded. Use it for fun games, not for official giveaways.',
    },
    {
      q: 'Can I edit a card after sending it?',
      a: 'No. The content is the link itself, so an edited card gets a new link. Send the new one.',
    },
    {
      q: 'How much do they need to scratch?',
      a: 'By default the card reveals itself once 50% is scratched off, and you can set anything from 30% to 90%. They can also tap “Reveal all” to skip scratching.',
    },
    {
      q: 'The link is long. Will it break in a text message?',
      a: 'The link carries the card, so it is longer than usual, but messaging apps open it fine. If it does not work, part of it was probably cut off while copying; send it with the Share button or the QR code instead.',
    },
  ],
  related: ['spin-wheel', 'ichiban-kuji', 'random-picker', 'qr-code-generator', 'fancy-text', 'countdown-timer'],
  priority: 50,
  updated: '2026-11-04',
});
