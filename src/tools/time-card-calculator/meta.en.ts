import { defineTool } from '../types';

export default defineTool({
  slug: 'time-card-calculator',
  name: 'Time Card Calculator',
  seoTitle: 'Time Card Calculator – Weekly Hours, Breaks, Overtime and Pay',
  description:
    'Free weekly time card calculator. Enter clock-in and clock-out times with lunch breaks to total hours in decimal and h:mm, with overtime and gross pay.',
  category: 'time',
  icon: 'ClipboardClock',
  keywords: [
    'time card calculator',
    'timesheet calculator',
    'hours calculator',
    'work hours calculator',
    'weekly time card calculator',
    'time clock calculator',
    'hours worked calculator',
    'time card calculator with lunch',
    'payroll hours calculator',
    'overtime calculator',
    'decimal hours calculator',
    'convert minutes to decimal hours',
    'california overtime calculator',
    'clock in clock out calculator',
    'biweekly time card calculator',
    'hours and minutes calculator for work',
  ],
  intro:
    'Fill in when you clocked in and out each day and how long your unpaid breaks were. The calculator totals the week in hours and minutes and in decimal hours, splits out overtime, and works out gross pay.',
  howTo: [
    'Choose AM/PM or 24-hour, and the day your workweek starts.',
    'For each day you worked, type the time in, the time out and the unpaid break (for example 9, 5:30pm, 30). Leave days off empty.',
    'Pick the overtime rule: Federal for most US jobs, California for daily overtime, or No overtime.',
    'Enter your hourly rate to see regular, overtime and gross pay. Round punches applies the rounding your employer uses, if any.',
  ],
  sections: [
    {
      heading: 'How to calculate hours worked',
      body: [
        'For each day, subtract the clock-in time from the clock-out time, then subtract unpaid breaks. A shift from 8:45 AM to 5:30 PM is 8 hours 45 minutes; minus a 30-minute lunch, that is 8 hours 15 minutes, or 8.25 hours.',
        'Converting to 24-hour time makes the subtraction easier: 5:30 PM is 17:30, and 17:30 − 8:45 = 8:45. For shifts that cross midnight, add 24 hours to the end time: 10:00 PM to 6:30 AM is (6:30 + 24:00) − 22:00 = 8:30. The calculator does this automatically and counts the shift on the day it starts.',
        'You can type times loosely. 9, 9:00, 900 and 9am all mean 9:00 AM. In AM/PM mode, an end time without AM or PM is read as whichever gives the shorter shift, so 9 to 5 is 8 hours, not 20.',
      ],
    },
    {
      heading: 'Hours and minutes vs. decimal hours',
      body: [
        'Payroll systems usually want decimal hours, not hours and minutes. Divide the minutes by 60: 15 minutes = 0.25, 30 = 0.50, 45 = 0.75, 20 = 0.33, 40 = 0.67, 10 = 0.17 and 50 = 0.83 hours. So 41 hours 15 minutes is 41.25 hours.',
        'Don’t write 7 hours 30 minutes as 7.30; it is 7.50. Mixing the two formats is the most common timesheet mistake, and at $20 an hour that slip costs $4 on a single day.',
        'This calculator shows every total both ways, for example 41:15 and 41.25, and the pay breakdown uses the decimal figure.',
      ],
    },
    {
      heading: 'Overtime: federal 40-hour rule and California daily overtime',
      body: [
        'Under the federal Fair Labor Standards Act, non-exempt employees must be paid at least 1.5 times their regular rate for hours over 40 in a workweek. There is no federal daily overtime, so a 12-hour day is not overtime by itself. The workweek is any fixed, recurring seven-day period your employer sets, which is why you can choose whether it starts on Sunday or Monday.',
        'Example: five 9-hour days is 45 hours. At $20 an hour that is 40 × $20 = $800 regular plus 5 × $30 = $150 overtime, for $950 gross.',
        'California adds daily overtime: 1.5× for hours over 8 in a day and 2× for hours over 12, plus 1.5× for the first 8 hours and 2× beyond 8 on the seventh consecutive day of work in a workweek. Four 10-hour days total 40 hours, so there is no federal overtime, but in California 8 of those hours are overtime: 32 × $20 + 8 × $30 = $880 instead of $800. Alaska, Nevada and Colorado have their own daily overtime rules, and some union contracts do too.',
      ],
    },
    {
      heading: 'Rounding punches and the 7-minute rule',
      body: [
        'Federal rules (29 CFR 785.48) let employers round clock times to the nearest 5 minutes, tenth of an hour or quarter hour, as long as the rounding is neutral over time. With quarter-hour rounding, 1 to 7 minutes rounds down and 8 to 14 minutes rounds up, which is known as the 7-minute rule: 8:07 counts as 8:00 and 8:08 as 8:15.',
        'Pick the same rounding as your employer’s time clock in Round punches to check your paycheck, or leave it on No rounding to see your exact hours. California courts have been stricter about rounding, so many California employers now pay to the minute.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I calculate my hours worked for the week?',
      a: 'For each day, subtract time in from time out and take off unpaid breaks, then add up the days. Enter your times above and the calculator gives the weekly total in hours:minutes and decimal hours.',
    },
    {
      q: 'How do I convert minutes to decimal hours?',
      a: 'Divide the minutes by 60. 15 minutes is 0.25 hours, 30 is 0.5, 45 is 0.75 and 20 is about 0.33. So 7 hours 45 minutes is 7.75 hours.',
    },
    {
      q: 'Is lunch break counted as hours worked?',
      a: 'Bona fide meal periods of 30 minutes or more, when you are fully relieved of duty, are usually unpaid. Short rest breaks of 5 to 20 minutes must be paid under federal rules, so don’t subtract them.',
    },
    {
      q: 'When do I get overtime?',
      a: 'Under federal law, non-exempt employees earn at least 1.5× pay for hours over 40 in a workweek. California also pays overtime for hours over 8 in a day and double time over 12. Check your state’s rules and your contract.',
    },
    {
      q: 'How do I enter an overnight shift?',
      a: 'Just type the times, for example 10pm in and 6am out. When the end time is earlier than the start, the shift is treated as ending the next day and counted on the day it began.',
    },
    {
      q: 'Can I use this for a biweekly timesheet?',
      a: 'Yes, fill in one week at a time. Overtime is calculated per workweek even when you are paid every two weeks, so two separate weeks give the correct overtime.',
    },
    {
      q: 'Is my time card saved?',
      a: 'Your entries stay in your browser on this device so you can come back to them during the week. Nothing is uploaded.',
    },
  ],
  related: ['exact-time', 'tip-calculator', 'sales-tax-calculator', 'fraction-calculator', 'gpa-calculator', 'salary-per-second'],
  priority: 72,
  updated: '2026-10-29',
});
