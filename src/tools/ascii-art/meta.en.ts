import { defineTool } from '../types';

export default defineTool({
  slug: 'ascii-art',
  name: 'Image to ASCII Art Converter',
  seoTitle: 'Image to ASCII Art Converter: Photo to Text Art Generator',
  description:
    'Turn a photo into ASCII art in your browser. Pick classic ASCII, blocks or braille, tune width, contrast and dithering, then copy the text or save TXT or PNG.',
  category: 'image',
  icon: 'ScanText',
  keywords: [
    'image to ascii',
    'ascii art generator',
    'photo to ascii art',
    'photo to text art',
    'image to text art',
    'picture to ascii',
    'ascii art converter',
    'braille art generator',
  ],
  intro:
    'Choose a picture and get text art made of characters in an instant. Use classic ASCII, blocks, braille or Chinese characters, set the width, then copy and paste it or save it as TXT or PNG. Your picture never leaves your device.',
  howTo: [
    'Click the dashed box to choose an image, drop one onto it, or paste a screenshot with Ctrl/Cmd + V. A sample picture is shown until you pick one.',
    'Drag the “Width” slider or press “Phone message”, “Chat post” or “Big poster”, then pick a “Character set”: Classic ASCII, Simple, Blocks, Braille, Chinese characters or Custom.',
    'Fine-tune with “Brightness” and “Contrast”, and tick “Dithering”, “Emphasize edges” or “Invert” if needed (dithering starts on for blocks and braille). Set “Background” to match where you will paste the art.',
    'Choose “Plain text” or “Color”, then press “Copy text”, “Download .txt”, “Download PNG” or “Copy as HTML”.',
  ],
  sections: [
    {
      heading: 'How brightness turns into characters',
      body: [
        'The picture is first shrunk to a grid with one cell per character. Each cell’s brightness is computed with the Rec. 709 formula (0.2126 × red + 0.7152 × green + 0.0722 × blue) and matched to a ramp of characters sorted from light to dark. On a light background, dark areas get dense characters such as @ and #, and bright areas get dots or spaces. On a dark background it works the other way around, so the dense characters draw the highlights.',
        'The order of the ramp is measured, not guessed. Your browser draws every character in the preview font on a canvas, measures how much of the cell is covered with ink and sorts by that, which also works for custom characters.',
        'A monospace character cell is roughly twice as tall as it is wide, so the tool halves the number of lines to keep the picture in proportion. Full-width characters such as Chinese characters are square and take two columns each. A braille character holds a grid of 2 × 4 dots, eight times the pixels in the same width, which is why it shows the most detail. “Dithering” uses Floyd–Steinberg error diffusion: the rounding error of each cell is passed on to its neighbors, so a handful of characters can still draw smooth gradients.',
      ],
    },
    {
      heading: 'Pictures that convert well',
      body: [
        'Large subjects on a plain background with clear contrast work best: silhouettes, black-and-white drawings, logos, pets and close-up portraits. A busy landscape turns to mush at a few dozen characters wide, so crop to the subject first with the Crop Image tool.',
        'More width means more detail. A phone message fits about 30 to 40 columns, enough for an outline; faces look better from 80 columns, and posters or prints can use 200. If the result looks flat, keep “Auto levels” on or raise “Contrast”. For line art, signatures and comics, tick “Emphasize edges”, which pairs well with the braille set.',
      ],
    },
    {
      heading: 'Why ASCII art looks broken in some apps',
      body: [
        'ASCII art only lines up when every character has the same width, which means a monospace font such as Menlo, Consolas or Courier New. Plain-text editors, terminals and code blocks wrapped in triple backticks (```) on Discord, Slack and GitHub all use one and show the art as intended.',
        'Most chat apps, social posts and word processors use proportional fonts, where i is much narrower than W, so the columns drift apart. The braille set is the usual workaround: within one font all braille characters share the same width, so it holds up better, although the result still depends on the reader’s font. Long lines that wrap, different line spacing and pages that collapse repeated spaces can also distort the art. To share it safely, send the PNG; for documents and email, “Copy as HTML” carries the font and colors along.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the difference between ASCII art and text art?',
      a: 'Strict ASCII art uses only the 95 printable ASCII characters: letters, digits, punctuation and the space. Text art is broader and also uses Unicode characters such as block shading, braille dots and Chinese characters. “Classic ASCII” and “Simple” stay within ASCII; the other sets are Unicode text art.',
    },
    {
      q: 'Why does my ASCII art look scrambled after I paste it?',
      a: 'The app is showing it in a proportional font, or long lines are wrapping. Paste it into a code block (triple backticks) where the app supports one, switch to the braille set, lower the width, or share the PNG instead.',
    },
    {
      q: 'Can I keep the colors when I paste?',
      a: 'Plain text has no color, so “Copy text” only copies the characters. “Copy as HTML” keeps the colors in editors and email apps that accept formatted text, and “Download PNG” keeps them everywhere. Chat apps usually strip the formatting.',
    },
    {
      q: 'How does braille art work?',
      a: 'The Unicode “Braille Patterns” block (U+2800 to U+28FF) has all 256 combinations of 8 dots. Each character holds 2 × 4 dots that can be on or off independently, so braille gives the finest detail per column. Empty areas use the blank braille pattern U+2800, which is as wide as the other braille characters.',
    },
    {
      q: 'Can I use my own characters?',
      a: 'Yes. Choose “Custom” and type the characters, for example 01 for a matrix look. The tool measures how dark each one is and sorts them for you; untick the sort option to keep your own light-to-dark order. Do not mix full-width and half-width characters, or the lines will not line up.',
    },
    {
      q: 'Is my photo uploaded?',
      a: 'No. Decoding, resizing and conversion all happen in your browser, and the picture is neither uploaded nor saved. Only your settings, such as width and character set, are remembered in this browser.',
    },
  ],
  related: ['fancy-text', 'image-crop', 'image-resizer', 'image-compressor', 'qr-code-generator'],
  priority: 50,
  updated: '2026-11-04',
});
