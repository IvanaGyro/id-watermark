import { defineTool } from '../types';

export default defineTool({
  slug: 'gift-exchange',
  name: 'Secret Santa Generator',
  seoTitle: 'Secret Santa Generator: Free Name Draw With Private Links',
  description:
    'Free Secret Santa generator with no sign-up. Nobody draws themselves, couples can be kept apart, and everyone gets a private scratch-off link or draws live.',
  category: 'generator',
  icon: 'Gift',
  keywords: [
    'secret santa generator',
    'secret santa name draw',
    'secret santa online',
    'gift exchange generator',
    'draw names online',
    'free secret santa no sign up',
    'secret santa exclusions',
    'office gift exchange',
  ],
  intro:
    'Enter a list of names and draw a Secret Santa where nobody gets themselves. Send private links or draw live in the room, with no sign-up.',
  howTo: [
    'Type names under “Participants”, one per line. You need at least 3 people, and “Use sample names” lets you try it first.',
    'Under “How do you want to draw?”, choose “Send private links”, “Pass the phone” or “Reveal on the big screen”. Open the optional sections to keep couples apart or add a budget and date.',
    'Press “Start the draw”. For private links, send each person their own link. They unwrap the gift box and scratch the card to see who they’re buying for.',
    'For a live draw, the person whose turn it is picks a gift box and opens it. Skip anyone who has stepped out. When everyone is done, you can reveal and copy the full list.',
  ],
  sections: [
    {
      heading: 'Which way of drawing should you use?',
      body: [
        '“Send private links” suits groups that haven’t met yet: coworkers, remote friends or family spread across cities. Each person opens a link only they should see, so everyone has time to shop. The screen never shows who drew whom, which means the organizer can play too.',
        '“Pass the phone” suits a group already in the room. The screen covers itself before the phone moves on, so each person sees only their own match. “Reveal on the big screen” is for exchange day: everyone brings a wrapped gift, and the whole room watches who gets whose. Full screen works well on a TV or projector.',
      ],
    },
    {
      heading: 'Why drawing names from a hat goes wrong',
      body: [
        'With a hat, somebody draws their own name more often than you’d guess. In a group of any real size, a random draw leaves nobody with themselves only about 37% of the time, so roughly two out of three rounds need a redo. Draw one at a time and the last person can be left holding their own name.',
        'This tool shuffles with the browser’s cryptographic random generator, crypto.getRandomValues(), and reshuffles the whole list until every rule holds. That gives every valid result the same chance. Four people have 9 valid results; eight people have 14,833. The result is set when the draw starts, so the gift box you pick is how it’s revealed, not what changes it.',
        'Keeping people apart works the same way. If you add so many pairs that no valid result exists, the tool tells you right away instead of getting stuck halfway.',
      ],
    },
    {
      heading: 'Where the names go',
      body: [
        'There are no accounts and no database. The list and the results stay in this browser, and each link holds only its owner’s name, result and event details. The part of a link after “#” isn’t sent to our server, and the result is removed from the address bar once the link opens.',
        'A link is encoded, not encrypted. Anyone who has it can open it, and someone technical could decode it, so send links directly and keep addresses and phone numbers out of the note. Without a server, the tool also can’t tell you who has opened their link.',
      ],
    },
  ],
  faq: [
    {
      q: 'Can someone draw their own name?',
      a: 'No. The tool reshuffles until nobody has themselves, and every valid result has the same chance.',
    },
    {
      q: 'Can I stop couples from drawing each other?',
      a: 'Yes. Open “Anyone who shouldn’t draw each other?”, pick two people and press “Keep apart”. You can add as many pairs as a valid draw allows.',
    },
    {
      q: 'Can the organizer take part without seeing the results?',
      a: 'Yes. In “Send private links” the screen shows only names and share buttons. As long as you don’t open someone else’s link or the “See all results” panel, you find out your match the same way as everyone else.',
    },
    {
      q: 'Can I see who has opened their link?',
      a: 'No. There’s no server to record it. The check mark only means you copied or shared that person’s link.',
    },
    {
      q: 'What if someone joins after the links went out?',
      a: 'Draw again, since anyone’s match could change. Old links still open but no longer count, so send the new ones to everyone.',
    },
    {
      q: 'Do people need an account or an app?',
      a: 'No. It runs in any phone or computer browser, and people who receive a link just open it and scratch.',
    },
  ],
  related: ['random-picker', 'scratch-card', 'spin-wheel', 'split-bill', 'ichiban-kuji'],
  priority: 85,
  updated: '2026-11-09',
});
