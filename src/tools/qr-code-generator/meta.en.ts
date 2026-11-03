import { defineTool } from '../types';

export default defineTool({
  slug: 'qr-code-generator',
  name: 'QR Code Generator',
  seoTitle: 'QR Code Generator: Free, No Sign-Up, Never Expires (PNG and SVG)',
  description:
    'Free QR code generator for URLs, text, Wi-Fi, email, phone numbers and contact cards. Pick colors and size, then download PNG or SVG. Static codes never expire.',
  category: 'generator',
  icon: 'QrCode',
  keywords: [
    'qr code generator',
    'free qr code generator',
    'qr code generator free no sign up',
    'qr code generator no expiration',
    'create qr code',
    'make a qr code',
    'qr code for website link',
    'wifi qr code generator',
    'vcard qr code generator',
    'qr code business card',
    'qr code svg',
    'qr code png download',
    'static qr code generator',
    'custom color qr code',
  ],
  intro:
    'Turn a link, Wi-Fi login or contact card into a QR code you can download as PNG or SVG. No account, no watermark, and the code works for as long as the content does.',
  howTo: [
    'Choose a type at the top: URL, Text, Wi-Fi, Email, Phone or Contact.',
    'Fill in the fields. The preview updates as you type. For Wi-Fi, pick the right Security option, or None (open network) for a network without a password.',
    'Adjust Error correction, Quiet zone, Foreground and Background if you need to. Keep a dark foreground on a light background for printing.',
    'Pick a PNG size and press Download PNG, or press Download SVG for a vector file that scales to any size.',
    'Scan the downloaded file with your phone camera once before you print or share it.',
  ],
  sections: [
    {
      heading: 'Static QR codes never expire',
      body: [
        'Many “free” QR code sites create dynamic codes: the pattern points to a short link on their server, which then redirects to your page. That lets them show analytics, but it also means the code stops working when a trial ends or the service shuts down. People find this out after printing 500 flyers.',
        'This generator makes static codes. Your URL, Wi-Fi details or contact card are encoded directly in the black and white modules, with no redirect in between. The code keeps working as long as the destination does, and nobody can track or disable it. The trade-off is that you can’t edit a static code after printing; if the link changes, generate a new one.',
      ],
    },
    {
      heading: 'Wi-Fi and contact card QR codes',
      body: [
        'A Wi-Fi QR code uses the standard format WIFI:T:WPA;S:network-name;P:password;; where T is the security type, S the network name and P the password. Hidden networks add H:true. Special characters such as semicolons, commas, colons, quotes and backslashes must be escaped, and the tool does that for you. The built-in camera on iPhone and most Android phones offers to join the network as soon as it reads the code, which makes it handy for guest rooms, Airbnb listings, offices and coffee shops.',
        'Contact mode creates a vCard 3.0, the same format phones use to share contacts. Scanning it opens an “Add contact” screen with the name, company, job title, phone, email, website and address filled in. Every field adds data and makes the pattern denser, so on a business card keep only what people actually need, usually name, phone, email and website.',
      ],
    },
    {
      heading: 'Choosing error correction',
      body: [
        'QR codes include Reed-Solomon error correction, so they still scan when part of the symbol is dirty, scratched or covered. Level L recovers about 7% damage, M about 15%, Q about 25% and H about 30%. Higher levels need more modules for the same content, so the pattern gets denser.',
        'M is the default and suits screens and clean print. Use Q or H for outdoor signs, stickers that will get scuffed, or a design where a logo will cover the center. For long content such as a vCard with many fields, L keeps the pattern open enough to scan from a phone. Error correction never changes what the code contains, only how much damage it can survive.',
      ],
    },
    {
      heading: 'Print size, quiet zone and colors',
      body: [
        'The QR code standard calls for a blank margin of at least 4 modules on every side, called the quiet zone. Scanners use it to find the corner markers, so don’t crop it or place the code tight against other artwork. A common rule of thumb is a scanning distance of about 10 times the code’s width: a 1 inch (2.5 cm) code on a business card reads from about 10 inches, while a sign meant to be scanned from 10 feet away needs a code about 1 foot wide.',
        'Custom colors work as long as the foreground is darker than the background and the contrast is strong. Light modules on a dark background confuse many scanners, and the tool warns you if contrast gets too low. Send the SVG file to your printer or designer, since it stays sharp at any size; PNG is fine for websites, slides and social posts.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is this QR code generator really free?',
      a: 'Yes. There is no sign-up, no trial, no watermark and no limit on how many codes you make. You can use the codes on menus, packaging, flyers and business cards, including commercial use.',
    },
    {
      q: 'Do the QR codes expire?',
      a: 'No. These are static codes with your content encoded directly in the image, not a redirect through our server. They keep working as long as the link or information they contain is still valid.',
    },
    {
      q: 'Can I change the link after printing?',
      a: 'Not with a static code. Changing the destination later requires a dynamic QR code service that redirects through its own short link, usually for a monthly fee. If you control the website, you can also keep the printed URL and redirect it yourself.',
    },
    {
      q: 'Why won’t my QR code scan?',
      a: 'The usual causes are low contrast or inverted colors, a code printed too small, a missing quiet zone, or so much content that the pattern is too dense. Switch back to black on white, print it larger or shorten the URL, then try again.',
    },
    {
      q: 'Can I use a QR code commercially?',
      a: 'Yes. “QR Code” is a registered trademark of DENSO WAVE, but the technology is an open ISO/IEC 18004 standard that anyone can use without a license fee.',
    },
    {
      q: 'Is my Wi-Fi password sent anywhere?',
      a: 'No. The QR code is generated in your browser. URLs, passwords and contact details never leave your device.',
    },
  ],
  related: ['password-generator', 'random-number', 'word-counter', 'led-marquee'],
  priority: 80,
  updated: '2026-10-29',
});
