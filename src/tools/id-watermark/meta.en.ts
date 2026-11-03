import { defineTool } from '../types';

export default defineTool({
  slug: 'id-watermark',
  name: 'ID Watermark',
  seoTitle: 'Watermark ID Card Online: Mark Copies “For Verification Only”',
  description:
    'Add a “for verification only” watermark to photos of your ID, driver’s license or passport, and black out part of the number. Runs in your browser, no upload.',
  category: 'image',
  icon: 'Stamp',
  keywords: [
    'watermark id card online',
    'add watermark to id copy',
    'add watermark to document photo',
    'for verification only watermark',
    'watermark driver license photo',
    'watermark passport copy',
    'protect id copy from identity theft',
    'black out id number in photo',
  ],
  intro:
    'Stamp “for [purpose] only” across a photo or scan of your ID so a leaked copy is harder to reuse. Add several images, cover part of the number, and download. Everything stays on your device.',
  howTo: [
    'Click the dashed box to choose ID photos or scans, or drag them in or paste a screenshot. You can add several, including iPhone HEIC photos.',
    'Under “Watermark text”, pick a template and fill in “Recipient” and “Purpose”, such as “First City Bank” and “account opening”. The date defaults to today. Pick “Custom” to write your own text, line breaks included.',
    'Under “Style”, adjust the layout, color, text size, angle, spacing and opacity. The preview updates as you go, and the style applies to every image.',
    'To hide something, choose “Black box” or “Mosaic” under “Mask” and drag over that part of the preview. “Undo” removes the last mask.',
    'Choose JPG or PNG and an output size, then click “Download this image”, or “Download all (ZIP)” to save every image at once.',
  ],
  sections: [
    {
      heading: 'Why watermark a copy of your ID?',
      body: [
        'Landlords, employers, banks, notaries, car rental desks and online marketplaces often ask for a photo or scan of a driver’s license, passport or state ID. Once you send it, you no longer control how it is stored or who else sees it, and a clean, unmarked copy is exactly what someone needs to open accounts or pass identity checks in your name.',
        'Writing who the copy is for, what it is for and the date across the image is a widely recommended precaution. Anyone looking at it can see the copy was meant for one purpose, which makes it harder to pass off elsewhere, and it reminds the recipient to handle it with care. A watermark has no special legal effect and is not a guarantee: it lowers the risk of misuse, it does not remove it. Share ID copies only when they are really needed.',
      ],
    },
    {
      heading: 'What to write, and where to put it',
      body: [
        'Be specific. Include the recipient, the purpose and the date, for example “For rental application with Oak Street Apartments only – Nov 4, 2026”. A vague line such as “Copy” or “Sample” is easier to explain away. There is no need to add your phone number or other personal details to the watermark itself.',
        'The text has to cross the important parts, your name, photo and ID number, or it can simply be cropped off. That is why a diagonal pattern repeated over the whole image works better than a small corner mark. Around 30–50% opacity keeps the details readable for the recipient. Red or blue works on most light cards; use white on dark backgrounds and turn on the outline when the card has a busy pattern. If the photo shows a lot of table around the card, crop it first so the watermark covers the card itself.',
        'Black out what the recipient does not need, such as part of the license number when they only check your name and photo, but leave anything they must verify, or your copy may be rejected. When in doubt, ask what they need before you send it.',
      ],
    },
    {
      heading: 'Why do it in your browser instead of an app',
      body: [
        'Many watermark apps and websites upload your photo to their servers to process it, and you cannot check whether the file is kept or reused. An ID is the last thing you want to hand to an unknown service. This tool draws the watermark with your browser’s built-in canvas on your own phone or computer; the images are never sent anywhere and are gone when you close the tab.',
        'Each download is a freshly encoded JPG or PNG, so EXIF metadata from the original photo, such as the capture time, phone model and GPS location, is not carried over. Black boxes and mosaics are drawn into the pixels, not added as a layer that someone could remove.',
      ],
    },
  ],
  faq: [
    {
      q: 'Are my ID photos uploaded?',
      a: 'No. Loading, watermarking, masking and exporting all happen in your browser, and nothing is sent to a server. Only your style and watermark text are remembered on this device; images are never stored.',
    },
    {
      q: 'Will a bank or landlord accept a watermarked ID copy?',
      a: 'Usually, as long as your name, photo and ID number stay clearly readable, which is why a moderate opacity is recommended. Policies differ, so if someone insists on an unmarked copy, ask why or offer to show the original in person.',
    },
    {
      q: 'Can a watermark be edited out?',
      a: 'No watermark is impossible to remove, but a repeated pattern that runs across the details is much harder to clean up than a small corner stamp. For information the recipient does not need, a black box is the safest choice.',
    },
    {
      q: 'What is the difference between Black box and Mosaic?',
      a: 'Black box covers the area completely. Mosaic keeps rough colors and looks less harsh, but on a large area the outline of what was there can still show. Use Black box for numbers and other key details.',
    },
    {
      q: 'Can I watermark the front and back of my ID at the same time?',
      a: 'Yes. Add up to 20 images at once. The watermark style applies to all of them, masks are set per image, and “Download all (ZIP)” saves everything in one file.',
    },
    {
      q: 'Does it work with iPhone HEIC photos?',
      a: 'Yes. Safari reads HEIC directly, and other browsers convert it to JPG inside the page first. If your browser cannot open a HEIC photo, convert it with the HEIC to JPG converter and add it again.',
    },
  ],
  related: ['image-crop', 'image-compressor', 'heic-to-jpg', 'image-to-pdf', 'image-resizer'],
  priority: 50,
  updated: '2026-11-04',
});
