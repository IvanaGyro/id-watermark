import { defineTool } from '../types';

export default defineTool({
  slug: 'date-diff',
  name: 'Days Between Dates Calculator',
  seoTitle: 'Days Between Dates Calculator: Days, Weeks and Business Days',
  description:
    'Count the days between two dates, or add and subtract days from a date. See the result in years, months and days, weeks, business days and hours.',
  category: 'time',
  icon: 'CalendarRange',
  keywords: [
    'days between dates',
    'days between dates calculator',
    'date calculator',
    'date duration calculator',
    'how many days until',
    'how many days since',
    'day counter',
    'count days',
    'business days calculator',
    'add days to date',
    'subtract days from date',
    '90 days from today',
    'weeks between dates',
    'date difference calculator',
  ],
  intro:
    'Find out exactly how many days are between two dates, or which date falls a set number of days before or after another. Results include weeks, business days and a years-months-days breakdown.',
  howTo: [
    'Choose Days between dates, then pick a start date and an end date.',
    'Tick Include end date if both the first and last day should count, for example for a hotel stay or a leave request.',
    'Read the total in days, plus years, months and days, weeks, business days (Mon–Fri) and total hours.',
    'To find a deadline instead, switch to Add or subtract days, pick a start date, enter a number of days or tap a quick button, and choose After or Before.',
  ],
  sections: [
    {
      heading: 'How the day count works',
      body: [
        'By default the calculator counts the days from the start date up to, but not including, the end date. That is the answer to “how many days until” questions: from Thursday, October 29, 2026 to Thursday, December 31, 2026 is 63 days, or exactly 9 weeks.',
        'Some counts should include both ends. A project that runs from March 1 to March 31 lasts 31 days, not 30. Tick Include end date to add that extra day. The years, months and days breakdown uses calendar months, so January 15 to March 14 is 1 month and 27 days.',
      ],
    },
    {
      heading: 'Business days vs. calendar days',
      body: [
        'Many deadlines are set in business days: shipping estimates, bank transfers, “respond within 10 business days” letters. This calculator counts Monday through Friday and skips Saturdays and Sundays. In 2026 there are 261 weekdays.',
        'Federal holidays such as Thanksgiving, Christmas Day or the Fourth of July are not subtracted automatically, because which holidays apply depends on your employer, bank or state. Take one day off the business-day count for each holiday that falls on a weekday in your range.',
      ],
    },
    {
      heading: 'Adding and subtracting days',
      body: [
        'Use Add or subtract days to find a date a set number of days away. 90 days after October 29, 2026 is Wednesday, January 27, 2027, and 30 days after is Saturday, November 28, 2026. Quick buttons cover the most common periods: 7, 30, 90, 100, 180 and 365 days.',
        'This is handy for return windows, trial periods, visa stays (such as the 90-day limit under the Visa Waiver Program), notice periods and medication schedules. Count backwards with Before to find when a 30-day period started.',
      ],
    },
    {
      heading: 'Leap years and time zones',
      body: [
        'Leap years are handled automatically: February has 29 days in 2028, so any range that crosses February 29, 2028 is one day longer. Years divisible by 100 are not leap years unless they are also divisible by 400, which is why 2000 was a leap year and 2100 will not be.',
        'The count is based on calendar dates, not clock time, so daylight saving time changes in March and November never add or remove a day.',
      ],
    },
  ],
  faq: [
    {
      q: 'How many days are left until Christmas?',
      a: 'Set the start date to today and the end date to December 25. From October 29, 2026, for example, there are 57 days until Christmas.',
    },
    {
      q: 'Does the calculator include the end date?',
      a: 'Not by default. It counts the nights between the two dates, the way you count days until an event. Tick Include end date to count both the first and the last day.',
    },
    {
      q: 'What date is 90 days from today?',
      a: 'Switch to Add or subtract days, keep today as the start date and tap 90 days. From October 29, 2026, it is January 27, 2027.',
    },
    {
      q: 'Are holidays excluded from business days?',
      a: 'No. Business days here are Monday to Friday only. Subtract any federal, state or company holidays that fall on weekdays in your range.',
    },
    {
      q: 'How many weeks are between two dates?',
      a: 'The Weeks figure divides the total days by 7 and shows any remaining days, for example 22 weeks or 9 weeks 3 days.',
    },
    {
      q: 'Can I count days between dates in the past?',
      a: 'Yes. Any two dates work, including historical ones. If the end date is earlier than the start date, the tool counts from the earlier date and tells you so.',
    },
  ],
  related: ['age-calculator', 'countdown-timer', 'timezone-converter', 'life-in-weeks', 'timestamp-converter'],
  priority: 75,
  updated: '2026-10-29',
});
