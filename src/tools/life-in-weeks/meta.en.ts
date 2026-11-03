import { defineTool } from '../types';

export default defineTool({
  slug: 'life-in-weeks',
  name: 'Life in Weeks Calendar',
  seoTitle: 'Life in Weeks Calendar: How Many Weekends Do I Have Left?',
  description:
    'See your life as a grid of weeks. Enter your birthday to find how many weeks, weekends and summers are left, plus about how many more visits with family.',
  category: 'time',
  icon: 'Grid3x3',
  keywords: [
    'life in weeks',
    'life in weeks calendar',
    'how many weekends do i have left',
    'how many weeks do i have left',
    'how many summers do i have left',
    'life calendar',
    'weeks of my life',
    'my life in weeks',
    'life progress bar',
    'how many times will i see my parents',
  ],
  intro:
    'Your life as a grid of weeks: one row per year, one box per week. See how many weekends and summers are still ahead, and spend them on what matters to you.',
  howTo: [
    'Enter your date of birth and set an expected lifespan. It starts at 80 years, an assumption you can change, not a prediction.',
    'The percentage at the top ticks up live. In the grid below, each row is a year and each box is a week; the orange box is this week.',
    'Next to the grid (below it on a phone) you can see how many weekends, summers, New Year’s Days and birthdays are left. Tick “Color the grid by life stage” to shade childhood, school, work and retirement.',
    'Under “Time with the people you love”, enter someone’s age and how often you see them to estimate the visits still ahead.',
    'Press “Download PNG” for a poster of your grid, or “Copy share link” to send your settings to a friend.',
  ],
  sections: [
    {
      heading: 'How the weeks are counted',
      body: [
        'Each row starts on your birthday and stands for one year of your life: 52 boxes of 7 days. A year has 365 or 366 days, which is 52 weeks plus a day or two, so the last box of each row absorbs the extra days and every row starts on your birthday again. If you were born on February 29, March 1 counts as your birthday in common years.',
        'The weeks lived and weeks ahead shown above the grid use real days divided by 7, so they run slightly ahead of the boxes, by about one week every 5.6 years. Eighty years is roughly 29,220 days or 4,174 weeks, while the grid shows 80 × 52 = 4,160 boxes. The percentage runs from midnight on the day you were born to midnight on the birthday you set, down to the millisecond, which is why the decimals keep moving.',
      ],
    },
    {
      heading: 'Why seeing your life as a grid helps you prioritize',
      body: [
        '“Eighty years” sounds like plenty of time. About four thousand small boxes, some already filled in, make the same span concrete. Once time is visible, it is easier to tell which projects deserve many boxes and which ones you can let go.',
        'Things that come once a year are especially striking as numbers. At 36, with a lifespan setting of 80, you have a little over 40 summers ahead. Rather than a reason to worry, treat it as a nudge: the trip you keep postponing, the skill you want to learn and the people you want to see can go on the calendar sooner.',
      ],
    },
    {
      heading: 'How the visits estimate works',
      body: [
        'For each person, the tool applies the same lifespan setting to their age, takes whichever is shorter, their years left or yours, and multiplies it by how many times a year you see them. A parent who is 60 and whom you see 6 times a year comes to about 20 years and 120 visits with a setting of 80.',
        'It is a rough reminder, not a forecast. Life expectancy varies by country, sex and generation, and this tool uses no statistics; every number comes from what you enter. The simplest way to change the result is to see them more often: one more visit a year adds about 20 visits over 20 years.',
      ],
    },
  ],
  faq: [
    {
      q: 'How many weekends do I have left?',
      a: 'The tool counts the Saturdays from today until the birthday you set as your lifespan, including today if it is a Saturday. At 36 with a setting of 80, that is a little under 2,300 weekends.',
    },
    {
      q: 'What should I enter as my life expectancy?',
      a: 'Anything that feels right. The default of 80 is only a convenient assumption, not a prediction. Life expectancy varies with country, generation and health, so try 90 or 100 as well; everything updates instantly.',
    },
    {
      q: 'What does the orange box mean?',
      a: 'It is the week you are living now. Filled boxes before it are weeks you have lived, and lighter boxes after it are still ahead. Hover over or tap any box to see your age and the dates of that week.',
    },
    {
      q: 'What if I am already older than the lifespan I set?',
      a: 'The grid grows to include your current year, the extra rows are shown in green as bonus time, and the counters stop counting down. You can also raise the lifespan setting.',
    },
    {
      q: 'Is my date of birth uploaded?',
      a: 'No. Everything is calculated in your browser, and the PNG is made on your device. A share link stores your settings after the # in the address, a part that is never sent to the server, but anyone you send the link to can see it.',
    },
  ],
  related: ['age-calculator', 'date-diff', 'salary-per-second', 'compound-interest', 'new-year-countdown'],
  priority: 50,
  updated: '2026-11-04',
});
