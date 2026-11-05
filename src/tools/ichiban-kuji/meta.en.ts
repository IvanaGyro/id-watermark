import { defineTool } from '../types';

export default defineTool({
  slug: 'ichiban-kuji',
  name: 'Ichiban Kuji Simulator',
  seoTitle: 'Ichiban Kuji Simulator: Online Kuji Draw Board with Live Odds',
  description:
    'Free ichiban kuji simulator: set up prize tiers A to Last One, then open tickets on a numbered board or draw 10 at once. See prizes left, next-draw odds and the cost to buy out the board, plus a hash to prove fairness on stream.',
  category: 'generator',
  icon: 'Gift',
  keywords: [
    'ichiban kuji simulator',
    'ichiban kuji odds',
    'ichiban kuji calculator',
    'online kuji draw',
    'last one prize',
    'prize ticket board',
    'kuji lottery generator',
    'live stream prize draw',
  ],
  intro:
    'Set up your own A, B and C prizes plus a Last One prize, shuffle, and open tickets on the board one by one or ten at a time. The tool keeps track of what is left, your odds on the next draw and what it would cost to buy out the rest.',
  howTo: [
    'Open "Prize setup", pick a preset such as "Standard 80 tickets" or enter your own tiers, prizes and counts, optionally add a Last One prize and a price per draw, then tap "Apply and shuffle".',
    'Type a name under "Who is drawing" if you want, then tap any ticket on the board to open it, or use "Draw 1", "Draw 5" or "Draw 10" to pick at random.',
    '"Prizes left" shows how many of each tier remain and the chance of hitting it on the next draw; the "Odds calculator" tells you how likely you are to land a tier within a given number of draws.',
    'On a live stream, post the hash from "Fairness check" before the first draw and tap "Publish ticket list" when the board is empty; "Copy history" gives you a list of who won what.',
  ],
  sections: [
    {
      heading: 'What is ichiban kuji?',
      body: [
        'Ichiban kuji is a Japanese prize lottery. Each set has a fixed number of tickets, and every ticket wins something: Prize A is usually a large figure, followed by smaller prizes down to keychains and towels. Tickets are not put back, so the fewer that remain, the better your odds on any big prize still in the box. Whoever draws the final ticket also takes home the Last One prize, often a special color version of the top figure.',
        'Hobby shops, anime fans and streamers also run their own kuji-style draws, and people use the format for parties and office gift exchanges: everyone pays the same price and the gifts are split into tiers. This tool is a virtual ticket box. You decide how many tickets each tier gets, the browser shuffles them with a cryptographic random number generator, and from then on picking a numbered ticket or drawing at random works exactly like reaching into a real box.',
      ],
    },
    {
      heading: 'How to calculate ichiban kuji odds',
      body: [
        'Because tickets are drawn without replacement, the odds follow a hypergeometric distribution. In an 80-ticket set with one Prize A, your first draw has a 1 in 80 (1.25%) chance, and 10 draws give you exactly a 10 in 80 (12.5%) chance of landing it. With two Prize B tickets, 10 draws give 1 − (70 × 69) ÷ (80 × 79) ≈ 23.6%.',
        'Odds change as the board empties. If 40 of those 80 tickets are gone and Prize A is still there, the next draw is 1 in 40 (2.5%) and the next 10 draws together reach 25%. With R tickets left and k of the prize you want, you get the first one on draw (R + 1) ÷ (k + 1) on average: 40.5 draws for a single Prize A in a full 80-ticket set, 27 for two Prize B. In the worst case it takes R − k + 1 draws to guarantee one, so up to 79 draws for one of the two Prize B tickets.',
        'Buying out the board costs the remaining tickets times the price per draw, so a full 80-ticket set at $10 a draw is $800. Enter a price in the setup and the tool tracks what has been spent and what the rest would cost.',
      ],
    },
    {
      heading: 'Proving a streamed kuji draw is fair',
      body: [
        'The usual worry with online kuji is that the big prize was pulled before the stream started. This tool fixes the prize behind every ticket number when you shuffle and computes a SHA-256 hash of the whole ticket list. Post that hash before the first draw, for example in your chat or community post. When the board is empty, publish the ticket list: anyone can paste it into a hash generator and check that the result matches the hash you posted, which shows the list never changed.',
        'The list includes a random salt, so nobody can work out where Prize A is from the hash alone. Note what this does and does not prove: it shows the tickets were not swapped, but the host could still look at the list before drawing. For more trust, let viewers call out the ticket numbers, or use a physical box and record the whole draw.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is this an official Ichiban Kuji?',
      a: 'No. It is a free tool for simulating draws and running your own kuji-style prize draws. It is not affiliated with BANDAI SPIRITS or any official Ichiban Kuji campaign and does not sell prizes; you set the prizes, counts and prices yourself.',
    },
    {
      q: 'Is the draw really random?',
      a: 'Yes. When you shuffle, the board is ordered with a Fisher–Yates shuffle driven by the browser’s crypto.getRandomValues, so every arrangement is equally likely, and random draws use the same generator. The layout is fixed from the start, just like a real ticket box, so picking a number and drawing at random are equally fair.',
    },
    {
      q: 'What is the Last One prize?',
      a: 'It is a bonus for whoever draws the very last ticket of the set, often a special edition of the top prize. Turn it on in "Prize setup" and describe the prize; when the final ticket is drawn, the tool marks who won it.',
    },
    {
      q: 'Can I undo a mis-tap?',
      a: 'Yes. "Undo last draw" puts the most recent ticket back in the box with the same prize behind it. To start the set over, tap "Reshuffle" and confirm; the history is cleared and a new layout is made.',
    },
    {
      q: 'Will my board still be there if I close the page?',
      a: 'Yes. The layout, history and settings are saved in this browser, so you can reload or come back later and keep drawing. They do not sync to other devices and are deleted if you clear your browsing data. Nothing is uploaded to a server.',
    },
    {
      q: 'Can I use it on a live stream?',
      a: 'Yes. Use "Full screen" to show the board to viewers, enter each viewer’s name before they draw to get a per-player tally, and "Copy history" to paste the results into chat. The fairness hash lets viewers verify the ticket list afterwards.',
    },
  ],
  related: ['spin-wheel', 'random-picker', 'scratch-card', 'random-number', 'hash-generator', 'split-bill'],
  priority: 60,
  updated: '2026-11-05',
});
