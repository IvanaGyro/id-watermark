import { defineTool } from '../types';

export default defineTool({
  slug: 'heic-to-jpg',
  name: 'HEIC to JPG Converter',
  seoTitle: 'HEIC to JPG Converter: Convert iPhone Photos in Bulk, No Upload',
  description:
    'Free HEIC to JPG converter. Batch convert iPhone HEIC and HEIF photos to JPG or PNG, set the quality and download a ZIP. Works on Windows, with no upload.',
  category: 'image',
  icon: 'Smartphone',
  keywords: [
    'heic to jpg',
    'heic to jpg converter',
    'convert heic to jpg',
    'heic converter',
    'heic to png',
    'heif to jpg',
    'iphone photo to jpg',
    'convert iphone photos to jpg',
    'open heic on windows',
    'heic to jpg windows',
    'batch convert heic to jpg',
    'heic to jpg without uploading',
    'what is a heic file',
  ],
  intro:
    'Convert iPhone HEIC photos to JPG or PNG in bulk so they open on Windows, in older software and in any upload form. Conversion happens on your device, so your photos are never uploaded.',
  howTo: [
    'Click the dashed box to choose HEIC photos, or drag them in. You can add many at once, with .heic or .heif extensions.',
    'Under “Output format”, pick JPG or PNG. JPG is right for most photos: smaller files that open everywhere.',
    'For JPG, drag the “Quality” slider. 85–92 keeps photos virtually identical to the original.',
    'Each photo shows its new size and dimensions when done. Click “Download” for one, or “Download all (ZIP)” to save everything in a single file.',
  ],
  sections: [
    {
      heading: 'What is a HEIC file, and why does my iPhone use it?',
      body: [
        'HEIC is Apple’s flavor of HEIF (High Efficiency Image File Format), with the image compressed using the HEVC (H.265) video codec. Since iOS 11, iPhones save photos as HEIC by default because a HEIC file is roughly half the size of a JPG of the same quality, which saves a lot of space on your phone and in iCloud. It can also store 10-bit color, depth data, bursts and the still frame of a Live Photo.',
        'The catch is compatibility. JPG has been universal for three decades, while HEIC needs explicit support. Macs and iPhones open it natively, but many Windows PCs, older versions of Photoshop and Office, and plenty of websites (job portals, DMV and passport photo uploads, print shops, marketplaces) accept only JPG or PNG.',
      ],
    },
    {
      heading: 'Make your iPhone shoot JPG: choose “Most Compatible”',
      body: [
        'If you often send photos to a PC or upload them to websites, change the capture format: open Settings > Camera > Formats and switch from “High Efficiency” to “Most Compatible”. New photos are saved as JPG and videos as H.264, at the cost of roughly doubling photo file sizes. Photos you have already taken stay HEIC, so you still need a converter for those.',
        'There is also Settings > Photos > Transfer to Mac or PC. With “Automatic”, photos imported to a computer over a USB cable are converted to JPG on the fly; “Keep Originals” keeps them as HEIC. Sharing through Mail or most social apps usually converts automatically too, but AirDrop to a Mac, downloading originals from iCloud.com, and syncing with Google Drive or Dropbox typically give you the HEIC file.',
      ],
    },
    {
      heading: 'How to open HEIC files on Windows',
      body: [
        'Windows 10 and 11 need two add-ons from the Microsoft Store to show iPhone photos: “HEIF Image Extensions” (free) and “HEVC Video Extensions” (a small fee in most regions). Even then, only apps that use the Windows codecs, such as Photos, can open them; Office, older editors and browser upload forms often still can’t.',
        'Converting to JPG avoids all of that. This tool first tries your browser’s built-in decoder (Safari reads HEIC natively). If the browser can’t, it loads an open-source HEIC decoder into the page and converts locally. Nothing to install and no private photos sent to an unknown conversion server.',
      ],
    },
    {
      heading: 'JPG or PNG, and what quality?',
      body: [
        'For photos, JPG is the right choice: at quality 90 the result is visually indistinguishable from the original. Because JPG compresses less efficiently than HEIC, the JPG is usually larger. A 2 MB HEIC may become a 3–4 MB JPG at quality 90. That is normal and doesn’t mean quality improved. If a site has a size limit, lower the quality to 80 or shrink the photo with the image compressor.',
        'PNG is lossless but makes photos three to five times bigger than JPG, so use it only for further editing or when PNG is required. Converted files are re-encoded from pixels, so EXIF metadata such as the capture time, camera model and GPS location is not carried over, which is a privacy plus when sharing photos publicly.',
      ],
    },
  ],
  faq: [
    {
      q: 'Are my photos uploaded when I convert HEIC to JPG?',
      a: 'No. Everything runs in your browser and nothing is sent to a server, so it is safe for family photos, ID pictures and other private images.',
    },
    {
      q: 'Why is the JPG bigger than the original HEIC?',
      a: 'HEIC compresses about twice as efficiently as JPG, so the same image takes more space as a JPG. For a smaller file, set quality around 80 or resize the photo afterwards.',
    },
    {
      q: 'Does converting HEIC to JPG reduce quality?',
      a: 'JPG is lossy, but at quality 90 or higher you won’t see a difference. Choose PNG if you need a lossless copy, at the cost of a much larger file.',
    },
    {
      q: 'How do I stop my iPhone from saving photos as HEIC?',
      a: 'Go to Settings > Camera > Formats and choose “Most Compatible”. New photos will be JPG; existing HEIC photos are not converted automatically.',
    },
    {
      q: 'Can I convert Live Photos?',
      a: 'Yes, you get the still image. The motion part of a Live Photo is a separate MOV video file and isn’t inside the HEIC.',
    },
    {
      q: 'How many photos can I convert, and why is it slow in Chrome?',
      a: 'There is no limit. Safari decodes HEIC natively and is very fast. Chrome, Edge and Firefox decode in the page, which takes a few seconds per 12-megapixel photo; on a phone, convert about 20 at a time.',
    },
  ],
  related: ['image-converter', 'image-compressor', 'image-resizer', 'id-watermark', 'image-to-pdf', 'image-crop'],
  priority: 88,
  updated: '2026-10-29',
});
