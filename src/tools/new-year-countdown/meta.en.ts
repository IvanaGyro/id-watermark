import { defineTool } from '../types';

export default defineTool({
  slug: 'new-year-countdown',
  name: 'New Year Countdown 2027',
  seoTitle: 'New Year Countdown 2027: Live Timer to Midnight in Your Time Zone',
  description:
    'Live New Year countdown to midnight on January 1, 2027 in your own time zone. Synced to an accurate clock, with a full screen mode and a giant final 60 seconds.',
  category: 'time',
  icon: 'PartyPopper',
  keywords: [
    'new year countdown',
    'new year countdown 2027',
    'countdown to new year',
    'countdown to 2027',
    'new years eve countdown',
    'new year countdown clock',
    'new year countdown timer',
    'how many days until new year',
    'days until 2027',
    'new year countdown full screen',
    'new years eve countdown for tv',
    'ball drop countdown',
    'lunar new year 2027',
    'when is lunar new year 2027',
  ],
  intro:
    'A live countdown to midnight on January 1, 2027 in your own time zone. It checks your clock against an accurate time server, switches to one huge number for the last minute, and fills your TV in full screen mode.',
  howTo: [
    'Open the page and the countdown starts right away, showing the days, hours, minutes and seconds left until midnight where you are.',
    'To put it on a TV or projector, press “Full screen”. Press Esc to leave full screen.',
    'Tick “Beep for the last 10 seconds” and tap anywhere on the page once so your browser allows sound.',
    'After midnight the page shows a Happy New Year screen for all of January 1, then starts counting to the next New Year on its own.',
    'Below the timer you will also find countdowns to New Year’s Eve and to Lunar New Year.',
  ],
  sections: [
    {
      heading: 'Counting down in your own time zone',
      body: [
        'The countdown always runs to midnight in the time zone your device is set to, so it works wherever you are: New York, Chicago, Denver, Los Angeles, Honolulu, London or Sydney. The line under the timer shows which zone it is using.',
        'Want to ring in the New Year with friends or family elsewhere? Change the time zone in your device settings and reload, or use our time zone converter to see when midnight arrives in their city. For example, midnight in New York is 9:00 p.m. on December 31 in Los Angeles and 5:00 a.m. on January 1 in London.',
      ],
    },
    {
      heading: 'Why this countdown stays accurate',
      body: [
        'Most countdown pages simply read your phone or computer clock. If that clock is a few seconds off, your “3, 2, 1” will not match the fireworks. When this page opens it measures the difference between your device and an accurate server clock and corrects the countdown, so zero lands on the real midnight.',
        'Live TV and streams usually run a few seconds to more than ten seconds behind real time. If you are watching the Times Square ball drop on a stream, the ball may reach the bottom a little after this page hits zero.',
      ],
    },
    {
      heading: 'Tips for a New Year’s Eve party',
      body: [
        'Connect a laptop to the TV or projector, open the page about ten minutes before midnight so it finishes syncing, and switch to full screen. In the last minute the screen shows a single giant number that is easy to read from across the room.',
        'Turn off the screen saver and sleep mode, plug in the power cable, and turn on Do Not Disturb so a notification does not cover the countdown at the big moment.',
      ],
    },
    {
      heading: 'New Year’s Day 2027 and Lunar New Year',
      body: [
        'New Year’s Eve 2026 falls on a Thursday, so New Year’s Day, January 1, 2027, is a Friday and a federal holiday, giving many people a three-day weekend.',
        'Lunar New Year, celebrated across China, Korea, Vietnam and Asian communities worldwide, follows the lunar calendar and lands between January 21 and February 20. In 2027 it falls on Saturday, February 6, starting the Year of the Goat. The card under the timer counts down to it in your time zone.',
      ],
    },
  ],
  faq: [
    {
      q: 'How many days until New Year 2027?',
      a: 'The big numbers at the top show the exact days, hours, minutes and seconds left until midnight on January 1, 2027 in your time zone, updated live.',
    },
    {
      q: 'Which time zone does the countdown use?',
      a: 'The time zone your device is set to. The zone name is shown under the timer, for example Eastern Standard Time. Change your device setting if you want to count down with another city.',
    },
    {
      q: 'Where does the New Year arrive first and last?',
      a: 'The first inhabited place is Kiritimati (Christmas Island) in Kiribati, on UTC+14. The last is American Samoa, on UTC−11, which reaches midnight 25 hours later.',
    },
    {
      q: 'Will it still work after 2027 begins?',
      a: 'Yes. The page shows Happy New Year throughout January 1 and then automatically counts down to the next New Year, with no need to reload.',
    },
    {
      q: 'Why didn’t the beep play?',
      a: 'Browsers only allow sound after you interact with the page. Tick the beep option, then tap or click anywhere on the page once, and make sure your device is not muted.',
    },
    {
      q: 'When is Lunar New Year 2027?',
      a: 'Saturday, February 6, 2027, which begins the Year of the Goat. Lunar New Year’s Eve is Friday, February 5.',
    },
  ],
  related: ['timezone-converter', 'countdown-timer', 'stopwatch', 'life-in-weeks', 'zodiac-finder'],
  priority: 88,
  updated: '2026-10-29',
});
