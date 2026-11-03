import { defineTool } from '../types';

export default defineTool({
  slug: 'stopwatch',
  name: 'Online Stopwatch',
  seoTitle: 'Online Stopwatch with Laps: Accurate to 1/100 Second',
  description:
    'Free online stopwatch accurate to 1/100 of a second. Record laps and split times, spot your fastest and slowest lap, and use Space, L and R as shortcuts.',
  category: 'time',
  icon: 'Timer',
  keywords: [
    'stopwatch',
    'online stopwatch',
    'stopwatch with laps',
    'lap timer',
    'split timer',
    'stop watch online',
    'stopwatch timer',
    'full screen stopwatch',
    'stopwatch with milliseconds',
    'stopwatch keyboard shortcut',
    'running lap timer',
    'free stopwatch',
  ],
  intro:
    'Press Start to time anything to a hundredth of a second and record each lap with its lap and total time. Switching tabs or reloading the page does not stop the clock.',
  howTo: [
    'Press Start or the Space bar to begin. Press Stop to pause, then Resume to keep adding to the same time.',
    'While it runs, press Lap or the L key to mark a lap. The table shows each lap time and total time and highlights your fastest and slowest lap.',
    'Press Reset or the R key to go back to zero and clear all laps.',
    'Press Copy laps to copy the table as text you can paste into notes, Excel or Google Sheets.',
  ],
  sections: [
    {
      heading: 'Lap time vs. split time',
      body: [
        'Total time (often called the split) is how long has passed since you pressed Start. Lap time is how long that one lap took: this lap’s total time minus the previous one. Running a mile on a standard 400 meter track, for example, you would press Lap at the end of each of the four laps and see both your pace per lap and your running total.',
        'Once you have two or more laps, the fastest and slowest are highlighted so you can see whether your pace held steady or dropped off at the end. Copy laps produces tab-separated text, so it lands in separate columns when you paste it into a spreadsheet.',
      ],
    },
    {
      heading: 'How accurate is an online stopwatch?',
      body: [
        'This stopwatch does not count ticks. It stores the moment you pressed Start and subtracts it from the current time whenever it updates the screen. Browsers slow down background tabs to save power, but that only pauses the display; the measured time is still exact when you come back. Your times are even kept if you reload the page.',
        'In practice the biggest source of error is human reaction time, which is typically around 0.2 seconds when you start or stop by hand. That is fine for training, practice and everyday timing, but official races use automatic timing systems. To keep comparisons fair, have the same person time every attempt and use the keyboard rather than a mouse.',
      ],
    },
    {
      heading: 'Common uses and keyboard shortcuts',
      body: [
        'People use a stopwatch for track and swim intervals, timing a speech or presentation, science labs, cooking, timed practice tests, speedruns and puzzle solves. On a computer you can keep your hands on the keyboard: Space starts and stops, L records a lap and R resets.',
        'When a text box or button has focus, the Space bar goes to that element instead, so you never trigger the stopwatch by accident while typing. Click an empty part of the page first if Space seems not to respond.',
      ],
    },
  ],
  faq: [
    {
      q: 'Does the stopwatch keep running if I switch tabs?',
      a: 'Yes. Time is calculated from the moment you pressed Start, so a background tab only pauses the screen updates. The tab title also keeps showing the running time.',
    },
    {
      q: 'Will I lose my time if I reload or close the page?',
      a: 'No. The running state and your laps are saved in your browser, and the stopwatch picks up where it left off when you open this page again. Private windows and clearing your browsing data remove them.',
    },
    {
      q: 'Is there a time limit?',
      a: 'No. After 60 minutes the display switches to hours, minutes and seconds, for example 1:02:03.45.',
    },
    {
      q: 'How many laps can I record?',
      a: 'As many as you need. The newest lap appears at the top of the table, and you can copy the whole list at any time.',
    },
    {
      q: 'What is the difference between a stopwatch and a timer?',
      a: 'A stopwatch counts up from zero to measure how long something takes. A countdown timer counts down from a time you set and alerts you when it reaches zero.',
    },
    {
      q: 'Why doesn’t the Space bar work?',
      a: 'If a text box or button has focus, Space acts on that element first. Click an empty area of the page and try again. L and R work anywhere outside a text box.',
    },
  ],
  related: ['countdown-timer', 'pomodoro', 'timezone-converter', 'meeting-cost', 'random-number'],
  priority: 50,
  updated: '2026-10-29',
});
