import { defineTool } from '../types';

export default defineTool({
  slug: 'color-converter',
  name: 'Color Converter',
  seoTitle: 'Color Converter: HEX to RGB, HSL and OKLCH with Contrast Checker',
  description:
    'Free color converter. Paste a HEX, RGB, HSL or OKLCH code to convert it to every other format, then check its WCAG contrast ratio with white and black text.',
  category: 'dev',
  icon: 'Palette',
  keywords: [
    'color converter',
    'hex to rgb',
    'rgb to hex',
    'hex to hsl',
    'hsl to hex',
    'color code converter',
    'oklch converter',
    'hex to oklch',
    'color picker',
    'contrast checker',
    'wcag contrast ratio',
    'css color converter',
    'rgba to hex',
  ],
  intro:
    'Convert any CSS color between HEX, RGB, HSL and OKLCH, and see right away whether white or black text on it passes WCAG contrast. Works with transparency too.',
  howTo: [
    'Type or paste a color into “Enter any color code”, for example #2456e3, rgb(36, 86, 227), hsl(224, 77%, 52%) or oklch(0.53 0.21 265). Or click the swatch on the left to pick one.',
    'The HEX, RGB, HSL and OKLCH rows update instantly. Click “Copy” next to the format you need.',
    'Check the contrast checker: it shows the ratio and AA / AAA results for white text and black text on your color.',
  ],
  sections: [
    {
      heading: 'HEX, RGB, HSL and OKLCH explained',
      body: [
        'HEX (#2456e3) and RGB (rgb(36, 86, 227)) describe the same thing: how much red, green and blue light to mix, each from 0 to 255. HEX writes the three values in base 16, which is why it is the format you see in design tools and brand guidelines. An optional fourth pair, as in #2456e380, adds transparency.',
        'HSL describes a color by hue (0–360 degrees around the color wheel), saturation and lightness, which makes it easier to tweak by hand: change only the lightness to get a darker or lighter shade. Its weakness is that equal lightness values don’t look equally bright: hsl(60, 100%, 50%) yellow looks far lighter than hsl(240, 100%, 50%) blue.',
        'OKLCH, supported in all major browsers since 2023, fixes that. L is perceived lightness, C is chroma (colorfulness) and H is hue. Colors with the same L look equally light, so OKLCH is a good choice for building color palettes and design-system scales. It can also describe colors outside the sRGB range of most screens.',
      ],
    },
    {
      heading: 'WCAG color contrast requirements',
      body: [
        'The Web Content Accessibility Guidelines (WCAG 2.1 and 2.2) measure contrast as a ratio from 1:1 (no contrast) to 21:1 (black on white). Level AA, the target in most accessibility laws and policies including the ADA Title II rule and Section 508 in the US and the European Accessibility Act, requires 4.5:1 for normal text and 3:1 for large text. Level AAA asks for 7:1 and 4.5:1.',
        'Large text means at least 18pt (24px) regular or 14pt (about 18.66px) bold. A classic example: #767676 gray on white is 4.54:1 and just passes AA, while #777777 is 4.48:1 and fails. The default blue #2456e3 reaches 5.97:1 with white text, so it passes AA but not AAA.',
      ],
    },
    {
      heading: 'Writing colors in CSS',
      body: [
        'Modern CSS accepts space-separated color functions: rgb(36 86 227 / 50%), hsl(224 77% 52%) and oklch(0.53 0.21 265). This converter reads both the older comma syntax and the modern one, and outputs the comma form for RGB and HSL because it works everywhere.',
        'When an OKLCH color falls outside sRGB, the browser clips it to the nearest color the screen can show. This tool does the same and tells you when it happened, so you know the HEX and RGB values are an approximation.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I convert HEX to RGB?',
      a: 'Split the six digits into three pairs and convert each from base 16 to base 10. For #ff6347, ff = 255, 63 = 99 and 47 = 71, so the color is rgb(255, 99, 71). Paste the HEX code above and the RGB value appears instantly.',
    },
    {
      q: 'What’s the difference between HSL and OKLCH?',
      a: 'Both use hue, but HSL’s lightness is mathematical while OKLCH’s is perceptual. Two OKLCH colors with the same L look equally light to the eye; two HSL colors with the same L often don’t. OKLCH is better for generating consistent shades and palettes.',
    },
    {
      q: 'What contrast ratio do I need for accessibility?',
      a: 'For WCAG AA, which most organizations target, normal text needs at least 4.5:1 and large text 3:1. AAA needs 7:1 for normal text and 4.5:1 for large text. User-interface components and icons need 3:1 against their surroundings.',
    },
    {
      q: 'Does it support transparent colors?',
      a: 'Yes. You can enter #RRGGBBAA, rgba(), or the / alpha syntax. The contrast check uses the color as it would appear laid over a white background.',
    },
    {
      q: 'Can I enter color names like “tomato” or “navy”?',
      a: 'Not at the moment. Enter the color as HEX, rgb(), hsl() or oklch(). You can also click the swatch to open your system’s color picker, or use its eyedropper to grab a color from the screen where supported.',
    },
  ],
  related: ['image-converter', 'html-entities', 'markdown-preview', 'bead-pattern', 'json-formatter'],
  priority: 60,
  updated: '2026-10-29',
});
