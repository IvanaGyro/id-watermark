import { defineTool } from '../types';

export default defineTool({
  slug: 'screen-test',
  name: 'Dead Pixel Test',
  seoTitle: 'Dead Pixel Test: Check Your Screen for Stuck Pixels and Bleed',
  description:
    'Free full-screen dead pixel test for monitors, laptops, TVs and phones. Cycle solid colors to find dead or stuck pixels, then check backlight bleed and banding.',
  category: 'test',
  icon: 'Monitor',
  keywords: [
    'dead pixel test',
    'dead pixel checker',
    'stuck pixel test',
    'screen test',
    'monitor test',
    'pixel test',
    'backlight bleed test',
    'monitor uniformity test',
    'screen color test',
    'lcd test',
    'oled screen test',
    'gradient banding test',
    'new monitor test',
    'phone screen test',
  ],
  intro:
    'Fill your screen with pure colors to spot dead, stuck and hot pixels in seconds, then use the gradient and uniformity patterns to check banding and backlight bleed.',
  howTo: [
    'Clean the screen with a dry microfiber cloth so dust isn’t mistaken for a dead pixel.',
    'Choose “Dead pixel test” and press “Start full screen”, or tap a color swatch to start from that color.',
    'Click or press → to go to the next color, ← to go back. Look over the whole screen, including the corners, on each color.',
    'Press Esc to exit. For bleed and clouding, run “Uniformity and backlight bleed” in a dark room with brightness turned up.',
  ],
  sections: [
    {
      heading: 'Dead, stuck and hot pixels',
      body: [
        'Each pixel on an LCD or OLED panel is made of red, green and blue subpixels. A dead pixel never lights up, so it shows as a black dot on the white screen. A stuck pixel has one or two subpixels permanently on, so it shows as a red, green or blue dot on the black or gray screens. A hot pixel is fully stuck on and shows as a white dot on black.',
        'Stuck pixels can sometimes be revived by flashing rapidly changing colors over them or by gently massaging the spot through a cloth while the screen is off. Truly dead pixels usually can’t be fixed in software.',
      ],
    },
    {
      heading: 'Dead pixel policies and returns',
      body: [
        'Most monitor makers follow the ISO 9241-307 pixel classes, and many only replace a panel once a certain number of bright or dark pixels is reached. Some brands, such as Dell with its Premium Panel Guarantee, promise replacement for even a single bright pixel during the warranty.',
        'The easiest fix is to test as soon as the screen arrives: retailers such as Amazon, Best Buy and Costco accept returns within their return window regardless of the manufacturer’s pixel policy. Take a photo of the defect on the solid color where it is most visible.',
      ],
    },
    {
      heading: 'Backlight bleed, IPS glow and uniformity',
      body: [
        'On LCD monitors, light from the backlight can leak around the edges and show up as bright patches on a black screen. Some edge bleed is normal, especially on IPS panels, which also show “IPS glow”, a silvery sheen that changes as you move your head. Bleed stays put when you change viewing angle; glow does not.',
        'The gray uniformity patterns reveal clouding (mura), vignetting and the dirty screen effect common on large TVs. OLED screens have no backlight, so black should be perfectly black; on OLED, use the 10% and 25% gray patterns to look for banding and burn-in.',
      ],
    },
    {
      heading: 'Gradients and color banding',
      body: [
        'A smooth gradient from black to white should have no visible steps. Clear bands usually mean a 6-bit panel with dithering, an aggressive picture mode, or a cable running at reduced color depth. In the 32-step grayscale, every block should be distinguishable; if the darkest steps merge, your black level or gamma setting is crushing shadow detail.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I check a new monitor for dead pixels?',
      a: 'Clean the screen, open this page on that monitor, start the dead pixel test in full screen and look closely at each solid color, especially black and white. Check the corners and edges as well as the center.',
    },
    {
      q: 'Is it a dead pixel or just dust?',
      a: 'Dust or a smudge moves or disappears when you wipe the screen and often looks blurry. A dead or stuck pixel is a sharp dot that stays in exactly the same place on every color.',
    },
    {
      q: 'Can a stuck pixel fix itself?',
      a: 'Sometimes. Stuck pixels occasionally recover after hours of use or after flashing colors. A pixel that is black on every color is more likely dead and permanent.',
    },
    {
      q: 'How many dead pixels are acceptable?',
      a: 'It depends on the manufacturer’s pixel policy, usually based on ISO 9241-307. Many accept a few dark pixels as within spec but replace screens with bright pixels in the center. Check your brand’s warranty page, and remember store return windows are often more generous.',
    },
    {
      q: 'Can I test a phone or tablet screen?',
      a: 'Yes. Open the page on the phone and start the test. iPhone Safari doesn’t allow web pages to go full screen, so the colors fill the window instead; add the page to your Home Screen or turn the phone sideways to hide most of the toolbars.',
    },
    {
      q: 'Does this test work on a TV?',
      a: 'Yes. Open the page in the TV’s web browser, or cast or mirror a laptop browser window to the TV, and start the test in full screen. On a mirrored screen, scaling can soften single pixels, so look closely.',
    },
  ],
  related: ['keyboard-tester', 'webcam-test', 'mic-test', 'led-marquee', 'image-resizer'],
  priority: 60,
  updated: '2026-10-29',
});
