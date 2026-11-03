import { defineTool } from '../types';

export default defineTool({
  slug: 'mic-test',
  name: 'Mic Test',
  seoTitle: 'Mic Test: Check if Your Microphone Is Working Online',
  description:
    'Free online mic test. See a live level meter and waveform, record 5 seconds to play back, and fix a blocked or silent mic on Windows, Mac, iPhone or Android.',
  category: 'test',
  icon: 'Mic',
  keywords: [
    'mic test',
    'microphone test',
    'online mic test',
    'test my mic',
    'mic checker',
    'is my mic working',
    'microphone test online',
    'mic test with playback',
    'headset mic test',
    'airpods mic test',
    'zoom mic test',
    'discord mic test',
    'mic not working',
    'microphone volume test',
  ],
  intro:
    'Check that your microphone works before a Zoom, Teams or Discord call. Watch the level meter react as you talk, then record a short clip to hear exactly what others will hear.',
  howTo: [
    'Press “Test my microphone” and choose Allow when your browser asks for microphone access.',
    'Speak normally. The level meter, waveform and verdict update in real time; aim for “Your microphone is working”.',
    'If you have several mics (built-in, headset, USB), pick one under “Input device”.',
    'Press “Record 5 seconds and play back” to hear yourself, and use “Download recording” if you want to keep the clip.',
  ],
  sections: [
    {
      heading: 'Reading the level meter',
      body: [
        'Levels are shown in dBFS, decibels relative to full scale, where 0 dB is the loudest a digital signal can be. Normal speech at arm’s length usually sits around −30 to −15 dBFS. Below −55 dBFS the tester treats the mic as silent; above −6 dBFS or touching 0 dB, your voice is likely to clip and sound distorted.',
        'For calls, aim for the “Your microphone is working” range with peaks well below 0 dB. For podcasts and voiceovers, many people target peaks around −12 to −6 dBFS and leave the rest of the headroom for loud moments.',
      ],
    },
    {
      heading: 'Mic not working? Check these first',
      body: [
        'If the page says access was blocked, the browser or the operating system is denying permission. On Windows 11, open Settings > Privacy & security > Microphone and make sure both “Microphone access” and “Let desktop apps access your microphone” are on. On a Mac, open System Settings > Privacy & Security > Microphone and turn on your browser.',
        'If permission is fine but the meter doesn’t move, the wrong input is selected. Pick the right device in “Input device”, and in Windows check Settings > System > Sound > Input; on a Mac, System Settings > Sound > Input. Also look for a hardware mute switch on the headset cable or a mute button on the mic itself.',
      ],
    },
    {
      heading: 'Noise suppression, echo cancellation and auto gain',
      body: [
        'Browsers apply the same voice processing that video calls use: noise suppression removes steady background noise, echo cancellation stops your speakers feeding back into the mic, and automatic gain control evens out your volume. That is why your voice may sound slightly different from a raw recording.',
        'Tick “Turn off noise suppression, echo cancellation and auto gain” to hear the raw input. This is useful for judging a new USB or XLR microphone, checking room noise, or setting gain for streaming in OBS.',
      ],
    },
    {
      heading: 'Bluetooth headsets and AirPods',
      body: [
        'When a Bluetooth headset uses its microphone, most systems switch it from the high-quality music profile (A2DP) to the hands-free profile (HFP), so both your voice and the audio you hear drop to phone-call quality. This is normal. If the mic doesn’t appear at all, make sure the headset is connected as an audio input, not just as speakers.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I know if my mic is working?',
      a: 'Press “Test my microphone”, allow access and speak. If the level meter moves and the verdict says your microphone is working, it is picking up sound. Record a 5-second clip and play it back to check the quality too.',
    },
    {
      q: 'Why does it say microphone access was blocked?',
      a: 'You or your system denied permission. Follow the steps shown under the error for your browser, then reload the page. On Windows 11 and macOS, the operating system’s privacy settings can also block the browser even when the site is allowed.',
    },
    {
      q: 'The meter moves, but people can’t hear me on Zoom or Teams.',
      a: 'Your microphone works, so the problem is in the app. Open the app’s audio settings and choose the same microphone you selected here, and make sure you aren’t muted in the meeting.',
    },
    {
      q: 'Why does my recording sound quiet or muffled?',
      a: 'Move closer to the mic, raise the input volume in your system sound settings, and avoid covering the mic. Bluetooth headsets use a low-bandwidth call profile, so a wired or USB mic will always sound clearer.',
    },
    {
      q: 'Can I test my mic on an iPhone or Android phone?',
      a: 'Yes. Open this page in Safari or Chrome and allow microphone access when asked. In-app browsers inside Instagram, Facebook or TikTok often can’t use the microphone, so open the page in your regular browser.',
    },
    {
      q: 'Is my voice recorded or uploaded?',
      a: 'No. Audio is analyzed and recorded only in your browser and is never uploaded. The 5-second clip stays on your device unless you download it, and the microphone stops when you leave the page.',
    },
  ],
  related: ['webcam-test', 'keyboard-tester', 'screen-test', 'decibel-meter', 'typing-test'],
  priority: 65,
  updated: '2026-10-29',
});
