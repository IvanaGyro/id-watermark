import { defineTool } from '../types';

export default defineTool({
  slug: 'image-to-pdf',
  name: 'JPG to PDF',
  seoTitle: 'JPG to PDF: Combine Images and Photos Into One PDF, Free',
  description:
    'Convert JPG to PDF for free. Combine photos, scans and screenshots into one PDF on US Letter, A4 or fit-to-image pages, in any order. No uploads.',
  category: 'pdf',
  icon: 'FileImage',
  keywords: [
    'jpg to pdf',
    'image to pdf',
    'convert jpg to pdf',
    'png to pdf',
    'photo to pdf',
    'picture to pdf',
    'combine jpg into one pdf',
    'multiple images to one pdf',
    'jpg to pdf free',
    'jpg to pdf converter',
    'screenshot to pdf',
    'convert photos to pdf on iphone',
    'scan to pdf',
    'jpg to pdf without uploading',
  ],
  intro:
    'Put photos, scans and screenshots into one PDF, one image per page, in the order you choose. Images stay on your device and are never uploaded.',
  howTo: [
    'Click the dashed box to choose images, or drag them in. You can also paste a screenshot with Ctrl/Cmd + V.',
    'Choose a page size (US Letter, A4 or “Fit image”), an orientation and a margin. The thumbnails show exactly where each image will sit.',
    'Drag the handle on the left or use the arrows to put the pages in order, and change the file name if you like.',
    'Click “Convert to PDF and download”.',
  ],
  sections: [
    {
      heading: 'Letter, A4 or fit image?',
      body: [
        'US Letter (8.5 × 11 in) is the standard paper size in the United States and Canada, and the right choice if the PDF will be printed there or uploaded to a US form. A4 (210 × 297 mm) is used almost everywhere else. With either one, each image is scaled to fit inside the margins and centered without cropping or stretching, and “Auto” orientation gives landscape images a landscape page.',
        '“Fit image” makes every page exactly the size of its picture, counting 96 pixels per inch, with no white border. It is ideal for screenshots, long receipts and phone screen captures that you only need to view on screen.',
      ],
    },
    {
      heading: 'Full quality, no recompression',
      body: [
        'JPG and PNG files are embedded in the PDF as they are, so there is no second round of compression and no loss of quality. The PDF is about the same size as your images added together. WebP, GIF, BMP and AVIF images are redrawn and stored as high-quality JPG.',
        'Phone photos often carry an EXIF orientation tag instead of being stored upright. The tool reads that tag, so portrait photos from an iPhone or Android phone come out the right way up in the PDF.',
      ],
    },
    {
      heading: 'Common uses',
      body: [
        'Turn photos of signed forms, receipts or homework into a single PDF for a school portal, an expense report, an insurance claim or a rental application. Many of these sites accept only one PDF per upload, so combine the pages here first.',
        'iPhone photos saved as HEIC can be added as they are; they are converted to JPG on your device. If the PDF is too big for an upload limit, shrink the photos first with the image compressor or resizer.',
      ],
    },
  ],
  faq: [
    {
      q: 'Are my images uploaded?',
      a: 'No. The PDF is built entirely in your browser with pdf-lib, and your images never leave your device.',
    },
    {
      q: 'How do I combine several JPGs into one PDF?',
      a: 'Select all the images at once (or add them in batches), arrange them in the list and click “Convert to PDF and download”. Each image becomes one page.',
    },
    {
      q: 'Should I choose Letter or A4?',
      a: 'Choose US Letter for documents used in the US or Canada and A4 for most other countries. If the PDF is only for viewing on screen, “Fit image” avoids white borders.',
    },
    {
      q: 'Will the PDF be blurry?',
      a: 'No. JPG and PNG images are embedded without recompression, so the PDF is as sharp as your original photos.',
    },
    {
      q: 'Can I convert photos to PDF on my iPhone?',
      a: 'Yes. Open this page in Safari, tap the box and choose Photo Library or Files. If your photos are HEIC, Safari usually converts them to JPG when you pick them from the photo library.',
    },
    {
      q: 'Is there a limit on the number of images?',
      a: 'There is no fixed limit and no sign-up. Very large batches depend on your device’s memory; on a phone, 50 or so full-size photos at a time is comfortable.',
    },
  ],
  related: ['pdf-merge', 'heic-to-jpg', 'image-compressor', 'id-watermark', 'pdf-to-image', 'image-resizer'],
  priority: 90,
  updated: '2026-10-29',
});
