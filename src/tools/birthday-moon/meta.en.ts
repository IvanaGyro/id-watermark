import { defineTool } from '../types';

export default defineTool({
  slug: 'birthday-moon',
  name: 'Birthday Moon Phase',
  seoTitle: 'Birthday Moon Phase: What Was the Moon on the Day I Was Born?',
  description:
    'See the moon on your birthday or any date: its phase, age and how much was lit, the nearest full and new moons, and years your birthday falls on a full moon.',
  category: 'time',
  icon: 'MoonStar',
  keywords: [
    'birthday moon phase',
    'what was the moon on my birthday',
    'moon phase on the day i was born',
    'what phase was the moon on my birthday',
    'moon phase by date',
    'moon phase calculator',
    'full moon on my birthday',
    'moon age calculator',
  ],
  intro:
    'Pick a date and see the moon that night: full, first quarter or a thin crescent, how much of it was lit and how many days old it was. Try a birthday, a wedding day or the night your child was born, then save it as a card to share.',
  howTo: [
    'Pick a birthday or any other day under “Date”. If you know the time of birth, add it under “Time (optional)”; otherwise you see the moon at 9 p.m. that night.',
    '“Time zone” starts with this device’s zone. If you were born somewhere else, choose that zone so the date and time are read as local time there.',
    'The drawing shows that night’s moon with its phase name, illumination and moon age. Switch the hemisphere to “Southern” to see it the way people in Australia, New Zealand or South America do.',
    'Below are the new and full moons of that lunar cycle, the coming years with a full moon on the date, and the moon 19 years later. Use “Download card” to save an image, or “Copy share link” to send the date to a friend.',
  ],
  sections: [
    {
      heading: 'Why the moon has phases',
      body: [
        'The moon makes no light of its own; it reflects sunlight. Half of it is always lit, but as it orbits Earth we see that lit half from a changing angle. When the moon is on the same side of Earth as the Sun, the lit side faces away from us and we get a new moon. When it is on the far side of Earth, the whole lit face points our way: a full moon. In between, at first and last quarter, we see exactly half.',
        'One cycle from new moon to new moon, the synodic month, averages 29.53 days, but each one lasts anywhere from about 29.3 to 29.8 days because the moon’s orbit is an ellipse. So this tool does not count 29.53-day steps from a fixed date. It computes every phase with the lunar and solar theories in Jean Meeus’s Astronomical Algorithms, which put new and full moon times within a few minutes.',
      ],
    },
    {
      heading: 'Moon age and illumination',
      body: [
        'Moon age is the time since the last new moon, in days. It is 0 at new moon, about 7.4 at first quarter, around 14.8 at full moon and about 22.1 at last quarter, and it starts again after roughly 29.5 days. Because the orbit is uneven, a full moon can come anywhere from about 13.9 to 15.6 days after the new moon.',
        'Illumination is the share of the moon’s disk that is lit. It depends on the phase angle, the angle between the Sun and Earth as seen from the moon: lit share = (1 + cos phase angle) ÷ 2. Quarters are 50% lit. A full moon is usually about 99.8% lit rather than exactly 100%, because the moon’s orbit is tilted about 5° to Earth’s; only in a total lunar eclipse do the three line up almost perfectly.',
      ],
    },
    {
      heading: 'Why the moon looks flipped in the Southern Hemisphere',
      body: [
        'From the United States, Canada or Europe you usually face south to see the moon, and a waxing moon is lit on the right. In Australia, New Zealand, South Africa or Argentina you face north instead, so the whole picture turns 180°. The moon is not only mirrored left to right but also upside down: a waxing moon is lit on the left, and the familiar man in the moon stands on his head.',
        'Near the equator a crescent often lies on its back like a boat, and anywhere on Earth the moon appears to tilt as it crosses the sky during the night. The drawing here uses the upright view of a moon phase chart; switch the hemisphere to “Southern” to see it turned around.',
      ],
    },
  ],
  faq: [
    {
      q: 'Do I need my exact time of birth?',
      a: 'No. Without a time the tool shows the moon at 9 p.m. that night. The moon moves about 12° a day relative to the Sun, so its lit share changes by at most about 11 percentage points a day, fastest around the quarters. A time makes the numbers more precise, but the phase name rarely changes.',
    },
    {
      q: 'How rare is a full moon on my birthday?',
      a: 'At 9 p.m., a given date has a full or nearly full moon (at least 97% lit) about one year in nine. The tool lists the next ones for your date, and tags the years when the full moon itself falls on that day.',
    },
    {
      q: 'What is the Metonic cycle?',
      a: '235 synodic months last about 6,939.69 days, almost exactly 19 years (6,939 or 6,940 days). So the moon phase on a date comes back about every 19 years, usually within a day of moon age. It is named after Meton of Athens, who described it in the 5th century BC, and it is the basis of the “golden number” used to work out the date of Easter.',
    },
    {
      q: 'Which time zone should I pick if I was born abroad?',
      a: 'Pick the zone of the place where you were born and enter the local time. At any moment two places can be on different dates, so the phase name and the dates of the nearest new and full moons follow the zone you choose.',
    },
    {
      q: 'Is anything uploaded?',
      a: 'No. Everything is calculated in your browser, and the last date you looked up is stored only on this device. The card is a 1080 × 1350 PNG, a good fit for Instagram and other social apps.',
    },
  ],
  related: ['age-calculator', 'zodiac-finder', 'date-diff', 'timezone-converter', 'countdown-timer'],
  priority: 50,
  updated: '2026-11-04',
});
