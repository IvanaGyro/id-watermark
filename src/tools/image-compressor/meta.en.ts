import { defineTool } from '../types';

export default defineTool({
  slug: 'image-compressor',
  name: 'Image Compressor',
  seoTitle: 'Image Compressor: Compress JPG, PNG and WebP Online in Bulk',
  description:
    'Free image compressor that shrinks JPG, PNG and WebP files without visible quality loss. Batch compress, cap the width and convert to WebP. No uploads.',
  category: 'image',
  icon: 'Minimize2',
  keywords: [
    'image compressor',
    'compress image',
    'compress jpeg',
    'compress png',
    'reduce image size',
    'reduce file size of photo',
    'compress image to 100kb',
    'compress image to 1mb',
    'bulk image compressor',
    'image optimizer',
    'compress images for website',
    'compress photo for email',
    'compress image without losing quality',
  ],
  intro:
    'Shrink photos and screenshots in seconds. Set the quality, optionally cap the width, and download smaller files. Everything happens in your browser, so nothing is uploaded.',
  howTo: [
    'Click the dashed box to choose images, drop them onto it, or press Ctrl/Cmd + V to paste. You can add many at once.',
    'Adjust “Quality”. 70–85 keeps photos looking the same while cutting the size dramatically.',
    'Optionally pick an “Output format” (WebP is usually smallest) and enter a “Max width (px)” to scale large photos down.',
    'Check the size and percentage saved for each image, then click “Download” or “Download all”.',
  ],
  sections: [
    {
      heading: 'How image compression works',
      body: [
        'JPG and WebP use lossy compression: they discard detail your eye is unlikely to notice, such as subtle color variation in fine texture. The quality setting controls how much is thrown away. Between about 70 and 85, most photos look identical to the original on screen while the file shrinks by 50–80%. Below 60, you start to see blocky artifacts and color banding in skies and skin tones.',
        'PNG is lossless, so a quality slider can’t make it smaller. What does work for PNG is reducing its dimensions, or converting photo-like PNGs to JPG or WebP, which often cuts them to a fraction of the size.',
      ],
    },
    {
      heading: 'Resize first: the biggest saving is pixel count',
      body: [
        'A 12-megapixel phone photo is about 4000 × 3000 pixels, far more than any web page or email needs. Halving the width to 2000 px removes three quarters of the pixels, and that saving multiplies with quality compression. Common targets: 1200–1600 px for blog and article images, 1080 px for Instagram, 1920 px for full-screen hero images, and 800–1200 px for photos you attach to an email.',
      ],
    },
    {
      heading: 'Typical file size limits',
      body: [
        'Many sites cap uploads: job application portals and government forms often ask for images under 1 MB or even 200 KB; Gmail and Outlook limit attachments to 20–25 MB for the whole message; WordPress hosts commonly default to a 2–8 MB upload limit. To hit a target like 100 KB, first set a max width (for example 1000 px), then lower the quality until the size fits.',
        'For your own website, smaller images improve Largest Contentful Paint (LCP), one of Google’s Core Web Vitals. Aim for under 200 KB for most content images and use WebP where you can.',
      ],
    },
    {
      heading: 'Your photos stay on your device',
      body: [
        'Many online compressors upload your files to their servers. This one decodes and re-encodes images with your browser’s built-in canvas, so personal photos, ID scans and unreleased work never leave your computer or phone. Location and camera metadata (EXIF) is also dropped from the compressed output, which is a privacy bonus when sharing photos publicly.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I compress an image to under 100 KB?',
      a: 'Enter a max width such as 1000 px, then lower the quality slider and watch the size next to the image. Saving as WebP or JPG instead of PNG also helps a lot. Most photos fit under 100 KB at 1000 px wide and quality 70.',
    },
    {
      q: 'Will compressing reduce image quality?',
      a: 'At quality 70–85 the difference is very hard to see on screen. Text-heavy screenshots and graphics with sharp edges show artifacts sooner, so keep those as PNG or use a higher quality.',
    },
    {
      q: 'Why did my PNG barely get smaller?',
      a: 'PNG is lossless, so the quality setting doesn’t apply. Choose JPG or WebP as the output format, or set a max width, to make a PNG significantly smaller.',
    },
    {
      q: 'Why does it say “Original kept”?',
      a: 'If re-encoding would make a file bigger (common with images that are already well compressed), the tool keeps your original instead of handing back a larger file.',
    },
    {
      q: 'Does compression remove EXIF data?',
      a: 'Yes. The compressed file is re-encoded from pixels, so GPS location, camera model and other EXIF metadata are not carried over. The photo’s orientation is applied before encoding, so it won’t appear rotated.',
    },
    {
      q: 'Is there a limit on how many images I can compress?',
      a: 'No fixed limit. Images are processed one after another on your device, so very large batches simply take a little longer.',
    },
  ],
  related: ['image-resizer', 'image-converter', 'heic-to-jpg', 'id-watermark', 'image-crop', 'image-to-pdf', 'image-to-base64'],
  priority: 80,
  updated: '2026-10-29',
});
