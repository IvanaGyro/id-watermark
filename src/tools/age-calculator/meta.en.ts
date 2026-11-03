import { defineTool } from '../types';

export default defineTool({
  slug: 'age-calculator',
  name: 'Age Calculator',
  seoTitle: 'Age Calculator: Exact Age in Years, Months and Days',
  description:
    'Find your exact age in years, months and days from your date of birth, plus your age in weeks and days, a countdown to your next birthday and your zodiac sign.',
  category: 'time',
  icon: 'Cake',
  keywords: [
    'age calculator',
    'how old am i',
    'calculate age',
    'age calculator by date of birth',
    'exact age calculator',
    'age in years months and days',
    'chronological age calculator',
    'age in days',
    'age in weeks',
    'age in months',
    'days until my birthday',
    'birthday calculator',
    'what day was i born',
    'zodiac sign by birthday',
  ],
  intro:
    'Enter your date of birth to see exactly how old you are in years, months and days, plus your age in months, weeks and days and how long it is until your next birthday.',
  howTo: [
    'Choose your birth month and day, then type your birth year.',
    'Leave Age on this date set to today, or pick another date to see how old you were or will be then.',
    'Read your exact age in the result box: years, months and days.',
    'Below it, see your age in months, weeks and days, the countdown to your next birthday, your zodiac sign and the day of the week you were born.',
  ],
  sections: [
    {
      heading: 'How exact age is calculated',
      body: [
        'Your age goes up by one year on each birthday. To get the months and days, the calculator counts whole calendar months from your last birthday and then the days left over. Someone born on June 15, 1990 is 36 years, 4 months and 14 days old on October 29, 2026.',
        'Counting months by the calendar, rather than as 30-day blocks, matches how people and most official forms think about age. A month is complete when the same day number comes around again, so January 31 to February 28 is 28 days rather than one month.',
      ],
    },
    {
      heading: 'Age in months, weeks and days',
      body: [
        'Some situations call for age in a single unit. Pediatricians track babies in weeks and months, and milestones like “10,000 days old” are fun to celebrate. Using the same example, a person born on June 15, 1990 is 436 months, 1,897 weeks or 13,285 days old on October 29, 2026.',
        'If you need the number of days between any two dates rather than from a birthday, the days between dates calculator does that, including business days.',
      ],
    },
    {
      heading: 'Age requirements in the US',
      body: [
        'Many US rules depend on an exact age on a specific date. You can vote in federal elections at 18, buy alcohol at 21, and rent a car without a young driver fee from 25 at most agencies. For Social Security, full retirement age is 67 for anyone born in 1960 or later, and Medicare eligibility starts at 65.',
        'School enrollment often uses a cutoff date, such as turning 5 by September 1 to start kindergarten. Set Age on this date to the cutoff to check whether a child qualifies.',
      ],
    },
    {
      heading: 'Leap day birthdays',
      body: [
        'People born on February 29 only have a calendar birthday every four years. In common years, this calculator treats March 1 as the birthday, so someone born on February 29, 2004 turns 23 on Monday, March 1, 2027. Some states and organizations use February 28 instead; check the rule that applies if the exact day matters, such as for a driver’s license.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I calculate my exact age?',
      a: 'Subtract your birth year from the current year, then subtract one if your birthday hasn’t happened yet this year. For months and days, count whole months since your last birthday and the days after that. The calculator does all of this for you.',
    },
    {
      q: 'How old am I in days?',
      a: 'Enter your date of birth and look at Age in days. Someone born on January 1, 2000, for example, is 9,798 days old on October 29, 2026.',
    },
    {
      q: 'How many days until my birthday?',
      a: 'The Until your next birthday figure counts the days from the selected date to your next birthday and shows which day of the week it falls on. On your birthday it shows Today.',
    },
    {
      q: 'Can I calculate my age on a past or future date?',
      a: 'Yes. Change Age on this date to any date, for example a retirement date, a school cutoff date or the day a visa expires.',
    },
    {
      q: 'Which zodiac sign dates does the calculator use?',
      a: 'It uses common Western astrology ranges, such as Aries from March 21 to April 19. Dates on the edge of two signs can differ by a day between sources.',
    },
    {
      q: 'Is my birth date saved or sent anywhere?',
      a: 'No. Everything runs in your browser. Your last entry is remembered only on your own device so it is there next time.',
    },
  ],
  related: ['date-diff', 'countdown-timer', 'timezone-converter', 'life-in-weeks', 'birthday-moon', 'bmi-calculator'],
  priority: 65,
  updated: '2026-10-29',
});
