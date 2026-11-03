import { defineTool } from '../types';

export default defineTool({
  slug: 'reaction-test',
  name: 'Reaction Time Test',
  seoTitle: 'Reaction Time Test: Measure Your Reflexes in Milliseconds',
  description:
    'Free reaction time test. Click the moment the screen turns green and get your time in milliseconds, averaged over 5 rounds and rated against typical scores.',
  category: 'test',
  icon: 'Zap',
  keywords: [
    'reaction time test',
    'reaction test',
    'reaction speed test',
    'reflex test',
    'human benchmark reaction time',
    'average reaction time',
    'reaction time tester',
    'test my reaction time',
    'click reaction test',
    'reaction time game',
    'good reaction time',
    'reaction time in ms',
    'gamer reaction time',
  ],
  intro:
    'Wait for the screen to turn from red to green, then click as fast as you can. You get five rounds, early clicks don’t count, and your average is compared with typical adult reaction times.',
  howTo: [
    'Click the large panel below, or click it once and press Space, to start. The screen turns red and says “Wait for green”.',
    'The red screen lasts a random 1.5 to 5 seconds. The instant it turns green and says “Click!”, click or press Space.',
    'If you click while it’s still red you’ll see “Too soon” and that round doesn’t count. Click again to retry the same round.',
    'After five rounds you’ll see your average reaction time, a rating and every round’s result. Press “Restart” to begin again from round 1.',
  ],
  sections: [
    {
      heading: 'What is a good reaction time?',
      body: [
        'Lab studies put simple visual reaction time for healthy young adults at roughly 200 to 250 milliseconds. Online tests add a little delay from the mouse, the browser and the display, so most people score between about 220 and 300 ms here. Large online datasets such as Human Benchmark report a median of around 270 ms.',
        'This test rates your five-round average: under 180 ms is Elite, 180 to 219 ms Very fast, 220 to 259 ms Above average, 260 to 299 ms Average, 300 to 359 ms A bit slow and 360 ms or more Slow. Results under 100 ms are flagged because a real reaction that fast is almost impossible; it usually means you guessed.',
      ],
    },
    {
      heading: 'Why your score changes from device to device',
      body: [
        'Every link in the chain adds latency. A 60 Hz monitor only refreshes every 16.7 ms, so the green screen can appear up to one frame late; a 144 Hz or 240 Hz display cuts that to 7 or 4 ms. Wireless mice, Bluetooth and touchscreens can add 10 to 50 ms more, and a laptop in power-saving mode may be slower again.',
        'This test times your reaction from the frame that actually paints green, using the browser’s high-resolution clock and the click’s own timestamp, to keep software delay to a minimum. To compare scores fairly, use the same device and browser each time. A wired mouse and a high refresh rate display will give you the best numbers.',
      ],
    },
    {
      heading: 'Reaction time in driving and sports',
      body: [
        'Real-world reactions are slower than a lab test because you first have to notice and decide. US road design guidelines (AASHTO) assume a perception-reaction time of 2.5 seconds for braking. At 60 mph you cover 88 feet every second, so even a quick 1.5-second reaction means about 132 feet traveled before your foot reaches the brake.',
        'In sprinting, World Athletics treats any start less than 0.100 seconds after the gun as a false start, because that is considered faster than a human can genuinely react to the sound. Elite sprinters typically react in 0.13 to 0.17 seconds.',
      ],
    },
    {
      heading: 'How to improve your reaction time',
      body: [
        'Sleep, caffeine, fatigue and focus all move your score by 20 to 50 ms, so test at a similar time of day if you’re tracking progress. Warm up with a few rounds first, keep your finger resting lightly on the button, and look at the center of the panel rather than at the edge.',
        'Practice helps up to a point: regular gaming and sports that demand quick responses are linked to faster reactions. Beyond that, the biggest gains often come from better hardware, a wired mouse and a high refresh rate monitor, rather than from your nerves.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the average human reaction time?',
      a: 'For a simple visual test like this one, most adults score between about 200 and 300 ms, with a typical online median of around 250 to 280 ms once device lag is included.',
    },
    {
      q: 'Is 200 ms a good reaction time?',
      a: 'Yes. 200 ms is faster than most people and rates as Very fast here. Consistently staying under 180 ms is rare and usually requires low-latency gear.',
    },
    {
      q: 'Why does it say “Too soon”?',
      a: 'You clicked before the screen turned green. The wait is random between 1.5 and 5 seconds so you can’t time it. That round isn’t counted; click again to retry it.',
    },
    {
      q: 'Why is my result faster or slower on my phone?',
      a: 'Touchscreens, display refresh rates and power-saving modes all add different amounts of delay. Compare results on the same device for a fair picture.',
    },
    {
      q: 'Does age affect reaction time?',
      a: 'Yes. Reaction time tends to be fastest in your 20s and slows gradually with age, though staying active and practicing can reduce the decline.',
    },
    {
      q: 'Are my results stored online?',
      a: 'No. Everything runs in your browser and only your best scores are saved on this device. Press “Clear records” to delete them.',
    },
  ],
  related: ['cps-test', 'typing-test', 'keyboard-tester', 'decibel-meter', 'stopwatch'],
  priority: 66,
  updated: '2026-10-29',
});
