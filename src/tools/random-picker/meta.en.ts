import { defineTool } from '../types';

export default defineTool({
  slug: 'random-picker',
  name: 'Random Name Picker',
  seoTitle: 'Random Name Picker: Pick Winners, Make Teams, Shuffle a List',
  description:
    'Paste a list of names to pick a random winner, split a class into fair random teams or shuffle the order. Free, no sign-up, unbiased crypto randomness.',
  category: 'generator',
  icon: 'Shuffle',
  keywords: [
    'random name picker',
    'random name generator from list',
    'pick a random name',
    'random team generator',
    'random group generator',
    'random list randomizer',
    'shuffle list',
    'random order generator',
    'giveaway picker',
    'raffle picker',
    'random winner picker',
    'random student picker',
    'name picker for teachers',
    'pick names out of a hat',
  ],
  intro:
    'Paste a list of names and draw a fair winner, split everyone into random teams, or put the whole list in random order. Your list stays in your browser.',
  howTo: [
    'Type or paste names into “Names or items”, one per line. Leave “Ignore duplicate entries” on so nobody gets two chances.',
    'Choose a mode: “Pick winners” draws a set number of entries, “Make teams” splits the list evenly, and “Random order” shuffles everyone.',
    'For winners, set “How many to pick” and tick “Remove winners from the list” for multi-round drawings. For teams, split by “Number of teams” or “People per team”.',
    'Press “Pick a winner” (or “Make teams” / “Shuffle order”), then “Copy results” to paste the outcome into an email, Slack or Google Classroom.',
  ],
  sections: [
    {
      heading: 'Is the draw really random?',
      body: [
        'Every draw uses crypto.getRandomValues(), the browser’s cryptographically secure random number generator, rather than the more predictable Math.random(). When you pick several winners at once, the tool runs a partial Fisher–Yates shuffle, so every possible set of winners is equally likely and no name can come up twice in the same draw.',
        'Turning a random number into a list position with a simple remainder slightly favors the names at the top of the list, an effect called modulo bias. This picker uses rejection sampling to remove it, so a 37-person list gives each person exactly a 1 in 37 chance. The rolling animation is only for show: the winner is decided the moment you press the button.',
      ],
    },
    {
      heading: 'How random teams are made',
      body: [
        'The list is shuffled first and then dealt out one by one, like cards, so team sizes never differ by more than one. Split 23 students into 5 teams and you get three teams of 5 and two teams of 4. Which teams get the extra person is random too, so it isn’t always Team 1.',
        'If you choose “People per team”, the tool works out how many teams you need: 10 people in teams of 3 makes 4 teams of 3, 3, 2 and 2, instead of leaving one person on their own. Copy results gives one line per team, for example “Team 1 (3): Alex, Jordan, Sam”, ready to paste into a class announcement or a group chat.',
      ],
    },
    {
      heading: 'Ideas for teachers, giveaways and teams',
      body: [
        'Teachers use it to cold-call students fairly, set a presentation order, or form lab partners and project groups in seconds. The list is saved on your device, so your class roster is there next period; press Clear and paste a new roster for another class.',
        'For an Instagram, YouTube or Discord giveaway, paste the usernames of eligible entrants, turn on duplicate removal so repeat comments count once, and screen-record the draw for transparency. For an office raffle with several prizes, tick “Remove winners from the list” and draw from the smallest prize up to the grand prize, so nobody wins twice.',
      ],
    },
    {
      heading: 'Tips for a drawing everyone trusts',
      body: [
        'Share the full list before you draw so people can check their name is on it, decide the number of winners in advance, and draw on a shared screen or a projector. Copy the results right away and post them along with the time of the draw.',
        'Check your local rules for prize promotions: in the US, sweepstakes generally need official rules and a free way to enter. If you need a random number instead of a name, such as a ticket number, use the random number generator; for a more visual draw at a party or stream, try the spin wheel.',
      ],
    },
  ],
  faq: [
    {
      q: 'Can the random name picker be rigged?',
      a: 'No. Results come from your browser’s cryptographically secure random number generator, every draw is independent, and there are no hidden weights. Each entry on the list has the same chance.',
    },
    {
      q: 'Can the same name be picked twice?',
      a: 'Not within one draw. If a name appears on the list twice, it counts as two entries unless “Ignore duplicate entries” is turned on. Use “Remove winners from the list” to keep previous winners out of later rounds.',
    },
    {
      q: 'How do I split a class into random groups?',
      a: 'Paste the class list, choose “Make teams”, then set either the number of teams or the number of people per team. Teams are balanced so sizes differ by at most one.',
    },
    {
      q: 'How many names can I add?',
      a: 'Up to 10,000 entries, which covers classrooms, office raffles and most social media giveaways.',
    },
    {
      q: 'Can I paste names from Excel or Google Sheets?',
      a: 'Yes. Copy a single column and paste it into the box; each cell becomes one line, and blank rows are ignored.',
    },
    {
      q: 'Is my list uploaded anywhere?',
      a: 'No. Everything runs in your browser. The list and settings are saved only on your device so they are there next time, and Clear removes them.',
    },
  ],
  related: ['spin-wheel', 'ichiban-kuji', 'random-number', 'countdown-timer', 'scratch-card', 'password-generator'],
  priority: 70,
  updated: '2026-10-29',
});
