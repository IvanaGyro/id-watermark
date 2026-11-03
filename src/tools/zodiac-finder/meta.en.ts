import { defineTool } from '../types';

export default defineTool({
  slug: 'zodiac-finder',
  name: 'Chinese Zodiac Calculator',
  seoTitle: 'Chinese Zodiac Calculator: Find Your Animal Sign by Birthday',
  description:
    'Free Chinese zodiac calculator. Enter your birthday to find your animal sign, element and yin or yang, using the Lunar New Year cutoff for Jan and Feb births.',
  category: 'time',
  icon: 'Sparkles',
  keywords: [
    'chinese zodiac calculator',
    'chinese zodiac',
    'what is my chinese zodiac',
    'chinese zodiac by birthday',
    'chinese zodiac years',
    'chinese zodiac chart',
    'chinese zodiac element calculator',
    'chinese new year animal',
    'lunar new year zodiac',
    'year of the horse 2026',
    'year of the goat 2027',
    'fire horse',
    'chinese birth year animal',
    'zodiac animals in order',
  ],
  intro:
    'Enter your date of birth to find your Chinese zodiac animal, element and yin or yang. Birthdays in January and February are checked against that year’s Lunar New Year, so they are never put in the wrong year.',
  howTo: [
    'Pick your birthday in “Date of birth”.',
    'Read your animal sign at the top, followed by your element, the stem and branch name in Chinese, and the date Lunar New Year fell on in your birth year.',
    'If you were born before Lunar New Year, a note explains why your animal belongs to the previous year.',
    'Scroll down to the Chinese zodiac years chart; your animal’s row is highlighted.',
  ],
  sections: [
    {
      heading: 'Why your birthday matters, not just the year',
      body: [
        'The Chinese zodiac follows the lunar calendar, and the new animal begins on Lunar New Year, which falls between January 21 and February 20. Most charts list a whole calendar year under one animal, which is wrong for anyone born in January or early February.',
        'For example, Lunar New Year 2024 was on February 10. Someone born on February 9, 2024 is a Water Rabbit from the 2023 lunar year, while a baby born the next day is a Wood Dragon. Likewise, a birthday of January 25, 1990 falls before Lunar New Year on January 27, so it is an Earth Snake, not a Metal Horse.',
      ],
    },
    {
      heading: 'The 12 animals and the five elements',
      body: [
        'The animals always come in the same order: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat (also called Sheep or Ram), Monkey, Rooster, Dog and Pig. The cycle repeats every 12 years.',
        'Each year also has one of five elements, Wood, Fire, Earth, Metal or Water, which lasts two years: one yang year followed by one yin year. A quick way to remember it is the last digit of the lunar year: 0 and 1 are Metal, 2 and 3 Water, 4 and 5 Wood, 6 and 7 Fire, and 8 and 9 Earth. Twelve animals times five elements gives the full 60-year cycle, so the same combination, such as the Fire Horse, comes back only every 60 years.',
        'In Chinese, each year has a two-character name made of a heavenly stem and an earthly branch. 2026 is 丙午 (bǐng wǔ), the Fire Horse, starting February 17, 2026. 2027 is 丁未 (dīng wèi), the Fire Goat, starting February 6, 2027.',
      ],
    },
    {
      heading: 'Compatible signs in Chinese tradition',
      body: [
        'Traditional matchmaking groups the animals into four “trines” that are said to get along well: Rat, Dragon and Monkey; Ox, Snake and Rooster; Tiger, Horse and Dog; and Rabbit, Goat and Pig. Each animal also has an opposite six places away, such as Rat and Horse, which is seen as a clash.',
        'These pairings are folklore rather than science, but they still come up at weddings, in naming customs and around Lunar New Year, so it helps to know where your sign sits.',
      ],
    },
    {
      heading: 'Chinese zodiac vs. Western zodiac',
      body: [
        'The Chinese zodiac is based on your birth year in the lunar calendar, while Western astrology signs such as Aries or Leo depend on the month and day. Your Chinese sign stays the same for a whole lunar year; your Western sign changes roughly every 30 days.',
      ],
    },
  ],
  faq: [
    {
      q: 'What Chinese zodiac animal is 2026?',
      a: '2026 is the Year of the Horse, specifically the Fire Horse (丙午). It starts on Lunar New Year, February 17, 2026, and lasts until February 5, 2027.',
    },
    {
      q: 'What is the Chinese zodiac for 2027?',
      a: '2027 is the Year of the Goat, the Fire Goat (丁未), beginning on February 6, 2027.',
    },
    {
      q: 'I was born in January. Is my animal the one for that year?',
      a: 'Only if you were born on or after Lunar New Year. If your birthday is before it, your animal is the one for the previous year. Enter your full date of birth above and the calculator checks this for you.',
    },
    {
      q: 'How do I find my Chinese zodiac element?',
      a: 'Look at the last digit of your lunar birth year: 0–1 Metal, 2–3 Water, 4–5 Wood, 6–7 Fire, 8–9 Earth. Even digits are yang and odd digits are yin. The calculator shows the element and adjusts the year for Lunar New Year.',
    },
    {
      q: 'Is the Goat the same as the Sheep or Ram?',
      a: 'Yes. The Chinese word 羊 covers goats and sheep, so you will see Goat, Sheep and Ram used for the same sign.',
    },
    {
      q: 'Which years does the calculator support?',
      a: 'Birthdays from January 31, 1900 to the end of 2100, based on astronomical Lunar New Year dates in China Standard Time.',
    },
  ],
  related: ['new-year-countdown', 'timezone-converter', 'spin-wheel', 'birthday-moon', 'random-number'],
  priority: 70,
  updated: '2026-10-29',
});
