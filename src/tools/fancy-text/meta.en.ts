import { defineTool } from '../types';

export default defineTool({
  slug: 'fancy-text',
  name: 'Fancy Text Generator',
  seoTitle: 'Fancy Text Generator: Cool Fonts for Instagram & Discord',
  description:
    'Free fancy text generator. Turn text into 25 cool fonts, from bold and cursive to Gothic, bubble and upside down, to copy and paste into Instagram or Discord.',
  category: 'text',
  icon: 'WandSparkles',
  keywords: [
    'fancy text generator',
    'font generator',
    'cool fonts',
    'fonts copy and paste',
    'instagram fonts',
    'discord fonts',
    'cursive font generator',
    'bold text generator',
    'italic text generator',
    'gothic font generator',
    'bubble text',
    'upside down text',
    'strikethrough text generator',
    'small text generator',
    'aesthetic fonts',
    'tiktok fonts',
  ],
  intro:
    'Type your name or a short line and see it in 25 Unicode font styles at once. Hit Copy and paste it into your Instagram bio, Discord nickname, TikTok profile or anywhere else, no font install needed.',
  howTo: [
    'Type your name, username or a short message into “Type your text”.',
    'All styles update instantly: bold, italic, cursive, Gothic, double-struck, bubble, strikethrough, upside down and more.',
    'Click “Copy” next to the style you like and paste it into your profile, bio or message.',
    'If someone sees boxes or question marks, their device lacks that character. Bold, italic and sans-serif styles display almost everywhere.',
  ],
  sections: [
    {
      heading: 'How fancy text works',
      body: [
        'Instagram, Discord and TikTok don’t let you pick a font, so these styles aren’t fonts at all. They are Unicode characters that look like letters, mostly from the Mathematical Alphanumeric Symbols block. Bold 𝐀 is “mathematical bold capital A” (U+1D400) and cursive 𝒜 is “mathematical script capital A”. Because every device uses the same code points, the text looks the same for whoever reads it.',
        'A few letters were encoded earlier in the Letterlike Symbols block (ℝ, ℂ, ℎ, ℯ), so their slots in the math block are empty. Simple generators that just add an offset show boxes for cursive B, E, F, H, I, L, M, R, e, g and o, Gothic C, H, I, R and Z, and double-struck C, H, N, P, Q, R and Z. This generator maps each of them to the correct character.',
      ],
    },
    {
      heading: 'Using fancy fonts on Instagram, Discord and TikTok',
      body: [
        'On Instagram you can paste fancy text into your Name and Bio fields, captions and comments. Your username (the part after @) only accepts letters, numbers, periods and underscores, so it can’t use these characters. Discord accepts them in display names, server nicknames, channel names and messages; TikTok in your name and bio.',
        'Keep hashtags in plain text: #𝐋𝐨𝐯𝐞 and #Love are different characters, so a styled hashtag won’t show up in searches. Many platforms count each styled letter as two characters, so you may hit a 30-character name limit or 150-character bio limit sooner than expected.',
      ],
    },
    {
      heading: 'Accessibility: what screen readers hear',
      body: [
        'Screen readers such as VoiceOver and TalkBack often read these characters one by one (“mathematical bold capital H, mathematical bold small e…”) or skip them entirely. Upside-down and strikethrough text is almost impossible to follow.',
        'Use fancy text as decoration for a name or a short tagline, and keep contact details, prices, links and anything people need to search for in normal text.',
      ],
    },
    {
      heading: 'Which style should you pick?',
      body: [
        'Bold and sans-serif bold are the most reliable for standing out. Cursive script and bold cursive give an elegant, handwritten look for names and brands. Gothic (Fraktur) feels medieval or metal, double-struck and monospace feel technical, and bubble or square letters are good for decoration. Black bubbles and squares only exist in capitals, so lowercase input is shown in capitals.',
        'Strikethrough, underline and slashed add a combining mark after each character, so they work on any text but may sit slightly differently from app to app. Upside down flips both the letters and their order. Everything runs in your browser and nothing you type is uploaded.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I change my font on Instagram?',
      a: 'Type your text here, click Copy next to a style, then open Instagram, tap Edit profile and paste it into your Name or Bio. Save, and the new look appears for everyone.',
    },
    {
      q: 'Why do some people see boxes or question marks?',
      a: 'Their device’s fonts don’t include that Unicode character, which happens on older phones and some computers. Bold, italic and sans-serif styles have the widest support.',
    },
    {
      q: 'Can I use fancy fonts in my Discord name?',
      a: 'Yes. Paste them into your display name or a server nickname. Some servers use bots that block non-standard characters in nicknames, so check the server rules.',
    },
    {
      q: 'Do fancy fonts work in hashtags?',
      a: 'No. Styled letters are different characters, so #𝐋𝐨𝐯𝐞 won’t match #Love. Keep hashtags in plain text.',
    },
    {
      q: 'Is fancy text bad for SEO or search?',
      a: 'Search engines and in-app search usually don’t treat styled letters as normal letters, so your name may not be found if it is written only in fancy text. Keep important keywords in plain text.',
    },
    {
      q: 'Does it work with accented letters or emoji?',
      a: 'Unicode only has styled versions of the plain letters A–Z and digits 0–9. Accented letters, emoji and other scripts stay as they are, though strikethrough and underline still apply to them.',
    },
  ],
  related: ['case-converter', 'word-counter', 'lorem-ipsum', 'led-marquee', 'line-tools', 'qr-code-generator'],
  priority: 75,
  updated: '2026-10-29',
});
