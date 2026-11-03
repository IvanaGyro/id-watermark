import { defineTool } from '../types';

export default defineTool({
  slug: 'salary-per-second',
  name: 'Moneytivation',
  seoTitle: 'Salary Per Second Calculator: Watch Your Pay Tick Up Live',
  description:
    'Enter your salary or hourly wage and watch today’s earnings tick up live. See pay per day, hour and second, a workday progress bar and a clock-out countdown.',
  category: 'finance',
  icon: 'Zap',
  keywords: [
    'salary per second',
    'how much do i earn per second',
    'earnings ticker',
    'live salary counter',
    'salary to hourly',
    'annual salary to daily pay',
    'paycheck calculator live',
    'work motivation',
    'money earned today',
    'salary per minute',
  ],
  intro:
    'Set your pay and working hours, then watch today’s earnings climb every second. The meter tells you what you have earned so far, from cups of coffee to lunches and concert tickets: a small push to get through the day.',
  howTo: [
    'Under “Pay and working hours”, choose yearly, monthly or hourly pay and enter the amount. The currency follows the site language, and you can change it.',
    'Enter your working days per month and your start and end times. Tick “Unpaid lunch break” to pause the counter during the break.',
    'The big number is what you have earned so far today. The bar shows how much of the workday is done, with the time left until clock-out.',
    'A line under the bar says what today’s pay already buys, and the list below converts it into coffees, lunches and more. Press “Full screen” to keep the meter on a second screen or on a phone, upright or on its side; the screen stays awake.',
  ],
  sections: [
    {
      heading: 'How per-second pay is worked out',
      body: [
        'Daily pay is your monthly pay divided by the working days in a month; an annual salary is first divided by 12. Hourly pay is daily pay divided by the hours you actually work, so an unpaid lunch break does not count. Divide the hourly figure by 3,600 and you get pay per second.',
        'For example, $60,000 a year is $5,000 a month. Over 22 working days that is about $227 a day. On a 9-to-5 day with a 30-minute unpaid lunch, you work 7.5 hours, which comes to about $30 an hour or roughly 0.84 cents every second. With hourly pay the tool simply multiplies your wage by the hours you work in a day.',
      ],
    },
    {
      heading: 'Why watch your pay tick up?',
      body: [
        'A salary is a big, abstract number that shows up once or twice a month. Broken down into cents per second, it becomes visible: every email, every meeting and even this minute of staring at the wall is quietly paying you. Feedback you can see is far more motivating than a distant payday.',
        'The meter also turns the number into things you can picture, such as “You have already earned 3.2 lunches today”. It names the priciest item your pay already covers, so the count feels real at any salary. Early in the day, before you have earned even a coffee, it tells you how much longer that takes. Prices are rough everyday averages, not exact price data.',
      ],
    },
    {
      heading: 'Night shifts, other currencies and privacy',
      body: [
        'If your end time is earlier than your start time, the shift is treated as ending the next day, so a 10 p.m. to 6 a.m. shift works as expected. The currency defaults to US dollars on the English site, and you can pick from a dozen others, including the euro, pound, Canadian and Australian dollar.',
        'Everything runs in your browser. Your salary and hours are saved only on this device and are never sent anywhere.',
      ],
    },
  ],
  faq: [
    {
      q: 'Does the counter keep going during lunch?',
      a: 'Not if “Unpaid lunch break” is ticked. The amount pauses and the screen shows how long the break has left. Untick it to count the whole day.',
    },
    {
      q: 'Why so many decimal places?',
      a: 'The number of decimals adapts to your pay per second, so the last digit changes on almost every frame and the meter always looks alive. Daily and hourly pay below use the usual two decimals.',
    },
    {
      q: 'Is this the same as my legal daily rate?',
      a: 'Not necessarily. Overtime, leave pay and similar figures are set by your contract and local law, which may use a different formula. Use this meter for motivation, not for payroll.',
    },
    {
      q: 'Does it work in other currencies?',
      a: 'Yes. Choose a currency from the list. Converting pay into coffees and lunches currently works for US dollars, Japanese yen and New Taiwan dollars.',
    },
    {
      q: 'Is my salary uploaded?',
      a: 'No. All maths happens in your browser, and settings are stored only in this browser on this device.',
    },
  ],
  related: ['time-card-calculator', 'pomodoro', 'countdown-timer', 'percentage-calculator'],
  priority: 50,
  updated: '2026-11-03',
});
