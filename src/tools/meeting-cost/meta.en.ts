import { defineTool } from '../types';

export default defineTool({
  slug: 'meeting-cost',
  name: 'Meeting Cost Calculator',
  seoTitle: 'Meeting Cost Calculator: Live Timer for What Your Meeting Costs',
  description:
    'Meeting cost calculator with a live timer. Enter attendees and salaries, watch the cost tick up as you talk, and see what a weekly meeting costs per year.',
  category: 'finance',
  icon: 'Flame',
  keywords: [
    'meeting cost calculator',
    'meeting cost timer',
    'cost of a meeting',
    'how much does this meeting cost',
    'meeting cost per hour',
    'meeting cost ticker',
    'cost of meetings calculator',
    'stand-up meeting cost',
  ],
  intro:
    'Meetings cost money, mostly in salaries. Add the people in the room and their pay, press start and watch the cost climb by the second, or work out what a recurring meeting costs over a year.',
  howTo: [
    'Under “Attendees and pay”, pick “Quick estimate” and enter the number of attendees and their average salary (annual, monthly or hourly). If pay differs a lot, switch to “By role” and add a row per role.',
    'Check the currency, working days per month and paid hours per day. To include payroll taxes, benefits and office costs, raise the “Overhead multiplier”.',
    'When the meeting begins, press “Start meeting”. The big number is what the meeting has cost so far, with the elapsed time, the time left against the plan and what that money could have bought. Pause, resume or reset at any time.',
    'Press “Full screen” to put the meter on a conference room screen or a phone lying on its side. The screen stays awake, and Space starts or pauses the meter.',
    'Under “Plan ahead”, enter the planned length and how often the meeting happens to see the cost per meeting, per month and per year, and what trimming a few minutes would save.',
  ],
  sections: [
    {
      heading: 'How meeting cost is calculated',
      body: [
        'Each attendee’s hourly rate is their monthly pay divided by the paid hours in a month (working days × hours per day). An annual salary is divided by 12 first, and hourly wages are used as they are. Add up everyone’s hourly rate to get the cost of one hour of meeting, then multiply by the time spent.',
        'For example, with 22 working days of 8 hours, a month has 176 paid hours, so an annual salary of $84,480 works out to $40 an hour. Eight people at that average cost $320 an hour, or about $5.33 a minute. A one-hour weekly meeting held 52 times a year costs $16,640 in salary alone.',
        'Salary is not the whole cost of an employee: employers also pay payroll taxes, benefits, equipment and office space. Raise the overhead multiplier to include them. At 1.3, the same meeting costs $416 an hour. The right figure depends on your company, so ask finance or HR for a rough ratio.',
      ],
    },
    {
      heading: 'Why a daily stand-up can cost more than a weekly hour',
      body: [
        'With the same eight people, a 15-minute daily stand-up costs $80 a meeting. Over 264 working days that adds up to $21,120 a year, more than the one-hour weekly meeting. Short meetings look cheap one at a time, but frequency adds up, which is why recurring meetings are the first place to look.',
        'Plan ahead shows how many hours each attendee spends in a meeting per year and what a shorter meeting would save. Cutting the weekly hour to 45 minutes saves $4,160 a year.',
      ],
    },
    {
      heading: 'Ways to make meetings cheaper',
      body: [
        'Decide what the meeting needs to settle and send the agenda and material beforehand. Status updates often work just as well as a written note or a shared document.',
        'Invite the people who need to speak or decide, and share notes with everyone else. Meetings do not have to fill a full hour: default to 25 or 50 minutes and leave a buffer before the next one.',
        'Put the meter on the meeting room screen. Seeing time and cost move helps everyone stay on topic. The point is not to make anyone feel guilty but to treat everyone’s time as valuable.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do you calculate the cost of a meeting?',
      a: 'Work out each attendee’s hourly rate (monthly pay ÷ paid hours per month, with annual salaries divided by 12 first), add the rates up and multiply by the meeting length. Multiply by an overhead factor if you want to include benefits and payroll taxes.',
    },
    {
      q: 'What overhead multiplier should I use?',
      a: 'Use 1 to count salary only. To estimate the full cost of employing people, raise it to cover payroll taxes, benefits, equipment and office space. The ratio varies a lot between companies, so ask your finance or HR team for a rough number.',
    },
    {
      q: 'What if someone joins late or leaves early?',
      a: 'Change the headcount or add a row while the meter runs. The new number applies from that moment, and the cost so far stays as it is. If you entered the wrong numbers at the start, press Reset.',
    },
    {
      q: 'Does the timer keep running if I switch tabs or reload?',
      a: 'Yes. The meter is based on the time you pressed start, so switching tabs, locking your phone or reloading the page does not lose any time. It only stops when you press Pause, so remember to pause or reset after the meeting.',
    },
    {
      q: 'Can I show it on a conference room screen?',
      a: 'Yes. Full screen shows only the big number, the meeting time and the start and pause buttons, sized for a projector, a TV or a phone on its side. The screen stays awake, Space starts or pauses, and Esc exits.',
    },
    {
      q: 'Is my salary data uploaded?',
      a: 'No. All calculations happen in your browser, and settings are stored only in this browser on this device.',
    },
  ],
  related: ['salary-per-second', 'stopwatch', 'countdown-timer', 'pomodoro', 'time-card-calculator', 'split-bill'],
  priority: 50,
  updated: '2026-11-04',
});
