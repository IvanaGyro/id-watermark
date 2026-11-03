import { defineTool } from '../types';

export default defineTool({
  slug: 'image-crop',
  name: 'Crop Image',
  seoTitle: 'Crop Image Online: Free Photo Cropper with 1:1, 4:5 and 16:9',
  description:
    'Crop images online for free. Drag the crop box, lock 1:1, 4:3, 3:2, 16:9, 9:16 or Instagram 4:5, rotate and flip, then save as JPG, PNG or WebP. No uploads.',
  category: 'image',
  icon: 'Crop',
  keywords: [
    'crop image',
    'crop image online',
    'image cropper',
    'photo cropper',
    'crop photo',
    'crop picture',
    'crop image to square',
    'crop image 16:9',
    'crop photo for instagram 4:5',
    'crop png',
    'crop jpg',
    'rotate image',
    'flip image',
  ],
  intro:
    'Drag a crop box over the part of the photo you want, snap it to common ratios for Instagram, YouTube or prints, and rotate or flip as needed. Everything stays on your device.',
  howTo: [
    'Click the dashed box to choose an image, drop one onto it, or press Ctrl/Cmd + V to paste a screenshot. A sample image is shown until you do.',
    'Under “Aspect ratio”, pick Free, 1:1, 4:3, 3:2, 16:9, 9:16 or 4:5 Instagram. The crop box snaps to the largest centered area with that shape.',
    'Drag inside the box to move it and drag the corner or edge handles to resize. With the box selected, the arrow keys nudge it; hold Shift to move faster.',
    'Rotate or flip if needed, choose an “Output format”, then click “Crop and download”.',
  ],
  sections: [
    {
      heading: 'Which aspect ratio should I use?',
      body: [
        '1:1 is the classic square for profile pictures and Instagram grid posts. 4:5 (1080 × 1350) is Instagram’s tallest feed format and takes up the most screen space in the feed. 16:9 fits YouTube thumbnails, presentation slides, X and LinkedIn link images, and desktop wallpapers, while 9:16 is for Stories, Reels, TikTok and phone wallpapers.',
        '3:2 matches most DSLR and mirrorless camera sensors and the standard 4 × 6 inch photo print, so crop to 3:2 before ordering prints to avoid unexpected trimming. 4:3 is the native shape of most phone cameras and iPad screens. Choose Free when you just want to trim away edges.',
      ],
    },
    {
      heading: 'Cropping vs resizing',
      body: [
        'Cropping cuts away part of the picture and keeps the remaining pixels exactly as they were. Resizing keeps the whole picture but changes how many pixels it has. To get an exact size like 1080 × 1080, crop to 1:1 here first so you control what is kept, then use the image resizer to scale it down.',
        'The stats below the image show the cropped size and the original size in pixels, so you can check that the result is still large enough. Instagram, for example, recommends images at least 1080 pixels wide.',
      ],
    },
    {
      heading: 'Rotating, flipping and output quality',
      body: [
        'The rotate buttons turn the image 90° at a time without any quality loss, which fixes sideways phone photos. Flip horizontal mirrors the image, handy for selfies taken with the front camera that show text backwards.',
        'Choosing “Original” keeps the source format. PNG output is lossless and keeps transparency; JPG and WebP use the quality slider, where 90 or above is visually lossless. The crop is drawn from the full-resolution original, not the on-screen preview.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I crop an image to a square?',
      a: 'Select the 1:1 aspect ratio, drag the box over the part you want to keep, and click “Crop and download”. The box stays perfectly square while you resize it.',
    },
    {
      q: 'Does cropping reduce image quality?',
      a: 'No. Cropping keeps the original pixels inside the box. If you save as JPG or WebP there is a small amount of compression, which is invisible at quality 90 or higher; PNG is lossless.',
    },
    {
      q: 'Can I crop a photo to exact pixel dimensions?',
      a: 'Lock the aspect ratio you need and crop here, then resize the result to the exact pixel size with the image resizer.',
    },
    {
      q: 'Can I crop HEIC photos from my iPhone?',
      a: 'Yes. Choose the HEIC photo as it is. If your browser can’t open HEIC, the tool converts it to JPG on your device first, so nothing is uploaded.',
    },
    {
      q: 'Will the cropped image keep its EXIF data?',
      a: 'No. The output is drawn fresh from pixels, so location, camera and date metadata are removed. Photo orientation is applied before cropping, so the result is not rotated unexpectedly.',
    },
    {
      q: 'Is my image uploaded anywhere?',
      a: 'No. Cropping runs in your browser using canvas, so the image never leaves your device.',
    },
  ],
  related: ['image-resizer', 'image-compressor', 'image-converter', 'bead-pattern', 'heic-to-jpg', 'image-to-pdf'],
  priority: 78,
  updated: '2026-10-29',
});
