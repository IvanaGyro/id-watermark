import { defineTool } from '../types';

export default defineTool({
  slug: 'led-marquee',
  name: 'LED Scrolling Text',
  seoTitle: 'LED Scrolling Text: Phone Marquee and LED Banner Online',
  description:
    'Turn your phone into an LED scrolling text sign. Type a message, pick colors and speed, then go full screen for concerts, airport pickups and cheering.',
  category: 'generator',
  icon: 'Megaphone',
  keywords: [
    'led scrolling text',
    'scrolling text',
    'phone marquee',
    'led banner',
    'led banner app online',
    'scrolling text sign',
    'scrolling text app',
    'led sign on phone',
    'airport pickup sign',
    'concert sign on phone',
  ],
  intro:
    'Type a message and your phone becomes a big LED scrolling sign: hold it up at a concert, greet someone at airport arrivals or get a message across a loud bar. Press “Full screen” and turn the phone sideways; the text fills the screen.',
  howTo: [
    'Type your text in “Message”. The preview above updates as you type.',
    'Under “Motion”, choose Scroll left, Scroll right or Static. Pick a text color and a background; the last circle in each row opens a color picker.',
    'Set the speed and text size, and turn on “LED dot effect”, “Blink” or “Mirror” if you like.',
    'Press “Full screen” and hold the phone sideways. Tap the screen to show “Rotate” and “Exit full screen”; on a computer, Esc also exits.',
    'To show the same sign on a friend’s phone, press “Copy share link” and send them the link.',
  ],
  sections: [
    {
      heading: 'How to make a sign people can read from far away',
      body: [
        'The farther away your audience is, the bigger and shorter the message should be. Text size starts at “Fill height”, so in landscape full screen each letter is almost as tall as the screen. For an airport pickup sign or a cheering sign, keep it to a name or a few words and choose “Static”; text that is too wide shrinks to fit. For a longer message, let it scroll and lower the speed so people have time to read it.',
        'Contrast matters more than any single color. Red, yellow, green or white on black looks like a classic LED board and stands out in a dark venue. In daylight or a bright arrivals hall, black on yellow or black on white is easier to read. The tool warns you when the two colors are too close. Turn your screen brightness all the way up before you start.',
      ],
    },
    {
      heading: 'Full screen on iPhone and Android',
      body: [
        'On Android and on computers the sign uses the browser’s full screen mode, which hides the address bar and system bars. Safari on iPhone may not let a web page go full screen, so the sign covers the whole page instead. While in full screen, the tool asks the browser to keep the screen awake, so supported browsers will not dim or lock it.',
        'If your phone has rotation lock on, turning it sideways does not rotate the page, so the sign turns the text to run along the long side by itself. If it ends up upside down, tap the screen and press “Rotate” to turn it 180 degrees. Tapping also brings up “Exit full screen”, and Esc exits on a computer.',
      ],
    },
    {
      heading: 'Blink, LED dots and mirror',
      body: [
        '“LED dot effect” lays a grid of round dots over the text so it looks like the bulbs of a real LED board, with the unlit dots faintly visible. “Blink” flashes the text once a second, which works best with a short static message. That rate is below the limit of three flashes per second in the Web Content Accessibility Guidelines (WCAG), but turn it off if someone nearby is sensitive to flashing light.',
        '“Mirror” flips the whole sign left to right, for when people see it reflected in a mirror or a window. A share link carries the text, colors, speed and every effect, so your friend can open it and go straight to full screen.',
      ],
    },
  ],
  faq: [
    {
      q: 'Can I use my phone as a concert sign?',
      a: 'Yes. Type your message, pick bright text on a black background, press “Full screen” and hold the phone up sideways. A phone screen is small, so fewer words read better. Check the venue’s rules on signs and phone use before you go.',
    },
    {
      q: 'How do I make an airport pickup sign on my phone?',
      a: 'Type the person’s name or “Welcome home”, choose “Static” and leave the text size at “Fill height”; the name scales to fit the screen. Arrivals halls are usually bright, so black on yellow or black on white is often clearer than a black background.',
    },
    {
      q: 'How do I share my sign with a friend?',
      a: 'Press “Copy share link” and paste it into a message, or use “Share” on your phone. When your friend opens the link they see the same text, colors, speed and effects, with nothing to install.',
    },
    {
      q: 'Will my screen turn off while the sign is showing?',
      a: 'In full screen the tool asks the browser to keep the screen on (Screen Wake Lock), so supported browsers will not lock it while the sign is up. If the browser does not support it or battery saver is on, the screen may still turn off according to your settings, so set a longer auto-lock time for the event.',
    },
    {
      q: 'How do I exit full screen?',
      a: 'Tap the screen and press “Exit full screen” in the top corner. On a computer you can also press Esc.',
    },
    {
      q: 'Is my message uploaded anywhere?',
      a: 'No. The sign runs entirely in your browser and your last settings are saved only on this device. In a share link the message sits after the “#” in the URL, and browsers do not send that part to the server.',
    },
  ],
  related: ['qr-code-generator', 'fancy-text', 'countdown-timer', 'screen-test', 'spin-wheel'],
  priority: 50,
  updated: '2026-11-04',
});
