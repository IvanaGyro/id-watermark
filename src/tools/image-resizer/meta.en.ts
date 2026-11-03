import { defineTool } from '../types';

export default defineTool({
  slug: 'image-resizer',
  name: 'Image Resizer',
  seoTitle: 'Image Resizer: Resize Photos in Pixels or Percent, in Bulk',
  description:
    'Free image resizer. Change dimensions in pixels or by percentage, keep the aspect ratio or crop to fit, with presets for Instagram, YouTube and passport photos.',
  category: 'image',
  icon: 'Scaling',
  keywords: [
    'image resizer',
    'resize image',
    'photo resizer',
    'resize image online',
    'change image size',
    'resize image to 1080x1080',
    'resize image for instagram',
    'youtube thumbnail size 1280x720',
    'resize photo for passport 600x600',
    'resize image by percentage',
    'bulk image resizer',
    'reduce image dimensions',
    'resize image without losing quality',
  ],
  intro:
    'Resize one image or a whole batch to exact pixel dimensions or a percentage, with one-click sizes for Instagram, Stories, YouTube thumbnails and US passport photos. Images are processed in your browser.',
  howTo: [
    'Click the dashed box to choose images, drop them onto it, or press Ctrl/Cmd + V to paste. You can add several at once.',
    'Under “Resize by”, choose “Pixels” and enter a width or height. With “Lock aspect ratio” ticked you only need one side; the other is calculated.',
    'For an exact size, click one of the “Popular sizes” or untick the lock and enter both sides, then pick how to handle a different aspect ratio: fill and crop, fit inside or stretch.',
    'To scale everything by the same amount, choose “Percentage”. Then click “Download” or “Download all”.',
  ],
  sections: [
    {
      heading: 'Pixels, DPI and file size',
      body: [
        'An image’s size on screen is set by its pixel dimensions, such as 1920 × 1080. The DPI (dots per inch) value stored in a file only matters for printing, so to make an image load faster on the web or fit an upload limit, reduce its pixel dimensions rather than changing DPI.',
        'Pixel count is width × height, so halving both sides leaves a quarter of the pixels and usually cuts the file size dramatically. Enlarging a small image can’t add detail; it only makes it softer. If you need a large image, start from the original high-resolution file.',
      ],
    },
    {
      heading: 'Fill and crop vs fit inside vs stretch',
      body: [
        'When the target box has a different shape from your photo (say a 4:3 photo going into a 1:1 square), there are three options. “Fill and crop” scales the photo up until it covers the whole box and trims the overflow from the center; nothing is distorted and there are no bars, which is ideal for social posts, profile pictures and thumbnails. Check the preview in case your subject is off-center.',
        '“Fit inside” keeps the whole picture and fills the leftover space with a padding color (or transparency for PNG and WebP), like letterboxing. “Stretch” forces the photo to the exact size and distorts it if the proportions differ, so it is rarely what you want for photos.',
      ],
    },
    {
      heading: 'Common image sizes for social media and documents',
      body: [
        'Instagram: 1080 × 1080 for square posts, 1080 × 1350 for portrait (4:5) posts, and 1080 × 1920 for Stories and Reels. Facebook and most link previews (Open Graph) use 1200 × 630. X (Twitter) shows single images best at 1600 × 900 (16:9). YouTube thumbnails should be 1280 × 720 and under 2 MB.',
        'For a US passport photo submitted online, the State Department asks for a square image between 600 × 600 and 1200 × 1200 pixels, which is the digital equivalent of the 2 × 2 inch print at 300 DPI. Crop so the head takes up 50–69% of the height before resizing.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I resize an image without stretching it?',
      a: 'Keep “Lock aspect ratio” ticked and enter just the width or the height. For an exact box like 1080 × 1080, untick the lock and choose “Fill and crop” or “Fit inside” instead of “Stretch”.',
    },
    {
      q: 'Does resizing reduce image quality?',
      a: 'Shrinking keeps images sharp; this tool downsizes in steps for smoother results. Enlarging beyond the original size makes images look soft because no new detail can be created.',
    },
    {
      q: 'How do I resize a photo to 600 × 600 for a passport application?',
      a: 'Click “US passport photo” in Popular sizes, which sets 600 × 600 with “Fill and crop”. Make sure your head is centered first, or use the image crop tool to frame it precisely.',
    },
    {
      q: 'Can I resize many images at once?',
      a: 'Yes. Add as many images as you like; the same settings apply to all of them. Use “Download all” to save them, each named with its new size, such as photo-1080x1080.jpg.',
    },
    {
      q: 'Will resizing make the file smaller?',
      a: 'Usually yes, because there are fewer pixels to store. For an even smaller file, choose JPG or WebP and lower the quality, or run the result through the image compressor.',
    },
    {
      q: 'Are my images uploaded?',
      a: 'No. Resizing uses your browser’s canvas on your own device, so your photos are never sent to a server.',
    },
  ],
  related: ['image-compressor', 'image-crop', 'image-converter', 'bead-pattern', 'heic-to-jpg', 'image-to-pdf', 'image-to-base64'],
  priority: 70,
  updated: '2026-10-29',
});
