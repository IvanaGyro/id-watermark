import { defineTool } from '../types';

export default defineTool({
  slug: 'birthday-candles',
  name: 'Blow Out Birthday Candles',
  seoTitle: 'Blow Out Birthday Candles Online: Virtual Cake & Birthday Card',
  description:
    'Make a virtual birthday cake and send it as a link. They make a wish and blow into the mic to put out the candles, then get confetti, the song and your message.',
  category: 'generator',
  icon: 'CakeSlice',
  keywords: [
    'blow out candles online',
    'blow out birthday candles',
    'virtual birthday cake',
    'online birthday card',
    'virtual candles to blow out',
    'birthday cake you can blow out',
    'long distance birthday ideas',
    'free birthday ecard',
    'make a wish online',
  ],
  intro:
    'Send a birthday cake to someone far away. Add their name and your message and share the link. When they blow at their phone, the candles go out one by one, followed by confetti, the birthday song and your words.',
  howTo: [
    'Under “Make a birthday cake”, enter the birthday person, their age, your message and your name, then pick a cake flavor. The cake updates as you type.',
    'Press “Copy link” or “Share” and send it by text, WhatsApp or email. Press “Preview as the recipient” to try blowing it out yourself first.',
    'They open the link, make a wish, press “Blow with the microphone” and allow microphone access, then blow at the phone. The candles go out depending on how hard and how long they blow.',
    'No microphone? Tap or swipe across the candles, or press “Blow out with a button”. When the last one is out, confetti falls, the song plays and your message appears. “Relight the candles” starts over.',
  ],
  sections: [
    {
      heading: 'Ideas for a long-distance birthday',
      body: [
        'When you can’t be in the same room, a cake they can actually blow out turns a quick “happy birthday” text into a small moment. The message stays hidden until the last candle is out, so opening it is part of the gift.',
        'A few ways to use it: send the link right at midnight in their time zone; open it together on a video call and sing while they blow (if the call is on the same phone, the call app may be holding the microphone, so tap the candles or open the link on a second device); have everyone in a group chat make their own cake; or turn the link into a QR code with the QR code generator and print it on a card that goes with a gift.',
        'When you send one to grandparents or kids, mention that the microphone is usually on the bottom edge of the phone. If blowing doesn’t work, tapping the candles does.',
      ],
    },
    {
      heading: 'How the blow detection works',
      body: [
        'After you press “Blow with the microphone”, the page uses your browser’s Web Audio analyzer (AnalyserNode) to check the microphone signal on every screen refresh, dozens of times a second. It spends the first half second measuring the room’s background level and sets its thresholds from that. Noise suppression, echo cancellation and automatic gain are turned off, because they would filter out exactly the breath noise it listens for.',
        'Blowing on a microphone makes a loud, noise-like rumble with most of its energy in the low frequencies and a flat spectrum. Speech, singing and music are built from harmonics, which show up as sharp peaks. A moment only counts as blowing when it is loud, flat and bass-heavy at the same time, and the sound has to last about 0.2 seconds before any candle goes out, so claps, coughs and normal talking don’t do it.',
        'Harder and longer blows put candles out faster. About two seconds of strong blowing puts out ten candles; a gentle breath takes longer, and a flame that almost went out recovers if you stop. The flames sway with any sound and lean away from the middle while you blow, and the “Wind” bar shows how strong the blow is.',
      ],
    },
    {
      heading: 'What’s in the link, and what the microphone hears',
      body: [
        'The names, age and message are encoded into the part of the link after the # sign. Browsers don’t send that part to the server when they load a page, so your text never passes through our server, and link previews in chat apps only show the tool’s own title and image.',
        'Encoding is not encryption: anyone who has the link can read the message and forward it, so leave out passwords, addresses and anything private. Your draft is kept only in this browser’s local storage.',
        'Microphone sound is analyzed in your browser for loudness and frequency content only. Nothing is recorded, saved or uploaded, and the microphone turns off when the candles are out, when you press “Turn off the microphone”, or when you switch to another tab.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why won’t the candles go out when I blow?',
      a: 'Check that you pressed “Blow with the microphone” and allowed microphone access. On a phone the microphone is usually on the bottom edge, so get close and blow one long breath at it. If the “Wind” bar barely moves, another app may be using the microphone or the browser lacks permission. You can always tap or swipe across the candles instead.',
    },
    {
      q: 'Will talking or music blow out the candles?',
      a: 'Usually not. Only sound that is loud, noise-like and lasts about 0.2 seconds counts as blowing; talking and music just make the flames flicker. A fan or hair dryer aimed right at the microphone can count, though.',
    },
    {
      q: 'Can I blow out the candles without a microphone?',
      a: 'Yes. Tap a candle to put it out, swipe across a row to put out several at once, or press “Blow out with a button” to put them out one after another.',
    },
    {
      q: 'Is my message uploaded, and who can see it?',
      a: 'It isn’t uploaded; it lives in the link after the # sign. Anyone with the link can read it, including people it gets forwarded to, so share it only with the birthday person or a group you trust.',
    },
    {
      q: 'Why is there no sound?',
      a: 'If the button says “Sound on”, the song is muted; press it to unmute. Turn up the volume too, and note that an iPhone in silent mode may not play sound from web pages. The song is synthesized in your browser with Web Audio, and “Play the song again” replays it.',
    },
    {
      q: 'How many candles does the cake get?',
      a: 'Up to age 10 there is one candle per year. From 11 the cake gets number candles, so a 30th birthday has a “3” and a “0”, and they blow out the same way. Without an age the cake gets 5 candles and the heading leaves the age out.',
    },
  ],
  related: ['age-calculator', 'zodiac-finder', 'qr-code-generator', 'spin-wheel', 'mic-test', 'countdown-timer'],
  priority: 50,
  updated: '2026-11-04',
});
