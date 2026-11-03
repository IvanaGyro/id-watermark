import { defineTool } from '../types';

export default defineTool({
  slug: 'image-converter',
  name: 'Image Converter',
  seoTitle: 'Image Converter: PNG to JPG, WebP to JPG, JPG to WebP Online',
  description:
    'Free online image converter. Change PNG to JPG, WebP to JPG or PNG, JPG to WebP, and to AVIF where your browser supports it. Batch convert with no uploads.',
  category: 'image',
  icon: 'RefreshCw',
  keywords: [
    'image converter',
    'png to jpg',
    'webp to jpg',
    'jpg to png',
    'webp to png',
    'jpg to webp',
    'png to webp',
    'convert image to jpg',
    'image to avif',
    'batch image converter',
    'free image converter online',
    'convert webp to jpg without uploading',
  ],
  intro:
    'Convert images to JPG, PNG, WebP or AVIF, several at a time. Everything runs in your browser, so your photos never leave your device.',
  howTo: [
    'Click the dashed box to choose images, drop them onto it, or press Ctrl/Cmd + V to paste. You can add several at once.',
    'Under “Convert to”, pick JPG, PNG or WebP. AVIF also appears if your browser can save it.',
    'For JPG, WebP and AVIF, adjust “Quality”. When converting to JPG, transparent areas are filled with the “Background for transparent areas” color.',
    'Each image shows its new format and size. Click “Download” for one file or “Download all” for every converted image.',
  ],
  sections: [
    {
      heading: 'JPG, PNG, WebP and AVIF compared',
      body: [
        'JPG (JPEG) is the universal photo format. Its lossy compression keeps files small and it opens everywhere, but it has no transparency, and every edit-and-save cycle compresses the image again, so quality degrades over time. PNG is lossless: text and lines stay crisp and transparency is supported, which makes it ideal for screenshots, logos and diagrams, but photos saved as PNG are very large.',
        'WebP, from Google, supports lossy and lossless compression plus transparency, and is typically 25–35% smaller than a JPG of similar quality. Every current browser displays it. AVIF, based on the AV1 video codec, usually compresses even better than WebP, but it is slower to encode and some older photo viewers, editors and upload forms still can’t open it.',
      ],
    },
    {
      heading: 'Why convert WebP to JPG?',
      body: [
        'Images saved from websites are often WebP, and plenty of software still trips over it: older versions of Microsoft Office, some print shops and photo labs, government and job application portals, and many marketplace and social upload forms only accept JPG or PNG. Converting to JPG is the safest choice whenever a site says “unsupported file type”.',
        'Going the other way, converting JPG or PNG to WebP is one of the easiest wins for page speed. Smaller images improve Largest Contentful Paint, one of Google’s Core Web Vitals, and most CMSs, including WordPress, accept WebP uploads.',
      ],
    },
    {
      heading: 'Which format should you choose?',
      body: [
        'Choose JPG for photos that must work everywhere: email attachments, printing, older software. Choose PNG when you need transparency or sharp text, such as logos, UI screenshots and charts. Choose WebP for images on your own website or blog. Try AVIF if you want the smallest possible files and your audience uses modern browsers.',
        'A quality setting of 80–90 is a good default for JPG and WebP. Below about 70, you start to see blocky artifacts around edges and in smooth gradients like skies.',
      ],
    },
    {
      heading: 'Converting doesn’t restore lost quality',
      body: [
        'Turning a small, compressed JPG into a PNG won’t bring back detail; it just stores the same pixels losslessly in a bigger file. Likewise, a PNG with a transparent background converted to JPG gets a solid background, because JPG can’t store transparency. Pick the background color before converting so it blends with where the image will be used.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I convert WebP to JPG?',
      a: 'Drop the .webp file onto the box above, keep “Convert to” on JPG and click “Download”. You can add many WebP files at once and use “Download all”.',
    },
    {
      q: 'Why is my PNG file bigger than the JPG?',
      a: 'PNG is lossless, so it stores every pixel exactly. That’s great for screenshots and graphics with flat colors, but photos have so much fine detail that a PNG can be five to ten times larger than a JPG.',
    },
    {
      q: 'Will converting PNG to JPG remove the transparent background?',
      a: 'Yes. JPG has no transparency, so transparent pixels are filled with the background color you choose (white by default). Keep the image as PNG or WebP if you need transparency.',
    },
    {
      q: 'Why don’t I see the AVIF option?',
      a: 'AVIF only appears when your browser can encode it. Recent versions of Chrome and Edge can; some other browsers can display AVIF but not save it.',
    },
    {
      q: 'Can I convert HEIC photos from my iPhone here?',
      a: 'Yes. Add HEIC or HEIF photos as they are and convert them to JPG, PNG or WebP in Chrome, Edge, Firefox or Safari. The conversion runs on your device, so the photos are never uploaded.',
    },
    {
      q: 'Are my images uploaded to a server?',
      a: 'No. Conversion uses your browser’s canvas, entirely on your device. Nothing is uploaded, which also makes it fast for large batches.',
    },
  ],
  related: ['heic-to-jpg', 'image-compressor', 'image-resizer', 'ascii-art', 'image-to-pdf', 'image-to-base64', 'color-converter'],
  priority: 70,
  updated: '2026-10-29',
});
