import { defineTool } from '../types';

export default defineTool({
  slug: 'pomodoro',
  name: 'Pomodoro Timer',
  seoTitle: 'Pomodoro Timer: Free Online 25/5 Focus Timer for Study and Work',
  description:
    'Free online Pomodoro timer: 25 minute focus sessions, 5 minute breaks and a 15 minute long break every 4 rounds. Adjust every length and track today’s focus.',
  category: 'time',
  icon: 'TimerReset',
  keywords: [
    'pomodoro timer',
    'pomodoro technique',
    'online pomodoro timer',
    'pomodoro timer online',
    'focus timer',
    'study timer',
    '25 minute timer',
    '25 5 timer',
    'pomodoro clock',
    'tomato timer',
    'work timer with breaks',
    'productivity timer',
    '50 10 pomodoro',
    'study with me timer',
  ],
  intro:
    'Alternate focused work and short breaks with the Pomodoro Technique: 25 minutes of focus, a 5 minute break, and a longer break after every 4 pomodoros. Every length is adjustable, and your settings stay in your browser.',
  howTo: [
    'Press Start to begin a 25 minute focus session. The ring shows your progress and the tab title shows the time left.',
    'When time is up, a sound plays and the timer switches to a break. Turn on Start the next phase automatically if you don’t want to press Start each time.',
    'Press Pause when you are interrupted, or Skip to jump to the next phase (a skipped focus session does not count). You can also pick Focus, Short break or Long break at the top.',
    'Open Settings to change the focus, short break and long break lengths and the number of pomodoros before a long break. Changes are saved automatically.',
  ],
  sections: [
    {
      heading: 'How the Pomodoro Technique works',
      body: [
        'The Pomodoro Technique was developed by Francesco Cirillo in the late 1980s and is named after the tomato-shaped kitchen timer he used as a university student. You pick one task, work on it for 25 minutes without switching, then take a 5 minute break. After four pomodoros you take a longer break of 15 to 30 minutes.',
        'Short, fixed blocks make it easier to start a task you have been putting off, because you only commit to 25 minutes. The breaks keep you fresh over a long day, and counting pomodoros gives you an honest measure of how much focused time a task really takes.',
      ],
    },
    {
      heading: 'Choosing your session lengths',
      body: [
        'The classic 25/5 rhythm suits most people, especially for studying, email and admin work. For deep work such as writing or programming, many people prefer 50 minutes of focus with a 10 minute break, or 45/15. If you have trouble concentrating, start with 15 or 20 minute sessions and build up.',
        'A typical day with the default settings looks like this: four pomodoros take 4 × 25 minutes of focus plus three 5 minute breaks, so a full set is 115 minutes, followed by a 15 minute long break. Eight pomodoros add up to 3 hours 20 minutes of real focus, which is a productive day for most knowledge work.',
      ],
    },
    {
      heading: 'Tips for better pomodoros',
      body: [
        'Before you start, write down the one task for this pomodoro and silence notifications on your phone. If a thought or errand comes up, jot it down and get back to work; deal with it during the break. If you are interrupted for real, it is fine to reset and start the pomodoro again.',
        'Use breaks to step away from the screen: stand up, stretch, refill your water or look out a window. Avoid checking social media during a 5 minute break, since it tends to stretch into 20.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is 25 minutes the best length for a pomodoro?',
      a: 'It is the original recommendation and a good starting point, but not a rule. Many people work better with 50/10 or 45/15 for deep work. Adjust the lengths in Settings and keep what helps you focus.',
    },
    {
      q: 'Does the timer keep running in a background tab?',
      a: 'Yes. Each phase stores its end time, so switching tabs does not slow it down. The sound still plays at the end of each phase, and the tab title shows the time left.',
    },
    {
      q: 'What does Skip do?',
      a: 'Skip moves straight to the next phase. A skipped focus session is not added to today’s count, and it leads to the break you would have earned.',
    },
    {
      q: 'When does today’s count reset?',
      a: 'At midnight in your local time. The count and today’s focus time are stored only in your browser.',
    },
    {
      q: 'Why didn’t I hear the sound?',
      a: 'Make sure Sound is checked in Settings and your device is not muted. Browsers only allow sound after you have clicked on the page, so the first session has to be started by you.',
    },
    {
      q: 'Can I use this for a study session with friends?',
      a: 'Yes. Share your screen during a video call or put the page in a corner of your stream so everyone follows the same focus and break schedule.',
    },
  ],
  related: ['countdown-timer', 'stopwatch', 'word-counter', 'meeting-cost', 'water-intake', 'salary-per-second'],
  priority: 55,
  updated: '2026-10-29',
});
