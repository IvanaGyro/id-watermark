import { defineTool } from '../types';

export default defineTool({
  slug: 'webcam-test',
  name: 'Webcam Test',
  seoTitle: 'Webcam Test: Check Your Camera, Resolution and FPS Online',
  description:
    'Free online webcam test. See its real resolution, aspect ratio and frame rate, take a snapshot, and fix a blocked camera on Windows or Mac.',
  category: 'test',
  icon: 'Webcam',
  keywords: [
    'webcam test',
    'camera test',
    'test my webcam',
    'online webcam test',
    'webcam check',
    'is my webcam working',
    'webcam resolution test',
    'webcam fps test',
    'camera test online',
    'laptop camera test',
    'webcam mirror',
    'zoom camera test',
    'webcam not working',
    'test camera on computer',
  ],
  intro:
    'Make sure your camera works before a video call or interview. See a live preview along with the real resolution and frame rate your webcam delivers, and take a snapshot to check the picture.',
  howTo: [
    'Press “Test my webcam” and choose Allow when the browser asks to use your camera.',
    'Check the live preview. If you have more than one camera, choose it under “Camera”.',
    'Pick a “Requested resolution” (480p to 4K) and compare it with the “Actual resolution” and “Measured frame rate” below the preview.',
    'Press “Take photo” to save a PNG snapshot, and “Turn off camera” when you are done.',
  ],
  sections: [
    {
      heading: 'Resolution and frame rate, explained',
      body: [
        'Browsers ask the camera for a resolution, and the camera delivers the closest mode it supports. That is why “Actual resolution” can be lower than what you requested: many built-in laptop webcams top out at 720p (1280 × 720), while external webcams such as the Logitech C920 deliver 1080p (1920 × 1080). “Camera maximum” shows the largest size the driver reports.',
        'Most webcams run at 30 fps; some reach 60 fps at 720p. If the measured frame rate drops to 15 fps or lower, the room is usually too dark: the camera lengthens its exposure to gather light, which halves the frame rate. Add light in front of you, not behind you.',
      ],
    },
    {
      heading: 'Why is my webcam mirrored?',
      body: [
        'The preview is mirrored by default, like a bathroom mirror, because that feels natural when you look at yourself. The people on a Zoom, Teams or Google Meet call see the unmirrored image, so text on a shirt or sign reads correctly for them. Untick “Mirror preview” to see exactly what others see; snapshots are saved the way the preview is shown.',
      ],
    },
    {
      heading: 'Webcam not working? Check these first',
      body: [
        'If access is blocked, check the browser’s site permission and the operating system. On Windows 11, open Settings > Privacy & security > Camera and turn on both “Camera access” and “Let desktop apps access your camera”. On a Mac, open System Settings > Privacy & Security > Camera and turn on your browser.',
        'If the camera is “in use” or won’t start, close other apps that may hold it, such as Zoom, Teams, FaceTime or OBS. Many laptops also have a privacy shutter or a camera key (often F8 or F10) that disables the camera in hardware; a black image with no error usually means the shutter is closed.',
      ],
    },
    {
      heading: 'Look better on video calls',
      body: [
        'Put the camera at eye level, about an arm’s length away, and face a window or a lamp so light falls on your face. Avoid a bright window behind you, which turns you into a silhouette. Wipe the lens: a fingerprint is the most common cause of a hazy, low-contrast picture.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I test my webcam?',
      a: 'Press “Test my webcam”, allow camera access and check the live preview. The resolution, aspect ratio and frame rate appear below it. If you see yourself, the webcam works.',
    },
    {
      q: 'Why does it say the camera is in use or couldn’t start?',
      a: 'Another app is using the camera, or the driver has crashed. Close video apps such as Zoom, Teams or OBS, then press Start again. If it still fails, unplug and reconnect an external webcam or restart the computer.',
    },
    {
      q: 'Why is the picture black?',
      a: 'A closed privacy shutter, a camera disable key, or another app holding the camera can all give a black image. Check the shutter on the bezel or webcam, and try the camera key on your laptop keyboard.',
    },
    {
      q: 'Why is my webcam quality worse than advertised?',
      a: 'The camera may not support the requested resolution, or it is lowering frame rate and detail in a dark room. Compare “Actual resolution” with “Camera maximum”, add light, and use a USB 3 port for 4K webcams.',
    },
    {
      q: 'Can I test the camera on my iPhone or Android phone?',
      a: 'Yes. Open the page in Safari or Chrome and allow camera access. If your phone has several cameras, choose the front or rear camera in the “Camera” menu after the first start.',
    },
    {
      q: 'Is my video recorded or uploaded?',
      a: 'No. The video is shown only in your browser and is never recorded or sent anywhere. Snapshots stay on your device unless you download them.',
    },
  ],
  related: ['mic-test', 'screen-test', 'keyboard-tester', 'decibel-meter', 'image-compressor'],
  priority: 65,
  updated: '2026-10-29',
});
