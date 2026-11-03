import { defineTool } from '../types';

export default defineTool({
  slug: 'bead-pattern',
  name: 'Bead Pattern Maker',
  seoTitle: 'Bead Pattern Maker: Turn a Photo into a Perler-Style Pattern',
  description:
    'Free bead pattern generator: turn any photo into a fuse bead pattern for Perler, Hama or Artkal style beads, with bead counts per color and pegboards needed.',
  category: 'image',
  icon: 'Grid3x3',
  keywords: [
    'perler bead pattern maker',
    'bead pattern generator',
    'photo to bead pattern',
    'fuse bead pattern',
    'perler bead pattern generator',
    'picture to perler beads',
    'hama bead pattern maker',
    'pixel art bead pattern',
    'melty bead pattern',
    'bead pattern from photo',
  ],
  intro:
    'Upload a photo or picture and get a printable fuse bead pattern right away. The tool picks the closest bead colors, counts how many beads and pegboards you need, and lets you fix single beads before you download or print.',
  howTo: [
    'Use the “Click to choose an image, or drop it here” box to pick a photo, drag a file onto it, or paste with Ctrl/Cmd + V. A sample picture is shown until you pick your own.',
    'Under “Width (beads)”, choose 29, 58 or 87, or type your own number. The height follows the picture unless you pick “Crop to square” or “Fit in square” under “Shape”.',
    'Choose a “Palette” and set the color limit with the “Up to … colors” slider. Tick “Dithering” for photos, and keep “Leave transparent and white background empty” on to skip the backdrop.',
    'To fix a bead, pick a color or the eraser under “Edit colors” and tap the pattern. “Undo” takes back the last change.',
    'Gather your beads with the “Shopping list”, then press “Download PNG”, or “Print” to print only the pattern and the list.',
  ],
  sections: [
    {
      heading: 'Choosing a pattern size',
      body: [
        'Width is the number of beads across; the height follows the shape of your picture. Large square pegboards are commonly 29 × 29 pegs, so a width of 29 fills one board, 58 fills a 2 × 2 block of four boards and 87 a 3 × 3 block of nine. Standard fuse beads are about 5 mm, so 29 beads come out at roughly 14.5 cm (5.7 in) and 58 beads at about 29 cm (11.4 in). The stats above the pattern show the finished size for you.',
        'More beads mean more detail, but also more beads to buy and more time on the board. Cartoon characters, logos and lettering with clear shapes look good at 29 across. Faces and landscapes usually need 58 or more, and it helps to crop the subject tightly first. A darker line every 10 beads makes counting easier, and the red lines show where each pegboard ends, so a big piece can be built one board at a time.',
      ],
    },
    {
      heading: 'How many beads to buy',
      body: [
        'The shopping list under the pattern shows how many beads of each color you need, most-used first, plus the total. Beads get dropped and rows get redone, so it is worth having a few extra of the main colors. If the list is long, lower the color limit: the least-used colors are merged into the closest color that stays, which also makes the pattern look cleaner.',
        'The palette is a set of approximate, generic bead shades, not any brand’s color codes. Shades differ between Perler, Hama and Artkal style beads, and even between batches of the same brand, so compare with real beads or a color chart before you buy. Colors are matched in CIELAB, a color space built around how people see color, which usually gives more natural results than comparing raw RGB values.',
      ],
    },
    {
      heading: 'Ironing tips',
      body: [
        'Cover the finished design with ironing paper or parchment paper; the iron should never touch the beads directly. Use a medium setting with the steam off and keep the iron moving in small circles. Lift a corner of the paper now and then: the beads are done when they have just melted together. Ironing too long closes the holes and can warp the piece.',
        'For a stronger piece, carefully flip it and give the other side a light press too. While it is still warm, set a heavy book on top and let it cool completely so it stays flat. When kids are making beads, an adult should handle the iron.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is this bead pattern maker free, and is my photo uploaded?',
      a: 'It is free and needs no sign-up. Your picture is converted inside your browser and is never uploaded to a server. Your settings are remembered in this browser, but the image itself is not saved.',
    },
    {
      q: 'Do the colors match Perler, Hama or Artkal color codes?',
      a: 'No. The palette uses approximate, generic bead colors, so you can use the pattern with Perler, Hama or Artkal style beads, but shades vary by brand. Compare with real beads or the brand’s color chart and pick the closest code yourself.',
    },
    {
      q: 'How many beads fit on one pegboard?',
      a: 'A large square pegboard is commonly 29 × 29 pegs, which holds 841 beads. If your board is a different size, enter it under “Pegboard size (pegs per side)” and the red board lines and the board count update.',
    },
    {
      q: 'Why does my photo pattern look noisy?',
      a: 'Crop the photo so the subject fills the frame, and pick pictures with a simple background and good contrast. A larger width keeps more detail, a lower color limit removes stray single colors, and dithering is best left off for cartoons. You can then fix the last few beads by hand under “Edit colors”.',
    },
    {
      q: 'Can I edit the pattern?',
      a: 'Yes. Pick a swatch under “Edit colors” and tap a bead to recolor it, or pick the eraser to leave a peg empty. With a mouse you can drag to paint. “Undo” or Ctrl/Cmd + Z steps back, and “Discard all edits” returns to the generated pattern.',
    },
    {
      q: 'How do I print the pattern?',
      a: 'Press “Print” to print only the stats, the pattern and the shopping list, without the rest of the page. On a black-and-white printer, tick “Show a symbol on each bead” so you can match beads to the list. You can also download the PNG and follow it on a phone or tablet.',
    },
  ],
  related: ['image-crop', 'image-resizer', 'color-converter', 'heic-to-jpg', 'image-compressor'],
  priority: 50,
  updated: '2026-11-04',
});
