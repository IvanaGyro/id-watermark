import { defineTool } from '../types';

export default defineTool({
  slug: 'spin-wheel',
  name: 'Spin the Wheel',
  seoTitle: 'Spin the Wheel: Free Random Wheel Picker with Custom Entries',
  description:
    'Make your own spinner wheel and spin to pick a random name, meal or prize. Set weighted odds, remove winners as you go and go full screen. Free, no sign-up.',
  category: 'generator',
  icon: 'LoaderPinwheel',
  keywords: [
    'spin the wheel',
    'wheel spinner',
    'spinner wheel',
    'random wheel',
    'wheel of names',
    'random name wheel',
    'decision wheel',
    'prize wheel',
    'custom wheel spinner',
    'wheel picker',
    'yes or no wheel',
    'what should i eat wheel',
    'food wheel',
    'truth or dare wheel',
    'wheel of fortune generator',
    'spin wheel for classroom',
  ],
  intro:
    'Type your entries, press Spin in the middle, and the wheel lands on a random result. Use it to pick a name in class, settle what to eat, or run a prize giveaway. Everything stays in your browser.',
  howTo: [
    'Pick one of the “Ready-made wheels” such as “What should I eat?”, “Yes or no” or “Wheel of names”, or type your own entries, one per line.',
    'To make an entry more likely, add “*” and a number after it, for example “Sticker*20”. Open “Odds for each entry” to check the exact chances.',
    'Press “Spin” in the center or tap the wheel. The pointer at the top shows the result. Choose “Fast”, “Normal” or “Slow” under “Spin speed”.',
    'To draw several different winners, tick “Remove each winner before the next spin”. Every result is added to “Results history”, which you can copy.',
  ],
  sections: [
    {
      heading: 'A fair spinner: the result is drawn first',
      body: [
        'Many online wheels let an animation slow down at a random rate and take whatever slice it stops on, so the result can depend on frame timing and device speed. This wheel works the other way around. The moment you press Spin, it draws the winning entry with crypto.getRandomValues(), the browser’s cryptographically secure random number generator, then calculates exactly how far to turn so the pointer stops inside that slice.',
        'The stopping point is also kept away from the lines between slices, so you never get a “was that on the line?” argument. The number of turns and the exact landing spot change every time, which makes it safe to use live in a classroom, on a stream or at a company party.',
      ],
    },
    {
      heading: 'How weighted entries and odds work',
      body: [
        'Add an asterisk and a number after an entry to set its weight: “Grand prize*1”, “Gift card*3”, “T-shirt*6”, “Sticker*20”, “Try again*10”. Each entry’s chance is its weight divided by the total of all weights, and slices are drawn in proportion, so what you see matches the real odds.',
        'In the built-in “Prize wheel (weighted)” the weights add up to 1 + 3 + 6 + 20 + 10 = 40. The grand prize has a 1 in 40 chance (2.5%), the gift card 7.5%, the T-shirt 15%, the sticker 50% and “Try again” 25%. An entry with no weight counts as 1, and a weight of 0 switches an entry off without deleting it.',
      ],
    },
    {
      heading: 'Popular ways to use a spinner wheel',
      body: [
        'Teachers use the wheel of names to call on students, choose who presents next or pick a reading partner; paste your roster once and it is saved for next time. The “Numbers 1–10” wheel works for seat numbers or picking a question.',
        'At home it settles “what’s for dinner?”, who does the dishes or what to do this weekend. Streamers and small businesses use a weighted prize wheel for giveaways, and friends use “Truth or dare” or “Yes or no” at parties. On a laptop connected to a TV or projector, press Full screen to make the wheel as large as possible.',
      ],
    },
    {
      heading: 'Drawing several winners, history and privacy',
      body: [
        'For a raffle with more than one prize, tick “Remove each winner before the next spin”. The winner stays on the wheel so everyone can see the result, and is removed just before the next spin. You can also press “Remove from wheel” under the result. Every spin is logged with the time in “Results history”, ready to copy into an announcement.',
        'Entries, the title and the history are stored only in your browser’s local storage. Nothing is uploaded and there is no account. For an official giveaway, spin on screen in front of your audience or record it, and keep the copied history as a record.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is this wheel spinner truly random?',
      a: 'Yes. Each spin draws its result with your browser’s cryptographically secure random number generator and then animates the wheel to land on it. There is no setting that forces a result; only the weights you add change the odds.',
    },
    {
      q: 'How do I make one option more likely to win?',
      a: 'Add “*” and a number after it. “Pizza*3” is three times as likely as an entry with weight 1. Open “Odds for each entry” to see each percentage.',
    },
    {
      q: 'Can I remove names after they are picked?',
      a: 'Yes. Tick “Remove each winner before the next spin”, or press “Remove from wheel” after a result. This is the easiest way to draw several winners without repeats.',
    },
    {
      q: 'How many entries can the wheel hold?',
      a: 'Up to 100 entries. With many entries the slices get thin and long labels are shortened; for very long lists, the random name picker is easier to read.',
    },
    {
      q: 'Will my wheel be saved?',
      a: 'Yes, in this browser. Your entries, title, settings and history are there next time you open the page. They are not kept in a private window or after you clear site data.',
    },
    {
      q: 'Does it work on a phone or a big screen?',
      a: 'Yes. Tap the center of the wheel on a phone or tablet, or press Full screen on a computer to project it. No app download is needed.',
    },
  ],
  related: ['random-picker', 'ichiban-kuji', 'random-number', 'countdown-timer', 'scratch-card', 'password-generator'],
  priority: 95,
  updated: '2026-10-29',
});
